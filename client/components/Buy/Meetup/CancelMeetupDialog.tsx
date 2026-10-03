/**
 * CancelMeetupDialog.tsx
 * Dialog used to cancel the meetup at the earlier stages or while both parties are checking in.
 * @AshokSaravanan222
 * 10-29-2024
 */
import React from 'react';
import { Button, HStack, Table, TableCaption, TableContainer, Tbody, Td, Text, Textarea, Th, Thead, Tr, useDisclosure, useToast, VStack } from '@chakra-ui/react';
import { AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay } from '@chakra-ui/react';
import { Meetup } from '@/types';

type CancelMeetupDialogProps = {
    meetup: Meetup | null;
    handleCancel: (cancelFee: number | null) => Promise<{ success: boolean, error: string }>;
    handleNewCancel: (cancelReason: string | null) => Promise<{ success: boolean, error: string }>;

}

export default function CancelMeetupDialog({ meetup, handleCancel, handleNewCancel }: CancelMeetupDialogProps) {
    const cancelRef = React.useRef(null);
    const { isOpen, onToggle, onClose } = useDisclosure();
    const [isLoadingCancel, setIsLoadingCancel] = React.useState(false);
    const [cancelReason, setCancelReason] = React.useState<string>("");
    const toast = useToast();


    const getCancelText = (meetup: Meetup) => {
        if (meetup.status === "pending") {
            return <Text>Are you sure you want to cancel the meetup? There is no charge for cancelling a meeting at this stage, since it has not been confirmed yet.</Text>
        } else if (meetup.status === "meeting" && meetup.time) {
            const meetupTime = new Date(meetup.time);
            const itemPrice = meetup.item_price;
            const currentTime = new Date().getTime();
            const timeDifference = meetupTime.getTime() - currentTime;

            if (timeDifference < 30 * 60 * 1000) {
                return <Text>Are you sure you want to cancel the meetup? You will be charged <b>${(0.25 * itemPrice).toFixed(2)}</b> for cancelling within 30 minutes of the meetup time.</Text>
            } else if (timeDifference < 60 * 60 * 1000) {
                return <Text>Are you sure you want to cancel the meetup? You will be charged <b>${(0.2 * itemPrice).toFixed(2)}</b> for cancelling within 1 hour of the meetup time.</Text>
            } else if (timeDifference < 6 * 60 * 60 * 1000) {
                return <Text>Are you sure you want to cancel the meetup? You will be charged <b>${(0.15 * itemPrice).toFixed(2)}</b> for cancelling within 6 hours of the meetup time.</Text>
            } else if (timeDifference < 12 * 60 * 60 * 1000) {
                return <Text>Are you sure you want to cancel the meetup? You will be charged <b>${(0.1 * itemPrice).toFixed(2)}</b> for cancelling within 12 hours of the meetup time.</Text>
            } else if (timeDifference < 24 * 60 * 60 * 1000) {
                return <Text>Are you sure you want to cancel the meetup? You will be charged <b>${(0.05 * itemPrice).toFixed(2)}</b> for cancelling within 24 hours of the meetup time.</Text>
            } else {
                return <Text>Are you sure you want to cancel the meetup? There is no charge for cancelling a meeting more than 24 hours in advance.</Text>
            }
        }
    };

    const generateCancelCost = (price: number, meetupTime: Date) => {
        const currentTime = new Date().getTime();
        const timeDifference = meetupTime.getTime() - currentTime;

        if (timeDifference < 30 * 60 * 1000) {
            return 0.25 * price;
        } else if (timeDifference < 60 * 60 * 1000) {
            return 0.2 * price;
        } else if (timeDifference < 6 * 60 * 60 * 1000) {
            return 0.15 * price;
        } else if (timeDifference < 12 * 60 * 60 * 1000) {
            return 0.1 * price;
        } else if (timeDifference < 24 * 60 * 60 * 1000) {
            return 0.05 * price;
        } else {
            return 0;
        }
    };

    const handleMeetupCancel = async () => {
        setIsLoadingCancel(true);
        try {

            if (!meetup) {
                throw new Error("Meetup not found.");
            }

            let cancelFee: number | null = null;
            if (meetup.status === "confirmed" && meetup.time) {
                cancelFee = generateCancelCost(meetup.item_price, new Date(meetup.time));
            } else if (meetup.status === "pending") {
                cancelFee = null; // no charge if the meetup is pending
            }

            const cancelPromise = handleCancel(cancelFee);
            toast.promise(cancelPromise, {
                success: {
                    title: `Meetup Cancelled.`,
                    description: `The meetup has been successfully cancelled.`,
                    duration: 5000,
                    isClosable: true,
                },
                error: {
                    title: 'Error cancelling meetup.',
                    description: 'An error occurred while cancelling the meetup.',
                    duration: 5000,
                    isClosable: true,
                },
                loading: {
                    title: 'Cancelling meetup...',
                    description: 'Please wait while we cancel the meetup.',
                    duration: 5000,
                    isClosable: true,
                }
            })

            const { success, error } = await cancelPromise;
            setIsLoadingCancel(false);
            if (!success) {
                throw new Error(error);
            }
        } catch (error: any) {
            toast({
                title: 'Error cancelling meetup.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            onClose();
            setIsLoadingCancel(false);
        }
    }

    const newHandleMeetupCancel = async () => {
        setIsLoadingCancel(true);
        try {

            if (!meetup) {
                throw new Error("Meetup not found.");
            }

            if (!cancelReason || cancelReason.length === 0) {
                throw new Error("Please provide a reason for cancelling the meetup.");
            }

            const cancelPromise = handleNewCancel(cancelReason);
            toast.promise(cancelPromise, {
                success: {
                    title: `Meetup Cancelled.`,
                    description: `The meetup has been successfully cancelled.`,
                    duration: 5000,
                    isClosable: true,
                },
                error: {
                    title: 'Error cancelling meetup.',
                    description: 'An error occurred while cancelling the meetup.',
                    duration: 5000,
                    isClosable: true,
                },
                loading: {
                    title: 'Cancelling meetup...',
                    description: 'Please wait while we cancel the meetup.',
                    duration: 5000,
                    isClosable: true,
                }
            })

            const { success, error } = await cancelPromise;
            setIsLoadingCancel(false);
            if (!success) {
                throw new Error(error);
            }
        } catch (error: any) {
            toast({
                title: 'Error cancelling meetup.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            onClose();
            setIsLoadingCancel(false);
        }
    }



    return (
        <>
            <Button colorScheme="red" onClick={onToggle}>Cancel {meetup?.buyer_met && meetup.seller_met ? "Purchase" : "Meetup"}</Button>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Cancel {meetup?.buyer_met && meetup.seller_met ? "Purchase" : "Meetup"}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            {/* <VStack align='left'>
                                {getCancelText(meetup!)}
                                {meetup?.status !== "pending" && <TableContainer>
                                    <Table colorScheme='blue' size={"sm"}>
                                        <TableCaption>Cancel Meetup Costs</TableCaption>
                                        <Thead>
                                            <Tr>
                                                <Th>Notice</Th>
                                                <Th>Price</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            <Tr>
                                                <Td>0-30 minutes</Td>
                                                <Td>25%</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>30 minutes - 1 hour</Td>
                                                <Td>20%</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>1-6 hours</Td>
                                                <Td>15%</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>6-12 hours</Td>
                                                <Td>10%</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>12-24 hours</Td>
                                                <Td>5%</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>24 hours+</Td>
                                                <Td>No charge</Td>
                                            </Tr>
                                        </Tbody>
                                    </Table>
                                </TableContainer>}
                            </VStack> */}
                            <Textarea
                                placeholder={meetup?.buyer_met && meetup.seller_met ? "Let the seller know why you choose to cancel so they can do better next time." : "Let the other party know why you are cancelling the meetup."}
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            />

                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <HStack>
                                <Button ref={cancelRef} onClick={onClose}>
                                    Cancel
                                </Button>
                                {/* <Button colorScheme="red" onClick={handleMeetupCancel} isLoading={isLoadingCancel}>Confirm</Button> */}
                                <Button colorScheme="red" onClick={newHandleMeetupCancel} isLoading={isLoadingCancel}isDisabled={cancelReason.length === 0}>Confirm</Button>
                            </HStack>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

        </>
    )
}