/**
 * app/contact/page.tsx
 * Contact page for people to ask inquiries or report issues.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-08-13
 *
 *
 */
"use client";
import React from 'react';
import { useToast, Button, Text, VStack, Textarea, Heading } from '@chakra-ui/react';
import { ContactSubject } from '@/types';
import { sendContactMessage } from '@/utils/services/actions';
import Layout from '@/components/Layout/Layout';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { FormControl, FormLabel, FormErrorMessage, Input, Select } from '@chakra-ui/react';
import useSupabaseBrowser from '@/utils/supabase/supabase-browser';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/utils/queries/get-user';
import { getUserProfile } from '@/utils/queries/get-user-profile';
import { getAlerts } from '@/utils/queries/get-alerts';

type ContactFormData = {
    name: string;
    subject: ContactSubject | '';
    message: string;
};

enum ContactSubjectEnum {
    GENERAL = 'general',
    ACCOUNT = 'account',
    BUGS = 'bugs',
    FEATURE = 'feature request',
    OTHER = 'other',
}

export default function Contact() {
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
                <ContactScreen />
            }>
            <ContactScreen />
        </Layout>
    );
}


const ContactScreen = () => {
    const toast = useToast();
    const contactValidationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
        subject: Yup.string().required('Subject is required'),
        message: Yup.string().required('Message is required').min(10, 'Message must be at least 10 characters'),
    });

    const handleSubmit = async (values: ContactFormData, actions: FormikHelpers<ContactFormData>) => {
        const { name, subject, message } = values;

        try {
            const { success, error } = await sendContactMessage(name, subject as ContactSubject, message); // Assuming sendContactMessage can take subject and name as well
            if (!success) {
                throw new Error(error);
            }
            toast({
                title: 'Message Sent',
                description: 'Your message has been sent successfully.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: `Error sending message: ${error.message}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            actions.setSubmitting(false);
        }
    };

    return (
        <VStack align={"left"}>
            <Heading>Contact Us</Heading>
            <Formik
                initialValues={{ name: '', subject: '', message: '' } as ContactFormData}
                onSubmit={handleSubmit}
                validationSchema={contactValidationSchema}
            >
                {(props) => (
                    <Form>
                        <VStack spacing={4} align="left">
                            <Field name="name">
                                {({ field, form }: any) => (
                                    <FormControl isInvalid={form.errors.name && form.touched.name} isRequired>
                                        <FormLabel>Name</FormLabel>
                                        <Input {...field} placeholder="Your Name" />
                                        <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                                    </FormControl>
                                )}
                            </Field>

                            <Field name="subject">
                                {({ field, form }: any) => (
                                    <FormControl isInvalid={form.errors.subject && form.touched.subject} isRequired>
                                        <FormLabel>Subject</FormLabel>
                                        <Select {...field} placeholder="Subject">
                                            <option value={ContactSubjectEnum.GENERAL}>General</option>
                                            <option value={ContactSubjectEnum.ACCOUNT}>Account</option>
                                            <option value={ContactSubjectEnum.FEATURE}>Feature Request</option>
                                            <option value={ContactSubjectEnum.BUGS}>Report a Bug</option>
                                            <option value={ContactSubjectEnum.OTHER}>Other</option>
                                        </Select>
                                        <FormErrorMessage>{form.errors.subject}</FormErrorMessage>
                                    </FormControl>
                                )}
                            </Field>

                            <Field name="message">
                                {({ field, form }: any) => (
                                    <FormControl isRequired>
                                        <FormLabel>Message</FormLabel>
                                        <Textarea {...field} placeholder="Send us a message if you have any questions or concerns." />
                                        <FormErrorMessage>{form.errors.message}</FormErrorMessage>
                                    </FormControl>
                                )}
                            </Field>

                            <Button
                                colorScheme="blue"
                                isLoading={props.isSubmitting}
                                type="submit"
                            >
                                Submit
                            </Button>
                        </VStack>
                    </Form>
                )}
            </Formik>
            <Text>For demo support, contact support@campus-marketplace.local.</Text>
        </VStack>
    );
}
