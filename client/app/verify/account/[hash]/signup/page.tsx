/**
 * app/verify/account/[hash]/signup/page.tsx
 * Page for verifying the user's account when they sign up. This page will be used to handle the first confirmation of the user's email or phone number (auto confirmed right now). The hash will contain the user's id and the type of signup (email or phone).
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use client"
import VerifyEmail from '@/components/Auth/VerifyEmail';
import VerifyOTP from '@/components/Auth/VerifyOTP';
import { createClient } from '@/utils/supabase/client';
import { decryptOTPHash } from '@/utils/services/encrypt';
import { AspectRatio, Box, Button, Center, HStack, Icon, Link, Skeleton, Spacer, Text, useToast, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Profile, User } from '@/types';
import { resendSignupConfirmationEmail, resendSignupConfirmationSMS, retriveUser, signOut, verifyOTP } from '@/utils/services/auth';
import Image from 'next/image';
import * as NextLink from 'next/link';
import { fetchUserProfile } from '@/utils/services/account';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useQueryClient } from '@tanstack/react-query';

export default function VerifyAccount({ params }: { params: { hash: string } }) {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<Profile | null>(null);
    const [otpLoading, setOTPLoading] = useState(false);
    const [otpError, setOTPError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [signupType, setSignupType] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const toast = useToast();
    const router = useRouter();
    const supabase = createClient();

    const getUser = async () => {
        setLoading(true);
        const { userId, type } = await decryptOTPHash(params.hash);
        const { success, error, user } = await retriveUser(userId)
        if (!success) {
            console.error(error);
            return;
        } else {
            setUser(user);
            if (user) {
                const userProfile = await fetchUserProfile(user.id);
                setUserProfile(userProfile);
            }
        }
        setUserId(userId);
        setSignupType(type);
        setLoading(false);
    }

    useEffect(() => {
        getUser()
    }, [otpLoading]);

    useEffect(() => {
        if (!userId) return;
        const channel = supabase
            .channel("realtime profile changes")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "profiles",
                    filter: `id=eq.${userId}`,
                },
                (payload) => {
                    const profile = payload.new as Profile;
                    if (profile.signed_up_at) {
                        getUser()
                    }
                    setUserProfile(profile);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, supabase]);

    const handleResend = async (type: "phone" | "email") => {
        setOTPError(null);
        if (user) {
            if (type == "phone" && user.phone) {
                const { error } = await resendSignupConfirmationSMS(user.phone);
                if (error) {
                    setOTPError("Error resending confirmation");
                }
            } else if (type == "email" && user.email) {
                const { success, error } = await resendSignupConfirmationEmail(user.email, window.location.origin);
                if (!success) {
                    setOTPError("Error resending confirmation" + error);
                    setEmailError("Error resending confirmation" + error);
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
            if (data && data.user && data.user.email) {
                if (!data.user.email_confirmed_at) {
                    const { error: emailError } = await resendSignupConfirmationEmail(data.user.email, window.location.origin);
                    if (emailError) {
                        setErrorMessage("Error sending confirmation email");
                    }
                }
            } else {
                setErrorMessage("Error obtaining user data");
            }
            setOTPError(null);
            setOTPLoading(false);
        }
    }


    const handleSignOut = async () => {
        try {
            await signOut();
            queryClient.invalidateQueries({
                queryKey: ['userProfile', userId]
            })
            queryClient.invalidateQueries({
                queryKey: ['user', userId]
            })
            router.push('/buy')
            toast({
                title: "Signed out",
                description: "You have been signed out successfully.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error: any) {
            toast({
                title: 'Error signing out.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };


    const handleCompleteSignup = () => {
        router.push("/buy")
    }

    return (


        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
            <VStack>
                <Center width="50%">
                    <AspectRatio ratio={1} width={{ base: "30%", md: "50%" }} borderRadius={"lg"}>
                        <Link href='/buy'>
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
                        <VStack maxW="md" mx="auto" mt={8} p={4} borderWidth={1} borderRadius="lg" boxShadow="lg" minH={300} minW={300}>
                            {user && userProfile && signupType ? (
                                <>
                                    {(!user.phone || user.phone_confirmed_at) ? (
                                        <>
                                            {user.email && user.email_confirmed_at ? (
                                                handleCompleteSignup()
                                            ) : (
                                                <VerifyEmail email={user.email ?? null} emailError={emailError} confirmation_sent_at={user.confirmation_sent_at ?? null} resendEmail={handleResend} />
                                            )}
                                        </>
                                    ) : (
                                        <VStack spacing={0} align={"left"}>
                                            <Link color={"teal"} as={NextLink.default} href={`/verify/account/${params.hash}/update-phone`}>
                                                <HStack>
                                                    <ArrowBackIcon />
                                                    <Text fontSize={"sm"}>Use different phone number</Text>
                                                </HStack>
                                            </Link>
                                            <VerifyOTP handleVerification={handleOTPVerification} email={signupType == "email" ? (user.email ?? null) : null} phone={signupType == "phone" ? (user.phone ?? null) : null} otpError={otpError} confirmation_sent_at={user.confirmation_sent_at ?? null} resendOTP={handleResend} type={signupType} />
                                        </VStack>
                                    )}
                                </>
                            ) : (
                                <>
                                    <h1 className="text-3xl font-bold">There was an error getting user details. {errorMessage}</h1>
                                    <Spacer />
                                </>
                            )}
                        </VStack>
                        <Box position="absolute" left={8} top={8} role="group">
                            <Button
                                colorScheme='blue'
                                onClick={handleSignOut}
                                py={2}
                                px={4}
                                borderRadius="md"
                                leftIcon={
                                    <Icon
                                        as={ArrowBackIcon}
                                        transition="transform 0.2s" // Adds smooth transition
                                        _groupHover={{ transform: 'translateX(-4px)' }} // Moves icon left on hover
                                    />
                                }
                            >
                                Sign Out
                            </Button>
                        </Box>
                    </VStack>
                </Skeleton>
            </VStack>
        </div>
    )

}