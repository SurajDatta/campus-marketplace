/**
 * app/updates/page.tsx
 * Page where users can see updates from the app, such as new features, bug fixes, and other changes, including LAUNCH!
 * @AshokSaravanan222
 * @updated 2024-09-12
 */
"use client";
import React, { useEffect, useState } from 'react';
import { useToast, Button, Text, VStack, Heading, HStack, Skeleton, Center, Icon } from '@chakra-ui/react';
import { Profile } from '@/types';
import { sendContactMessage, subscribeUserStatus } from '@/utils/services/actions';
import Layout from '@/components/Layout/Layout';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { FormControl, FormLabel, FormErrorMessage, Input, Select } from '@chakra-ui/react';
import AnimatedIcon from '@/components/Common/Other/AnimatedIcon';
import { BellIcon, CloseIcon } from '@chakra-ui/icons';
import useSupabaseBrowser from '@/utils/supabase/supabase-browser';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/utils/queries/get-user';
import { getUserProfile } from '@/utils/queries/get-user-profile';
import { getAlerts } from '@/utils/queries/get-alerts';

type LaunchFormData = {
    email: string;
    source: string;
};

enum LaunchSourceEnum {
    FRIEND = 'friend',
    REDDIT = 'reddit',
    SNAPCHAT = 'snapchat',
    GROUPME = 'groupme',
    OTHER = 'other',
}


export default function Updates() {
    const supabase = useSupabaseBrowser()

    const { data: user, isLoading: loadingUser } = useQuery({
        queryKey: ["user"],
        queryFn: () => getUser(supabase),
    });

    // Step 2: Fetch user profile, only if user exists
    const { data: userProfile, isLoading: loadingProfile } = useQuery({
        queryKey: ["userProfile", user?.id],
        queryFn: () => getUserProfile(supabase, user!.id),
        enabled: !!user, // This query will only run if `user` is not null
    });

    // Step 3: Fetch alerts, only if userProfile exists
    const { data: alerts, isLoading: loadingAlerts } = useQuery({
        queryKey: ["alerts", user?.id],
        queryFn: () => getAlerts(supabase, userProfile!.id),
        enabled: !!user, // This query will only run if `userProfile` is not null
    });

    return (
        <Layout
            user={user}
            userProfile={userProfile}
            alerts={alerts}
            loadingUser={loadingUser}
            loadingProfile={loadingProfile}
            loadingAlerts={loadingAlerts}
            visitorContent={
                <UpdateScreen userProfile={userProfile ?? null} isLoading={loadingProfile} />
            }>
            <UpdateScreen userProfile={userProfile ?? null} isLoading={loadingProfile} />
        </Layout>
    );
}


const UpdateScreen = ({ userProfile, isLoading }: { userProfile: Profile | null, isLoading: boolean }) => {
    const [subscribed, setSubscribed] = useState<boolean>(userProfile ? userProfile.subscribed : false);
    const [isUnsubscribing, setIsUnsubscribing] = useState(false);
    const toast = useToast();
    const launchValidationSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('Email is required'),
        source: Yup.string().required('Source is required'),
    });

    const handleSubmit = async (values: LaunchFormData, actions: FormikHelpers<LaunchFormData>) => {
        const { email, source } = values;

        try {
            const { success, error } = await sendContactMessage(email, "other", source); // Assuming sendContactMessage can take subject and name as well
            if (!success) {
                throw new Error(error);
            }
            if (userProfile) {
                const { success: subscribeSuccess, error: subscribeError } = await subscribeUserStatus(userProfile.id, true);
                if (!subscribeSuccess) {
                    throw new Error(subscribeError);
                }
            }
            setSubscribed(true);
            toast({
                title: 'We got you!',
                description: 'We will notify you with updates.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: `Error getting notified: ${error.message}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            actions.setSubmitting(false);
        }
    };

    const handleUnsubscribe = async (userId: string) => {
        setIsUnsubscribing(true);
        try {
            const { success, error } = await subscribeUserStatus(userId, false);
            if (!success) {
                throw new Error(error);
            }
            toast({
                title: 'Unsubscribed',
                description: 'You will no longer receive updates.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            setSubscribed(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: `Error unsubscribing: ${error.message}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsUnsubscribing(false);
        }
    }

    useEffect(() => {
        setSubscribed(userProfile ? userProfile.subscribed : false);
    }, [userProfile]);

    return (
        <VStack align={"left"}>
            <HStack>
                <AnimatedIcon
                    src={"https://cdn.lordicon.com/jcepibgt.json"}
                    trigger="hover"
                    style={{ width: "100px", height: "100px" }}
                    colors="primary:#000000"
                />
                <Heading>Licks Updates</Heading>
            </HStack>
            <Text>Get details of when we officially launch, our latest feature updates, and increased availability on the marketplace.</Text>
            <Skeleton isLoaded={!isLoading} height={isLoading ? "100vh" : "auto"}>
                {subscribed ?
                    <Center>
                        <VStack>
                            <HStack p={2}>
                                <BellIcon boxSize={8} />
                                <Text fontSize={"2xl"}>You are on the list!</Text>
                            </HStack>
                            <Button colorScheme='blue' leftIcon={<Icon as={CloseIcon} />} onClick={() => {
                                if (userProfile) {
                                    handleUnsubscribe(userProfile.id);
                                }
                            }} isLoading={isUnsubscribing}>Unsubscribe</Button>
                        </VStack>
                    </Center>
                    : <Formik
                        initialValues={{ email: '', source: '' } as LaunchFormData}
                        onSubmit={handleSubmit}
                        validationSchema={launchValidationSchema}
                    >
                        {(props) => (
                            <Form>
                                <VStack spacing={4} align="left">
                                    <Field name="email">
                                        {({ field, form }: any) => (
                                            <FormControl isInvalid={form.errors.email && form.touched.email} isRequired>
                                                <FormLabel>Email</FormLabel>
                                                <Input {...field} placeholder="Your email" />
                                                <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                                            </FormControl>
                                        )}
                                    </Field>

                                    <Field name="source">
                                        {({ field, form }: any) => (
                                            <FormControl isInvalid={form.errors.source && form.touched.source} isRequired>
                                                <FormLabel>How did you hear about us?</FormLabel>
                                                <Select {...field} placeholder="We'd love to know!">
                                                    <option value={LaunchSourceEnum.FRIEND}>Friend</option>
                                                    <option value={LaunchSourceEnum.REDDIT}>Reddit</option>
                                                    <option value={LaunchSourceEnum.SNAPCHAT}>Snapchat</option>
                                                    <option value={LaunchSourceEnum.GROUPME}>GroupMe</option>
                                                    <option value={LaunchSourceEnum.OTHER}>Other</option>
                                                </Select>
                                                <FormErrorMessage>{form.errors.source}</FormErrorMessage>
                                            </FormControl>
                                        )}
                                    </Field>

                                    <Button
                                        leftIcon={<BellIcon />}
                                        colorScheme="blue"
                                        isLoading={props.isSubmitting}
                                        type="submit"
                                    >
                                        Get Notified
                                    </Button>
                                </VStack>
                            </Form>
                        )}
                    </Formik>}
            </Skeleton>
        </VStack >
    );
}
