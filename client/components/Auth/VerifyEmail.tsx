/**
 * VerifyEmail.tsx
 * Screen to be shown when the user has to verify their email after signing up. 
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React, { useState } from 'react'
import { Text, Button, VStack, Skeleton, Divider } from "@chakra-ui/react"
import Countdown from 'react-countdown';
import { EmailIcon } from '@chakra-ui/icons';

type VerifyEmailProps = {
    email: string | null;
    resendEmail: (type: "phone" | "email") => void;
    emailError: string | null;
    confirmation_sent_at: string | null
}

type CountdownProps = {
    minutes: number;
    seconds: number;
    completed: boolean;
};


export default function VerifyEmail({ email, resendEmail, emailError, confirmation_sent_at }: VerifyEmailProps) {
    const waitTime = 60;
    const [resendLoading, setResendLoading] = useState<boolean>(false);
    const [confirmationTime, setConfirmationTime] = useState<string | null>(confirmation_sent_at)

    const canSendVerification = () => {
        return !confirmationTime || (new Date().getTime() - new Date(confirmationTime).getTime()) > (waitTime * 1000) // 5 minutes
    }

    const handleResendClick = async () => {
        setResendLoading(true);
        if (canSendVerification()) {
            await resendEmail("email")
            setConfirmationTime(new Date().toISOString());
        } else {
            console.log('Cannot resend OTP yet');
        }
        setResendLoading(false);
    }

    // Renderer callback with condition
    const renderer = ({ minutes, seconds, completed }: CountdownProps) => {
        if (completed) {
            // Render a completed state
            return (
                <Text>Resend</Text>
            );
        } else {
            // Render a countdown
            return (
                <Text>Resend in {minutes}m {seconds}s</Text>
            );
        }
    };

    return (
        <VStack align={"left"} spacing={4}>
            <h1 className="text-3xl font-bold">You are almost there!</h1>
            <Text fontSize={"sm"} opacity={0.5}>Please verify your email address to continue</Text>
            <Skeleton isLoaded={!!(confirmationTime && email)}>
                <VStack align={"left"}>
                    <Text>
                        We've sent an email to <b>{email}</b> at <b>{new Date(confirmationTime ?? "").toLocaleString()}</b>. Click the link in the email to verify your address.
                    </Text>
                    <Divider />
                    <Text>
                        It can take up to 2 minutes to arrive. Please check your junk folder if you don't see it in your inbox.
                    </Text>
                    <Text fontSize={"sm"} opacity={"0.5"}>
                        If you still can't find it, add our email as a safe sender in Outlook. Go to <b>Settings</b> {">"} <b>Junk Email</b> {">"} Scroll down to <b>Senders</b> {">"} Add <b>'support@campus-marketplace.local'</b> to the list.
                    </Text>
                </VStack>
            </Skeleton>
            <Text color="red.500">{emailError}</Text>

            <Button isDisabled={!canSendVerification()} onClick={handleResendClick} isLoading={resendLoading} colorScheme='blue' width={"100%"} leftIcon={<EmailIcon />}>{canSendVerification() ? "Resend Verification Email" : confirmationTime ? <Countdown
                date={new Date(confirmationTime).getTime() + waitTime * 1000}
                renderer={renderer}
            /> : "Resend Verification Email"
            }</Button>
        </VStack>
    )
}