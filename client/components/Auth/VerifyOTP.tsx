/**
 * VerifyOTP.tsx
 * Used to verify a 6 digit one time passcode sent to either the user's email or phone number. Want to use chakraUI pinInput, but there is a bug on mobile devices, so using OtpInput instead.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React, { useState } from 'react';
import { HStack, Heading, Text, Button, FormControl, VStack } from '@chakra-ui/react'
import { Input } from '@chakra-ui/react'
import OtpInput from 'react-otp-input';
import Countdown from 'react-countdown';
import { RepeatIcon } from '@chakra-ui/icons';

type CountdownProps = {
    minutes: number;
    seconds: number;
    completed: boolean;
};

type VerifyOTPProps = {
    type: string;
    email: string | null;
    phone: string | null;
    handleVerification: (token: string, email: string | null, phone: string | null) => Promise<void>;
    otpError: string | null;
    confirmation_sent_at: string | null
    resendOTP: (type: "phone" | "email") => void;
}

export default function VerifyOTP({ type, email, phone, handleVerification, otpError, confirmation_sent_at, resendOTP }: VerifyOTPProps) {
    const device = email ? email : (phone ? phone : '');
    const waitTime = 60;
    const [otp, setOtp] = useState<string>();
    const [resendLoading, setResendLoading] = useState<boolean>(false);
    const [confirmationTime, setConfirmationTime] = useState<string | null>(confirmation_sent_at)

    const formatPhoneNumber = (phoneNumber: string) => {
        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');
        let formatted = cleaned;

        if (cleaned.length > 3 && cleaned.length <= 6) {
            formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        } else if (cleaned.length > 6) {
            formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
        }

        return formatted;
    }

    function censorDevice(device: string) {
        if (type === "email") {
            return device
        } else {
            const phone = formatPhoneNumber(device.slice(1));
            return "+1 " + phone
        }
    }

    const handleOTPVerification = async (token: string) => {
        await handleVerification(token, email, phone)
    }

    const canSendOTP = () => {
        return !confirmationTime || (new Date().getTime() - new Date(confirmationTime).getTime()) > (waitTime * 1000)
    }

    // Renderer callback with condition
    const renderer = ({ minutes, seconds, completed }: CountdownProps) => {
        if (completed) {
            // Render a completed state
            return (
                <Text>You can resend another code</Text>
            );
        } else {
            // Render a countdown
            return (
                <Text>You can resend another code in {minutes}m {seconds}s</Text>
            );
        }
    };

    const handleResendClick = async () => {
        setResendLoading(true);
        if (canSendOTP()) {
            if (type === "phone" || type === "email") {
                await resendOTP(type)
                setConfirmationTime(new Date().toISOString())
            }
        } else {
            console.error('Cannot resend OTP yet');
        }
        setResendLoading(false);
    }

    return (
        <VStack p={4}>
            <Heading>Verify Code</Heading>
            {confirmationTime && (
                <Text>
                    We sent a 6-digit code to <b>{censorDevice(device)}</b> at <b>{new Date(confirmationTime).toLocaleString()}</b>. {type === 'email' ? "It usually takes around 2 minutes to arrive. If you don't see it, check your junk folder." : "It should arrive momentarily."}
                </Text>
            )}

            <HStack key={confirmationTime}>
                <FormControl>
                    <VStack align={"left"}>
                        <OtpInput
                            value={otp}
                            shouldAutoFocus
                            onChange={(token) => {
                                if (token.length === 6) {
                                    handleOTPVerification(token)
                                } else {
                                    setOtp(token);
                                }
                            }}
                            numInputs={6}
                            placeholder={'○○○○○○'} //set the placeholder on the OtpInput component
                            renderInput={({ style, ...props }, i) => (
                                <Input
                                    {...props}
                                    _focus={{ //make the placeholder transparent on focus
                                        _placeholder: {
                                            color: 'transparent',
                                        },
                                    }}
                                    size={'lg'}
                                    textAlign={'center'}
                                    w={10}
                                    px={0}
                                    mx={1}
                                    isInvalid={!!otpError}
                                />
                            )}
                            inputType='tel'
                        />
                        <Text color="red.500">{otpError}</Text>
                        {confirmationTime && <Countdown
                            date={new Date(confirmationTime).getTime() + (waitTime * 1000)}
                            renderer={renderer}
                        />}
                        <Button isDisabled={!canSendOTP()} onClick={handleResendClick} isLoading={resendLoading} colorScheme='blue' leftIcon={<RepeatIcon />}>Resend Code</Button>
                    </VStack>
                </FormControl>
            </HStack>
        </VStack>
    )
}