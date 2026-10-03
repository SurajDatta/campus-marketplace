/**
 * EditLocationModal.tsx
 * Modal that will be used to edit their custom locations. They can change the landmark name, add a photo, and add notes to the location. This will be used in the profile page.
 * @AshokSaravanan222
 * 08-24-2024
 */
import { Location } from '@/types';
import { updateLocation, uploadLocationPhoto } from '@/utils/services/sell';
import { Button } from '@chakra-ui/button';
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/modal';
import { AspectRatio, Box, Divider, FormControl, FormErrorMessage, FormHelperText, FormLabel, Icon, Image, Input, Skeleton, Text, Textarea, VStack, useDisclosure, useToast } from '@chakra-ui/react';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import React from 'react';
import { FaCamera } from 'react-icons/fa';
import * as Yup from 'yup';
import CreateLocationForm from './CreateLocationForm';

type EditLocationModalProps = {
    userId: string | null;
    loading: boolean;
    location: Location | null
    setAllLocations: React.Dispatch<React.SetStateAction<Location[]>>;
    googleMapsApiKey: string;
    isOpen: boolean;
    onClose: () => void;
}

type FormData = {
    name: string;
    photoURL: string;
    notes: string;
    address: string;
    latitude: number;
    longitude: number;
}

export default function EditLocationModal({ userId, loading, location, googleMapsApiKey, isOpen, onClose, setAllLocations }: EditLocationModalProps) {
    const toast = useToast();

    const handleLocationEdit = async (values: FormData, actions: FormikHelpers<FormData>) => {
        try {
            if (!location) {
                throw new Error('Invalid location');
            }
            const photoData = new FormData();
            const photo = await fetch(values.photoURL).then(r => r.blob());
            photoData.append("photo", photo);
            const { success, photoURL, error } = await uploadLocationPhoto(photoData, location.id);
            if (!success) {
                throw new Error(error);
            }
            const { success: locationSuccess, error: locationError } = await updateLocation(location.id, values.name, photoURL, values.address, values.notes, values.latitude, values.longitude);
            if (!locationSuccess) {
                throw new Error(locationError);
            } else {
                setAllLocations((prevLocations) => {
                    const updatedLocations = prevLocations.map((prevLocation) => {
                        if (prevLocation.id === location.id) {
                            return {
                                ...prevLocation,
                                name: values.name,
                                img_url: photoURL,
                                address: values.address,
                                notes: values.notes,
                                latitude: values.latitude,
                                longitude: values.longitude
                            }
                        }
                        return prevLocation;
                    });
                    return updatedLocations;
                });
            }
            toast({
                title: "Success",
                description: "Location updated successfully",
                status: "success",
                duration: 5000,
                isClosable: true
            });
        } catch (error: any) {
            console.error('Error processing image:', error);
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true
            });
        } finally {
            actions.setSubmitting(false);
            onClose();
        }
    }

    const editLocationValidationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        photoURL: Yup.string().required('Photo is required'),
        notes: Yup.string(),
        address: Yup.string().required('Address is required'),
        latitude: Yup.number().required('Latitude is required'),
        longitude: Yup.number().required('Longitude is required')
    });


    return (
        <Modal
            isCentered
            onClose={onClose}
            isOpen={isOpen}
            motionPreset='slideInRight'
        >
            <ModalOverlay />
            <ModalContent>
                <Formik
                    initialValues={{ name: location ? location.name : "name", photoURL: location ? location.img_url : process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/photos/default.webp", notes: location ? location.notes : "", address: location ? location.address ?? "" : "", latitude: location ? location.latitude ?? 0 : 0, longitude: location ? location.longitude ?? 0 : 0 }}
                    validationSchema={editLocationValidationSchema}
                    onSubmit={handleLocationEdit}
                >
                    {(props) => (
                        <Form>
                            <ModalHeader>Edit Location</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                <VStack align={"left"}>
                                    <Field name='photoURL'>
                                        {({ field, form }: any) => (
                                            <FormControl isInvalid={form.errors.photoURL && form.touched.photoURL} isRequired>
                                                <FormLabel>Image</FormLabel>
                                                <Input
                                                    type="file"
                                                    id="photo-input"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        if (e.target.files && e.target.files.length > 0) {
                                                            props.setFieldValue('photoURL', URL.createObjectURL(e.target.files[0]))
                                                        }
                                                    }}
                                                    style={{ display: 'none' }}
                                                />
                                                <VStack align={"left"}>
                                                    <Box borderWidth="1px" borderRadius="lg" p={6}>
                                                        <AspectRatio ratio={1} width="100%" maxH="100%">
                                                            <Image
                                                                src={field.value}
                                                                alt="Location Image"
                                                                objectFit="cover"
                                                                objectPosition={"center"}
                                                                width="100%"
                                                                height="100%"
                                                            />
                                                        </AspectRatio>
                                                    </Box>
                                                    <Button
                                                        onClick={() => document.getElementById('photo-input')?.click()}
                                                        leftIcon={<Icon as={FaCamera} />}
                                                        colorScheme='blue'
                                                    >
                                                        Replace Photo
                                                    </Button>
                                                    <FormErrorMessage>{form.errors.photoURL}</FormErrorMessage>
                                                </VStack>
                                            </FormControl>
                                        )}
                                    </Field>

                                    <Skeleton isLoaded={!loading}>
                                        <Field name="name">
                                            {({ field, form }: any) => (
                                                <FormControl isInvalid={form.errors.name && form.touched.name} isRequired>
                                                    <FormLabel>Name</FormLabel>
                                                    <Input
                                                        {...field}
                                                        value={props.values.name}
                                                        onChange={(e) => {
                                                            props.setFieldValue("name", e.target.value)
                                                        }}
                                                    />
                                                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>
                                    </Skeleton>

                                    <Skeleton isLoaded={!loading}>
                                        <Field name='notes'>
                                            {({ field, form }: any) => (
                                                <FormControl isInvalid={form.errors.notes && form.touched.notes}>
                                                    <FormLabel>Notes</FormLabel>
                                                    <Textarea
                                                        {...field}
                                                    />
                                                    <FormErrorMessage>{form.errors.notes}</FormErrorMessage>
                                                    <FormHelperText>Provide any additional information about the location here.</FormHelperText>
                                                </FormControl>
                                            )}
                                        </Field>
                                    </Skeleton>

                                    <Divider borderColor={"black"} />


                                    <CreateLocationForm
                                        userId={userId}
                                        loading={loading}
                                        latitude={props.values.latitude}
                                        longitude={props.values.longitude}
                                        address={props.values.address}
                                        name={props.values.name}
                                        setLatitude={(latitude: number) => props.setFieldValue('latitude', latitude)}
                                        setLongitude={(longitude: number) => props.setFieldValue('longitude', longitude)}
                                        setAddress={(address: string) => props.setFieldValue('address', address)}
                                        setName={(name: string) => props.setFieldValue('name', name)}
                                    />
                                </VStack>
                            </ModalBody>

                            <ModalFooter>
                                <Button mr={3} onClick={onClose}>
                                    Close
                                </Button>
                                <Button
                                    colorScheme='blue'
                                    isLoading={props.isSubmitting}
                                    onClick={props.submitForm}
                                >
                                    Save
                                </Button>
                            </ModalFooter>
                        </Form>
                    )}
                </Formik>
            </ModalContent>
        </Modal>
    );
}