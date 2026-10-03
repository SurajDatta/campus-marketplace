/**
 * LinkGoogleCalendar.tsx
 * Button that will be used to link google calendar. It will first prompt a dialog saying that this will refresh the page, and all changes that the user made will be lost. If the user confirms, it will redirect to the google calendar page.
 * @AshokSaravanan222
 * 09-19-2024
 */

import { MeetupTimes, Profile, Time } from "@/types";
import { addGoogleCalendar, removeGoogleCalendar } from "@/utils/services/google";
import { CheckIcon, CloseIcon, LinkIcon } from "@chakra-ui/icons";
import { useDisclosure, Button, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogCloseButton, AlertDialogBody, AlertDialogFooter, useToast, VStack, Text, Badge, HStack, IconButton } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import React from "react"
import { FaGoogle } from "react-icons/fa";

type LinkGoogleCalendarProps = {
    isMobile: boolean;
    userProfile: Profile | null;
    allTimes: Time[];
    isDisabled: boolean;
    googleCalendarUnavailability?: MeetupTimes
    googleCalendarId?: string,
}


export default function LinkGoogleCalendar({isMobile, userProfile, allTimes, isDisabled, googleCalendarUnavailability, googleCalendarId }: LinkGoogleCalendarProps) {
    // what if I didn't refresh the page, but did it on a new tab? 90%, you should leave it.
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [loading, setLoading] = React.useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const cancelRef = React.useRef(null);
    const toast = useToast();

    const handleGoogleAuth = async () => {
        setLoading(true);
        try {
            if (!userProfile) {
                throw new Error('User profile not found');
            }
            const origin = window.location.origin;
            const redirectURL = `${origin}${pathname}`; // how can I put this in
            const callbackURL = `${origin}/auth/googleCallback`
            // const { success, error, url } = await linkGoogleCalendar(redirectURL); // old supabase
            const { success, error, url } = await addGoogleCalendar(callbackURL, redirectURL);
            if (!success) {
                console.error('Error linking Google Calendar:', error)
            } else {
                // add query params to the url
                toast({
                    title: 'Linking Google Calendar!',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                })
                router.push(url);
            }
        } catch (error: any) {
            toast({
                title: 'Error linking Google Calendar.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
        } finally {
            setLoading(false);
        }

    }

    const handleCalendarSignOut = async () => {
        setLoading(true);
        try {
            if (!userProfile) {
                throw new Error('User profile not found');
            }
            if (!googleCalendarId) {
                throw new Error('Google Calendar ID not found');
            }
            // const { success, error } = await unlinkGoogleCalendar(userProfile.id); // old supabase
            const { success, error } = await removeGoogleCalendar(googleCalendarId);
            if (!success) {
                console.error('Error unlinking Google Calendar:', error)
            }
            toast({
                title: 'Google Calendar unlinked.',
                description: 'You have successfully unlinked your Google Calendar.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            })
            queryClient.invalidateQueries({
                queryKey: ['calendar', userProfile.id]
            });
        } catch (error: any) {
            toast({
                title: 'Error unlinking Google Calendar. Try refreshing the page to fix this issue.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
        } finally {
            setLoading(false);
            onClose();
        }
    }

    const linked = googleCalendarId ? true : false;

    return (
        <>
            <HStack>
                {isMobile ? <IconButton aria-label='Link Google Calendar' icon={<FaGoogle />} onClick={onOpen} colorScheme="blue" /> : <Button colorScheme="blue" onClick={onOpen} leftIcon={<FaGoogle />} size={"sm"}>{linked ? "Unlink" : "Link"} Google Calendar</Button>}
            </HStack>

            <AlertDialog
                motionPreset='slideInBottom'
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isOpen={isOpen}
                isCentered
            >
                <AlertDialogOverlay />
                <AlertDialogContent>
                    <AlertDialogHeader>{linked ? "Unlink" : "Link"} Google Calendar</AlertDialogHeader>
                    <AlertDialogCloseButton />
                    <AlertDialogBody>
                        {isDisabled ? <Text>{linked ? "Unlinking" : "Linking"} your Google Calendar is not allowed until all changes on this page are saved.</Text> : <Text>{linked ? "Unlinking" : "Linking"} your Google Calendar will {linked ? "unblock" : "block"} times that are in your calendar. Are you sure you want to {linked ? "unlink" : "link"} your Google Calendar?</Text>}
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Close
                        </Button>
                        <Button colorScheme="blue" ml={3} leftIcon={linked ? <CloseIcon /> : <LinkIcon />} onClick={linked ? handleCalendarSignOut : handleGoogleAuth} isLoading={loading} isDisabled={isDisabled}>
                            {linked ? "Unlink" : "Link"}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}