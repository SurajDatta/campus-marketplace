/**
 * DeleteScheduleButton.tsx
 * Will be used to delete a schedule.
 * @AshokSaravanan222
 * 10-10-2024
 */

import { DeleteIcon } from "@chakra-ui/icons";
import { Button, IconButton, useDisclosure, useToast } from "@chakra-ui/react";
import { useRef, useState } from "react"
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react'
import { Location, Profile } from "@/types";
import { useQueryClient } from "@tanstack/react-query";


type DeleteScheduleButtonProps = {
    userProfile: Profile | null;
    onDelete: (scheduleId: string) => Promise<{ success: boolean, error: string }>
    allLocations: Location[]
    locationId: number
    scheduleId: string
}

export default function DeleteScheduleButton({ userProfile, allLocations, locationId, onDelete, scheduleId }: DeleteScheduleButtonProps) {
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const queryClient = useQueryClient()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = useRef(null)
    const toast = useToast()
    const locationName = allLocations.find((location) => location.id === locationId)?.name

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            if (!userProfile) {
                throw new Error("User profile not found.")
            }
            const { success, error } = await onDelete(scheduleId);
            if (!success) {
                throw new Error(error)
            } else {
                queryClient.invalidateQueries({
                    queryKey: ["schedule", userProfile.id]
                })
            }
            toast({
                title: 'Schedule Deleted',
                description: 'Your schedule has been deleted successfully.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: `Error deleting schedule: ${error.message}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });

        } finally {
            setIsDeleting(false)
            onClose()
        }
    }

    return (
        <>
            {/* <Button colorScheme={"red"} leftIcon={<DeleteIcon />} onClick={onOpen} isLoading={isDeleting}>Delete Schedule</Button> */}
            <IconButton
                aria-label="Remove schedule"
                icon={<DeleteIcon />}
                size="md"
                colorScheme="red"
                onClick={onOpen}
            />
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Delete Schedule
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to delete the schedule for <b>{locationName ?? "Unknown Location"}</b>? This will remove it from your account, which can affect other listings that use this schedule.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme='red' onClick={handleDelete} ml={3} isLoading={isDeleting}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    )

}