/**
 * app/verify/account/[hash]/update-phone/page.tsx
 * Will be used for a user to update their phone in case they made a mistake earlier, or if they want to change it.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use client"
import { decryptOTPHash } from '@/utils/services/encrypt';
import { AspectRatio, Box, Button, Center, HStack, Icon, Link, Skeleton, Spacer, Text, useToast, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { User } from '@/types';
import { checkUserPhone, retriveUser, signOut } from '@/utils/services/auth';
import Image from 'next/image';
import * as NextLink from 'next/link';
import { updatePhone } from '@/utils/services/account';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useQueryClient } from '@tanstack/react-query';
import ChangePhoneForm, { ChangePhoneFormData } from '@/components/Auth/UpdatePhoneForm';
import { FormikHelpers } from 'formik';

export default function UpdatePhone({ params }: { params: { hash: string } }) {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [signupType, setSignupType] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const toast = useToast();
    const router = useRouter();

    const getUser = async () => {
        setLoading(true);
        const { userId, type } = await decryptOTPHash(params.hash);
        const { success, error, user } = await retriveUser(userId)
        if (!success) {
            console.error(error);
            return;
        } else {
            setUser(user);
        }
        setUserId(userId);
        setSignupType(type);
        setLoading(false);
    }

    useEffect(() => {
        getUser()
    }, []);

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

    const convertPhoneNumberToPlain = (formattedPhoneNumber: string) => {
        // Remove all non-digit characters to get plain phone number
        return "+1" + formattedPhoneNumber.replace(/\D/g, '');
    }

    const handlePhoneSignup = async (values: ChangePhoneFormData, actions: FormikHelpers<ChangePhoneFormData>) => {
        setErrorMessage(null);
        if (!user) {
            setErrorMessage("User not found, the URL may be incorrect. Try repeating the same steps to come back to this page.")
            actions.setSubmitting(false);
            return;
        }
        const phone = convertPhoneNumberToPlain(values.phone);
        const phoneConfirm = values.phoneConfirm
        if (phone.slice(1) === user.phone) {
            setErrorMessage("You have entered the same phone number as before. Please enter a different phone number.")
            actions.setSubmitting(false);
            return;
        }

        const { success: successPhone } = await checkUserPhone(phone.slice(1))
        if (successPhone) {
            setErrorMessage("An account with this phone number already exists. Please choose a different one.")
            actions.setSubmitting(false);
            return;
        }

        const { success, errorCode } = await updatePhone(user.id, phone, phoneConfirm);
        if (success && user) {
            router.push(`/verify/account/${params.hash}/signup`)
            setLoading(true);
        } else {
            setErrorMessage("Something went wrong: " + errorCode + "Please contact us at campus-marketplace.local/contact")
        }
        actions.setSubmitting(false);
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
                <Skeleton isLoaded={!loading}>
                    <VStack maxW="md" mx="auto" mt={8} p={4} borderWidth={1} borderRadius="lg" boxShadow="lg" minH={300} align={"left"}>
                        <Link color={"teal"} as={NextLink.default} href={`/verify/account/${params.hash}/signup`}>
                            <HStack>
                                <ArrowBackIcon />
                                <Text fontSize={"sm"}>Back</Text>
                            </HStack>
                        </Link>
                        <h1 className="text-3xl font-bold text-center">Change Phone</h1>
                        {user && signupType ? (
                            <>
                                <ChangePhoneForm handlePhoneUpdate={handlePhoneSignup} />
                                <Text color={'red'}>{errorMessage}</Text>
                            </>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold">There was an error getting user details. {errorMessage}</h1>
                                <Spacer />
                            </>
                        )}
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