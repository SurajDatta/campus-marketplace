/**
 * app/verify/confirm-signup/page.tsx
 * Page that the user will see after opening the link sent to their email when first signing up. This page will confirm the user's email and redirect them to the home page. The hash will contain the user's id and the type of signup (email or phone).
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use client"
import React from "react"
import { useSearchParams } from "next/navigation"
import { Button, Text, useToast, HStack, IconButton, VStack, Skeleton, Center, AspectRatio, Divider, Link } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { EmailOtpType } from "@supabase/supabase-js"
import { verifySignup } from "@/utils/services/auth"
import { updateSignupTime } from "@/utils/services/account"
import { ArrayHelpers, FieldArray, Form, Formik, FormikHelpers } from "formik"
import { register, updateMFADevices, verifyRegistration } from "@/utils/services/mfa"
import { AddIcon, CheckIcon, DeleteIcon } from "@chakra-ui/icons"
import { startRegistration } from "@simplewebauthn/browser"
import UAParser from 'ua-parser-js';
import Image from "next/image"
import * as NextLink from "next/link"

type MFAFormData = {
    devices: { id: string, type: string, info: string, created: string }[];
}

export default function ConfirmSignup() {
    const router = useRouter();
    const searchParams = useSearchParams()
    const tokenHash = searchParams.get('token_hash') || ''
    const type = searchParams.get('type') || ''
    const email = searchParams.get('email') || ''
    const toast = useToast();

    const handleAddDevice = async (arrayHelpers: ArrayHelpers, email: string, deviceIds: string[]) => {
        // attempt to add a new device, then push it to the array
        try {
            const origin = window.location.origin;
            const rpID = new URL(origin).hostname;
            const { success: optionsSuccess, error: optionsError, options } = await register(email, rpID, deviceIds);
            if (!optionsSuccess) {
                throw new Error("Failed to update MFA: " + optionsError)
            }
            if (!options) {
                throw new Error("Failed to update MFA: No options returned");
            }
            // getting the device data
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
                        created: createdAt
                    })
                    toast({
                        title: 'Device added.',
                        description: "Your changes have been saved.",
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                    });
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

    const handleSubmit = async (values: MFAFormData, actions: FormikHelpers<MFAFormData>) => {
        try {
            const { success, error, data } = await verifySignup(tokenHash, type as EmailOtpType)
            if (!success) {
                throw new Error(error)
            } else {
                if (data.user) {
                    const { success, error } = await updateSignupTime(data.user.id)
                    if (!success) {
                        throw new Error(error)
                    } else {
                        const deviceIds = values.devices.map((device) => device.id)
                        const { success: deviceSuccess, error: deviceError } = await updateMFADevices(data.user.id, deviceIds)
                        if (!deviceSuccess) {
                            throw new Error(deviceError)
                        }
                    }
                    toast({
                        title: "Got it.",
                        description: "Your account is ready!",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    })
                    router.push('/buy')
                } else {
                    throw new Error("User not found")
                }
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            })
        } finally {
            actions.setSubmitting(false)
        }
    }

    const formatDate = (date: string | null) => {
        if (!date) return ""
        return new Date(date).toLocaleString('en-US', {
            weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour12: true
        });
    }

    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
            <Skeleton isLoaded={true}>
                <Formik
                    initialValues={
                        {
                            devices: []
                        } as MFAFormData
                    }
                    onSubmit={handleSubmit}
                >
                    {(props) => (
                        <Form>
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
                                <VStack maxW="md" mx="auto" mt={8} p={4} borderWidth={1} borderRadius="lg" boxShadow="lg">
                                    <h1 className="text-3xl font-bold">Last Step!</h1>
                                    <VStack align={"left"}>
                                        <Text>If you would like, you can protect your account with Multi-Factor Authentication (MFA).</Text>
                                        <FieldArray
                                            name="devices"
                                            render={arrayHelpers => (
                                                <VStack align={"left"} p={4}>
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
                                                                colorScheme="red"
                                                                onClick={() => arrayHelpers.remove(index)}
                                                            />
                                                        </HStack>
                                                    ))}
                                                    {props.values.devices.length === 0 && <Button type='button' size={"sm"} variant={"outline"} leftIcon={<AddIcon />} colorScheme="blue" onClick={() => handleAddDevice(arrayHelpers, email, props.values.devices.map((device) => device.id))}>Add Device</Button>}
                                                </VStack>
                                            )} />
                                    </VStack>
                                    <Divider borderColor={"black"} />
                                    <Button
                                        colorScheme="blue"
                                        size="md"
                                        mt={4}
                                        type='submit'
                                        isLoading={props.isSubmitting}
                                        width={"100%"}
                                        leftIcon={<CheckIcon />}
                                    >
                                        {(props.values.devices.length === 0) && "No Thanks, "}Confirm Email
                                    </Button>
                                </VStack>
                            </VStack>
                        </Form>
                    )}
                </Formik>
            </Skeleton>

        </div>

    )
}
