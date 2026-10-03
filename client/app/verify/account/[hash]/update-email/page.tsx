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
import { createClient } from '@/utils/supabase/client';
import { decryptOTPHash } from '@/utils/services/encrypt';
import { AspectRatio, Box, Button, Center, FormControl, FormErrorMessage, FormHelperText, FormLabel, Icon, Input, InputGroup, InputLeftElement, InputRightElement, Link, Skeleton, Spacer, Text, useToast, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Profile, User } from '@/types';
import { checkUserEmail, retriveUser, signOut } from '@/utils/services/auth';
import Image from 'next/image';
import * as NextLink from 'next/link';
import { fetchUserProfile, updateEmail } from '@/utils/services/account';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { ArrowBackIcon, CheckIcon, CloseIcon, EmailIcon } from '@chakra-ui/icons';
import { useQueryClient } from '@tanstack/react-query';

type UpdateEmailFormData = {
    email: string;
};

export default function UpdateEmail({ params }: { params: { hash: string } }) {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<Profile | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [signupType, setSignupType] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const toast = useToast();
    const router = useRouter();
    const supabase = createClient();
    const [emailComplete, setEmailComplete] = useState<boolean | null>(null);

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
    }, []);

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


    const handleUpdateEmail = async (values: UpdateEmailFormData, actions: FormikHelpers<UpdateEmailFormData>) => {
        setErrorMessage(null);
        if (!userId || !userProfile) {
            setErrorMessage("User not found, the URL may be incorrect. Try repeating the same steps to come back to this page.")
            actions.setSubmitting(false);
            return;
        }
        const email = values.email;

        const { success: successEmail } = await checkUserEmail(email)
        if (successEmail) {
            setErrorMessage("An account with this email already exists. Please choose a different one.")
        } else {
            const { success, errorCode } = await updateEmail(userId, email, true, window.location.origin);
            if (success && user) {
                router.push(`/verify/account/${params.hash}/signup`)
                setLoading(true);
            } else {
                setErrorMessage("Something went wrong: " + errorCode + "Please contact us at campus-marketplace.local/contact")
            }
        }
        actions.setSubmitting(false);
    }

    function validateEmail(value: string) {
        let error;
        if (!value) {
            error = 'Email is required';
        } else if (!value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) {
            error = 'Please enter a valid email';
        } else if (value.toLowerCase().endsWith('.edu')) {
            error = 'Please enter a personal email address';
        }
        return error;
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
                    <VStack maxW="md" mx="auto" mt={8} p={4} borderWidth={1} borderRadius="lg" boxShadow="lg" minH={300}>
                        <h1 className="text-3xl font-bold text-center">Welcome Back{` ${user?.user_metadata.first_name}`}!</h1>
                        {user && signupType ? (
                            <Formik
                                initialValues={{
                                    email: "",
                                } as UpdateEmailFormData}
                                onSubmit={handleUpdateEmail}
                            >
                                {(props) => (
                                    <Form>
                                        <VStack align={"left"}>
                                            <Text>Thank you for signing up and being one of our early users! You can add a personal email for account notifications.</Text>
                                            <Field name='email' validate={validateEmail}>
                                                {({ field, form }: any) => (
                                                    <FormControl isInvalid={form.errors.email && form.touched.email} isRequired>
                                                        <FormLabel>Personal Email</FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement pointerEvents='none'>
                                                                <EmailIcon color='gray.300' />
                                                            </InputLeftElement>
                                                            <Input {...field}
                                                                placeholder='student@example.com'
                                                                onChange={e => {
                                                                    form.setFieldValue(field.name, e.target.value);
                                                                    if (validateEmail(e.target.value) === undefined) {
                                                                        setEmailComplete(true);
                                                                    } else if (e.target.value === '') {
                                                                        setEmailComplete(null);
                                                                    } else {
                                                                        setEmailComplete(false);
                                                                    }
                                                                }} />
                                                            {emailComplete === true ? (
                                                                <InputRightElement>
                                                                    <CheckIcon color='green.500' />
                                                                </InputRightElement>
                                                            ) : emailComplete === false ? (
                                                                <InputRightElement>
                                                                    <CloseIcon color='red.500' />
                                                                </InputRightElement>
                                                            ) : null}
                                                        </InputGroup>
                                                        {emailComplete === null ? <FormHelperText>This personal email will be used for account notifications.</FormHelperText> :
                                                            <FormErrorMessage>{form.errors.email}</FormErrorMessage>}
                                                    </FormControl>
                                                )}
                                            </Field>
                                            <Button
                                                mt={4}
                                                colorScheme='blue'
                                                isLoading={props.isSubmitting}
                                                type='submit'
                                                width={"100%"}
                                            >
                                                Add Email
                                            </Button>
                                            {errorMessage && <Text color='red'>{errorMessage}</Text>}
                                            <Box position="absolute" left={8} top={8} role="group">
                                                <Button
                                                    colorScheme='blue'
                                                    variant={'outline'}
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
                                                    Back
                                                </Button>
                                            </Box>
                                        </VStack>
                                    </Form>
                                )}
                            </Formik>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold">There was an error getting user details. {errorMessage}</h1>
                                <Spacer />
                            </>
                        )}
                    </VStack>
                </Skeleton>
            </VStack>
        </div>
    )

}
