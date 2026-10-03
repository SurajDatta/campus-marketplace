/**
 * VerificationCountdown.tsx 
 * Component to show the time left until they are allowed to verify (5 min). So if they just verified their email or phone within the last 5 minutes, they will be allowed to change their phone or password.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-25
 *
 *
 */
import { Profile, User } from "@/types";
import { otpLogin } from "@/utils/services/auth";
import { encryptOTPHash } from "@/utils/services/encrypt";
import { Button, HStack, Text, VStack, useToast } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Countdown from "react-countdown";

type VerificationCountdownProps = {
    user: User;
    userProfile: Profile
    timeValid: number;
}

type CountdownProps = {
    minutes: number;
    seconds: number;
    completed: boolean;
};

export default function VerificationCountdown({ user, userProfile, timeValid }: VerificationCountdownProps) {
    const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
    const router = useRouter();
    const toast = useToast();

    const handleVerify = async () => {
        setVerifyLoading(true);
        try {
            if (user && user.email) {
                // handle the verification process
                const { success, error } = await otpLogin(user.email, null);
                if (!success) {
                    throw new Error(error);
                } else {
                    const hash = await encryptOTPHash(user.id, 'email') // create hash for verification page
                    const callbackUrl = encodeURIComponent('/account#restricted'); // redirect to account page
                    router.push(`/verify/account/${hash}/login?callback_url=${callbackUrl}`); // redirect to verification page
                }
            } else {
                throw new Error("User email not found");
            }
        } catch (error: any) {
            toast({
                title: 'Error verifying account.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setVerifyLoading(false);
        }
    }

    // Renderer callback with condition
    const renderer = ({ minutes, seconds, completed }: CountdownProps) => {
        if (completed) {
            // When the countdown is complete, user has option to verify their account
            return (
                <VStack align={"left"}>
                    <Text>To make changes to your personal details, a verification code is required. Click the "Verify Account" button to receive the code via email.</Text>
                    <HStack>
                        <Button colorScheme="blue" onClick={handleVerify} isLoading={verifyLoading}>Verify Account</Button>
                    </HStack>
                </VStack>
            );
        } else {
            // Render a countdown
            return (
                <Text>Verification valid for {minutes}m {seconds}s. You will be able to make changes to this page.</Text>
            );
        }
    };

    return (
        <Countdown
            date={userProfile.last_verified ? new Date(userProfile.last_verified).getTime() + timeValid : new Date().toISOString()} // x milliseconds after last verified
            renderer={renderer}
        />
    )
}
