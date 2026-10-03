/**
 * EditListing.tsx
 * Component that allows the seller to edit the listing of the item they have for sale. Will use react query to fetch the data faster, from cached data.
 * @AshokSaravanan222
 * 09-26-2024
 */
"use client";
import Layout from "@/components/Layout/Layout";
import {
    Availability,
    BuyerMeetups,
    Categories,
    Item,
    ItemSchedule,
    Location,
    MeetupLocations,
    MeetupPreferences,
    MeetupSchedule,
    MeetupTimes,
    Profile,
    PurchaseStatus,
    Schedule,
    SellerSchedule,
    User,
} from "@/types";
import {
    getAllTimes,
    upsertItemListing,
    uploadItemPhotos,
    deleteItem,
} from "@/utils/services/sell";
import {
    Button,
    Divider,
    Heading,
    Skeleton,
    Text,
    VStack,
    useBreakpointValue,
    useToast,
    Box,
    SimpleGrid,
    AspectRatio,
    Input,
    InputGroup,
    InputLeftAddon,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Checkbox,
    HStack,
    Textarea,
    Switch,
    CircularProgress,
    CircularProgressLabel,
    IconButton,
    Tooltip,
    Icon,
    Spinner,
    Image as ChakraImage,
    Select as ChakraSelect,
    Flex,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionIcon,
    AccordionPanel,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Link,
    InputRightElement,
    InputLeftElement,
    FormHelperText,
    Grid,
    GridItem,
    Badge,
    Center,
    Spacer,
    Stack,
} from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Form,
    Formik,
    Field,
    FieldArray,
    ArrayHelpers,
    FormikHelpers,
} from "formik";
import {
    AddIcon,
    ArrowBackIcon,
    CalendarIcon,
    CheckIcon,
    CloseIcon,
    DeleteIcon,
    EditIcon,
    RepeatIcon,
    SettingsIcon,
    UnlockIcon,
    ViewIcon,
} from "@chakra-ui/icons";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { FormikProps } from "formik";
import * as Yup from "yup";
import Select, { MultiValue } from "react-select";
import imageCompression from "browser-image-compression";
import { FaCamera, FaMoneyBill } from "react-icons/fa";
import ItemPhotoModal from "@/components/Common/Item/ItemPhotoModal";
import {
    MdAttachMoney,
    MdCalendarMonth,
    MdChecklist,
    MdDetails,
    MdOutlineSubtitles,
    MdPerson,
    MdTitle,
} from "react-icons/md";
import { getAlerts } from "@/utils/queries/get-alerts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserProfile } from "@/utils/queries/get-user-profile";
import { getUser } from "@/utils/queries/get-user";
import { getLocations } from "@/utils/queries/get-locations";
import useSupabaseBrowser from "@/utils/supabase/supabase-browser";
import { getCategories } from "@/utils/queries/get-categories";
import { getTimes } from "@/utils/queries/get-times";
import { getItem } from "@/utils/queries/get-item";
import { getUserSchedules } from "@/utils/queries/get-user-schedules";
import { addSchedule } from "@/utils/services/schedule";
import BlockedScreen from "@/components/Common/Other/BlockedScreen";
import ItemPrice from "@/components/Common/Item/ItemPrice";
import { CgNotes } from "react-icons/cg";
import TitleEdit from "./TitleEdit";
import DescriptionEdit from "./DescriptionEdit";
import SchedulePreferencesItem from "../Preferences/SchedulePreferencesItem";
import PriceEdit from "./PriceEdit";
import CategoriesEdit from "./CategoriesEdit";
import ConditionEdit from "./ConditionEdit";
import { IoIosListBox } from "react-icons/io";
import { getTotalTimes } from "@/utils/getTotalTimes";
import DeleteListingDialog from "./DeleteListingDialog";
import { getCalendar } from "@/utils/queries/get-calendar";
import { useDropzone } from 'react-dropzone';

export type FormData = {
    title: string;
    price: string;
    listingPrice: string;
    quantity: number;
    description: string;
    condition: string;
    categories: number[];
    photos: {
        photo_url: string;
        photo_size: { x: number; y: number; w: number; h: number };
        status: {
            loading: boolean;
            error: string | null;
            compression: number;
        };
    }[];
    contact: boolean;
    schedule: boolean;
    sellerContact: string[];
    sellerSchedules: string[];
    isActive: boolean;
    negotiable: boolean;
    returnAfterCancellation: boolean;
    safeMeetup: boolean;
    deleted: boolean;
};

type SellEditPageProps = {
    itemId: string;
    development: boolean;
    mapsAPIKey: string | undefined;
};

export default function SellEditPage({
    itemId,
    development,
    mapsAPIKey,
}: SellEditPageProps) {
    const supabase = useSupabaseBrowser();
    const queryClient = useQueryClient();
    const pathname = usePathname();
    const [displayPathName, setDisplayPathName] = useState<string>(pathname);
    const [itemState, setItemState] = useState<number>(0);

    // for the preview section
    const [contact, setContact] = useState<boolean>(true);
    const [schedule, setSchedule] = useState<boolean>(false);
    const [safeMeetup, setSafeMeetup] = useState<boolean>(true);

    const [buyerContact, setBuyerContact] = useState<string[]>(["phone"]);
    const [buyerMeetups, setBuyerMeetups] = useState<BuyerMeetups>({}); // buyer location availability
    const [buyerTimes, setBuyerTimes] = useState<Availability>({}); // buyer time availability

    const [loadedInitialData, setLoadedInitialData] = useState<boolean>(false);

    const initalValues: FormData = {
        title: "",
        price: "",
        quantity: 1,
        listingPrice: "",
        description: "",
        condition: "",
        categories: [],
        photos: [],
        contact: true,
        schedule: true,
        sellerContact: [],
        sellerSchedules: [],
        isActive: false,
        negotiable: false,
        returnAfterCancellation: false,
        safeMeetup: false,
        deleted: false
    }

    const [lastSavedChanges, setLastSavedChanges] = useState<FormData>(initalValues);

    const [statusPhotos, setStatusPhotos] = useState<
        {
            photo_url: string;
            photo_size: { x: number; y: number; w: number; h: number };
            status: { loading: boolean; error: string; compression: number };
        }[]
    >([]);

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

    const generateNextWeek = (): Date[] => {
        const now = new Date();
        const start = now
        // const start = new Date(now.setHours(now.getHours() + 48));
        const nextWeek: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            nextWeek.push(date);
        }
        return nextWeek;
    };
    const nextWeek = generateNextWeek();
    const nextMonth = generateNextMonth();
    const days = nextMonth.map((date) => date.toDateString());

    const isMobile = useBreakpointValue({ md: true, lg: false }) ?? true;

    const [openImageModal, setOpenImageModal] = useState(false);
    const [imageTouched, setImageTouched] = useState(false);
    const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<MultiValue<{
        value: string;
        label: string;
    }> | null>([]);
    const toast = useToast();
    const router = useRouter();

    const [addingSchedule, setAddingSchedule] = useState(false);
    const [deletingSchedule, setDeletingSchedule] = useState(false);

    // queries. Could prefetch the first two, or add initialData?
    const { data: categories, isLoading: loadingCategories } = useQuery({
        queryKey: ["categories"],
        queryFn: () => getCategories(supabase),
    });

    const { data: times, isLoading: loadingTimes } = useQuery({
        queryKey: ["times"],
        queryFn: () => getTimes(supabase),
    });

    const { data: locations, isLoading: loadingLocations } = useQuery({
        queryKey: ["locations"],
        queryFn: () => getLocations(supabase),
    });

    const { data: item, isLoading: loadingItem } = useQuery({
        queryKey: ["item", itemId],
        queryFn: () => getItem(supabase, itemId, development),
    });

    // using item since it will be pre-fetched

    const { data: scheduleData, isLoading: loadingSchedule } = useQuery({
        queryKey: ["schedule", item?.seller_id],
        queryFn: () => getUserSchedules(supabase, item!.seller_id),
        enabled: !!item,
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

    const {
        data: googleCalendarUnavailability,
        isLoading: loadingGoogleCalendarUnavailability,
    } = useQuery({
        queryKey: ["calendar", user?.id],
        queryFn: () => getCalendar(supabase, user!.id, days, times ?? []),
        enabled: !!times && !!user,
    });

    // Step 3: Fetch alerts, only if userProfile exists
    const { data: alerts, isLoading: loadingAlerts } = useQuery({
        queryKey: ["alerts", user?.id],
        queryFn: () => getAlerts(supabase, user!.id),
        enabled: !!user, // This query will only run if `userProfile` is not null
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get("gcalstatus");
        if (success === "success") {
            urlParams.delete("gcalstatus");
            const newUrl = window.location.pathname + "?" + urlParams.toString();
            router.replace(newUrl);
            toast({
                title: "Google Calendar linked.",
                status: "success",
                description:
                    "Your availability will now be synced with Google Calendar.",
                duration: 5000,
                isClosable: true,
            });
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

    useEffect(() => {
        if (item) {
            var paths = displayPathName.split("/");
            for (let i = 0; i < paths.length; i++) {
                if (paths[i] === item.id) {
                    paths[i] = item.title;
                } if (paths[i] === "edit") {
                    paths[i] = "";
                }
            }
            setDisplayPathName(paths.join("/"));
        }
    }, [item]);

    const openPhotoModal = (index: number) => {
        if (statusPhotos[index] === undefined) return;
        setActivePhotoIndex(index);
        setOpenImageModal(true);
    };

    const closePhotoModal = () => {
        setOpenImageModal(false);
        setActivePhotoIndex(null); // Reset the active photo index on close
    };

    const getPhotoSize = (
        photo_url: string
    ): Promise<{ x: number; y: number; w: number; h: number }> => {
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

    const handleAddPhoto = async (
        e: React.ChangeEvent<HTMLInputElement>,
        photosLength: number
    ) => {
        if (!e.target.files) return;
        const filesArray = Array.from(e.target.files);

        const photos = await Promise.all(
            filesArray.map(async (file, index) => {
                setStatusPhotos((prev) => [
                    ...prev,
                    {
                        photo_url:
                            process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/photos/default.webp",
                        photo_size: { x: 0, y: 0, w: 100, h: 100 },
                        status: { loading: true, error: "", compression: 0 },
                    },
                ]);

                const options = {
                    maxSizeMB: 1, // Set the maximum size in MB
                    maxWidthOrHeight: 1920, // Set the maximum width or height in pixels
                    useWebWorker: true, // Use a web worker for faster compression
                    onProgress: (percent: number) => {
                        setStatusPhotos((prev) =>
                            prev.map((photo, i) =>
                                i === index + photosLength
                                    ? {
                                        ...photo,
                                        status: { ...photo.status, compression: percent },
                                    }
                                    : photo
                            )
                        );
                    },
                };

                // do operations
                try {
                    if (file.type.includes('heic')) {
                        file = await convertHeicToJpg(file);
                    }
                    const compressedFile = await imageCompression(file, options);
                    if (compressedFile.size > 1048576) {
                        throw new Error("Error compressing image");
                    }
                    const photoURL = URL.createObjectURL(compressedFile);
                    const photoSize = await getPhotoSize(photoURL);
                    setStatusPhotos((prev) =>
                        prev.map((photo, i) =>
                            i === index + photosLength
                                ? {
                                    photo_url: photoURL,
                                    photo_size: photoSize,
                                    status: { loading: false, error: "", compression: 0 },
                                }
                                : photo
                        )
                    );
                    return { photo_url: photoURL, photo_size: photoSize };
                } catch (error: any) {
                    setStatusPhotos((prev) =>
                        prev.map((photo, i) =>
                            i === index + photosLength
                                ? {
                                    ...photo,
                                    photo_url:
                                        process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/photos/error.png",
                                    status: {
                                        ...photo.status,
                                        error: "Error compressing image",
                                        loading: false,
                                    },
                                }
                                : photo
                        )
                    );
                    return {
                        photo_url:
                            process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/photos/error.png",
                        photo_size: { x: 0, y: 0, w: 100, h: 100 },
                    };
                }
            })
        );
    };

    const handleRemovePhoto = (index: number, arrayHelpers: ArrayHelpers) => {
        setStatusPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const calculatePosition = (photoSize: {
        x: number;
        y: number;
        w: number;
        h: number;
    }) => {
        const x =
            photoSize.w === 100
                ? photoSize.x
                : (photoSize.x / (100 - photoSize.w)) * 100;
        const y =
            photoSize.h === 100
                ? photoSize.y
                : (photoSize.y / (100 - photoSize.h)) * 100;
        return `${x}% ${y}%`;
    };

    const isTimesComplete = (times: Availability) => {
        // add all of the lengths and see if the user has at least 3 hours of availability
        let totalHours = 0;
        for (const day in times) {
            totalHours += times[day] ? times[day].length : 0;
        }
        return totalHours >= 6; // half hours
    };

    const locationsComplete = (selectedLocation: number | undefined) => {
        if (selectedLocation === undefined) return false;
        return selectedLocation !== 0;
    };

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

    const isContactComplete = (sellerContact: string[]) => {
        return sellerContact.length >= 1 && isContactValid(sellerContact);
    };

    const isContactValid = (sellerContact: string[]) => {
        // check that all of the contact details are filled out
        for (const contact of sellerContact) {
            if (contact === "email" || contact === "phone") {
                continue;
            } else if (
                userProfile &&
                userProfile.contact_details &&
                !(userProfile.contact_details as { [key: string]: string })[contact]
            ) {
                return false;
            }
        }
        return true;
    };

    const isTitleValid = (title: string) => {
        return title?.length > 0;
    };

    const isPriceValid = (price: string) => {
        return /^\d+(\.\d{1,2})?$/.test(price);
    };

    const listingValidationSchema = Yup.object().shape({
        title: Yup.string().required("Title is required"),
        price: Yup.number()
            .typeError("Price must be a number")
            .min(1, "Price must be at least $1")
            .test("Must be a valid price", "Must be a valid price", function (value) {
                if (value === undefined) return true;
                return /^\d+(\.\d{1,2})?$/.test(String(value));
            }),
        description: Yup.string().required("Description is required"),
        condition: Yup.string().required("Condition is required"),
        categories: Yup.array()
            .required("Categories are required")
            .min(1, "At least one category is required")
            .max(3, "No more than 3 categories are allowed"),
        photos: Yup.array()
            .test(
                "photo-validation",
                "One or more photos have an error. This can happen if you upload an image with .heic extension.",
                function (value) {
                    return value && value.every((photo) => !photo.status.error);
                }
            )
            .min(1, "At least one photo is required"),
        contact: Yup.boolean().test(
            "contact-schedule-validation",
            "Either quick or scheduled meet is required",
            function (value) {
                return value || this.parent.schedule; // Returns true if either contact or schedule is true
            }
        ),
        schedule: Yup.boolean().test(
            "contact-schedule-validation",
            "Either quick or scheduled meet is required",
            function (value) {
                return value || this.parent.contact; // Returns true if either contact or schedule is true
            }
        ),
        sellerContact: Yup.array().when("contact", {
            is: true, // alternatively: (val) => val == true
            then: (schema) =>
                schema
                    .test(
                        "is-valid",
                        "One or more contact details are empty",
                        (value) => {
                            return value && (value.length === 0 || isContactValid(value));
                        }
                    )
                    .test(
                        "is-complete",
                        "At least 2 contact details are required",
                        (value) => {
                            return value && isContactComplete(value);
                        }
                    ),
            otherwise: (schema) => schema.notRequired(),
        }),
        sellerSchedules: Yup.array().when("schedule", {
            is: true, // alternatively: (val) => val == true
            then: (schema) =>
                schema
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
            otherwise: (schema) => schema.notRequired(),
        }),
        isActive: Yup.boolean().required("Active status is required"),
        negotiable: Yup.boolean().required("Negotiable status is required"),
        returnAfterCancellation: Yup.boolean().required(
            "Return after cancellation status is required"
        ),
        safeMeetup: Yup.boolean().required("Safe meetup status is required"),
    });

    const handleSavePhotoSize = (
        index: number,
        photoSize: { x: number; y: number; w: number; h: number }
    ) => {
        // update only the photo status in the arrayhelpers
        setStatusPhotos((prev) =>
            prev.map((photo, i) =>
                i === index ? { ...photo, photo_size: photoSize } : photo
            )
        );
    };

    const handleSubmit = async (
        values: FormData,
        actions: FormikHelpers<FormData>
    ) => {
        try {
            if (!user || !userProfile) {
                throw new Error("User not found.");
            }
            const userId = user.id;
            const verified = !!(development
                ? userProfile.test_customer_id
                : userProfile.customer_id);

            const lastEdited = new Date().toISOString();

            // uploading photos
            const photo_urls = values.photos.map((photo) => photo.photo_url);
            const photo_sizes = values.photos.map((photo) => photo.photo_size);

            const uploadedFiles = photo_urls.filter((url) => url.startsWith("blob:"));
            const photos = await Promise.all(
                uploadedFiles.map(async (file) => {
                    return await fetch(file).then((r) => r.blob());
                })
            );
            const photoData = new FormData();
            photos.forEach((file, index) => {
                photoData.append(`photo${index}`, file, `photo${index}.jpg`);
            });
            const {
                success: uploadSuccess,
                photoURLs,
                error: uploadItemPhotosError,
            } = await uploadItemPhotos(photoData, itemId);
            if (!uploadSuccess) {
                throw new Error("Error uploading photos." + uploadItemPhotosError);
            }

            // updating item listing
            const filteredPhotoUrls = photo_urls.filter(
                (url) => !url.startsWith("blob:")
            ); // should be none when creating
            const allPhotoURLs = [...filteredPhotoUrls, ...photoURLs];
            const {
                success,
                error,
                id: fetchedId,
            } = await upsertItemListing(
                itemId,
                values.title,
                values.condition,
                values.categories,
                Number(values.price),
                values.description,
                userId,
                allPhotoURLs,
                photo_sizes,
                values.contact,
                values.schedule,
                values.sellerContact,
                values.sellerSchedules,
                values.isActive,
                values.negotiable,
                values.returnAfterCancellation,
                values.safeMeetup,
                verified,
                development,
                lastEdited
            );
            queryClient.invalidateQueries({
                queryKey: ["item", itemId],
            })

            // setting new photos
            setStatusPhotos(
                allPhotoURLs.map((photo_url, index) => ({
                    photo_url,
                    photo_size: photo_sizes[index] ?? { x: 0, y: 0, w: 100, h: 100 },
                    status: { loading: false, error: "", compression: 0 },
                }))
            );
            // removing blob urls
            uploadedFiles.forEach((url) => URL.revokeObjectURL(url));

            if (!success) {
                throw new Error(error + `photoURLs: ${allPhotoURLs}`);
            }
            setLastSavedChanges({
                title: values.title,
                price: values.price,
                quantity: values.quantity,
                listingPrice: values.listingPrice,
                description: values.description,
                condition: values.condition,
                categories: values.categories,
                photos: values.photos,
                contact: values.contact,
                schedule: values.schedule,
                sellerContact: values.sellerContact,
                sellerSchedules: values.sellerSchedules,
                isActive: values.isActive,
                negotiable: values.negotiable,
                returnAfterCancellation: values.returnAfterCancellation,
                safeMeetup: values.safeMeetup,
                deleted: values.deleted
            });
        } catch (error: any) {
            toast({
                title: "Error saving item.",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            actions.setSubmitting(false);
        }
    };

    const renderMeetupSection = (props: FormikProps<FormData>) => {
        return (
            <>
                {/* <Skeleton isLoaded={!loadingItem}>
                    <Field name="contact">
                        {({ field, form }: any) => (
                            <FormControl
                                isInvalid={
                                    props.errors.sellerContact && form.touched.sellerContact
                                }
                            >
                                <VStack align={"left"}>
                                    <HStack>
                                        <Icon as={FaBoltLightning} boxSize={5} />
                                        <FormLabel pt={2}>Quick Meet</FormLabel>
                                        <Switch
                                            id="contact"
                                            {...field}
                                            isChecked={form.values.contact}
                                        />
                                    </HStack>
                                    <Text fontSize={"sm"} opacity={0.5}>
                                        If enabled, you and the buyer will exchange contact details
                                        in order to meetup.
                                    </Text>
                                    {form.values.contact && ( // want to check if contact is enabled, ideally through form
                                        <ContactPreferences
                                            user={user ?? null}
                                            userProfile={userProfile ?? null}
                                            sellerContact={props.values.sellerContact}
                                            setSellerContact={(e) => {
                                                form.setFieldValue("sellerContact", e);
                                                form.setFieldTouched("sellerContact", true);
                                            }}
                                            contactDetailsComplete={isContactComplete(
                                                props.values.sellerContact
                                            )}
                                            isLoadingContact={loadingUser || loadingProfile}
                                        />
                                    )}
                                    <FormErrorMessage>
                                        {!isContactComplete(props.values.sellerContact)
                                            ? props.errors.sellerContact
                                            : undefined}
                                    </FormErrorMessage>
                                </VStack>
                            </FormControl>
                        )}
                    </Field>
                </Skeleton> */}

                <VStack align={"left"}>
                    <HStack>
                        <Icon as={MdCalendarMonth} boxSize={5} />
                        <Text>Schedule</Text>
                    </HStack>
                    <Skeleton isLoaded={!loadingItem && !loadingSchedule} height={loadingItem || loadingSchedule ? "20vh" : "auto"}>
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
                                    <FormErrorMessage>
                                        {props.errors.sellerSchedules
                                            ? String(props.errors.sellerSchedules)
                                            : undefined}
                                    </FormErrorMessage>
                                </FormControl>
                            )}
                        </Field>
                    </Skeleton>
                </VStack>

                {/* <Skeleton isLoaded={!loadingItem && !loadingSchedule}>
                    <Field name="schedule">
                        {({ field, form }: any) => (
                            <FormControl
                                isInvalid={
                                    props.errors.sellerSchedules && form.touched.sellerSchedules
                                }
                            >
                                <VStack align={"left"}>
                                    <HStack>
                                        <CalendarIcon boxSize={5} />
                                        <FormLabel pt={2}>Scheduled Meet</FormLabel>
                                        <Switch
                                            id="schedule"
                                            {...field}
                                            isChecked={props.values.schedule}
                                        />
                                    </HStack>
                                    <Text fontSize={"sm"} opacity={0.5}>
                                        If enabled, the buyer can schedule a meetup time to purchase
                                        this item.
                                    </Text>
                                    {props.values.schedule && (
                                        <SchedulePreferencesItem
                                            scheduleData={scheduleData}
                                            sellerSchedules={props.values.sellerSchedules}
                                            setSellerSchedules={(e) => {
                                                form.setFieldValue("sellerSchedules", e);
                                                form.setFieldTouched("sellerSchedules", true);
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
                                    )}
                                    <FormErrorMessage>
                                        {props.errors.sellerSchedules
                                            ? String(props.errors.sellerSchedules)
                                            : undefined}
                                    </FormErrorMessage>
                                </VStack>
                            </FormControl>
                        )}
                    </Field>
                </Skeleton> */}
            </>
        );
    };

    const renderGeneralSection = (props: FormikProps<FormData>) => {
        return (
            <VStack align={"left"}>
                <Skeleton isLoaded={!loadingItem}>
                    <Field name="isActive">
                        {({ field, form }: any) => (
                            <FormControl
                                isInvalid={props.errors.isActive && form.touched.isActive}
                            >
                                <VStack align={"left"} spacing={0}>
                                    <HStack>
                                        <Icon as={UnlockIcon} boxSize={5} />
                                        <FormLabel pt={2}>Active</FormLabel>
                                        <Switch
                                            id="isActive"
                                            {...field}
                                            isChecked={form.values.isActive}
                                        />
                                    </HStack>
                                    <Text fontSize={"sm"} opacity={0.5}>
                                        If enabled, this item will be visible to buyers.
                                    </Text>
                                    <FormErrorMessage>{props.errors.isActive}</FormErrorMessage>
                                </VStack>
                            </FormControl>
                        )}
                    </Field>
                </Skeleton>
                <Skeleton isLoaded={!loadingItem}>
                    <DeleteListingDialog itemId={itemId} itemTitle={props.values.title} onDelete={deleteItem} userProfile={userProfile ?? null} />
                </Skeleton>
                <>

                </>

                {/* <Skeleton isLoaded={!loadingItem}>
                    <Field name="returnAfterCancellation">
                        {({ field, form }: any) => (
                            <FormControl isInvalid={props.errors.returnAfterCancellation && form.touched.returnAfterCancellation}>
                                <VStack align={"left"} spacing={0}>
                                    <HStack >
                                        <Icon as={RepeatIcon} boxSize={5} />
                                        <FormLabel pt={2}>
                                            Always available
                                        </FormLabel>
                                        <Switch id='returnAfterCancellation'
                                            {...field}
                                            isChecked={form.values.returnAfterCancellation}
                                        />
                                    </HStack>
                                    <Text fontSize={"sm"} opacity={0.5}>If enabled, this item will be returned to the marketplace after a buyer cancels the purchase.</Text>
                                    <FormErrorMessage>{props.errors.returnAfterCancellation}</FormErrorMessage>
                                </VStack>
                            </FormControl>
                        )}
                    </Field>
                </Skeleton> */}
            </VStack>
        );
    };

    const getPhotos = (
        photoURLs: string[],
        photoSizes: { x: number; y: number; w: number; h: number }[]
    ): {
        photo_url: string;
        photo_size: { x: number; y: number; w: number; h: number };
    }[] => {
        return photoURLs.map((photo_url: string, index: number) => {
            return {
                photo_url: photo_url,
                photo_size: photoSizes[index] ?? { x: 0, y: 0, w: 100, h: 100 },
            } as {
                photo_url: string;
                photo_size: { x: number; y: number; w: number; h: number };
            };
        });
    };

    useEffect(() => {
        if (item && userProfile && scheduleData) {
            const newPhotos = getPhotos(
                item.photo_urls,
                item.photo_sizes as { x: number; y: number; w: number; h: number }[]
            );
            setStatusPhotos(
                newPhotos.map((photo) => ({
                    ...photo,
                    status: { loading: false, error: "", compression: 0 },
                }))
            );
            setLastSavedChanges({
                title: item.title,
                price: String(item.price),
                quantity: item.quantity,
                listingPrice: String(item.listing_price),
                description: item.description,
                condition: item.condition,
                categories: item.categories,
                photos: newPhotos.map((photo) => ({
                    ...photo,
                    status: { loading: false, error: "", compression: 0 },
                })),
                contact: getContact(item, userProfile),
                schedule: getSchedule(item, userProfile),
                sellerContact: getSellerContact(item, userProfile),
                sellerSchedules: getSellerSchedules(item, scheduleData),
                isActive: item.active,
                negotiable: item.negotiable,
                returnAfterCancellation: item.return_after_cancellation,
                safeMeetup: item.safe_meetup,
                deleted: item.deleted
            });
            setLoadedInitialData(true);
        }
    }, [item, userProfile, scheduleData]);

    useEffect(() => {
        if (item && categories && categories.length > 0) {
            setSelectedOptions(
                item.categories.map((categoryId) => {
                    const category = categories.find(
                        (category) => category.id === categoryId
                    );
                    return {
                        value: category?.id.toString() ?? "",
                        label: category?.name ?? "Unknown Category",
                    };
                })
            );
        }
    }, [item, categories]);

    const getContact = (
        item: Item | null,
        userProfile: Profile | null
    ): boolean => {
        if (item && userProfile) {
            const itemMeetupPreferences =
                (item.meetup_preferences as MeetupPreferences) || {};
            const userProfileMeetupPreferences =
                (userProfile.seller_meetup as MeetupPreferences) || {};
            return Object.keys(itemMeetupPreferences).length !== 0
                ? itemMeetupPreferences.quick
                : userProfileMeetupPreferences.quick;
        }
        return true;
    };

    const getSchedule = (
        item: Item | null,
        userProfile: Profile | null
    ): boolean => {
        if (item && userProfile) {
            const itemMeetupPreferences =
                (item.meetup_preferences as MeetupPreferences) || {};
            const userProfileMeetupPreferences =
                (userProfile.seller_meetup as MeetupPreferences) || {};
            return Object.keys(itemMeetupPreferences).length !== 0
                ? itemMeetupPreferences.scheduled
                : userProfileMeetupPreferences.scheduled;
        }
        return true;
    };

    const getSellerContact = (
        item: Item | null,
        userProfile: Profile | null
    ): string[] => {
        if (item && userProfile) {
            const itemContactPreferences = item.contact_preferences;
            const userProfileContactPreferences = userProfile.seller_contact;
            return Object.keys(itemContactPreferences).length !== 0
                ? itemContactPreferences
                : userProfileContactPreferences;
        }
        return ["phone"];
    };

    const getSellerSchedules = (
        item: Item | null,
        schedules: Schedule[] | null
    ): string[] => {
        if (item && schedules) {
            const itemSchedulePreferences = item.schedule_preferences;
            const userProfileSchedulePreferences = schedules.map(
                (schedule) => schedule.id
            );
            if (Object.keys(itemSchedulePreferences).length !== 0) {
                return userProfileSchedulePreferences.filter((schedule) => itemSchedulePreferences.includes(schedule));
            } else {
                return userProfileSchedulePreferences;
            }
        }
        return [];
    };

    const handleAddSchedule = async () => {
        setAddingSchedule(true);
        try {
            if (!userProfile) {
                throw new Error("User profile not found");
            }
            const { success, error, data } = await addSchedule(
                userProfile.id,
                0,
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                {}
            );
            if (!success) {
                throw new Error("Failed to add schedule: " + error);
            } else {
                queryClient.invalidateQueries({
                    queryKey: ["schedule", userProfile.id],
                });
            }
            toast({
                title: "Schedule added.",
                description: "Your changes have been saved.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error: any) {
            toast({
                title: "Error adding schedule.",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setAddingSchedule(false);
        }
    };

    const changesMade = (lastSavedChanges: FormData, values: FormData) => {
        const newLastSavedChanges = {
            ...lastSavedChanges,
            price: Number(lastSavedChanges.price),
            listingPrice: Number(lastSavedChanges.listingPrice),
            sellerContact: lastSavedChanges.sellerContact.sort(),
            sellerSchedules: lastSavedChanges.sellerSchedules.sort(),
        };
        const newValues = {
            ...values,
            price: Number(values.price),
            listingPrice: Number(values.listingPrice),
            sellerContact: values.sellerContact.sort(),
            sellerSchedules: values.sellerSchedules.sort(),
        };
        const differenceInChanges = Object.keys(values).filter(
            (key) =>
                JSON.stringify((newValues as any)[key]) !==
                JSON.stringify((newLastSavedChanges as any)[key])
        );
        return (
            differenceInChanges.length !== 0 &&
            !loadingItem &&
            !loadingProfile &&
            !loadingSchedule &&
            !loadingCategories &&
            !loadingLocations &&
            !loadingTimes &&
            !loadingUser
        );
    };

    const renderPhotoSection = (props: FormikProps<FormData>, getRootProps: any) => {
        return (
            <Skeleton isLoaded={!loadingItem}>
                <Text fontWeight={"500"}>Photos</Text>
                <FieldArray
                    name="photos"
                    render={(arrayHelpers) => (
                        <Box p={4} {...getRootProps()}>
                            <SimpleGrid columns={2} gap={4}>
                                {props.values.photos.map((data, index) => {
                                    const { photo_url, photo_size, status } = data;
                                    return (
                                        <Box
                                            position="relative"
                                            h="100%"
                                            w="100%"
                                            borderWidth="1px"
                                            borderStyle="solid"
                                            borderColor="gray.300"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            cursor="pointer"
                                            onClick={() => openPhotoModal(index)}
                                        >
                                            {status.loading ? (
                                                <Flex
                                                    direction="column"
                                                    align="center"
                                                    justify="center"
                                                    h="100%"
                                                >
                                                    {status.compression < 100 ? (
                                                        <>
                                                            <Text mt={2}>Compressing</Text>
                                                            <CircularProgress value={status.compression}>
                                                                <CircularProgressLabel>
                                                                    {status.compression}%
                                                                </CircularProgressLabel>
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
                                                                objectFit={"cover"}
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
                                    <Box
                                        as="label"
                                        htmlFor="photo-input"
                                        cursor="pointer"
                                        h="100%"
                                        w="100%"
                                        borderWidth="2px"
                                        borderStyle="dashed"
                                        borderColor="gray.300"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        onClick={() => setImageTouched(true)}
                                    >
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
                                    onChange={(e) =>
                                        handleAddPhoto(e, props.values.photos.length)
                                    }
                                    style={{ display: "none" }}
                                />
                            </SimpleGrid>
                            {openImageModal && activePhotoIndex !== null && (
                                <ItemPhotoModal
                                    photoUrl={
                                        props.values.photos[activePhotoIndex]
                                            ? props.values.photos[activePhotoIndex].photo_url
                                            : ""
                                    }
                                    photoSize={
                                        props.values.photos[activePhotoIndex]
                                            ? props.values.photos[activePhotoIndex].photo_size
                                            : { x: 0, y: 0, w: 100, h: 100 }
                                    }
                                    savePhotoSize={(newSize) =>
                                        handleSavePhotoSize(activePhotoIndex, newSize)
                                    }
                                    edit={true}
                                    name={`Image ${activePhotoIndex + 1}`}
                                    isOpen={openImageModal}
                                    onClose={closePhotoModal}
                                />
                            )}
                            <Text fontSize={"sm"} opacity={0.5}>
                                Click image to edit position.
                            </Text>
                            {imageTouched && (
                                <Text color={"red.500"}>
                                    {arrayHelpers.form.errors.photos as any}
                                </Text>
                            )}
                        </Box>
                    )}
                />
            </Skeleton>
        );
    };


    const renderDescription = ({
        values: { description, condition },
        setFieldValue,
        touched,
        errors,
        submitForm,
    }: FormikProps<FormData>) => {
        return (
            <Skeleton isLoaded={!loadingItem}>
                <VStack align={"left"}>
                    <HStack>
                        <Icon as={MdChecklist} boxSize={5} />
                        <Text>Condition</Text>
                    </HStack>
                    <ConditionEdit
                        condition={condition}
                        handleSave={(newCondition) => {
                            setFieldValue("condition", newCondition);
                        }}
                        saveListing={submitForm}
                    />

                    <HStack>
                        <Icon as={CgNotes} boxSize={5} />
                        <Text>Description</Text>
                    </HStack>
                    <DescriptionEdit
                        description={description}
                        handleSave={(newDescription) => {
                            setFieldValue("description", newDescription);
                        }}
                        saveListing={submitForm}
                    />
                </VStack>
                {!touched.description || !errors.description ? (
                    <></>
                ) : (
                    <FormErrorMessage>{errors.description}</FormErrorMessage>
                )}
            </Skeleton>
        );
    };

    const renderPrice = ({
        values: { negotiable, price, listingPrice },
        errors,
        touched,
        setFieldValue,
        submitForm,
    }: FormikProps<FormData>) => {
        return (
            <Skeleton isLoaded={!loadingItem}>
                <VStack align={"left"}>
                    <HStack>
                        <Icon as={FaMoneyBill} boxSize={5} />
                        <Text>Price</Text>
                        <Skeleton isLoaded={!loadingItem}>
                            <Field name="negotiable">
                                {({ field, form }: any) => (
                                    <FormControl
                                        isInvalid={errors.negotiable && form.touched.negotiable}
                                    >
                                        <Switch {...field} isChecked={field.value} />
                                    </FormControl>
                                )}
                            </Field>
                        </Skeleton>
                        {negotiable ? (
                            <Badge colorScheme="green">Negotiable</Badge>
                        ) : (
                            <Badge colorScheme="red">Non-Negotiable</Badge>
                        )}
                    </HStack>
                    <PriceEdit
                        price={price}
                        listingPrice={listingPrice}
                        handleSave={(newPrice) => {
                            setFieldValue("price", String(Number(newPrice).toFixed(2)));
                        }}
                        saveListing={submitForm}
                    />
                    {!touched.price || !errors.price ? (
                        <></>
                    ) : (
                        <FormErrorMessage>{errors.price}</FormErrorMessage>
                    )}
                </VStack>
            </Skeleton>
        );
    };

    const renderProductInfo = ({
        values: { title, categories: selectedCategories },
        errors,
        touched,
        setFieldValue,
        submitForm,
    }: FormikProps<FormData>) => {
        return (
            <VStack align={"left"}>
                <Skeleton isLoaded={!loadingItem}>
                    <TitleEdit
                        title={title}
                        handleSave={(newTitle) => {
                            setFieldValue("title", newTitle);
                        }}
                        saveListing={submitForm}
                    />
                    {!touched.title || !errors.title ? (
                        <></>
                    ) : (
                        <FormErrorMessage>{errors.title}</FormErrorMessage>
                    )}
                </Skeleton>

                <Skeleton isLoaded={!loadingItem && !loadingCategories}>
                    <CategoriesEdit
                        categories={selectedCategories}
                        allCategories={categories ?? []}
                        handleSave={(newCategories) => {
                            setFieldValue("categories", newCategories);
                        }}
                        saveListing={submitForm}
                    />
                    {!touched.categories || !errors.categories ? (
                        <></>
                    ) : (
                        <FormErrorMessage>{errors.categories}</FormErrorMessage>
                    )}
                </Skeleton>
            </VStack>
        );
    };

    const renderItem = (props: FormikProps<FormData>) => {
        return (
            <>
                {renderProductInfo(props)}
                <Divider borderColor={"black"} />
                {renderPrice(props)}
                <Divider borderColor={"black"} />
                {renderDescription(props)}
                <Divider borderColor={"black"} />
                {renderMeetupSection(props)}
            </>
        );
    };

    return (
        <Layout
            user={user}
            userProfile={userProfile ?? undefined}
            alerts={alerts}
            loadingUser={loadingUser}
            loadingProfile={loadingProfile}
            loadingAlerts={loadingAlerts}
            loadingPathName={loadingItem}
            displayPathName={displayPathName}
            fullScreen={itemState === 1}
        >
            {/* TODO: Make sure people have to be logged in! */}
            {user?.id == item?.seller_id ? <Formik
                enableReinitialize={!loadedInitialData}
                initialValues={
                    {
                        title: item ? item.title : "",
                        price: item ? String(item.price.toFixed(2)) : 0,
                        listingPrice: item ? String(item.listing_price.toFixed(2)) : 0,
                        description: item ? item.description : "",
                        condition: item ? item.condition : "",
                        categories: item ? item.categories : [],
                        photos: item
                            ? getPhotos(
                                item.photo_urls,
                                item.photo_sizes as {
                                    x: number;
                                    y: number;
                                    w: number;
                                    h: number;
                                }[]
                            ).map((photo) => ({
                                ...photo,
                                status: { loading: false, error: "", compression: 0 },
                            }))
                            : [],
                        contact: getContact(item ?? null, userProfile ?? null),
                        schedule: getSchedule(item ?? null, userProfile ?? null),
                        sellerContact: getSellerContact(item ?? null, userProfile ?? null),
                        sellerSchedules: getSellerSchedules(
                            item ?? null,
                            scheduleData ?? null
                        ),
                        isActive: item ? item.active : false,
                        negotiable: item ? item.negotiable : false,
                        returnAfterCancellation: item
                            ? item.return_after_cancellation
                            : false,
                        safeMeetup: item ? item.safe_meetup : false,
                        deleted: item ? item.deleted : false,
                    } as FormData
                }
                onSubmit={(values, actions) => {
                    const promise = handleSubmit(values, actions);
                    toast.promise(promise, {
                        success: {
                            title: `Item Updated.`,
                            description: `Your item has successfully been updated.`,
                            duration: 5000,
                            isClosable: true,
                        },
                        error: {
                            title: "Error saving item.",
                            description: "An error occurred while saving your item.",
                            duration: 5000,
                            isClosable: true,
                        },
                        loading: {
                            title: "Saving item...",
                            description: "Please wait while we save your item.",
                            duration: 5000,
                            isClosable: true,
                        },
                    });
                }}
                validationSchema={listingValidationSchema}
            >
                {(props) => {
                    useEffect(() => {
                        props.setFieldValue("photos", statusPhotos);
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

                    return (
                        <Form>
                            <FormControl
                                isInvalid={
                                    !!(props.errors.contact || props.touched.contact) ||
                                    !!(props.errors.schedule && props.touched.schedule)
                                }
                            >
                                <VStack align={"left"} key={"newChanges - " + props.submitCount}>
                                    {changesMade(lastSavedChanges, props.values) && (
                                        <Box position="sticky" top={2} zIndex={2}>
                                            <Alert status="warning">
                                                <AlertIcon />
                                                <AlertTitle>You have unsaved changes!</AlertTitle>
                                                <AlertDescription>
                                                    If you leave this page, those changes will be lost.{" "}
                                                    <Link
                                                        href="#save"
                                                        color={"teal.500"}
                                                        onClick={props.submitForm}
                                                    >
                                                        Save changes.
                                                    </Link>
                                                </AlertDescription>
                                            </Alert>
                                        </Box>
                                    )}
                                    {!props.values.deleted ?
                                        <>
                                            {props.values.isActive ? (
                                                <VStack align={"left"}>
                                                    {isMobile ? (
                                                        <VStack spacing={6} align={"left"}>
                                                            <Box width={{ base: "90%", md: "50%" }}>
                                                                {renderPhotoSection(props, getRootProps)}
                                                            </Box>
                                                            {renderItem(props)}
                                                        </VStack>
                                                    ) : (
                                                        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                                                            <GridItem colSpan={1}>
                                                                <Box position="sticky" top={0} width={"90%"}>
                                                                    {renderPhotoSection(props, getRootProps)}
                                                                </Box>
                                                            </GridItem>
                                                            <GridItem colSpan={1}>
                                                                <VStack align={"left"}>{renderItem(props)}</VStack>
                                                            </GridItem>
                                                        </Grid>
                                                    )}
                                                </VStack>
                                            ) : (
                                                <VStack align={"left"}>
                                                    <BlockedScreen blockedText="Your item is inactive." />
                                                </VStack>
                                            )}
                                        </> :
                                        <VStack align={"left"}>
                                            <BlockedScreen blockedText="Your item has been deleted." />
                                        </VStack>
                                    }
                                    <Divider borderColor={"#ceb888"} />
                                    <HStack width={"100%"} align={"start"}>
                                        {renderGeneralSection(props)}
                                        <Spacer />
                                        <Skeleton isLoaded={!loadingItem && !loadingSchedule}>
                                            <Button
                                                id="save"
                                                type="submit"
                                                colorScheme="blue"
                                                leftIcon={<CheckIcon />}
                                                isLoading={props.isSubmitting}
                                                onClick={() => setImageTouched(true)}
                                            >
                                                {props.isSubmitting ? "Saving" : "Save"}
                                            </Button>
                                        </Skeleton>
                                    </HStack>
                                    <FormErrorMessage>
                                        {props.errors.contact || props.errors.schedule}
                                    </FormErrorMessage>
                                </VStack>
                            </FormControl>
                        </Form>
                    );
                }}
            </Formik> : <VStack align={"left"}>
                <BlockedScreen blockedText="You are not the seller of this item." />
            </VStack>}
        </Layout>
    );
}
