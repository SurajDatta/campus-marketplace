/**
 * ResetScheduleDialog.tsx
 * Will be used to delete a schedule.
 * @AshokSaravanan222
 * 10-10-2024
 */

import { DeleteIcon, RepeatIcon } from "@chakra-ui/icons";
import { Button, Icon, IconButton, useDisclosure, useToast } from "@chakra-ui/react";
import { use, useRef, useState } from "react"
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react'
import { Location, Profile } from "@/types";
import { useQueryClient } from '@tanstack/react-query';

type ResetScheduleDialogProps = {
    userProfile: Profile | null;
    isMobile: boolean
    onReset: (scheduleId: string) => Promise<{success: boolean, error: string}>
    allLocations: Location[]
    locationId: number
    scheduleId: string
}

export default function ResetScheduleDialog({ userProfile, isMobile, allLocations, locationId, onReset, scheduleId }: ResetScheduleDialogProps) {
    const [isResetting, setIsResetting] = useState<boolean>(false);
    const queryClient = useQueryClient()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = useRef(null)
    const toast = useToast()
    const locationName = allLocations.find((location) => location.id === locationId)?.name

    const handleReset = async () => {
        setIsResetting(true)
        try {
            if (!userProfile) {
                throw new Error("User profile not found.")
            }
            const {success, error} = await onReset(scheduleId);
            if (!success) {
                throw new Error(error)
            } else {
                queryClient.invalidateQueries({
                    queryKey: ["schedule", userProfile.id]
                })
            }
            toast({
                title: 'Schedule Reset',
                description: 'Your schedule has been reset successfully.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: `Error resetting schedule: ${error.message}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });

        } finally {
            setIsResetting(false)
            onClose()
        }
    }

    return (
        <>
            {isMobile ? <IconButton aria-label='Reset Schedule' icon={<Icon as={RepeatIcon} />} onClick={onOpen} colorScheme="green" /> : <Button colorScheme={"green"} leftIcon={<Icon as={RepeatIcon} />} onClick={onOpen} >Reset Schedule</Button>}
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Reset Schedule
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to reset the schedule for <b>{locationName ?? "Unknown Location"}</b>? This will remove all times from the schedule, and preserve the location.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme='green' onClick={handleReset} ml={3} isLoading={isResetting}>
                                Reset
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    )

}