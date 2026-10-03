/**
 * CreateLocationForm.tsx
 * Very similar to UpdateLocationForm, but we will keep the address since we need to create a new location.
 * @AshokSaravanan222
 * 09-09-2024
 */
import { EditIcon } from "@chakra-ui/icons";
import { Button, Divider, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, InputGroup, InputRightElement, Skeleton, Spinner, Text, VStack, Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, HStack, Icon, ButtonGroup, Link, useToast } from "@chakra-ui/react";
import { Field, Form, Formik, FormikHelpers } from "formik"
import { RxReset } from 'react-icons/rx';
import React from "react";
import * as Yup from "yup"
import * as NextLink from 'next/link';
import { findAddress, findLatLong } from "@/utils/services/location";
import { MdLocationPin, MdOutlineLocationCity } from "react-icons/md";
import { FaLocationArrow, FaSearchLocation } from "react-icons/fa";


type CreateLocationFormProps = {
    userId: string | null;
    loading: boolean;
    latitude: number;
    setLatitude: (latitude: number) => void;
    longitude: number;
    setLongitude: (longitude: number) => void;
    name: string;
    setName: (name: string) => void;
    address: string;
    setAddress: (address: string) => void;
}

type FormData = {
    latitude: number;
    longitude: number;
    address: string;
    name: string;
}

export default function CreateLocationForm({ userId, loading, latitude, setLatitude, longitude, setLongitude, address, setAddress, name, setName }: CreateLocationFormProps) {
    const toast = useToast();
    const locationFormValidationSchema = Yup.object().shape({
        latitude: Yup.number().required("Latitude is required"),
        longitude: Yup.number().required("Longitude is required"),
        address: Yup.string().required("Address is required").test("is-address-complete", "Address is not complete", async (address) => {
            return await isAddressComplete(address);
        })
    })

    const isAddressComplete = (address: string) => {
        return address.length > 1;
    }

    const handleSubmit = async (values: FormData, actions: FormikHelpers<FormData>) => {
        try {
            if (!userId) {
                throw new Error("User not found")
            }
            const modifiedQuery = values.address + " West Lafayette";
            const response = await findLatLong(null, userId, modifiedQuery)
            if (response === null) {
                throw new Error("Address not found")
            }
            setLatitude(response.coords.latitude);
            setLongitude(response.coords.longitude);
            setAddress(response.address);
            setName(response.name);
            actions.setFieldValue("latitude", response.coords.latitude);
            actions.setFieldValue("longitude", response.coords.longitude);
            actions.setFieldValue("address", response.address);
            toast({
                title: "Success",
                description: `Found Location: ${response.name} at ${response.address}`,
                status: "success",
                duration: 5000,
                isClosable: true
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true
            })
        } finally {
            actions.setSubmitting(false);
        }
    }

    // used to update name and address with lat and long
    const latLongForm = ({ latitude, longitude, setLatitude, setLongitude }: {
        latitude: number;
        longitude: number;
        setLatitude: (latitude: number) => void;
        setLongitude: (longitude: number) => void;
        setName: (name: string) => void;
        setAddress: (address: string) => void;
    }) => {

        type LatLongFormData = {
            latitude: number;
            longitude: number;
        }

        const latLongValidationSchema = Yup.object().shape({
            latitude: Yup.number().required("Latitude is required"),
            longitude: Yup.number().required("Longitude is required")
        })

        const handleLatLongSubmit = async (values: LatLongFormData, actions: FormikHelpers<LatLongFormData>) => {
            try {
                if (!userId) {
                    throw new Error("User not found")
                }
                const response = await findAddress(null, userId, values.latitude, values.longitude)
                if (response === null) {
                    throw new Error("Address not found")
                }
                setLatitude(values.latitude);
                setLongitude(values.longitude);
                setAddress(response.address);
                setName(response.name);
                actions.setFieldValue("latitude", values.latitude);
                actions.setFieldValue("longitude", values.longitude);
                toast({
                    title: "Success",
                    description: `Set coordinates to ${values.latitude}, ${values.longitude}`,
                    status: "success",
                    duration: 5000,
                    isClosable: true
                })
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true
                })
            } finally {
                actions.setSubmitting(false);
            }
        }

        return (
            <Formik
                initialValues={{
                    latitude: latitude,
                    longitude: longitude,
                } as LatLongFormData}
                validationSchema={latLongValidationSchema}
                onSubmit={handleLatLongSubmit}
                enableReinitialize={true}
            >
                {(props) => (
                    <Form>
                        <VStack spacing={4} align={"left"}>
                            <Skeleton isLoaded={!loading}>
                                <Field name="latitude">
                                    {({ field, form }: any) => (
                                        <FormControl isInvalid={form.errors.latitude && form.touched.latitude} isRequired>
                                            <FormLabel>Latitude</FormLabel>
                                            <Input
                                                {...field}
                                                value={props.values.latitude}
                                                onChange={(e) => {
                                                    setLatitude(Number(e.target.value))
                                                    props.setFieldValue("latitude", e.target.value)
                                                }}
                                            />
                                            <FormErrorMessage>{form.errors.latitude}</FormErrorMessage>
                                        </FormControl>
                                    )}
                                </Field>
                            </Skeleton>

                            <Skeleton isLoaded={!loading}>
                                <Field name="longitude">
                                    {({ field, form }: any) => (
                                        <FormControl isInvalid={form.errors.longitude && form.touched.longitude} isRequired>
                                            <FormLabel>Longitude</FormLabel>
                                            <Input
                                                {...field}
                                                value={props.values.longitude}
                                                onChange={(e) => {
                                                    setLongitude(Number(e.target.value))
                                                    props.setFieldValue("longitude", e.target.value)
                                                }}
                                            />
                                            <FormErrorMessage>{form.errors.longitude}</FormErrorMessage>
                                        </FormControl>
                                    )}
                                </Field>
                            </Skeleton>
                            <VStack align={"left"} spacing={0}>
                                <Text fontSize={"sm"} opacity={0.5}>Enter latitude and longitude to autofill name and address information. </Text>
                                <Link as={NextLink.default} href="https://developers.google.com/maps/documentation/geocoding/overview#how-the-geocoding-api-works" isExternal color={"teal.500"} fontSize={"xs"}>This Google geocoding demonstration may be useful.</Link>
                            </VStack>
                            <Button colorScheme="blue" isLoading={props.isSubmitting} onClick={props.submitForm} leftIcon={<Icon as={FaLocationArrow} />}>Use Coordinates</Button>
                        </VStack>
                    </Form>
                )}
            </Formik>
        )
    }

    return (
        <Formik
            initialValues={{
                latitude: latitude,
                longitude: longitude,
                address: address,
                name: name
            }}
            validationSchema={locationFormValidationSchema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
        >
            {(props) => (
                <Form>
                    <VStack spacing={4} align={"left"}>
                        {latLongForm({ latitude, longitude, setLatitude, setLongitude, setName, setAddress })}
                        <Divider borderColor={"black"} />

                        <Skeleton isLoaded={!loading}>
                            <Field name="address">
                                {({ field, form }: any) => (
                                    <FormControl isInvalid={form.errors.address && form.touched.address} isRequired>
                                        <FormLabel>Address</FormLabel>
                                        <InputGroup>
                                            <Input
                                                {...field}
                                                value={props.values.address}
                                                onChange={(e) => {
                                                    setAddress(e.target.value)
                                                    props.setFieldValue("address", e.target.value)
                                                }}
                                            />
                                            <InputRightElement>
                                                {props.isSubmitting && <Spinner size="sm" />}
                                            </InputRightElement>
                                        </InputGroup>
                                        <FormErrorMessage>{form.errors.address}</FormErrorMessage>
                                        <FormHelperText>Enter an address like: 1225 1st Street.</FormHelperText>
                                        <Link as={NextLink.default} href="https://www.openstreetmap.org/copyright" isExternal color={"teal.500"} fontSize={"xs"}>Powered by © OpenStreetMap</Link>
                                    </FormControl>
                                )}
                            </Field>
                        </Skeleton>
                        <Text fontSize={"sm"} opacity={0.5}>Enter an address to autofill name and latitude/longitude information.</Text>
                        <Button colorScheme="blue" isLoading={props.isSubmitting} onClick={props.submitForm} leftIcon={<Icon as={MdLocationPin} />}>Use Address</Button>
                    </VStack>
                </Form>
            )}
        </Formik>
    )
}