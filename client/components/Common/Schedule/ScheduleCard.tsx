/**
 * ScheduleCard.tsx
 * Card that will be used in Schedule.tsx
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import { Availability, Location, Profile, Schedule, SellerSchedule, Time } from '@/types';
import { CalendarIcon, EditIcon } from '@chakra-ui/icons';
import { AspectRatio, Box, Button, HStack, IconButton, Spacer, Text, useDisclosure, useToast, VStack } from '@chakra-ui/react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import ScheduleEdit from './ScheduleEdit';
import { getTotalTimes } from '@/utils/getTotalTimes';
import { useQueryClient } from '@tanstack/react-query';
import DeleteScheduleDialog from '@/components/Sell/Preferences/DeleteScheduleDialog';
import { deleteSchedule } from '@/utils/services/schedule';
import DeleteScheduleButton from '@/components/Sell/Preferences/DeleteScheduleButton';

type ScheduleCardProps = {
    schedule: Schedule
    allLocations: Location[]
    allTimes: Time[]
    userProfile: Profile | null
    isLoadingLocations: boolean
    isLoadingTimes: boolean
    isMobile: boolean
    mapsApiKey: string
    days: string[]
    saveSchedule(id: string, newSchedule: Schedule): Promise<{ success: boolean, error: string }>
    googleCalendarUnavailability?: Availability; // times that are blocked in google calendar
    googleCalendarId?: string;
}

export default function ScheduleCard({ schedule, saveSchedule, allLocations, days, allTimes, userProfile, isLoadingLocations, isLoadingTimes, isMobile, mapsApiKey, googleCalendarUnavailability, googleCalendarId }: ScheduleCardProps) {
    const { isOpen, onOpen, onClose: onModalClose } = useDisclosure()
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const toast = useToast();
    const queryClient = useQueryClient()

    const location = allLocations.find((potentialLocation) => potentialLocation.id === schedule.location)
    const totalTimes = getTotalTimes(schedule, new Date(days[0]));

    const [editedSchedule, setEditedSchedule] = useState<Schedule>(JSON.parse(JSON.stringify(schedule)))

    const onClose = () => {
        setEditedSchedule(JSON.parse(JSON.stringify(schedule))) // reset to original schedule
        onModalClose()
    }

    const handleSave = async () => {
        try {
            setIsSaving(true);
            if (!userProfile) {
                throw new Error("User profile not found.")
            }
            const saveSchedulePromise = saveSchedule(schedule.id, editedSchedule)
            toast.promise(saveSchedulePromise, {
                success: {
                    title: `Schedule Saved.`,
                    description: `Your schedule has successfully been updated.`,
                    duration: 5000,
                    isClosable: true,
                },
                error: {
                    title: 'Error saving schedule.',
                    description: 'An error occurred while saving your schedule.',
                    duration: 5000,
                    isClosable: true,
                },
                loading: {
                    title: 'Saving schedule...',
                    description: 'Please wait while we save your schedule.',
                    duration: 5000,
                    isClosable: true,
                }
            })

            const { success, error } = await saveSchedulePromise
            if (!success) {
                throw new Error("Could not save schedule" + error)
            } else {
                queryClient.invalidateQueries({
                    queryKey: ['schedule', userProfile.id]
                })
            }
        } catch (error: any) {
            console.error(error)
        } finally {
            setIsSaving(false)
            onClose()
        }
    }

    useEffect(() => {
        setEditedSchedule(JSON.parse(JSON.stringify(schedule)));
    }, [schedule]);

    return (
        <Box key={schedule.id}>
            <HStack>
                <VStack align={"left"} spacing={0}>
                    <Text>{location ? location.name : "Unknown Location"}</Text>
                    <Text fontSize={"sm"} opacity={0.5}>{totalTimes} times</Text>
                </VStack>
                <Spacer />
                <IconButton aria-label="Edit Schedule" icon={<EditIcon />} colorScheme='blue' onClick={onOpen} />
            </HStack>

            <Modal isOpen={isOpen} onClose={onClose} size={"6xl"}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Schedule</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <ScheduleEdit
                            sellerSchedule={editedSchedule}
                            setSellerSchedule={setEditedSchedule}
                            allLocations={allLocations}
                            userProfile={userProfile}
                            isLoadingLocations={isLoadingLocations}
                            allTimes={allTimes}
                            isLoadingTimes={isLoadingTimes}
                            isMobile={isMobile}
                            googleMapsAPIKey={mapsApiKey}
                            googleCalendarUnavailability={googleCalendarUnavailability}
                            googleCalendarId={googleCalendarId}
                            days={days}
                            onReset={onModalClose}
                            onDelete={onModalClose}
                            showDelete={true}
                        />
                    </ModalBody>

                    <ModalFooter>
                        <Button mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button colorScheme='blue' onClick={handleSave} isLoading={isSaving}>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    )

}