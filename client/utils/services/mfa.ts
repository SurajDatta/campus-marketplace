/**
 * This file is used to handle the MFA registration and login process.
 * 
 * @AshokSaravanan222
 * @2024-08-23
 */
"use server"
import { VerifiedAuthenticationResponse, VerifyAuthenticationResponseOpts, generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse } from '@simplewebauthn/server';
import { createClient } from '../supabase/server';
import { AuthenticationResponseJSON, AuthenticatorDevice, AuthenticatorTransportFuture, PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON, RegistrationResponseJSON } from '@simplewebauthn/server/script/deps';
import { Biometric, Device } from '@/types';
import { base64ToUint8Array, uint8ArrayToBase64 } from '../binaryConversion';


export const fetchBiometric = async (userId: string): Promise<Biometric | null> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('biometric')
        .select('*')
        .eq('user_id', userId)
        .single();
    if (error) {
        return null;
    } else {
        return data
    }
}

export const createBiometric = async (userId: string, masterKey: string, deviceId: string) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('biometric')
        .insert({
            user_id: userId,
            master_key: masterKey,
            credentials: [deviceId],
        });
    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true, error: '' };
}

export const updateBiometric = async (userId: string, deviceIds: string[]) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('biometric')
        .update({ credentials: deviceIds })
        .eq('user_id', userId);
    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true, error: '' };
}


export const fetchDevices = async (deviceIds: string[]): Promise<{authDevices: AuthenticatorDevice[], devices: Device[]}> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .in('id', deviceIds);
    if (error) {
        return { authDevices: [], devices: [] };
    } else {
        return {authDevices: data.map(
            (dev: Device) => ({
                credentialID: dev.credential_id,
                credentialPublicKey: base64ToUint8Array(dev.public_key),
                counter: dev.counter,
                transports: (dev.transports as AuthenticatorTransportFuture[]) ?? undefined,
            })
        ), devices: data as Device[]};
    }
}

export const findDevice = async (credentialID: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('credential_id', credentialID)
        .single();
    if (error) {
        return { success: false, error: error.message, device: null };
    } else {
        return { success: true, error: '', device: {
            credentialID: data.credential_id,
            credentialPublicKey: base64ToUint8Array(data.public_key),
            counter: data.counter,
            transports: (data.transports as AuthenticatorTransportFuture[]) ?? undefined,
        }};
    }
}

export const updateMFADeviceCounter = async (credentialID: string, newCounter: number) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('credentials')
        .update({ counter: newCounter })
        .eq('credential_id', credentialID);
    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true, error: '' };
}

export const insertMFADevice = async (newDevice: AuthenticatorDevice, createdAt: string, deviceType: string, deviceInfo: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('credentials')
        .upsert({
            credential_id: newDevice.credentialID,
            public_key: uint8ArrayToBase64(newDevice.credentialPublicKey),
            counter: newDevice.counter,
            transports: newDevice.transports ?? null,
            created_at: createdAt,
            device_type: deviceType,
            device_info: deviceInfo,
        })
        .select('id')
        .single();
    if (error || !data) {
        return { success: false, error: error.message, id: null };
    }
    return { success: true, error: '', id: data.id as string };
}

export const updateMFADevices = async (userId: string, newDevices: string[]) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('profiles')
        .update({ devices: newDevices })
        .eq('id', userId);
    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true, error: '' };
}


// webauthn functions
export const register = async (email: string, rpID: string, deviceIds: string[]) => {
    try {
        const {authDevices: devices} = await fetchDevices(deviceIds)
        const options = await generateRegistrationOptions({
            rpName: 'Campus Marketplace',
            rpID: rpID, // either `localhost` or `campus-marketplace.local`
            userName: email,
            timeout: 60000,
            attestationType: 'none',
            excludeCredentials: devices.map((dev) => ({
                id: dev.credentialID,
                type: 'public-key',
                transports: dev.transports,
            })),
            authenticatorSelection: {
                residentKey: 'discouraged',
                /**
                 * Wondering why user verification isn't required? See here:
                 *
                 * https://passkeys.dev/docs/use-cases/bootstrapping/#a-note-about-user-verification
                 */
                userVerification: 'preferred',
            },
            /**
             * Support the two most common algorithms: ES256, and RS256
             */
            supportedAlgorithmIDs: [-7, -257],
        });
        return { success: true, error: '', options: options };
    } catch (error: any) {
        return { success: false, error: error.message, options: null };
    }
}

export const verifyRegistration = async (rpID: string, origin: string, options: PublicKeyCredentialCreationOptionsJSON, response: RegistrationResponseJSON, createdAt: string, deviceType: string, deviceInfo: string) => {
    const expectedChallenge = options.challenge;

    const verification = await verifyRegistrationResponse({
        response: response,
        expectedChallenge: `${expectedChallenge}`,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: false,
    });

    const { verified, registrationInfo } = verification;
    if (verified && registrationInfo) {
        const { credentialPublicKey, credentialID, counter } = registrationInfo;
        const newDevice: AuthenticatorDevice = {
            credentialPublicKey,
            credentialID,
            counter,
            transports: response.response.transports,
        };
        // upsert depending on the credentialID column
        const { id: newId, success, error } = await insertMFADevice(newDevice, createdAt, deviceType, deviceInfo);
        if (!success) {
            return { success: false, error: error, verified: verified, newId: null };
        } else {
            if (!newId) {
                return { success: false, error: 'Device not found', verified: verified, newId: newId };
            } else {
                return { success: true, error: '', verified: verified, newId: newId };
            }
        }
    } else {
        return { success: false, error: 'Verification failed', verified: verified, newId: null };
    }
}


export const authenticate = async (rpID: string, deviceIds: string[]) => {
    try {
        const {authDevices: devices} = await fetchDevices(deviceIds)
        const options = await generateAuthenticationOptions({
            timeout: 60000,
            allowCredentials: devices.map((dev) => ({
                id: dev.credentialID,
                type: 'public-key',
                transports: dev.transports,
            })),
            userVerification: 'required',
            rpID: rpID,
        });
        return { success: true, error: '', options: options };
    } catch (error) {
        return { success: false, error: "Issue getting options", options: null };
    }
}

export const verifyAuthentication = async (rpID: string, origin: string, options: PublicKeyCredentialRequestOptionsJSON, response: AuthenticationResponseJSON) => {
    const expectedChallenge = options.challenge;

    let verification: VerifiedAuthenticationResponse;
    let device: AuthenticatorDevice;
    try {
        const { success, error, device: fetchedDevice } = await findDevice(response.id);
        if (!success) {
            throw new Error(error);
        }
        if (!fetchedDevice) {
            throw new Error('Device not found');
        }
        const opts: VerifyAuthenticationResponseOpts = {
            response: response,
            expectedChallenge: `${expectedChallenge}`,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: fetchedDevice,
            requireUserVerification: false,
        };
        verification = await verifyAuthenticationResponse(opts);
        device = fetchedDevice;
    } catch (error) {
        const _error = error as Error;
        return { success: false, error: _error.message, verified: false };
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
        const { success, error } = await updateMFADeviceCounter(device.credentialID, authenticationInfo.newCounter);
        if (!success) {
            return { success: false, error: error, verified: verified };
        } else {
            return { success: true, error: '', verified: verified };
        }
    } else {
        return { success: false, error: 'Verification failed', verified: verified };
    }
}