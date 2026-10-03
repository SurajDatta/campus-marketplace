/**
 * DeleteListingDialog.tsx
 * Will be used to delete a schedule.
 * @AshokSaravanan222
 * 10-10-2024
 */

import { DeleteIcon } from "@chakra-ui/icons";
import { Button, HStack, IconButton, useDisclosure, useToast } from "@chakra-ui/react";
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
import { useRouter } from "next/navigation";


type DeleteListingDialogProps = {
    userProfile: Profile | null;
    itemId: string;
    itemTitle: string;
    onDelete: (itemId: string) => Promise<{ success: boolean, error: string }>
}

export default function DeleteListingDialog({ userProfile, onDelete, itemId, itemTitle }: DeleteListingDialogProps) {
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const router = useRouter()
    const queryClient = useQueryClient()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = useRef(null)
    const toast = useToast()

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            if (!userProfile) {
                throw new Error("User profile not found.")
            }
            const { success, error } = await onDelete(itemId);
            if (!success) {
                throw new Error(error)
            } else {
                queryClient.invalidateQueries({
                    queryKey: ["sellItems", userProfile.id]
                })
            }
            toast({
                title: 'Listing Deleted',
                description: 'Your item has been deleted successfully.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            router.push('/sell')
        } catch (error: any) {
            toast({
                title: 'Error',
                description: `Error deleting listing: ${error.message}`,
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
            <HStack>
                <Button leftIcon={<DeleteIcon />} colorScheme={"red"} onClick={onOpen}>Delete Listing</Button>
            </HStack>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Delete Listing
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to delete your listing for <b>{itemTitle}</b>? This action is irreversible.
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