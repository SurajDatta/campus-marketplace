/**
 * AddScheduleModal.tsx
 * Modal to add a schedule, the same as edit, but with a blank schedule.
 * @AshokSaravanan222
 * 10-28-2024
 */

import ScheduleEdit from "@/components/Common/Schedule/ScheduleEdit";
import AddLocationModal from "@/components/Sell/Preferences/AddLocationModal";
import { Availability, Location, Profile, Schedule, Time } from "@/types";
import { getTotalTimes } from "@/utils/getTotalTimes";
import { AddIcon } from "@chakra-ui/icons";
import { Button, HStack, useToast } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

type AddScheduleProps = {
    schedule: Schedule;
    allLocations: Location[];
    allTimes: Time[];
    userProfile: Profile | null;
    isLoadingLocations: boolean;
    isLoadingTimes: boolean;
    isMobile: boolean;
    mapsApiKey: string;
    googleCalendarUnavailability?: Availability; // times that are blocked in google calendar
    googleCalendarId?: string;
    days: string[];
    addSchedule(monday: number[], tuesday: number[], wednesday: number[], thursday: number[], friday: number[], saturday: number[], sunday: number[], days: Availability, location: number): Promise<{ success: boolean, error: string }>
}


export default function AddScheduleModal({ allLocations, allTimes, userProfile, isLoadingLocations, isLoadingTimes, isMobile, mapsApiKey, googleCalendarUnavailability, googleCalendarId, days, addSchedule, schedule }: AddScheduleProps) {
    const toast = useToast();
    const queryClient = useQueryClient()
    const { isOpen, onOpen, onClose: onModalClose } = useDisclosure()
    const [isAdding, setIsAdding] = useState<boolean>(false);

    const [newSchedule, setNewSchedule] = useState<Schedule>(JSON.parse(JSON.stringify(schedule)))

    const onClose = () => {
        setNewSchedule(JSON.parse(JSON.stringify(schedule))) // reset to original schedule
        onModalClose()
    }

    const handleSave = async () => {
        try {
            setIsAdding(true);
            if (!userProfile) {
                throw new Error("User profile not found.")
            }
            if (newSchedule.location === 0) {
                throw new Error("Please select a location.")
            }
            if (getTotalTimes(newSchedule, new Date(days[0])) === 0) {
                throw new Error("Please add at least 1 time to your schedule.")
            }
            const addSchedulePromise = addSchedule(newSchedule.monday, newSchedule.tuesday, newSchedule.wednesday, newSchedule.thursday, newSchedule.friday, newSchedule.saturday, newSchedule.sunday, (newSchedule.days as Availability), newSchedule.location)
            toast.promise(addSchedulePromise, {
                success: {
                    title: `Schedule Added.`,
                    description: `Your schedule has successfully been added.`,
                    duration: 5000,
                    isClosable: true,
                },
                error: {
                    title: 'Error adding schedule.',
                    description: 'An error occurred while adding your schedule.',
                    duration: 5000,
                    isClosable: true,
                },
                loading: {
                    title: 'Adding schedule...',
                    description: 'Please wait while we add your schedule.',
                    duration: 5000,
                    isClosable: true,
                }
            })

            const { success, error } = await addSchedulePromise
            if (!success) {
                throw new Error("Could not save schedule" + error)
            } else {
                queryClient.invalidateQueries({
                    queryKey: ['schedule', userProfile.id]
                })
            }
            onClose();
        } catch (error: any) {
            toast({
                title: 'Invalid schedule.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsAdding(false)
        }
    }

    useEffect(() => {
        setNewSchedule(JSON.parse(JSON.stringify(schedule)));
    }, [schedule]);

    return (
        <>
            {/* <HStack>
                <Button colorScheme='blue' onClick={onOpen}>Add Location</Button>
            </HStack> */}

            {newSchedule.location === 0 && <AddLocationModal userProfile={userProfile} sellerSchedule={newSchedule} setSellerSchedule={setNewSchedule} mapsAPIKey={mapsApiKey} allLocations={allLocations} locationsLoading={isLoadingLocations} isMobile={isMobile} handleNext={onOpen} />}

            <Modal isOpen={isOpen} onClose={onClose} size={"6xl"} motionPreset='slideInBottom'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Schedule</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <ScheduleEdit
                            sellerSchedule={newSchedule}
                            setSellerSchedule={setNewSchedule}
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
                            onReset={() => { }}
                            onDelete={() => { }}
                            showDelete={false}
                        />
                    </ModalBody>

                    <ModalFooter>
                        <Button mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button colorScheme='blue' onClick={handleSave} isLoading={isAdding}>Add</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}