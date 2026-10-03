/**
 * services/encrypt.ts
 * Service functions used to handle encryption and decryption of sensitive data, like purchase hashes and OTPs.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use server"
import CryptoJS from 'crypto-js';

export const encryptPurchaseHash = async (sellerId: string, meetupId: string): Promise<string> => {
    const secretKey = process.env.PRIVATE_KEY
    if (!secretKey) {
        throw new Error('No secret key found');
    }
    const data = `${sellerId}:${meetupId}`;
    const ciphertext = CryptoJS.AES.encrypt(data, secretKey).toString();
    const urlSafeCiphertext = encodeURIComponent(btoa(ciphertext));
    return urlSafeCiphertext;
}


export const decryptPurchaseHash = async (ciphertext: string): Promise<{ sellerId: string, meetupId: string }> => {
    const secretKey = process.env.PRIVATE_KEY
    if (!secretKey) {
        throw new Error('No secret key found');
    }
    const decodedCiphertext = atob(decodeURIComponent(ciphertext));
    const bytes = CryptoJS.AES.decrypt(decodedCiphertext, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    const [sellerId, meetupId] = decryptedData.split(':');
    return { sellerId, meetupId };
}


export const encryptOTPHash = async (userId: string, type: string): Promise<string> => { // login type
    const secretKey = process.env.PRIVATE_KEY
    if (!secretKey) {
        throw new Error('No secret key found');
    }
    const data = `${userId}:${type}`;
    const ciphertext = CryptoJS.AES.encrypt(data, secretKey).toString();
    const urlSafeCiphertext = encodeURIComponent(btoa(ciphertext));
    return urlSafeCiphertext;
}

export const decryptOTPHash = async (ciphertext: string): Promise<{ userId: string, type: string }> => {
    const secretKey = process.env.PRIVATE_KEY
    if (!secretKey) {
        throw new Error('No secret key found');
    }
    const decodedCiphertext = atob(decodeURIComponent(ciphertext));
    const bytes = CryptoJS.AES.decrypt(decodedCiphertext, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    const [userId, type] = decryptedData.split(':');
    return { userId, type };
}


export const encryptReauthHash = async (userId: string, type: string, meetupId: string): Promise<string> => { // login type
    const secretKey = process.env.PRIVATE_KEY
    if (!secretKey) {
        throw new Error('No secret key found');
    }
    const data = `${userId}:${type}:${meetupId}`;
    const ciphertext = CryptoJS.AES.encrypt(data, secretKey).toString();
    const urlSafeCiphertext = encodeURIComponent(btoa(ciphertext));
    return urlSafeCiphertext;
}

export const decryptReauthHash = async (ciphertext: string): Promise<{ userId: string, type: string, meetupId: string }> => {
    const secretKey = process.env.PRIVATE_KEY
    if (!secretKey) {
        throw new Error('No secret key found');
    }
    const decodedCiphertext = atob(decodeURIComponent(ciphertext));
    const bytes = CryptoJS.AES.decrypt(decodedCiphertext, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    const [userId, type, meetupId] = decryptedData.split(':');
    return { userId, type, meetupId };
}

export const encryptMasterKey = async (masterKey: string): Promise<string> => {
    const secretKey = process.env.PRIVATE_KEY;
    if (!secretKey) {
        throw new Error('No secret key found');
    }
    const ciphertext = CryptoJS.AES.encrypt(masterKey, secretKey).toString();
    return ciphertext;  // Store this directly in your database
};

// Decrypting master password
export const decryptMasterKey = async (ciphertext: string): Promise<string> => {
    const secretKey = process.env.PRIVATE_KEY;
    if (!secretKey) {
        throw new Error('No secret key found');
    }
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData; // Return decrypted plain text
};