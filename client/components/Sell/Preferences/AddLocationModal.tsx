/**
 * AddLocationModal.tsx
 * Modal that will allow the seller to add either a location by landmark or by address, while creating a schedule.
 * @AshokSaravanan222
 * 10-01-2024
 */

import { Location, Profile, Schedule, SellerSchedule } from "@/types";
import { AspectRatio, Badge, Box, Button, Divider, FormControl, FormErrorMessage, FormHelperText, FormLabel, HStack, Icon, IconButton, Input, InputGroup, InputRightElement, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Skeleton, Spacer, Spinner, Switch, Text, Tooltip, useDisclosure, useToast, VStack } from "@chakra-ui/react";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { useEffect, useState } from "react";
import { MdImage, MdLocationPin } from "react-icons/md";
import Select, { OptionProps, components } from 'react-select';
import * as Yup from 'yup';
import * as NextLink from 'next/link';
import { FaLightbulb, FaLocationArrow } from "react-icons/fa";
import { AddIcon, ArrowForwardIcon, ArrowUpIcon, CheckIcon, CloseIcon, DeleteIcon, EditIcon, SpinnerIcon } from "@chakra-ui/icons";
import SelectedLocations from "@/components/Common/Locations/SelectedLocations";
import Image from "next/image";
import { findLatLong } from "@/utils/services/location";
import { stringSimilarity } from 'string-similarity-js';
import CreatableSelect from "react-select/creatable";
import { createLocation, deleteLocation, updateLocation, uploadLocationPhoto } from "@/utils/services/sell";
import { useQueryClient } from "@tanstack/react-query";
import { updateLocationSchedule } from "@/utils/services/account";
import { calculateDistance } from "@/utils/location";

type AddLocationModalProps = {
    userProfile: Profile | null;
    isMobile: boolean;
    sellerSchedule: Schedule;
    setSellerSchedule: React.Dispatch<React.SetStateAction<Schedule>>;
    locationsLoading: boolean;
    mapsAPIKey: string;
    allLocations: Location[]
    handleNext?: () => void;
}

interface Option {
    readonly label: string;
    readonly value: string;
}

type AddressFormValues = {
    addressQuery: string;
}

export default function AddLocationModal({ userProfile, sellerSchedule, setSellerSchedule, mapsAPIKey, allLocations, locationsLoading, isMobile, handleNext }: AddLocationModalProps) {
    const [selectedLocation, setSelectedLocation] = useState<number>(sellerSchedule.location);
    const [blueLightMode, setBlueLightMode] = useState<boolean>(sellerSchedule.location !== 0 ? allLocations.find((location) => location.id === sellerSchedule.location)?.blue_light ?? false : true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [imgLink, setImgLink] = useState<string>(allLocations.find((location) => location.id === sellerSchedule.location)?.img_url ?? '');
    const [address, setAddress] = useState<string>(allLocations.find((location) => location.id === sellerSchedule.location)?.address ?? '');
    const queryClient = useQueryClient();
    const toast = useToast();
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [addressError, setAddressError] = useState<string | null>(null);
    const [deletingLocation, setDeletingLocation] = useState<boolean>(false);

    const CustomBlueLightOption = (props: OptionProps<Option>) => {
        return (
            <HStack p={2}>
                <components.Option {...props} />
                <Badge colorScheme="blue">Blue Light</Badge>
            </HStack>
        );
    };

    const CustomOption = (props: OptionProps<Option>) => {
        const isCustomLocation = customLocations.includes(props.data.label)
        const isBlueLight = allLocations.find((location) => location.name === props.data.label)?.blue_light ?? false;
        return (
            <HStack p={2}>
                <components.Option {...props} />
                {isCustomLocation ? <Badge colorScheme="green">Custom</Badge> : isBlueLight ? <Badge colorScheme="blue">Blue Light</Badge> : <Badge colorScheme="gray">Default</Badge>}
            </HStack>
        );
    };

    const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();


    // const blueLightOptions = allLocations.filter(location => location.blue_light).map((location, index) => ({
    //     value: String(location.id),
    //     label: location.name ?? `Unknown Location${index}`,
    // }));

    // const nonBlueLightOptions = allLocations.filter(location => !location.blue_light && (location.created_by === userProfile?.id || location.created_by === null)).map((location, index) => ({
    //     value: String(location.id),
    //     label: location.name ?? `Unknown Location${index}`,
    // }));

    const options = allLocations.map((location, index) => ({
        value: String(location.id),
        label: location.name ?? `Unknown Location${index}`,
    }));

    const customLocations = allLocations.filter(location => location.created_by === userProfile?.id).map(location => location.name);

    const handleCreate = async (inputValue: string) => {
        setIsLoading(true);
        try {
            if (!userProfile) {
                throw new Error('User not found');
            }
            const { success, error, id: locationId } = await createLocation(userProfile.id, inputValue);
            if (!success) {
                throw new Error(error);
            } else {
                queryClient.invalidateQueries({
                    queryKey: ['locations']
                })
                // updating the schedule to have this location
                if (sellerSchedule.id !== "") {
                    const { success } = await updateLocationSchedule(sellerSchedule.id, locationId);
                    if (!success) {
                        throw new Error('Error updating location');
                    } else {
                        queryClient.invalidateQueries({
                            queryKey: ['schedule', userProfile.id]
                        })
                        toast({
                            title: 'Location created',
                            description: 'The location was created successfully.',
                            status: 'success',
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                } else {
                    toast({
                        title: 'Location created',
                        description: 'The location was created successfully.',
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                    });
                }
            }
        } catch (error) {
            toast({
                title: 'Error creating location',
                description: 'There was an error creating the location. Please try again later.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    }

    const onClose = () => {
        setSelectedLocation(sellerSchedule.location);
        // setSelectedOption(blueLightOptions.find((option) => Number(option.value) === sellerSchedule.location) ?? {
        //     value: "0",
        //     label: "Select a location"
        // });
        // setSelectedCustomOption(nonBlueLightOptions.find((option) => Number(option.value) === sellerSchedule.location) ?? {
        //     value: "0",
        //     label: "Select a location"
        // });
        setSelectedOption(options.find((option) => Number(option.value) === sellerSchedule.location) ?? {
            value: "0",
            label: "Select a location"
        });
        onModalClose();
    }

    // const [selectedOption, setSelectedOption] = useState<Option>(blueLightOptions.find((option) => Number(option.value) === sellerSchedule.location) ?? {
    //     value: "0",
    //     label: "Select a location"
    // });

    // const [selectedCustomOption, setSelectedCustomOption] = useState<Option>(nonBlueLightOptions.find((option) => Number(option.value) === sellerSchedule.location) ?? {
    //     value: "0",
    //     label: "Select a location"
    // });
    const [selectedOption, setSelectedOption] = useState<Option>(options.find((option) => Number(option.value) === sellerSchedule.location) ?? {
        value: "0",
        label: "Select a location"
    });

    const handleUpdateLocation = async () => {
        const location = allLocations.find((location) => location.id === selectedLocation);
        const isCustomLocation = location?.created_by === userProfile?.id;
        if (selectedLocation === 0) {
            toast({
                title: 'Error',
                description: 'Please select a location.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
            return
        } else if (!blueLightMode && isCustomLocation && (address !== location?.address || imgLink !== location?.img_url)) {
            setIsProcessing(true);
            try {
                const response = await findLatLong(selectedLocation === 0 ? null : selectedLocation, userProfile?.id ?? '', address);
                if (response === null) {
                    setAddressError('Could not find address');
                } else {
                    setAddress(response.address);

                    let url = imgLink;
                    if (imgLink.startsWith('blob')) {
                        const photoData = new FormData();
                        const photo = await fetch(imgLink).then(r => r.blob());
                        photoData.append("photo", photo);
                        const { success, photoURL, error } = await uploadLocationPhoto(photoData, selectedLocation);
                        if (!success) {
                            throw new Error(error);
                        } else {
                            url = photoURL;
                        }
                    }
                    // const { success, error } = await updateLocation(selectedLocation, selectedCustomOption.label, url, response.address, "", response.coords.latitude, response.coords.longitude);
                    const { success, error } = await updateLocation(selectedLocation, selectedOption.label, url, response.address, "", response.coords.latitude, response.coords.longitude);
                    if (!success) {
                        throw new Error(error);
                    }
                    queryClient.invalidateQueries({
                        queryKey: ['locations']
                    })
                    toast({
                        title: 'Location updated',
                        description: 'The location was updated successfully.',
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                    });
                    setSellerSchedule((prev) => (
                        {
                            ...prev,
                            location: selectedLocation
                        }
                    ));
                    onModalClose();
                    if (handleNext) {
                        handleNext();
                    }
                }
            } catch (error: any) {
                toast({
                    title: 'Error updating location.',
                    description: error.message,
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                })
            } finally {
                setIsProcessing(false);
            }
        } else {
            setSellerSchedule((prev) => (
                {
                    ...prev,
                    location: selectedLocation
                }
            ));
            onModalClose();
            if (handleNext) {
                handleNext();
            }
        }
    }

    const handleDeleteLocation = async () => {
        setDeletingLocation(true);
        try {
            const { success, error } = await deleteLocation(selectedLocation);
            if (!success) {
                throw new Error(error);
            }
            queryClient.invalidateQueries({
                queryKey: ['locations']
            })
            toast({
                title: 'Location deleted',
                description: 'The location was deleted successfully.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            setSelectedLocation(0);
            setSelectedOption({ value: "0", label: "Select a location" });
            // setSelectedCustomOption({ value: "0", label: "Select a location" });
        } catch (error: any) {
            toast({
                title: 'Error deleting location.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
        } finally {
            setDeletingLocation(false);
        }
    }

    const findNearestLocation = (latitude: number, longitude: number, locations: Location[]): number => {
        let minDistance = Number.MAX_VALUE;
        let nearestLocation = locations[0];
        locations.forEach((l) => {
            const distance = calculateDistance(latitude, longitude, l.latitude, l.longitude);
            if (distance < minDistance) {
                minDistance = distance;
                nearestLocation = l;
            }
        });
        return nearestLocation.id;
    }

    const findNearestLocationSimilarity = (location: string, locations: Location[]): number => {
        let maxSimilarity = 0;
        let nearestLocation = locations[0];
        locations.forEach((l) => {
            const similarity = stringSimilarity(location, l.name);
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                nearestLocation = l;
            }
        });
        return nearestLocation.id
    }

    const findAddress = async (location: string, userId: string): Promise<number> => {
        const modifiedQuery = location + 'West Lafayette';
        const response = await findLatLong(null, userId, modifiedQuery)
        const blueLightLocations = allLocations.filter(location => location.blue_light);
        let nearestLocationId = -1;
        if (response === null) {
            nearestLocationId = findNearestLocationSimilarity(location, blueLightLocations);
        } else {
            nearestLocationId = findNearestLocation(response.coords.latitude, response.coords.longitude, blueLightLocations);
        }
        return nearestLocationId === -1 ? 0 : nearestLocationId;
    }

    const handleAddressSubmit = async (values: AddressFormValues, actions: FormikHelpers<AddressFormValues>) => {
        try {
            if (!userProfile) {
                throw new Error('User profile not found');
            }
            const findAddressPromise = findAddress(values.addressQuery, userProfile.id);
            toast.promise(findAddressPromise, {
                success: { title: 'Found potential location.', description: 'Please verify the location and save changes if you are satisfied.' },
                error: { title: 'Error', description: 'An error occurred while finding the address.' },
                loading: { title: 'Finding location...', description: 'Please wait while we find the nearest blue light.' },
            })
            const location = await findAddressPromise;
            setSelectedLocation(location);
            setSelectedOption(options.find((option) => Number(option.value) === location) ?? {
                value: "0",
                label: "Select a location"
            });
            // setSelectedOption(blueLightOptions.find((option) => Number(option.value) === location) ?? {
            //     value: "0",
            //     label: "Select a location"
            // });
        } catch (error: any) {
            toast({
                title: 'Error finding address.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
        } finally {
            actions.setSubmitting(false);
        }


    }

    const renderLandmarkLocation = () => {
        return (
            <CreatableSelect
                isLoading={isLoading}
                defaultValue={selectedOption}
                value={selectedOption}
                onChange={(e) => {
                    const selectedValue = e as Option;
                    if (!selectedValue) {
                        setSelectedLocation(0);
                        setSelectedOption({ value: "0", label: "Select a location" });
                    } else {
                        setSelectedLocation(Number(selectedValue.value));
                        setSelectedOption(selectedValue);
                    }
                }}
                options={options}
                components={{ Option: CustomOption }}
                onCreateOption={handleCreate}
                createOptionPosition="first"
                isSearchable
                isClearable
            />)
    }

    // const renderLandmarkLocation = () => {
    //     return (
    //         <Select
    //             isLoading={locationsLoading}
    //             defaultValue={selectedOption}
    //             value={selectedOption}
    //             onChange={(e) => {
    //                 const selectedValue = e as Option;
    //                 if (!selectedValue) {
    //                     setSelectedLocation(0);
    //                     setSelectedOption({ value: "0", label: "Select a location" });
    //                 } else {
    //                     setSelectedLocation(Number(selectedValue.value));
    //                     setSelectedOption(selectedValue);
    //                 }
    //             }}
    //             options={blueLightOptions}
    //             components={{ Option: CustomBlueLightOption }}
    //             isSearchable
    //             isClearable
    //         />
    //     )
    // }

    // const renderCustomLandmarkLocation = () => {
    //     return (
    //         <CreatableSelect
    //             isLoading={isLoading}
    //             defaultValue={selectedCustomOption}
    //             value={selectedCustomOption}
    //             onChange={(e) => {
    //                 const selectedValue = e as Option;
    //                 if (!selectedValue) {
    //                     setSelectedLocation(0);
    //                     setSelectedCustomOption({ value: "0", label: "Select a location" });
    //                 } else {
    //                     setSelectedLocation(Number(selectedValue.value));
    //                     setSelectedCustomOption(selectedValue);
    //                 }
    //             }}
    //             options={nonBlueLightOptions}
    //             components={{ Option: CustomOption }}
    //             onCreateOption={handleCreate}
    //             createOptionPosition="first"
    //             isSearchable
    //             isClearable
    //         />)
    // }

    const renderAddressLocation = () => {
        const addressValidationSchema = Yup.object().shape({
            addressQuery: Yup.string().required("")
        })
        return (
            <Formik
                initialValues={{ addressQuery: selectedLocation ? '' : '' } as AddressFormValues}
                onSubmit={handleAddressSubmit}
                validationSchema={addressValidationSchema}
                enableReinitialize
            >
                {(props) => (
                    <Form>
                        <Skeleton isLoaded={!locationsLoading}>
                            <Field name="addressQuery">
                                {({ field, form }: any) => (
                                    <FormControl isInvalid={form.errors.addressQuery && form.touched.addressQuery}>
                                        <HStack>
                                            <Input
                                                {...field}
                                                value={props.values.addressQuery}
                                                onChange={(e) => {
                                                    props.setFieldValue("addressQuery", e.target.value)
                                                }}
                                                placeholder="STEW, 1225 1st Street, Rise on Chauncey"
                                            />
                                            <IconButton aria-label="Search Address" icon={<ArrowUpIcon />} colorScheme='blue' type="submit" isLoading={props.isSubmitting} onClick={props.submitForm} />
                                        </HStack>
                                        <FormErrorMessage>{form.errors.addressQuery}</FormErrorMessage>
                                        <FormHelperText>Enter an address / hall name / residence hall.</FormHelperText>
                                        <Link as={NextLink.default} href="https://www.openstreetmap.org/copyright" isExternal color={"teal.500"} fontSize={"xs"}>Powered by © OpenStreetMap</Link>
                                    </FormControl>
                                )}
                            </Field>
                        </Skeleton>
                    </Form>
                )}
            </Formik >)
    }

    const renderCustomAddressLocation = () => {
        const location = allLocations.find((location) => location.id === selectedLocation)
        const isCustomLocation = location?.created_by === userProfile?.id;
        return (
            location && <VStack align={"left"}>
                <Text as={"b"}>Image</Text>
                <Input
                    type="file"
                    id="location-image"
                    accept="image/*"
                    onChange={async (e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            const newImgLink = URL.createObjectURL(e.target.files[0]);
                            setImgLink(newImgLink)
                        }
                    }}
                    style={{ display: 'none' }}
                />
                <Skeleton isLoaded={!locationsLoading}>
                    <AspectRatio ratio={1} width={"50%"} height={"50%"}>
                        <Image
                            src={isCustomLocation ? imgLink : location.img_url}
                            alt={location.name}
                            width={500}
                            height={500}
                            style={{ borderRadius: "20px" }}
                        />
                    </AspectRatio>
                </Skeleton>
                {isCustomLocation && <HStack>
                    <Button colorScheme="blue" leftIcon={<Icon as={MdImage} />} onClick={() => document.getElementById('location-image')?.click()}>Replace Image</Button>
                </HStack>}

                <Text as={"b"}>Address</Text>
                <Skeleton isLoaded={!locationsLoading}>
                    <VStack align={"left"} spacing={0}>
                        <Input
                            value={isCustomLocation ? address : location.address ?? ""}
                            onChange={(e) => {
                                setAddress(e.target.value)
                                setAddressError(null)
                            }}
                            placeholder="Enter an address"
                            isDisabled={!isCustomLocation}
                        />
                        {isCustomLocation && <VStack align={"left"} spacing={1}>
                            <FormHelperText>Enter an address / hall name / residence hall. </FormHelperText>
                            <Link as={NextLink.default} href="https://www.openstreetmap.org/copyright" isExternal color={"teal.500"} fontSize={"xs"}>Powered by © OpenStreetMap</Link>
                        </VStack>}
                        <Text color={"red"}>{addressError}</Text>
                    </VStack>
                </Skeleton>
            </VStack>
        )
    }

    const renderLocation = (locationId: number) => {
        const location = allLocations.find((location) => location.id === locationId)
        const isCustomLocation = location?.created_by === userProfile?.id;
        return (
            location && <>
                <Box width={50} height={50}>
                    <AspectRatio ratio={1} width={"100%"} height={"100%"}>
                        <Image
                            src={location.img_url}
                            alt={location.name}
                            width={500}
                            height={500}
                            style={{ borderRadius: "10px" }}
                        />
                    </AspectRatio>
                </Box>
                <VStack align={"left"} spacing={0}>
                    <Text key={String(locationId)} fontSize={"xl"} as={"b"}>{location.name}</Text>
                    <HStack>
                        {location.blue_light ? <Badge colorScheme="blue">Blue Light Location</Badge> : isCustomLocation ? <Badge colorScheme="green">Custom Location</Badge> : <Badge colorScheme="gray">Default Location</Badge>}
                    </HStack>
                </VStack>
            </>
        )
    }

    const renderOldLocation = () => {
        return (
            <VStack align={"left"} spacing={4}>
                {/* <VStack align={"left"}>
                <HStack>
                    <Icon as={FaLightbulb} color={"blue.500"} />
                    <Text>Safe Meetup</Text>
                    <Switch
                        isChecked={blueLightMode}
                        onChange={() => {
                            setBlueLightMode((prev) => {
                                if (prev) {
                                    setSelectedLocation(selectedCustomOption.value === "0" ? 0 : Number(selectedCustomOption.value));
                                } else {
                                    setSelectedLocation(selectedOption.value === "0" ? 0 : Number(selectedOption.value));
                                }
                                return !prev;
                            })
                        }}
                    />
                </HStack>
                <Text fontSize={"sm"} opacity={0.5}>The meetup will be scheduled at a blue light location. </Text>
            </VStack>
            <Divider /> */}
                {blueLightMode ? <>
                    {/* <Text as={"b"}>Blue Light Locations</Text> */}
                    {renderLandmarkLocation()}
                    {/* <Divider />
            <Text as={"b"}>Add Address</Text>
            {renderAddressLocation()} */}
                    <SelectedLocations allLocations={allLocations} isMobile={isMobile} minimumLocations={1} maximumLocations={1} googleMapsAPIKey={mapsAPIKey} sellerLocations={[selectedLocation]} userId={userProfile ? userProfile.id : undefined} loading={locationsLoading} />
                    {/* <Text as={"b"}>Landmark Address</Text> */}
                    {selectedLocation === 0 && <>
                        <Divider />
                        <Text as={"b"}>Find Nearest Location</Text>
                        {renderAddressLocation()}
                    </>}
                </> : <>
                    <HStack width={"100%"}>
                        <VStack align={"left"} width={"100%"}>
                            {/* {renderCustomLandmarkLocation()} */}
                        </VStack>
                        <Spacer />
                        {allLocations.find((location) => location.id === selectedLocation)?.created_by === userProfile?.id && <IconButton colorScheme="red" onClick={handleDeleteLocation} isLoading={deletingLocation} icon={<DeleteIcon />} aria-label="delete location">Delete Location</IconButton>}
                    </HStack>
                    {renderCustomAddressLocation()}
                </>}
            </VStack>
        )
    }

    useEffect(() => {
        if (selectedLocation !== 0) {
            const location = allLocations.find((location) => location.id === selectedLocation)
            setImgLink(location?.img_url ?? '');
            setAddress(location?.address ?? '');
        }
    }, [selectedLocation])

    return (
        <>
            <HStack>
                {sellerSchedule.location === 0 ?
                    (isMobile ? <IconButton aria-label="Add Location" icon={<AddIcon />} colorScheme='blue' onClick={onOpen} /> : <Button colorScheme='blue' leftIcon={<AddIcon />} onClick={onOpen}>Add Location</Button>) :
                    <>
                        {renderLocation(sellerSchedule.location)}
                        <IconButton aria-label="Edit Location" icon={<EditIcon />} colorScheme='blue' onClick={onOpen} />
                    </>}
            </HStack>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{selectedLocation !== 0 ? "Edit Location" : "Add Location"}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack align={"left"} spacing={4}>
                            <HStack width={"100%"}>
                                <VStack align={"left"} width={"100%"}>
                                    {renderLandmarkLocation()}
                                </VStack>
                                <Spacer />
                                {allLocations.find((location) => location.id === selectedLocation)?.created_by === userProfile?.id && <IconButton colorScheme="red" onClick={handleDeleteLocation} isLoading={deletingLocation} icon={<DeleteIcon />} aria-label="delete location">Delete Location</IconButton>}
                            </HStack>
                            {allLocations.find((location) => location.id === selectedLocation)?.blue_light ? <SelectedLocations allLocations={allLocations} isMobile={isMobile} minimumLocations={1} maximumLocations={1} googleMapsAPIKey={mapsAPIKey} sellerLocations={[selectedLocation]} userId={userProfile ? userProfile.id : undefined} loading={locationsLoading} /> : renderCustomAddressLocation()}
                            {/* {selectedLocation === 0 && <>
                                <Text as={"b"}>Find Nearest Location</Text>
                                {renderAddressLocation()}
                            </>} */}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button colorScheme="blue" onClick={handleUpdateLocation} isLoading={isProcessing}>{handleNext ? "Next" : "Save"}</Button>
                    </ModalFooter>
                </ModalContent>

            </Modal>
        </>
    )
}