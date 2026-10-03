/**
 * CreateListing.tsx
 * This component will be used to create a new listing for the user. Will use react query to load the necessary data faster.
 * @AshokSaravanan222
 * 09-26-2024
 */
"use client"
import Layout from '@/components/Layout/Layout';
import { Availability, Categories, MeetupPreferences, MeetupSchedule, Profile, SellerSchedule, User } from '@/types';
import { updateUserListingsCreated, uploadItemPhotos, upsertItemListing } from '@/utils/services/sell';
import { Button, Center, Divider, FormHelperText, HStack, Heading, InputLeftElement, InputRightAddon, InputRightElement, Switch, VStack, useBreakpointValue, useToast } from '@chakra-ui/react'
import { useEffect, useState } from 'react';
import { AddIcon, ArrowUpDownIcon, ArrowUpIcon, CheckIcon, CloseIcon, PlusSquareIcon, RepeatClockIcon, ViewIcon } from '@chakra-ui/icons';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { Formik, Form, Field, FieldArray, ArrayHelpers, FormikHelpers, FormikProps } from 'formik';
import Select, { MultiValue } from 'react-select';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { AspectRatio, Box, Checkbox, CircularProgress, CircularProgressLabel, Flex, FormControl, FormErrorMessage, FormLabel, Icon, IconButton, Input, InputGroup, InputLeftAddon, Skeleton, SimpleGrid, Spinner, Text, Textarea, Tooltip, Image as ChakraImage, Select as ChakraSelect } from '@chakra-ui/react';
import * as Yup from 'yup';
import { FaCamera, FaClipboardList, FaMagic } from 'react-icons/fa';
import ItemPhotoModal from '@/components/Common/Item/ItemPhotoModal';
import { MdAttachMoney, MdCategory, MdOutlinePublish, MdOutlineSubtitles, MdTitle } from 'react-icons/md';
import { createListing } from '@/utils/services/gemini';
import useSupabaseBrowser from '@/utils/supabase/supabase-browser';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUser } from '@/utils/queries/get-user';
import { getUserProfile } from '@/utils/queries/get-user-profile';
import { getAlerts } from '@/utils/queries/get-alerts';
import { getCategories } from '@/utils/queries/get-categories';
import ItemDetails from '@/components/Buy/Item/Details/ItemDetails';
import { getUserSchedules } from '@/utils/queries/get-user-schedules';
import { useDropzone } from 'react-dropzone';
import SchedulePreferencesItem from '../Preferences/SchedulePreferencesItem';
import { getTimes } from '@/utils/queries/get-times';
import { getLocations } from '@/utils/queries/get-locations';
import { getCalendar } from '@/utils/queries/get-calendar';
import { getTotalTimes } from '@/utils/getTotalTimes';



type FormData = {
    title: string;
    price: string;
    quantity: number;
    negotiable: boolean;
    description: string;
    condition: string;
    categories: number[];
    photos: {
        photo_url: string, photo_size: { x: number, y: number, w: number, h: number }, status: {
            loading: boolean;
            error: string | null;
            compression: number;
        }
    }[];
    sellerSchedules: string[]
};

type SellCreatePageProps = {
    development: boolean;
    mapsAPIKey: string | undefined;
}

export default function SellCreatePage({ development, mapsAPIKey }: SellCreatePageProps) {
    const supabase = useSupabaseBrowser()
    const queryClient = useQueryClient();

    const [loadingData, setLoadingData] = useState(true);
    const [aiGenerating, setAIGenerating] = useState(false);

    const returnAfterCancellation = true // will come from user profile preferences, later
    const isActive = true // will come from user profile preferences, later
    const safeMeetup = true // this will be by default for now

    const [contactPreferences, setContactPreferences] = useState<string[]>([]);
    const [schedulePreferences, setSchedulePreferences] = useState<string[]>([]);

    const [statusPhotos, setStatusPhotos] = useState<{ photo_url: string, photo_size: { x: number, y: number, w: number, h: number }, status: { loading: boolean, error: string, compression: number } }[]>([]);

    const [openImageModal, setOpenImageModal] = useState(false);
    const [imageTouched, setImageTouched] = useState(false);
    const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<MultiValue<{
        value: string;
        label: string;
    }> | null>([]);
    const toast = useToast();
    const router = useRouter();

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
    const days = generateNextMonth().map(date => date.toDateString());

    const openPhotoModal = (index: number) => {
        if (statusPhotos[index] === undefined) return;
        setActivePhotoIndex(index);
        setOpenImageModal(true);
    }

    const closePhotoModal = () => {
        setOpenImageModal(false);
        setActivePhotoIndex(null); // Reset the active photo index on close
    }

    const getPhotoSize = (photo_url: string): Promise<{ x: number, y: number, w: number, h: number }> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const sideLength = Math.min(img.naturalWidth, img.naturalHeight);
                const xOffset = (img.naturalWidth - sideLength) / 2;
                const yOffset = (img.naturalHeight - sideLength) / 2;
                resolve({
                    x: (xOffset / img.naturalWidth) * 100,
                    y: (yOffset / img.naturalHeight) * 100,
                    w: (sideLength / img.naturalWidth) * 100,
                    h: (sideLength / img.naturalHeight) * 100,
                });
            };
            img.onerror = reject;
            img.src = photo_url;
        });
    };

    const convertHeicToJpg = async (file: File) => {
        return await import('heic2any').then(async ({ default: heic2any }) => {
            const rawBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 1,
            });
            // Convert blob/blob array to single blob
            const singleBlob = Array.isArray(rawBlob) ? rawBlob[0] : rawBlob;
            const jpegFile = new File([singleBlob], 'item.jpg', { type: 'image/jpeg' });
            return jpegFile;
        });
    }


    const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>, photosLength: number) => {
        if (!e.target.files) return;
        const filesArray = Array.from(e.target.files);

        return await Promise.all(filesArray.map(async (file, index) => {
            setStatusPhotos(prev => [...prev, { photo_url: process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/photos/default.webp", photo_size: { x: 0, y: 0, w: 100, h: 100 }, status: { loading: true, error: '', compression: 0 } }]);

            const options = {
                maxSizeMB: 1, // Set the maximum size in MB
                maxWidthOrHeight: 1920, // Set the maximum width or height in pixels
                useWebWorker: true, // Use a web worker for faster compression
                onProgress: (percent: number) => {
                    setStatusPhotos(prev => prev.map((photo, i) => i === index + photosLength ? { ...photo, status: { ...photo.status, compression: percent } } : photo));
                }
            };

            // do operations
            try {
                // check if file is heic
                if (file.type.includes('heic')) {
                    file = await convertHeicToJpg(file);
                }
                const compressedFile = await imageCompression(file, options);
                if (compressedFile.size > 1048576) {
                    throw new Error('Error compressing image');
                }
                const photoURL = URL.createObjectURL(compressedFile);
                const photoSize = await getPhotoSize(photoURL);
                setStatusPhotos(prev => prev.map((photo, i) => i === index + photosLength ? { photo_url: photoURL, photo_size: photoSize, status: { loading: false, error: '', compression: 0 } } : photo));
                return { photo_url: photoURL, photo_size: photoSize };
            } catch (error: any) {
                setStatusPhotos(prev => prev.map((photo, i) => i === index + photosLength ? { ...photo, photo_url: process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/photos/error.png", status: { ...photo.status, error: "Error compressing image", loading: false } } : photo));
                return { photo_url: process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/photos/error.png", photo_size: { x: 0, y: 0, w: 100, h: 100 } };
            }
            // setPhotoUrls(prev => [...prev, photoURL]);
            // arrayHelpers.replace(index + photosLength, { photo_url: photoURL, photo_size: photoSize, status: { loading: false, error: error, compression: 0 } });
        }));
    }


    const handleRemovePhoto = (index: number, arrayHelpers: ArrayHelpers) => {
        setStatusPhotos(prev => prev.filter((_, i) => i !== index));
    }

    const calculatePosition = (photoSize: { x: number, y: number, w: number, h: number }) => {
        const x = photoSize.w === 100 ? photoSize.x : (photoSize.x / (100 - photoSize.w)) * 100;
        const y = photoSize.h === 100 ? photoSize.y : (photoSize.y / (100 - photoSize.h)) * 100;
        return `${x}% ${y}%`;
    };

    const createListingValidationSchema = Yup.object().shape({
        title: Yup.string().required('Title is required'),
        price: Yup.number()
            .typeError('Price must be a number')
            .min(1, 'Price must be at least $1')
            .test('Must be a valid price', 'Must be a valid price', function (value) {
                if (value === undefined) return true;
                return /^\d+(\.\d{1,2})?$/.test(String(value));
            }),
        description: Yup.string().required('Description is required'),
        condition: Yup.string().required('Condition is required'),
        categories: Yup.array().required('Categories are required').min(1, 'At least one category is required'),
        photos: Yup.array()
            .test('photo-validation', 'One or more photos have an error. This can happen if you upload an image with .heic extension.', function (value) {
                return value && value.every(photo => !photo.status.error);
            })
            .min(1, 'At least one photo is required'),
        sellerSchedules: Yup.array()
            .test(
                "is-valid",
                "Each schedule requires at least 1 time and 1 location",
                (value) => {
                    return value && (value.length === 0 || isScheduleValid(value));
                }
            )
            .test("is-complete", "At least 1 schedule is required", (value) => {
                return value && isScheduleComplete(value);
            }),
    });

    const handleSavePhotoSize = (index: number, photoSize: { x: number, y: number, w: number, h: number }, arrayHelpers: ArrayHelpers) => {
        // update only the photo status in the arrayhelpers
        setStatusPhotos(prev => prev.map((photo, i) => i === index ? { ...photo, photo_size: photoSize } : photo));
    }


    const handleSubmit = async (values: FormData, actions: FormikHelpers<FormData>) => {
        try {
            if (!user || !userProfile) {
                throw new Error('User not found.');
            }
            const userId = user.id;
            const verified = !!(development ? userProfile.test_customer_id : userProfile.customer_id);

            const lastEdited = new Date().toISOString();

            const newSchedulePreferences = values.sellerSchedules.length > 0 ? values.sellerSchedules : schedulePreferences;

            const { success: createSuccess, error: createError, id: itemId } = await upsertItemListing(null, values.title, values.condition, values.categories, Number(values.price), values.description, userId, [], [], false, true, contactPreferences, newSchedulePreferences, isActive, values.negotiable, returnAfterCancellation, safeMeetup, verified, development, lastEdited);

            if (!itemId || !createSuccess) {
                throw new Error('Error creating item');
            }
            // uploading photos
            const photo_urls = values.photos.map(photo => photo.photo_url);
            const photo_sizes = values.photos.map(photo => photo.photo_size);

            const uploadedFiles = photo_urls.filter(url => url.startsWith('blob:'));
            const photos = await Promise.all(uploadedFiles.map(async (file) => {
                return await fetch(file).then(r => r.blob());
            }));
            const photoData = new FormData();
            photos.forEach((file, index) => {
                photoData.append(`photo${index}`, file, `photo${index}.jpg`);
            });
            const { success: uploadSuccess, photoURLs, error: uploadItemPhotosError } = await uploadItemPhotos(photoData, itemId);
            if (!uploadSuccess) {
                throw new Error('Error uploading photos.' + uploadItemPhotosError);
            }

            // updating item listing
            const filteredPhotoUrls = photo_urls.filter(url => !url.startsWith('blob:')); // should be none when creating
            const allPhotoURLs = [...filteredPhotoUrls, ...photoURLs];
            const { success, error, id: fetchedId } = await upsertItemListing(itemId, values.title, values.condition, values.categories, Number(values.price), values.description, userId, allPhotoURLs, photo_sizes, false, true, contactPreferences, newSchedulePreferences, isActive, values.negotiable, returnAfterCancellation, safeMeetup, verified, development, lastEdited);

            queryClient.invalidateQueries({
                queryKey: ['sellItems', userId]
            });

            // setting new photos
            setStatusPhotos(allPhotoURLs.map((photo_url, index) => ({ photo_url, photo_size: photo_sizes[index] ?? { x: 0, y: 0, w: 100, h: 100 }, status: { loading: false, error: '', compression: 0 } })));

            // removing blob urls
            uploadedFiles.forEach(url => URL.revokeObjectURL(url));

            if (!success) {
                throw new Error(error + `photoURLs: ${allPhotoURLs}`);
            }

            // updating user listings created
            const { success: updateSuccess, error: updateError } = await updateUserListingsCreated(userId, (development ? userProfile.test_listings_created : userProfile.listings_created) + 1, development);
            if (!updateSuccess) {
                throw new Error('Error updating user listings created.' + updateError);
            }

            queryClient.invalidateQueries({
                queryKey: ['userProfile', userId]
            });

            const text = itemId ? 'saved' : 'added';
            toast({
                title: `Item ${text}.`,
                description: `Your item has successfully been ${text}.`,
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            router.push(`/sell`)
        } catch (error: any) {
            toast({
                title: 'Error saving item.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
        } finally {
            actions.setSubmitting(false);
        }
    }

    const { data: times, isLoading: loadingTimes } = useQuery({
        queryKey: ["times"],
        queryFn: () => getTimes(supabase),
    });

    const { data: locations, isLoading: loadingLocations } = useQuery({
        queryKey: ["locations"],
        queryFn: () => getLocations(supabase),
    });

    const { data: categories, isLoading: loadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => getCategories(supabase)
    })

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

    const { data: scheduleData, isLoading: loadingSchedule } = useQuery({
        queryKey: ["schedule", user?.id],
        queryFn: () => getUserSchedules(supabase, user!.id),
        enabled: !!user, // This query will only run if `userProfile` is not null
    });

    const {
        data: googleCalendarUnavailability,
        isLoading: loadingGoogleCalendarUnavailability,
    } = useQuery({
        queryKey: ["calendar", user?.id],
        queryFn: () => getCalendar(supabase, user!.id, days, times ?? []),
        enabled: !!times && !!user,
    });

    useEffect(() => {
        if (userProfile) {
            setContactPreferences(userProfile.seller_contact);
        }
    }, [userProfile]);

    useEffect(() => {
        if (scheduleData) {
            setSchedulePreferences(scheduleData.map(schedule => schedule.id));
        }
    }, [scheduleData]);


    // useEffect(() => {
    //     if (scheduleData) {
    //         const sellerSchedule = scheduleData.reduce((acc, selectedSchedule) => {
    //             const days = selectedSchedule.days as Availability;
    //             acc[selectedSchedule.id] = {
    //                 "times": {
    //                     "sunday": selectedSchedule.sunday,
    //                     "monday": selectedSchedule.monday,
    //                     "tuesday": selectedSchedule.tuesday,
    //                     "wednesday": selectedSchedule.wednesday,
    //                     "thursday": selectedSchedule.thursday,
    //                     "friday": selectedSchedule.friday,
    //                     "saturday": selectedSchedule.saturday,
    //                     ...days
    //                 },
    //                 "location": selectedSchedule.location,
    //             }
    //             return acc;
    //         }, {} as SellerSchedule);

    //         setSellerSchedule(sellerSchedule)
    //     }
    // }, [scheduleData])

    const isMobile = useBreakpointValue({ base: true, lg: false }) ?? true;

    // using AI to generate lsi

    const handleGenerateAIListing = async (photos: { photo_url: string, photo_size: { x: number, y: number, w: number, h: number } }[], props: FormikProps<FormData>, categories: Categories[]) => {
        setAIGenerating(true);
        try {
            if (photos.length === 0) throw new Error('No photos found.');

            // getting photo ready
            const photoURL = photos[0].photo_url
            if (photoURL === process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/photos/error.png") {
                throw new Error('The photo could not be processed.');
            }
            const photo = await fetch(photoURL).then(r => r.blob());
            const photoData = new FormData();
            photoData.append('image', photo, 'item.jpg');

            // calling gemini
            const output = await createListing(photoData)
            if (output) {
                // setting values
                props.setFieldValue('title', output.title);
                props.setFieldValue('price', output.price);
                props.setFieldValue('negotiable', output.negotiable);
                props.setFieldValue('condition', output.condition);
                props.setFieldValue('categories', [output.category]);
                setSelectedOptions([{ value: output.category.toString(), label: categories.find(category => category.id === output.category)?.name ?? '' }] as MultiValue<{ value: string; label: string }> | null);
                props.setFieldValue('description', output.description);
            } else {
                throw new Error('Error generating listing.');
            }
        } catch (error: any) {
            // reject promise
            throw new Error(error.message);

        } finally {
            setAIGenerating(false);
        }
    }

    const isTitleValid = (title: string) => {
        return title.length > 0;
    }

    const isPriceValid = (price: string) => {
        return /^\d+(\.\d{1,2})?$/.test(price);
    }

    const isScheduleComplete = (sellerSchedules: string[]) => {
        return sellerSchedules.length >= 1 && isScheduleValid(sellerSchedules);
    };

    const isScheduleValid = (sellerSchedules: string[]) => {
        for (const scheduleId of sellerSchedules) {
            const schedule = scheduleData?.find(
                (potentialSchedule) => potentialSchedule.id === scheduleId
            );
            if (!schedule) return false;
            const totalHours = getTotalTimes(schedule, new Date(days[0]))
            const locationValid = schedule.location !== 0;

            if (totalHours === 0 || !locationValid) {
                return false;
            }
        }
        return true;
    };

    return (
        <Layout
            user={user}
            userProfile={userProfile ?? undefined}
            alerts={alerts}
            loadingUser={loadingUser}
            loadingProfile={loadingProfile}
            loadingAlerts={loadingAlerts}
            displayPathName='/sell//create'
        >
            <Box p={4}>
                <Formik
                    initialValues={{
                        title: '',
                        price: '',
                        quantity: 1,
                        negotiable: false,
                        description: '',
                        condition: '',
                        categories: [],
                        photos: [],
                        sellerSchedules: []
                    } as FormData}
                    onSubmit={handleSubmit}
                    validationSchema={createListingValidationSchema}
                >
                    {(props) => {

                        const onDrop = async (acceptedFiles: File[]) => {
                            const photosLength = props.values.photos.length;
                            await handleAddPhoto({ target: { files: acceptedFiles } } as any, photosLength);
                        };

                        const { getRootProps } = useDropzone({
                            onDrop,
                            accept: {
                                "image": ["image/*"],
                            },
                            multiple: true,
                        });

                        useEffect(() => {
                            props.setFieldValue('photos', statusPhotos);
                        }, [statusPhotos]);

                        useEffect(() => {
                            if (Object.keys(props.errors).length > 0 && props.isSubmitting) {
                                Object.values(props.errors).forEach((error: any) => {
                                    toast({
                                        title: "Validation Error",
                                        description: error,
                                        status: "error",
                                        duration: 5000,
                                        isClosable: true,
                                    });
                                });
                            }
                        }, [props.errors, props.submitCount, toast]);

                        return (
                            <Form>
                                <VStack align={"left"}>
                                    <Heading>Details</Heading>
                                    <Input
                                        type="file"
                                        id="ai-photo-input"
                                        accept="image/*"
                                        multiple
                                        onChange={async (e) => {
                                            const photos = await handleAddPhoto(e, props.values.photos.length)
                                            setImageTouched(true);
                                            if (photos && categories) {
                                                const promise = handleGenerateAIListing(photos, props, categories);
                                                toast.promise(promise, {
                                                    success: { title: 'Listing Generated', description: 'Listing has been generated using AI. Verify the details and make any necessary changes.' },
                                                    error: { title: 'Error', description: 'Something went wrong. Please try again or contact us if the issue persists.' },
                                                    loading: { title: 'Processing', description: 'Please wait while AI scans your item.' },
                                                })
                                            }
                                        }}
                                        style={{ display: 'none' }}
                                    />
                                    <>
                                        <Divider borderColor={"black"} />

                                        <VStack align={"left"} spacing={4}>
                                            <Box>
                                                <Text fontWeight={"500"}>Photos</Text>
                                                <FieldArray
                                                    name="photos"
                                                    render={arrayHelpers => (
                                                        <Box p={4} {...getRootProps()}>
                                                            <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap={4}>
                                                                {props.values.photos.map((data, index) => {
                                                                    const { photo_url, photo_size, status } = data;
                                                                    return (
                                                                        <Box position="relative" h="100%" w="100%" borderWidth="1px" borderStyle="solid" borderColor="gray.300" display="flex" alignItems="center" justifyContent="center" cursor="pointer" onClick={() => openPhotoModal(index)}>
                                                                            {status.loading ? (
                                                                                <Flex direction="column" align="center" justify="center" h="100%">
                                                                                    {status.compression < 100 ? (
                                                                                        <>
                                                                                            <Text mt={2}>Compressing</Text>
                                                                                            <CircularProgress value={status.compression}>
                                                                                                <CircularProgressLabel>{status.compression}%</CircularProgressLabel>
                                                                                            </CircularProgress>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <Spinner size="sm" />
                                                                                            <Text mt={2}>Loading</Text>
                                                                                        </>
                                                                                    )}
                                                                                </Flex>
                                                                            ) : (
                                                                                <>
                                                                                    <Tooltip label={status.error}>
                                                                                        <AspectRatio ratio={1} width="100%" height={"100%"}>
                                                                                            <ChakraImage
                                                                                                src={photo_url}
                                                                                                alt={`Photo ${index}`}
                                                                                                boxSize={"100%"}
                                                                                                objectFit={'cover'}
                                                                                                objectPosition={calculatePosition(photo_size)}
                                                                                            />
                                                                                        </AspectRatio>
                                                                                    </Tooltip>
                                                                                    <IconButton
                                                                                        aria-label="Remove photo"
                                                                                        icon={<CloseIcon />}
                                                                                        size="sm"
                                                                                        colorScheme="red"
                                                                                        position="absolute"
                                                                                        top="-5px"
                                                                                        right="-5px"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleRemovePhoto(index, arrayHelpers);
                                                                                        }}
                                                                                    />
                                                                                </>
                                                                            )}
                                                                        </Box>
                                                                    );
                                                                })}
                                                                <AspectRatio ratio={1}>
                                                                    <Box as="label" htmlFor="photo-input" cursor="pointer" h="100%" w="100%" borderWidth="2px" borderStyle="dashed" borderColor="gray.300" display="flex" alignItems="center" justifyContent="center">
                                                                        <VStack>
                                                                            <Icon as={FaCamera} boxSize={6} />
                                                                            <Text>Add Photo</Text>
                                                                        </VStack>
                                                                    </Box>
                                                                </AspectRatio>
                                                                <Input
                                                                    type="file"
                                                                    id="photo-input"
                                                                    accept="image/*"
                                                                    multiple
                                                                    onChange={e => {
                                                                        handleAddPhoto(e, props.values.photos.length)
                                                                        setImageTouched(true);
                                                                    }}
                                                                    style={{ display: 'none' }}
                                                                />
                                                                <AspectRatio ratio={1}>
                                                                    <Box as="label" htmlFor="ai-photo-input" cursor="pointer" h="100%" w="100%" borderWidth="2px" borderStyle="dashed" borderColor="gray.300" display="flex" alignItems="center" justifyContent="center">
                                                                        <VStack>
                                                                            <Icon as={FaMagic} boxSize={6} />
                                                                            <Text>Upload with AI</Text>
                                                                        </VStack>
                                                                    </Box>
                                                                </AspectRatio>
                                                            </SimpleGrid>
                                                            {openImageModal && activePhotoIndex !== null && (
                                                                <ItemPhotoModal
                                                                    photoUrl={props.values.photos[activePhotoIndex].photo_url}
                                                                    photoSize={props.values.photos[activePhotoIndex].photo_size}
                                                                    savePhotoSize={(newSize) => handleSavePhotoSize(activePhotoIndex, newSize, arrayHelpers)}
                                                                    edit={true}
                                                                    name={`Image ${activePhotoIndex + 1}`}
                                                                    isOpen={openImageModal}
                                                                    onClose={closePhotoModal}
                                                                />
                                                            )}
                                                            <Text fontSize={"sm"} opacity={0.5} pt={2}>{props.values.photos.length === 0 ? 'Upload a photo or use AI to generate starter text.' : 'Click image to edit position.'}</Text>
                                                            {/* <Text fontSize={"sm"} opacity={0.5}>{props.values.photos.length === 0 ? 'Upload at least 1 photo.' : 'Click image to edit position.'}</Text> */}
                                                            {imageTouched && <Text color={"red.500"}>{arrayHelpers.form.errors.photos as any}</Text>}
                                                            {/* <Divider borderColor={"#ceb888"} />
                                                        <HStack>
                                                            <Button as="label" htmlFor='ai-photo-input' type="button" colorScheme='blue' leftIcon={<Icon as={FaMagic} />} isLoading={aiGenerating} loadingText={"Generating..."}>Upload with AI </Button>
                                                            <Text fontSize="sm" opacity={0.5}>Generate starter text using a picture of your item.</Text>
                                                        </HStack> */}

                                                        </Box>

                                                    )}
                                                />
                                            </Box>

                                            {/* <HStack >
                                                <Icon as={FaMagic} />
                                                <Text>Generate AI Description</Text>
                                                <Switch />
                                            </HStack> */}


                                            <Field name="title">
                                                {({ field, form }: any) => (
                                                    <FormControl isInvalid={form.errors.title && form.touched.title} isRequired>
                                                        <FormLabel>Title</FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement pointerEvents='none'>
                                                                <Icon as={MdOutlineSubtitles} />
                                                            </InputLeftElement>
                                                            <Input
                                                                {...field}
                                                                type="text"
                                                                placeholder='Title'
                                                            />
                                                            {aiGenerating ?
                                                                <InputRightElement>
                                                                    <Spinner size="sm" />
                                                                </InputRightElement> : null}
                                                        </InputGroup>
                                                        {/* {!props.touched.title || !props.errors.title ? <FormHelperText>Enter a short description of the item name.</FormHelperText> : <FormErrorMessage>{props.errors.title}</FormErrorMessage>} */}
                                                        <FormErrorMessage>{props.errors.title}</FormErrorMessage>
                                                    </FormControl>
                                                )}
                                            </Field>

                                            <VStack align={"left"}>
                                                <Field name="price">
                                                    {({ field, form }: any) => (
                                                        <FormControl isInvalid={form.errors.price && form.touched.price} isRequired>
                                                            <FormLabel>Price</FormLabel>
                                                            <InputGroup>
                                                                <InputLeftElement pointerEvents='none'>
                                                                    <Icon as={MdAttachMoney} />
                                                                </InputLeftElement>
                                                                <Input
                                                                    {...field}
                                                                    type="text"
                                                                    placeholder={'1.00'}
                                                                />
                                                                {aiGenerating ?
                                                                    <InputRightElement>
                                                                        <Spinner size="sm" />
                                                                    </InputRightElement> : null}
                                                            </InputGroup>
                                                            {!props.touched.price || !props.errors.price ? <FormHelperText>Enter a price above $1.00.</FormHelperText> : <FormErrorMessage>{props.errors.price}</FormErrorMessage>}
                                                        </FormControl>
                                                    )}
                                                </Field>

                                                <Field name="negotiable">
                                                    {({ field, form }: any) => (
                                                        <FormControl isInvalid={form.errors.negotiable && form.touched.negotiable}>
                                                            <HStack>
                                                                <Checkbox
                                                                    {...field}
                                                                    isChecked={field.value}
                                                                    isDisabled={aiGenerating}
                                                                    pb={2}
                                                                    size="lg"
                                                                    iconSize="10px"
                                                                    sx={{
                                                                        '& > span:first-of-type': {
                                                                            borderRadius: '50%', // Makes the checkbox circular
                                                                            width: '24px', // Adjusts the size of the checkbox
                                                                            height: '24px',
                                                                        }
                                                                    }}
                                                                />
                                                                <HStack spacing={0}>
                                                                    <FormLabel>Price Negotiable<Text opacity={0.5}></Text></FormLabel>
                                                                    {/* <FormHelperText pb={4}>- If enabled, the price can be negotiated during the meetup.</FormHelperText> */}
                                                                </HStack>
                                                            </HStack>

                                                        </FormControl>
                                                    )}
                                                </Field>
                                            </VStack>

                                            <Field name="condition">
                                                {({ field, form }: any) => (
                                                    <FormControl isInvalid={form.errors.condition && form.touched.condition} isRequired>
                                                        <FormLabel>Condition</FormLabel>
                                                        <ChakraSelect
                                                            {...field}
                                                            isDisabled={aiGenerating}
                                                        >
                                                            <option value="">Select condition</option>
                                                            <option value="new">New</option>
                                                            <option value="used (like new)">Used (like new)</option>
                                                            <option value="used (good)">Used (good)</option>
                                                            <option value="used (fair)">Used (fair)</option>
                                                        </ChakraSelect>
                                                        {/* {!props.touched.condition || !props.errors.condition ? <FormHelperText>Describe the condition of your item, so people know what to expect.</FormHelperText> : <FormErrorMessage>{props.errors.condition}</FormErrorMessage>} */}
                                                        <FormErrorMessage>{props.errors.condition}</FormErrorMessage>
                                                    </FormControl>
                                                )}
                                            </Field>

                                            <Skeleton isLoaded={!loadingCategories}>
                                                <Field name="categories">
                                                    {({ field, form }: any) => (
                                                        <FormControl isInvalid={form.errors.categories && form.touched.categories} isRequired>
                                                            <FormLabel>Categories</FormLabel>
                                                            <Select
                                                                {...field}
                                                                defaultValue={selectedOptions}
                                                                isLoading={aiGenerating}
                                                                value={selectedOptions}
                                                                onChange={(e) => {
                                                                    const selectedValues = e as MultiValue<{
                                                                        value: string;
                                                                        label: string;
                                                                    }>;
                                                                    setSelectedOptions(selectedValues);
                                                                    const selectedCategories = selectedValues.map(selectedValue => parseInt(selectedValue.value));
                                                                    props.setFieldValue(field.name, selectedCategories);
                                                                }}
                                                                options={categories && categories.map(category => ({
                                                                    value: category.id.toString(),
                                                                    label: category.name
                                                                }))}
                                                                isMulti
                                                                isSearchable
                                                                isClearable
                                                            />
                                                            {/* {!props.touched.categories || !props.errors.categories ? <FormHelperText>Pick at least 1 category that suits your item. Misceallenous can be used if you are unsure. </FormHelperText> : <FormErrorMessage>{props.errors.categories}</FormErrorMessage>} */}
                                                            {!props.touched.categories || !props.errors.categories ? <FormHelperText>Pick at least 1 category. </FormHelperText> : <FormErrorMessage>{props.errors.categories}</FormErrorMessage>}
                                                        </FormControl>
                                                    )}
                                                </Field>
                                            </Skeleton>

                                            <Field name='description'>
                                                {({ field, form }: any) => (
                                                    <FormControl isInvalid={form.errors.description && form.touched.description} isRequired>
                                                        <FormLabel>Description</FormLabel>
                                                        <Textarea
                                                            {...field}
                                                            placeholder='Your description here...'
                                                            isDisabled={aiGenerating}
                                                        />
                                                        {/* {!props.touched.description || !props.errors.description ? <FormHelperText>Add a short description of your item. We recommend at least 1-2 sentences or 3 bullet points.</FormHelperText> : <FormErrorMessage>{props.errors.description}</FormErrorMessage>} */}
                                                        <FormErrorMessage>{props.errors.description}</FormErrorMessage>
                                                    </FormControl>
                                                )}
                                            </Field>
                                        </VStack>
                                    </>
                                    <Heading>Meetup</Heading>
                                    <Divider borderColor={"black"} />
                                    <VStack align={"left"} spacing={4}>
                                        <Field name="schedule">
                                            {({ field, form }: any) => (
                                                <FormControl
                                                    isInvalid={
                                                        props.errors.sellerSchedules && form.touched.sellerSchedules
                                                    }
                                                >
                                                    <SchedulePreferencesItem
                                                        scheduleData={scheduleData}
                                                        sellerSchedules={props.values.sellerSchedules}
                                                        setSellerSchedules={(e) => {
                                                            form.setFieldValue("sellerSchedules", e);
                                                        }}
                                                        allLocations={locations ?? []}
                                                        isLoadingSchedule={loadingSchedule || loadingLocations}
                                                        scheduleDetailsComplete={isScheduleComplete(
                                                            props.values.sellerSchedules
                                                        )}
                                                        isLoadingTimes={loadingTimes}
                                                        isLoadingLocations={loadingLocations}
                                                        isMobile={isMobile}
                                                        days={days}
                                                        mapsApiKey={mapsAPIKey ?? ""}
                                                        allTimes={times ?? []}
                                                        userProfile={userProfile ?? null}
                                                        googleCalendarUnavailability={
                                                            googleCalendarUnavailability?.meetupTimes ?? {}
                                                        }
                                                        googleCalendarId={
                                                            googleCalendarUnavailability?.calendarId ?? ""
                                                        }
                                                    />
                                                    {/* {!props.touched.sellerSchedules || !props.errors.sellerSchedules ? <FormHelperText>Add 1 location that you will meetup at if this item is purchased.</FormHelperText> : <FormErrorMessage>{!isScheduleComplete(props.values.sellerSchedules) && props.errors.sellerSchedules}</FormErrorMessage>} */}
                                                    <FormErrorMessage>{!isScheduleComplete(props.values.sellerSchedules) && props.errors.sellerSchedules}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>
                                    </VStack>

                                    <>
                                        <HStack>
                                            <Button type="submit" colorScheme="green" isLoading={props.isSubmitting}
                                                onClick={() => setImageTouched(true)} leftIcon={<ArrowUpIcon />}
                                            >
                                                Publish Item
                                            </Button>
                                        </HStack>
                                        {/* <Text fontSize={"sm"} color={"teal.500"}>After adding the listing, you can customize details like meetup contact, times and locations, or availability.</Text> */}
                                    </>
                                </VStack>
                            </Form>
                        )
                    }}
                </Formik>
            </Box>
        </Layout >
    )
}
