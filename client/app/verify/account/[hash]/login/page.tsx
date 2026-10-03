/**
 * app/verify/account/[hash]/login/page.tsx
 * Page for verifying the user's account login. This will be used in the login process when needing to confirm the user's email or phone number from the 6 digit OTP. Currently, this will be the page that will be redirected to if the user has forgotten their password, as we have not implemented passwordless login. The hash will contatin the user's id and the type of login (email or phone).
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use client"
import VerifyOTP from '@/components/Auth/VerifyOTP';
import { User } from '@/types';
import { otpLogin, retriveUser, verifyAccount, verifyOTP } from '@/utils/services/auth';
import { decryptOTPHash } from '@/utils/services/encrypt';
import { AspectRatio, Center, Link, Skeleton, Spacer, useToast, VStack } from '@chakra-ui/react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import * as NextLink from 'next/link';
import { useQueryClient } from '@tanstack/react-query';

export default function VerifyAccountLogin({ params }: { params: { hash: string } }) {
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);
    const [otpLoading, setOTPLoading] = useState(false);
    const [otpError, setOTPError] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loginType, setLoginType] = useState<string | null>(null)
    const searchParams = useSearchParams()
    const onLogin = searchParams.get('callback_url') ?? "/buy"
    const toast = useToast();
    const router = useRouter();
    const queryClient = useQueryClient();

    useEffect(() => {
        const getUser = async () => {
            setLoading(true);
            const { userId, type } = await decryptOTPHash(params.hash);
            const { success, error, user } = await retriveUser(userId)
            if (!success) {
                console.error(error);
                return;
            } else {
                setUser(user);
                setLoading(false);

            }
            setLoginType(type);
            setLoading(false);
        }
        getUser()
    }, [setUser, setLoading]);

    const handleResend = async (type: "phone" | "email") => {
        if (user) {
            if (type == "phone" && user.phone) {
                const { success, errorCode } = await otpLogin(null, user.phone)
                if (!success) {
                    setOTPError("Error resending confirmation" + errorCode);
                }
            } else if (type == "email" && user.email) {
                const { success, errorCode } = await otpLogin(user.email, null)
                if (!success) {
                    setOTPError("Error resending confirmation" + errorCode);
                }
            }
        } else {
            setErrorMessage("User not found");
        }
    }

    const handleOTPVerification = async (token: string, email: string | null, phone: string | null) => {
        setOTPLoading(true);
        const { success, error, data } = await verifyOTP(token, email, phone);
        if (!success) {
            setOTPError(error)
            setOTPLoading(false);
        } else {
            if (data && data.user) {
                setUser(data.user)
            } else {
                setErrorMessage("Error obtaining user data");
            }
            setOTPError(null);
            setOTPLoading(false);
        }
    }

    const handleCompleteLogin = async (userId: string) => {
        const id = 'login-toast'
        try {
            const { success, error } = await verifyAccount(userId);
            if (!success) {
                throw new Error(error);
            } else {
                queryClient.invalidateQueries({
                    queryKey: ['userProfile', userId]
                });
                if (!toast.isActive(id)) {
                    toast({
                        id: id,
                        title: "Login complete",
                        description: "You have been logged in successfully.",
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                    });
                }
                router.push(onLogin);
            }
        } catch (error: any) {
            setErrorMessage(error.message);
        }
    }

    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
            <VStack>
                <Center width="50%">
                    <AspectRatio ratio={1} width={{ base: "30%", md: "50%" }} borderRadius={"lg"}>
                        <Link href='/buy' as={NextLink.default}>
                            <Image
                                src="/images/campus-marketplace-logo.png"
                                alt="Campus Marketplace Logo"
                                width={200}
                                height={200}
                            />
                        </Link>
                    </AspectRatio>
                </Center>
                <Skeleton isLoaded={!loading && !otpLoading}>
                    <VStack>
                        <VStack maxW="md" mx="auto" mt={8} p={4} borderWidth={1} borderRadius="lg" boxShadow="lg" minH={300}>
                            {user && loginType ? (
                                <>
                                    {(loginType === "email" ? user.last_sign_in_at && user.recovery_sent_at && (new Date(user.last_sign_in_at) > new Date(user.recovery_sent_at)) : (loginType == "phone") ? user.last_sign_in_at && user.confirmation_sent_at && (new Date(user.last_sign_in_at) > new Date(user.confirmation_sent_at)) : false) ? (
                                        handleCompleteLogin(user.id)
                                    ) : (
                                        <VerifyOTP handleVerification={handleOTPVerification} type={loginType} email={loginType == "email" ? (user.email ?? null) : null} phone={loginType == "phone" ? (user.phone ?? null) : null} otpError={otpError} confirmation_sent_at={loginType == "email" ? (user.recovery_sent_at ?? null) : (loginType == "phone") ? (user.confirmation_sent_at ?? null) : null} resendOTP={handleResend} />
                                    )}
                                </>
                            ) : (
                                <>
                                    <h1 className="text-3xl font-bold">There was an error getting user details. {errorMessage} </h1>
                                    <Spacer />
                                </>
                            )}
                        </VStack>
                    </VStack>
                </Skeleton>
            </VStack>
        </div>
    )

}