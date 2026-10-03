/**
 * app/account/page.tsx 
 * Account page, which will show the user their account details and allow them to update their information.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-25
 *
 *
 */
"use client"
import { Divider, Heading, useBreakpointValue } from '@chakra-ui/react';
import Layout from '@/components/Layout/Layout';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/utils/queries/get-user';
import useSupabaseBrowser from '@/utils/supabase/supabase-browser';
import { getUserProfile } from '@/utils/queries/get-user-profile';
import { getAlerts } from '@/utils/queries/get-alerts';
import React, { useEffect, useState } from 'react';
import {
    Box, Text, Button, useToast, FormControl,
    FormLabel, Input, useDisclosure, FormErrorMessage,
    Skeleton, AlertDialog, AlertDialogOverlay, AlertDialogContent,
    AlertDialogHeader, AlertDialogBody, AlertDialogFooter, HStack, Switch, Badge, Link, Wrap,
    VStack,
    IconButton,
    CircularProgress,
    CircularProgressLabel
} from '@chakra-ui/react';
import { createOnboardingLink, createStripeAccount } from '@/utils/services/stripe';
import { changePassword, createSellerAccount, deleteSellerAccount, updateName, updateNotificationSettings, updatePhone } from '@/utils/services/account';
import { Device, MeetupTimes, Profile, User } from '@/types';
import { ArrayHelpers, Field, FieldArray, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import * as NextLink from 'next/link';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import * as Yup from 'yup';
import VerificationCountdown from '@/components/Account/VerificationCountdown';
import { usePathname, useRouter } from 'next/navigation';
import useStripeConnect from '@/hooks/useStripeConnect';
import { ConnectAccountManagement, ConnectComponentsProvider, ConnectPayments, ConnectPayouts } from '@stripe/react-connect-js';
import { fetchDevices, register, updateMFADevices, verifyRegistration } from '@/utils/services/mfa';
import { startRegistration } from '@simplewebauthn/browser';
import UAParser from 'ua-parser-js';
import { useQueryClient } from '@tanstack/react-query';
import LinkGoogleCalendar from '@/components/Common/Times/LinkGoogleCalendar';
import { getTimes } from '@/utils/queries/get-times';
import { getCalendar } from '@/utils/queries/get-calendar';

type PersonalDetailsFormData = {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
};

type PhoneFormData = {
    phone: string;
    confirmPhone: string;
};

type PasswordFormData = {
    password: string;
    confirmPassword: string;
};

type MFAFormData = {
    devices: { id: string, type: string, info: string, created: string }[];
}


type NotificationFormData = {
    email: boolean;
    sms: boolean;
};


export default function UserAccount() {
    const supabase = useSupabaseBrowser();
    const isMobile = useBreakpointValue({ base: true, md: false }) ?? true;
    const cancelRef = React.useRef(null);
    const { isOpen: isDeleteAccountOpen, onOpen: onDeleteAccountOpen, onClose: onDeleteAccountClose } = useDisclosure();
    const verifyValid = 10 * 60 * 1000; // 10 minutes since they have logged in with OTP
    const toast = useToast();
    const [accountLoading, setAccountLoading] = useState<boolean>(false);
    const development = process.env.NEXT_PUBLIC_ENV === 'development';
    const pathname = usePathname();
    const router = useRouter();
    const [devices, setDevices] = useState<Device[]>([]);
    const addDeviceRef = React.useRef<HTMLButtonElement | null>(null);
    const queryClient = useQueryClient();
    const [stripeUrl, setStripeUrl] = useState<string | null>(null);

    const generateNextMonth = (): Date[] => {
        const now = new Date();
        const start = now
        // const start = new Date(now.setHours(now.getHours() + 48));
        const nextMonth: Date[] = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            nextMonth.push(date);
        }
        return nextMonth;
    };
    const nextMonth = generateNextMonth();
    const days = nextMonth.map((date) => date.toDateString());

    const formatTime = (timez: string) => {
        const [hours, minutes] = timez.split(':');
        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);
        const isPM = hour >= 12;
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        const formattedMinute = minute < 10 ? `0${minute}` : minute;
        return `${formattedHour}:${formattedMinute} ${isPM ? 'PM' : 'AM'}`;
    };

    const getBlockedTimes = (meetupTimes: MeetupTimes | null) => {
        if (!meetupTimes) {
            return ''
        }
        const blockedTimes = Object.keys(meetupTimes).map((day) => {
            return meetupTimes[day].map((id) => {
                const time = (times ?? []).find(t => t.id === id)?.timez;
                return `${day} ${formatTime(time || '')}`;
            })
        }, []).flat().join(', ');

        return blockedTimes;
    }

    const handlePersonalDetailsChange = async (values: PersonalDetailsFormData, actions: FormikHelpers<PersonalDetailsFormData>) => {
        try {
            if (!userProfile) {
                throw new Error("User profile not found")
            }
            const { success, error } = await updateName(userProfile.id, values.first_name, values.last_name)
            if (!success) {
                throw new Error("Failed to update personal details: " + error)
            } else {
                toast({
                    title: 'Personal Details updated.',
                    description: "Your changes have been saved.",
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error updating personal details.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            actions.setSubmitting(false);
        }
    }

    const handleSaveNotifications = async (values: NotificationFormData, actions: FormikHelpers<NotificationFormData>) => {
        try {
            if (!userProfile) {
                throw new Error("User profile not found")
            }
            // SMS functionality disabled - always pass false for SMS
            const { success, error } = await updateNotificationSettings(userProfile.id, values.email, false)
            if (!success) {
                throw new Error("Failed to save notifications: " + error)
            } else {
                toast({
                    title: 'Notifications saved.',
                    description: "Your changes have been saved.",
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error saving notifications.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            actions.setSubmitting(false);
        }
    }

    const handleAddDevice = async (arrayHelpers: ArrayHelpers, email: string | undefined, deviceIds: string[], props: FormikProps<MFAFormData>) => {
        // attempt to add a new device, then push it to the array
        try {
            if (!email) {
                throw new Error("Email not found")
            }
            const origin = window.location.origin;
            const rpID = new URL(origin).hostname;
            const { success: optionsSuccess, error: optionsError, options } = await register(email, rpID, deviceIds);
            if (!optionsSuccess) {
                throw new Error("Failed to update MFA: " + optionsError)
            }
            if (!options) {
                throw new Error("Failed to update MFA: No options returned");
            }

            const parser = new UAParser();
            const result = parser.getResult();

            const deviceType = result.device.type || 'desktop';
            const osName = result.os.name;
            const browserName = result.browser.name;
            const deviceInfo = `${osName} - ${browserName}`;

            const createdAt = new Date().toISOString();
            const attResp = await startRegistration(options);
            const { success, error, verified, newId } = await verifyRegistration(rpID, origin, options, attResp, createdAt, deviceType, deviceInfo);
            if (!success) {
                throw new Error("Failed to update MFA: " + error)
            } else {
                if (verified && newId) {
                    arrayHelpers.push({
                        id: newId,
                        type: deviceType,
                        info: deviceInfo,
                        created: createdAt,
                    })
                    props.submitForm()
                } else {
                    throw new Error("Failed to update MFA: Device not verified")
                }
            }
        } catch (error: any) {
            toast({
                title: 'Error adding device.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    }


    const handleMFAChange = async (values: MFAFormData, actions: FormikHelpers<MFAFormData>) => {
        try {
            if (!userProfile) {
                throw new Error("User profile not found")
            }
            const deviceIds = values.devices.map((device) => device.id)
            const { success, error } = await updateMFADevices(userProfile.id, deviceIds)
            if (!success) {
                throw new Error("Failed to update MFA: " + error)
            }
            queryClient.invalidateQueries({
                queryKey: ['userProfile', userProfile.id]
            });
            toast({
                title: 'MFA updated.',
                description: "Your changes have been saved.",
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error: any) {
            toast({
                title: 'Error updating MFA.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            actions.setSubmitting(false);
        }
    }

    const convertPhoneNumberToPlain = (formattedPhoneNumber: string) => {
        // Remove all non-digit characters to get plain phone number
        return "+1" + formattedPhoneNumber.replace(/\D/g, '');
    }

    const handlePhoneChange = async (values: PhoneFormData, actions: FormikHelpers<PhoneFormData>) => {
        try {
            if (!userProfile) {
                throw new Error("User profile not found")
            }
            const formattedPhone = convertPhoneNumberToPlain(values.phone);
            const { success, error } = await updatePhone(userProfile.id, formattedPhone, false) // will need to integrate phone verification later.
            // an issue that could arise is allowing people to put in their phone number and then not verifying that it is theirs. This is an issue we will have to deal with until we have enough money to get twillio to work.
            if (!success) {
                throw new Error("Failed to update phone number: " + error)
            } else {
                queryClient.invalidateQueries({
                    queryKey: ['user', userProfile.id]
                })
                toast({
                    title: 'Phone number updated.',
                    description: "Your changes have been saved.",
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error updating phone number.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            actions.setSubmitting(false);
        }
    }

    const handlePasswordChange = async (values: PasswordFormData, actions: FormikHelpers<PasswordFormData>) => {
        try {
            const { success, error } = await changePassword(values.password)
            if (!success) {
                throw new Error("Failed to update password: " + error)
            } else {
                queryClient.invalidateQueries({
                    queryKey: ['user', userProfile?.id]
                })
                toast({
                    title: 'Password updated.',
                    description: "Your changes have been saved.",
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error updating password.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            actions.setSubmitting(false);
        }

    }

    const handleAccountDelete = async (userProfile: Profile, onCompletion: () => void, development: boolean) => {
        setAccountLoading(true);
        try {
            const { success, error } = await deleteSellerAccount(userProfile.id, development)
            if (!success) {
                throw new Error("Failed to delete account: " + error)
            } else {
                queryClient.invalidateQueries({
                    queryKey: ['userProfile', userProfile.id]
                })
                toast({
                    title: 'Your account has been deleted successfully.',
                    description: "Your changes have been saved.",
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error deleting account.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setAccountLoading(false);
            onCompletion();
        }
    }


    const handleAccountCreate = async (userProfile: Profile, user: User, onCompletion: () => void, development: boolean) => {
        setAccountLoading(true);
        try {
            const { accountId, error: stripeError } = await createStripeAccount(userProfile, user, development);
            if (accountId) {
                const { success, error } = await createSellerAccount(userProfile.id, accountId, development)
                if (!success) {
                    throw new Error("Failed to create account: " + error)
                } else {
                    const onboardingLink = await createOnboardingLink(accountId, pathname, true);
                    setStripeUrl(onboardingLink);
                    toast({
                        title: 'Your account has been created successfully.',
                        description: "Your changes have been saved.",
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                    });
                    queryClient.invalidateQueries({
                        queryKey: ['userProfile', userProfile.id]
                    })
                    router.push(onboardingLink ?? pathname);
                }
            } else {
                throw new Error("Failed to create account: " + stripeError)
            }
        } catch (error: any) {
            toast({
                title: 'Error creating account.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setAccountLoading(false);
            onCompletion();
        }
    }

    const formatDate = (date: string | null) => {
        if (!date) return ""
        return new Date(date).toLocaleString('en-US', {
            weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour12: true
        });
    }

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

    const isVerified = (userProfile: Profile | null) => {
        if (!userProfile) return false;
        return userProfile.last_verified ? new Date(userProfile.last_verified).getTime() > Date.now() - verifyValid : false;
    }


    const personalDetailsValidationSchema = Yup.object().shape({
        first_name: Yup.string().required("First name is required"),
        last_name: Yup.string().required("Last name is required"),
        email: Yup.string(),
        phone: Yup.string()
    });

    const notificationValidationSchema = Yup.object().shape({
        email: Yup.boolean(),
        sms: Yup.boolean(),
    });

    const phoneValidationSchema = Yup.object().shape({
        phone: Yup.string()
            .required('Phone is required')
            .test('is-valid-phone', 'Please enter a valid phone number', function (value) {
                const phoneRegex1 = /^\(\d{3}\) \d{3} \d{4}$/;
                const phoneRegex2 = /^\d{3} \d{3} \d{4}$/;
                const phoneRegex3 = /^\d{10}$/;

                return (
                    phoneRegex1.test(value) ||
                    phoneRegex2.test(value) ||
                    phoneRegex3.test(value)
                );
            }),
        confirmPhone: Yup.string()
            .required('Confirm phone is required')
            .oneOf([Yup.ref('phone')], 'Phone numbers must match')
    });

    const passwordValidationSchema = Yup.object().shape({
        password: Yup.string()
            .required("Password is required")
            .min(8, "Password must be at least 8 characters long"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Passwords must match')
            .required('Password confirmation is required')
    });

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
        queryFn: () => getAlerts(supabase, user!.id),
        enabled: !!user, // This query will only run if `userProfile` is not null
    });

    const { data: times, isLoading: loadingTimes } = useQuery({
        queryKey: ["times"],
        queryFn: () => getTimes(supabase),
    });

    const {
        data: googleCalendarUnavailability,
        isLoading: loadingGoogleCalendarUnavailability,
    } = useQuery({
        queryKey: ["calendar", user?.id],
        queryFn: () => getCalendar(supabase, user!.id, days, times ?? []),
        enabled: !!times && !!user,
    });


    const connectInstance = useStripeConnect(userProfile ? (development ? userProfile.test_account_id : userProfile.account_id) : null);

    useEffect(() => {
        async function fetchStripeUrl(userProfile: Profile) {
            if (development) {
                if (userProfile.test_account_id && !stripeUrl) {
                    const onboarding = userProfile.test_account_requirements.length !== 0;
                    const onboardingLink = await createOnboardingLink(userProfile.test_account_id, pathname, onboarding);
                    setStripeUrl(onboardingLink);
                }
            } else {
                if (userProfile.account_id && !stripeUrl) {
                    const onboarding = userProfile.account_requirements.length !== 0;
                    const onboardingLink = await createOnboardingLink(userProfile.account_id, pathname, onboarding);
                    setStripeUrl(onboardingLink);
                }
            }
        }

        const fetchUserDevices = async (userProfile: Profile) => {
            const { devices } = await fetchDevices(userProfile.devices)
            if (devices.length > 0) {
                setDevices(devices)
            }
        }
        if (userProfile) {
            fetchStripeUrl(userProfile)
            fetchUserDevices(userProfile)
        }

    }, [userProfile])

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get("gcalstatus");
        if (success === "success") {
            urlParams.delete("gcalstatus");
            const newUrl = window.location.pathname + "?" + urlParams.toString();
            router.replace(newUrl);
            if (!toast.isActive('gcalstatus')) {
                toast({
                    id: 'gcalstatus',
                    title: "Google Calendar linked.",
                    status: "success",
                    description:
                        "Your availability will now be synced with Google Calendar.",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } else if (success === "error") {
            urlParams.delete("gcalstatus");
            const newUrl = window.location.pathname + "?" + urlParams.toString();
            router.replace(newUrl);
            toast({
                title: "Error linking Google Calendar.",
                description:
                    "We ran into an error with the signup process. Please try again or press the button in the top right corner to contact us.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    }, []);


    return (
        <Layout user={user} userProfile={userProfile ?? undefined} alerts={alerts} loadingUser={loadingUser} loadingProfile={loadingProfile} loadingAlerts={loadingAlerts}>
            <VStack align="left">
                <Heading>General</Heading>
                <Divider borderColor={"black"} />
                <VStack id='general' align="left" spacing={4} p={4}>
                    <Skeleton isLoaded={!loadingProfile}>
                        <Box borderWidth="1px" borderRadius="lg" p={6}>
                            <Text fontSize="2xl" mb={4}>Personal Details</Text>
                            <Formik
                                initialValues={{
                                    first_name: userProfile ? userProfile.first_name : "",
                                    last_name: userProfile ? userProfile.last_name : "",
                                    email: user ? user.email : "",
                                    phone: user ? user.phone : "",
                                } as PersonalDetailsFormData}
                                onSubmit={handlePersonalDetailsChange}
                                enableReinitialize
                                validationSchema={personalDetailsValidationSchema}
                            >
                                {(props) => (
                                    <Form>
                                        <VStack>

                                            <Field name='email'>
                                                {({ field, form }: any) => (
                                                    <FormControl id="email">
                                                        <FormLabel>Email</FormLabel>
                                                        <Input
                                                            {...field}
                                                            type="email"
                                                            isDisabled
                                                            size="lg"
                                                            _disabled={{ bg: "gray.100", cursor: "not-allowed" }}
                                                        />
                                                        <FormErrorMessage>{props.errors.email}</FormErrorMessage>
                                                    </FormControl>
                                                )}
                                            </Field>

                                            <Field name='phone'>
                                                {({ field, form }: any) => (
                                                    <FormControl id="phone">
                                                        <FormLabel>Phone</FormLabel>
                                                        <Input
                                                            {...field}
                                                            type="tel"
                                                            isDisabled
                                                            size="lg"
                                                            _disabled={{ bg: "gray.100", cursor: "not-allowed" }}
                                                            value={formatPhoneNumber(field.value.slice(1))}
                                                        />
                                                        <FormErrorMessage>{props.errors.phone}</FormErrorMessage>
                                                    </FormControl>
                                                )}
                                            </Field>

                                            <Field name='first_name'>
                                                {({ field, form }: any) => (
                                                    <FormControl id="first_name" isInvalid={form.errors.first_name && form.touched.first_name} isRequired>
                                                        <FormLabel>First Name</FormLabel>
                                                        <Input type="text" size="lg" {...field} />
                                                        <FormErrorMessage>{form.errors.first_name}</FormErrorMessage>
                                                    </FormControl>
                                                )}
                                            </Field>
                                            <Field name='last_name'>
                                                {({ field, form }: any) => (
                                                    <FormControl id="last_name" isInvalid={form.errors.last_name && form.touched.last_name} isRequired>
                                                        <FormLabel>Last Name</FormLabel>
                                                        <Input type="text" size="lg" {...field} />
                                                        <FormErrorMessage>{form.errors.last_name}</FormErrorMessage>
                                                    </FormControl>
                                                )}
                                            </Field>
                                        </VStack>
                                        <Button
                                            colorScheme="blue"
                                            size="md"
                                            isLoading={props.isSubmitting}
                                            type="submit"
                                            mt={4}
                                        >Save</Button>
                                    </Form>
                                )}
                            </Formik>
                        </Box>
                    </Skeleton>

                    <Skeleton isLoaded={!loadingProfile}>
                        <Box borderWidth="1px" borderRadius="lg" p={6}>
                            <Text fontSize="2xl" mb={4}>Notifications</Text>
                            <Formik
                                initialValues={
                                    {
                                        email: userProfile ? userProfile.email_notifications : false,
                                        sms: userProfile ? userProfile.sms_notifications : false,
                                    } as NotificationFormData
                                }
                                onSubmit={handleSaveNotifications}
                                validationSchema={notificationValidationSchema}
                            >
                                {(props) => (
                                    <Form>
                                        <Field name='email'>
                                            {({ field, form }: any) => (
                                                <FormControl id="email" mt={4}>
                                                    <FormLabel>Email Notifications</FormLabel>
                                                    <Switch
                                                        {...field}
                                                        isChecked={form.values.email}
                                                    />
                                                    <Text fontSize={"sm"} opacity={"0.5"}>Whether to send you an email when you get a new alert.</Text>
                                                </FormControl>
                                            )}
                                        </Field>
                                        {/* SMS functionality disabled - SMS notifications always set to false */}
                                        {/* <Field name='sms'>
                                            {({ field, form }: any) => (
                                                <FormControl id="sms" mt={4}>
                                                    <HStack>
                                                        <FormLabel>SMS Notifications</FormLabel>
                                                    </HStack>
                                                    <Switch
                                                        isChecked={form.values.sms}
                                                        {...field}
                                                    />
                                                    <Text fontSize={"small"}>
                                                        If you choose to opt in, we'll text this phone number to send notifications. Message and data rates may apply. By opting in, you agree to our <Link href='/terms' color='teal.500' as={NextLink.default}> Terms and Conditions</Link> and <Link href='/privacy' color='teal.500' as={NextLink.default}> Privacy Policy.</Link></Text>
                                                </FormControl>
                                            )}
                                        </Field> */}
                                        <Button
                                            colorScheme="blue"
                                            size="md"
                                            mt={4}
                                            type='submit'
                                            isLoading={props.isSubmitting}
                                        >
                                            Save
                                        </Button>
                                    </Form>
                                )}
                            </Formik>
                        </Box>
                    </Skeleton>

                    <Skeleton isLoaded={!(loadingUser && loadingProfile)}>
                        <Box borderWidth="1px" borderRadius="lg" p={6}>
                            <Text fontSize="2xl" mb={4}>Multi Factor Authentication</Text>
                            <Formik
                                initialValues={
                                    {
                                        devices: devices.map((device) => {
                                            return {
                                                id: device.id,
                                                type: device.device_type,
                                                info: device.device_info,
                                                created: device.created_at,
                                            }
                                        })
                                    } as MFAFormData
                                }
                                enableReinitialize
                                onSubmit={handleMFAChange}
                            >
                                {(props) => (
                                    <Form>
                                        <FieldArray
                                            name="devices"
                                            render={arrayHelpers => (
                                                <VStack align={"left"}>
                                                    {props.values.devices.map((device, index) => (
                                                        <HStack key={index}>
                                                            <VStack align={"left"} spacing={0} p={2} borderWidth={1} borderRadius={"lg"}>
                                                                <Text><b>{device.type.charAt(0).toUpperCase() + device.type.slice(1)}</b> ({device.info})</Text>
                                                                <Text fontSize={"sm"} opacity={0.5}>{`${formatDate(device.created)}`}</Text>
                                                            </VStack>
                                                            <IconButton
                                                                aria-label='Remove Device'
                                                                icon={<DeleteIcon />}
                                                                type="button"
                                                                colorScheme='red'
                                                                onClick={() => {
                                                                    arrayHelpers.remove(index)
                                                                    props.submitForm()
                                                                }}
                                                            />
                                                        </HStack>
                                                    ))}
                                                    <HStack>
                                                        <Button ref={addDeviceRef} type='button' leftIcon={<AddIcon />} colorScheme="blue" onClick={() => {
                                                            if (user) {
                                                                handleAddDevice(arrayHelpers, user.email, props.values.devices.map((device) => device.id), props)
                                                            }
                                                        }
                                                        }>Add Device</Button>
                                                    </HStack>
                                                </VStack>
                                            )} />
                                    </Form>
                                )}
                            </Formik>
                        </Box>
                    </Skeleton>

                    <Skeleton isLoaded={!(loadingGoogleCalendarUnavailability && loadingUser && loadingProfile && loadingTimes)}>
                        <Box borderWidth="1px" borderRadius="lg" p={6}>
                            <Text fontSize="2xl" mb={4}>Calendars</Text>
                            <HStack>
                                <LinkGoogleCalendar userProfile={userProfile ?? null} allTimes={times ?? []} isDisabled={false} googleCalendarUnavailability={googleCalendarUnavailability?.meetupTimes ?? undefined} isMobile={isMobile} googleCalendarId={googleCalendarUnavailability?.calendarId} />
                                <Text fontSize={"sm"} opacity={"0.5"}>{googleCalendarUnavailability?.calendarId ?
                                    <><b>Blocked Times:</b>{" "}{getBlockedTimes(googleCalendarUnavailability.meetupTimes)}</> : "Use your calendar to block off unavailable times."}</Text>
                            </HStack>
                        </Box>
                    </Skeleton>
                </VStack>

                <Heading>Sell Details</Heading>
                <Divider borderColor={"black"} />
                <VStack id='sell' align="left" spacing={4} p={4}>
                    <Skeleton isLoaded={!loadingProfile}>
                        <Box borderWidth="1px" borderRadius="lg" p={6}>
                            <Text fontSize="2xl" mb={4}>Seller Account</Text>
                            {userProfile && user && stripeUrl && (development ? userProfile.test_account_id && userProfile?.test_account_created_at : userProfile.account_id && userProfile?.account_created_at) ?

                                <>
                                    {
                                        (development ? userProfile.test_account_id && userProfile.test_account_requirements?.length === 0 : userProfile.account_id && userProfile.account_requirements?.length === 0) ?
                                            <VStack align={"left"}>
                                                <Wrap align={"center"}>
                                                    <Box borderWidth="1px" borderRadius="lg" p={2}>
                                                        <Text>ID: {(development ? userProfile.test_account_id : userProfile.account_id)}</Text>
                                                        <Text style={{ opacity: "0.5" }}>Created: {formatDate((development ? userProfile.test_account_created_at : userProfile.account_created_at))}</Text>
                                                    </Box>
                                                </Wrap>

                                                {/* Account Management */}
                                                <Box borderWidth="1px" borderRadius="lg" p={6}>
                                                    <Text fontSize="2xl" mb={4}>Account Information</Text>
                                                    {connectInstance && <ConnectComponentsProvider connectInstance={connectInstance}>
                                                        <ConnectAccountManagement />
                                                    </ConnectComponentsProvider>}
                                                </Box>

                                                {/* Payment Information */}
                                                <Box borderWidth="1px" borderRadius="lg" p={6}>
                                                    <Text fontSize="2xl" mb={4}>Payment Information</Text>
                                                    {connectInstance && <ConnectComponentsProvider connectInstance={connectInstance}>
                                                        <ConnectPayments />
                                                    </ConnectComponentsProvider>}
                                                </Box>

                                                {/* Payout Information */}
                                                <Box borderWidth="1px" borderRadius="lg" p={6}>
                                                    <Text fontSize="2xl" mb={4}>Payout Information</Text>
                                                    {connectInstance && <ConnectComponentsProvider connectInstance={connectInstance}>
                                                        <ConnectPayouts />
                                                    </ConnectComponentsProvider>}
                                                </Box>
                                            </VStack>
                                            : <VStack align={"left"}>
                                                <HStack>
                                                    <CircularProgress value={100 - (((development ? (userProfile.test_account_requirements ? userProfile.test_account_requirements.length : 12) : (userProfile.account_requirements ? userProfile.account_requirements.length : 12)) / 12) * 100)} >
                                                        <CircularProgressLabel>{(100 - (((development ? (userProfile.test_account_requirements ? userProfile.test_account_requirements.length : 12) : (userProfile.account_requirements ? userProfile.account_requirements.length : 12)) / 12) * 100)).toFixed(0)}%</CircularProgressLabel>
                                                    </CircularProgress>
                                                    <Text>Signup Complete</Text>
                                                </HStack>
                                                <Text>
                                                    Continue onboarding <Link color={"teal"} as={NextLink.default} href={stripeUrl}>here</Link>.
                                                </Text>
                                            </VStack>
                                    }
                                </> :
                                <Button
                                    colorScheme='blue'
                                    isLoading={accountLoading}
                                    onClick={() => {
                                        if (userProfile && user) {
                                            handleAccountCreate(userProfile, user, onDeleteAccountClose, development)
                                        }
                                    }}
                                >
                                    Create Account
                                </Button>
                            }
                        </Box>
                    </Skeleton>
                </VStack>

                <Heading>Restricted</Heading>
                <Divider borderColor={"black"} />
                <VStack id='restricted' align="left" spacing={4} p={4}>
                    <Skeleton isLoaded={!loadingProfile}>
                        <Box borderWidth="1px" borderRadius="lg" p={6}>
                            <HStack>
                                <Text fontSize="2xl" mb={4}>Verification</Text>
                                <Badge colorScheme={isVerified(userProfile ?? null) ? "green" : "red"} px={2} py={1} mb={3}>{isVerified(userProfile ?? null) ? "Verified" : "Not Verified"}</Badge>
                            </HStack>
                            {user && userProfile && <VerificationCountdown user={user} userProfile={userProfile} timeValid={verifyValid} />}
                        </Box>
                    </Skeleton>

                    <Skeleton isLoaded={!loadingUser}>
                        <Box borderWidth="1px" borderRadius="lg" p={6}>
                            <Text fontSize="2xl" mb={4}>Change Phone</Text>
                            <Formik
                                initialValues={
                                    {
                                        phone: "",
                                        confirmPhone: "",
                                    } as PhoneFormData
                                }
                                onSubmit={handlePhoneChange}
                                enableReinitialize
                                validationSchema={phoneValidationSchema}
                            >
                                {(props) => (
                                    <Form>
                                        <Field name="phone">
                                            {({ field, form }: any) => (
                                                <FormControl id="phone" mt={4} isInvalid={form.errors.phone && form.touched.phone} isRequired>
                                                    <FormLabel>New Phone Number</FormLabel>
                                                    <Input
                                                        {...field}
                                                        type="tel"
                                                        size="lg"
                                                        value={field.value}
                                                        onChange={e => {
                                                            form.setFieldValue(field.name, formatPhoneNumber(e.target.value));
                                                        }}
                                                    />
                                                    <FormErrorMessage>{props.errors.phone}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>
                                        <Field name="confirmPhone">
                                            {({ field, form }: any) => (
                                                <FormControl id="confirmPhone" mt={4} isInvalid={form.errors.confirmPhone && form.touched.confirmPhone} isRequired>
                                                    <FormLabel>Confirm Phone Number</FormLabel>
                                                    <Input
                                                        {...field}
                                                        type="tel"
                                                        size="lg"
                                                        value={field.value}
                                                        onChange={e => {
                                                            form.setFieldValue(field.name, formatPhoneNumber(e.target.value));
                                                        }}
                                                    />
                                                    <FormErrorMessage>{props.errors.confirmPhone}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>
                                        <Button
                                            colorScheme="blue"
                                            size="md"
                                            isLoading={props.isSubmitting}
                                            isDisabled={!isVerified(userProfile ?? null)}
                                            type='submit'
                                            mt={4}
                                        >
                                            Save
                                        </Button>
                                    </Form>
                                )}
                            </Formik>
                        </Box>
                    </Skeleton>

                    {/* Password Section */}
                    <Skeleton isLoaded={true}>
                        <Box borderWidth="1px" borderRadius="lg" p={6}>
                            <Text fontSize="2xl" mb={4}>Change Password</Text>
                            <Formik
                                initialValues={
                                    {
                                        password: "",
                                        confirmPassword: "",
                                    } as PasswordFormData
                                }
                                onSubmit={handlePasswordChange}
                                enableReinitialize
                                validationSchema={passwordValidationSchema}
                            >
                                {(props) => (
                                    <Form>
                                        <Field name='password'>
                                            {({ field, form }: any) => (
                                                <FormControl id="password" mt={4} isInvalid={form.errors.password && form.touched.password} isRequired>
                                                    <FormLabel>New Password</FormLabel>
                                                    <Input
                                                        type="text"
                                                        size="lg"
                                                        {...field}
                                                    />
                                                    <FormErrorMessage>{props.errors.password}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>
                                        <Field name='confirmPassword'>
                                            {({ field, form }: any) => (
                                                <FormControl id="confirmPassword" mt={4} isInvalid={form.errors.confirmPassword && form.touched.confirmPassword} isRequired>
                                                    <FormLabel>Confirm Password</FormLabel>
                                                    <Input
                                                        type="text"
                                                        size="lg"
                                                        {...field}
                                                    />
                                                    <FormErrorMessage>{props.errors.confirmPassword}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>
                                        <Button
                                            colorScheme="blue"
                                            size="md"
                                            isLoading={props.isSubmitting}
                                            isDisabled={!isVerified(userProfile ?? null)}
                                            type='submit'
                                            mt={4}
                                        >
                                            Save
                                        </Button>
                                    </Form>
                                )}
                            </Formik>
                        </Box>
                    </Skeleton>
                    {/* Delete Seller Account Section */}
                    <Skeleton isLoaded={!loadingProfile}>
                        {(development ? userProfile?.test_account_id : userProfile?.account_id) && <Box borderWidth="1px" borderRadius="lg" p={6}>
                            <Text fontSize="2xl" mb={4}>Delete Account</Text>
                            {/* <Button onClick={onDeleteAccountOpen} colorScheme='red' isDisabled={!isVerified(userProfile ?? null)}>
                            Delete Account
                        </Button> */}
                            <Button onClick={onDeleteAccountOpen} colorScheme='red' isDisabled={!isVerified(userProfile ?? null)}>
                                Delete Seller Account
                            </Button>
                            <AlertDialog
                                isOpen={isDeleteAccountOpen}
                                leastDestructiveRef={cancelRef}
                                onClose={onDeleteAccountClose}
                            >
                                <AlertDialogOverlay>
                                    <AlertDialogContent>
                                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                            Delete Seller Account
                                        </AlertDialogHeader>

                                        <AlertDialogBody>
                                            Are you sure you want to delete your seller account? This is a destructive action and it will reset the seller process for you.
                                        </AlertDialogBody>

                                        <AlertDialogFooter>
                                            <HStack>
                                                <Button ref={cancelRef} onClick={onDeleteAccountClose}>
                                                    Cancel
                                                </Button>
                                                <Button
                                                    colorScheme={'red'}
                                                    isLoading={accountLoading}
                                                    onClick={() => {
                                                        if (userProfile) {
                                                            handleAccountDelete(userProfile, onDeleteAccountClose, development)
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </HStack>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialogOverlay>
                            </AlertDialog>
                        </Box>}
                    </Skeleton>
                </VStack>
            </VStack>
        </Layout>
    );
}
