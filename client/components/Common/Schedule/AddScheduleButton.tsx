/**
 * AddScheduleButton.tsx
 * Component that is used to add a new schedule to the user's profile.
 * @AshokSaravanan222
 * 10-16-2024
 */

import { Profile } from "@/types";
import { addSchedule } from "@/utils/services/schedule";
import { AddIcon } from "@chakra-ui/icons";
import { Button, useToast } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type AddScheduleButtonProps = {
    userProfile: Profile | null;
}

export default function AddScheduleButton({ userProfile }: AddScheduleButtonProps) {
    const queryClient = useQueryClient()
    const [addingSchedule, setAddingSchedule] = useState(false);
    const toast = useToast();

    const handleAddSchedule = async () => {
        setAddingSchedule(true);
        try {
            if (!userProfile) {
                throw new Error("User profile not found")
            }
            const { success, error, data } = await addSchedule(userProfile.id, 0, [], [], [], [], [], [], [], {});
            if (!success) {
                throw new Error("Failed to add schedule: " + error)
            } else {
                queryClient.invalidateQueries({
                    queryKey: ['schedule', userProfile.id]
                });
            }
            toast({
                title: 'Schedule added.',
                description: "Your changes have been saved.",
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error: any) {
            toast({
                title: 'Error adding schedule.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setAddingSchedule(false);
        }
    }

    return (
        <Button width={"100%"} colorScheme='blue' mt={4} leftIcon={<AddIcon />} onClick={handleAddSchedule} isLoading={addingSchedule}>Add Schedule</Button>
    )
}