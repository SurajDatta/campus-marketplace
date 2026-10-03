/**
 * MeetupConfirmation.tsx
 * Wrapper of the ItemInfo component that will be shown after an item has been bought/sold.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-08-03
 *
 *
 */
import React, { useEffect } from "react";
import { Button, Center, CircularProgress, CircularProgressLabel, Divider, FormControl, FormErrorMessage, FormHelperText, FormLabel, Grid, GridItem, HStack, Heading, Input, InputGroup, InputLeftElement, InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Skeleton, Spacer, Spinner, Text, VStack, useDisclosure, useToast } from "@chakra-ui/react";
import { Coordinate, Location, Meetup, Message, Profile, User } from "@/types";
import ItemInfo from "./ItemInfo";
import ScheduledMeetup from "./Schedule/ScheduledMeetup";
import ExpiryDetails from "@/components/Common/Item/ExpiryDetails";
import { AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay } from "@chakra-ui/react";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import * as Yup from 'yup';
import ChatDisplay from "./CheckIn/ChatDisplay";
import { createMessage } from "@/utils/services/buy";
import { useQueryClient } from "@tanstack/react-query";
import CancelMeetupDialog from "./CancelMeetupDialog";
import LiveMeetupCard from "./CheckIn/LiveMeetupCard";

type MeetupConfirmationProps = {
    user: User | null;
    meetup: Meetup | null;
    messages: Message[] | null;
    locations: Location[] | null;
    mapsAPIKey: string | null;
    otherUser: User | null;
    otherUserProfile: Profile | null;
    buyer: boolean;
    confirmed: boolean; // whether the meetup has been confirmed
    isMobile: boolean;
    development: boolean;
    handleCheckIn: () => Promise<{ success: boolean, error: string }>;
    openItemModal: () => void;
    openCheckInModal: () => void;
    openRescheduleModal: () => void;
    confirmBuy: () => void;
    cancelBuy: () => void;
    cancelMeetup: (cancelFee: number | null) => Promise<{ success: boolean, error: string }>;
    newCancelMeetup: (cancelReason: string | null) => Promise<{ success: boolean, error: string }>;
    unconfirmBuy: () => void;
    confirmSeller: () => void;
    handlePriceChange?: (newPrice: number) => Promise<void>;
};

export default function MeetupConfirmation({ user, meetup, locations, mapsAPIKey, buyer, openCheckInModal, openItemModal, confirmed, isMobile, otherUser, otherUserProfile, confirmBuy, cancelBuy, handlePriceChange, unconfirmBuy, confirmSeller, openRescheduleModal, messages, cancelMeetup, development, newCancelMeetup, handleCheckIn }: MeetupConfirmationProps) {
    const [itemPrice, setItemPrice] = React.useState<number>(0);
    const queryClient = useQueryClient();
    // buyer confirmation
    const { isOpen: isBuyerConfirmationOpen, onToggle: onBuyerConfirmationToggle, onClose: onBuyerConfirmationClose } = useDisclosure();
    const [isLoadingConfirm, setIsLoadingConfirm] = React.useState(false);
    const [isLoadingUnconfirm, setIsLoadingUnconfirm] = React.useState(false);
    const cancelRef = React.useRef(null);

    // for hold to confirm
    const [holdProgress, setHoldProgress] = React.useState(0);
    const [holdTimeout, setHoldTimeout] = React.useState<NodeJS.Timeout | null>(null);
    const [isHolding, setIsHolding] = React.useState(false);

    const [checkingIn, setCheckingIn] = React.useState(false);
    const toast = useToast();

    const handleMouseDown = () => {
        if (isLoadingConfirm || holdProgress === 50 || isHolding) return; // Prevent multiple intervals from being set
        if (!buyer && !meetup?.buyer_confirmed) return;

        setIsHolding(true);
        let progress = 0;

        // Clear any existing interval
        if (holdTimeout) {
            clearInterval(holdTimeout);
        }

        const intervalId = setInterval(() => {
            progress += 1; // Increment by 1% every 10ms (50 steps to 50%)
            setHoldProgress(progress);

            if (progress >= 50) {
                clearInterval(intervalId);
                setHoldTimeout(null); // Clear the timeout to avoid accidental re-triggering
                handleConfirm();
            }
        }, 50);

        setHoldTimeout(intervalId);
    };

    const handleMouseUp = () => {
        if (holdTimeout) {
            clearInterval(holdTimeout);
            setHoldTimeout(null);
        }
        setIsHolding(false);
        setHoldProgress(0);
    };

    const handleConfirm = async () => {
        try {
            if (buyer) {
                await handleBuyerConfirmation();
            } else {
                await handleSellerConfirm();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsHolding(false);
        }
    }

    const handleBuyerConfirmation = async () => {
        setIsLoadingConfirm(true);
        try {
            if (confirmBuy) {
                await confirmBuy();
            } else {
                throw new Error("confirmBuy function not provided");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingConfirm(false);
            onBuyerConfirmationClose();
        }
    }

    // const handleCancel = async () => {
    //     try {
    //         if (cancelBuy) {
    //             await cancelBuy();
    //         } else {
    //             throw new Error("cancelBuy function not provided");
    //         }
    //     } catch (error) {
    //         console.error(error);
    //     } finally {
    //         onBuyerConfirmationClose();
    //     }
    // }

    const handleUnconfirmBuy = async () => {
        setIsLoadingUnconfirm(true);
        try {
            if (!meetup) {
                throw new Error("Meetup not found");
            }
            if (unconfirmBuy && meetup.buyer_confirmed) {
                console.log("unconfirming buy");
                await unconfirmBuy();
            } else {
                throw new Error("unconfirmBuy function not provided");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingUnconfirm(false);
        }
    }

    // adjust price
    const { isOpen: isAdjustPriceOpen, onOpen: onAdjustPriceOpen, onClose: onAdjustPriceClose } = useDisclosure()
    const [priceComplete, setPriceComplete] = React.useState<boolean | null>(null);


    // seller confirmation
    const { isOpen: isSellerConfirmationOpen, onOpen: onSellerConfirmationOpen, onClose: onSellerConfirmationClose } = useDisclosure()
    const [isLoadingSellerConfirm, setIsLoadingSellerConfirm] = React.useState(false);

    const handleSellerConfirm = async () => {
        setIsLoadingSellerConfirm(true);
        try {
            if (confirmSeller) {
                await confirmSeller();
            } else {
                throw new Error("confirmSeller function not provided");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingSellerConfirm(false);
        }
    }

    const handleSendMessage = async (message: string): Promise<{ success: boolean, error: string }> => {
        try {
            if (!meetup) {
                throw new Error("Meetup not found");
            }
            if (!user) {
                throw new Error("User ID not found");
            }
            const { success, error } = await createMessage(meetup.id, user.id, message, null)
            if (!success) {
                throw new Error(error);
            } else {
                queryClient.invalidateQueries({
                    queryKey: ['messages', meetup.id]
                });
            }
        } catch (error: any) {
            return { success: false, error: error.message };
        } finally {
            return { success: true, error: "" };
        }
    }

    const checkInWrapper = async () => {
        setCheckingIn(true);
        try {
            const checkInPromise = handleCheckIn();
            toast.promise(checkInPromise, {
                success: {
                    title: `Checked in.`,
                    description: `You have successfully checked in.`,
                    duration: 5000,
                    isClosable: true,
                },
                error: {
                    title: 'Error checking in.',
                    description: 'An error occurred while checking in.',
                    duration: 5000,
                    isClosable: true,
                },
                loading: {
                    title: 'Checking in...',
                    description: 'Please wait while we check you in.',
                    duration: 5000,
                    isClosable: true,
                }
            })
            const { success, error } = await checkInPromise;
            if (!success) {
                throw new Error(error);
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error checking in.",
                description: "An error occurred while checking in.",
                status: "error",
                duration: 5000,
                isClosable: true
            })
        } finally {
            setCheckingIn(false);
        }
    }


    const handleShareLocation = async (latitude: number, longitude: number): Promise<{ success: boolean, error: string }> => {
        try {
            if (!meetup) {
                throw new Error("Meetup not found");
            }
            if (!user) {
                throw new Error("User ID not found");
            }

            const location: Coordinate = { latitude, longitude };
            const { success, error } = await createMessage(meetup.id, user.id, `${buyer ? "Buyer" : "Seller"} has shared their location.`, location)
            if (!success) {
                throw new Error(error);
            } else {
                queryClient.invalidateQueries({
                    queryKey: ['messages', meetup.id]
                });
            }


        } catch (error: any) {
            return { success: false, error: error.message };
        } finally {
            return { success: true, error: "" };
        }
    }

    const validatePrice = (value: string) => {
        let error;
        if (!value) {
            error = 'Price is required';
        } else if (!/^\d+(\.\d{1,2})?$/.test(value)) { // check if it is a valid price (no negative and only 2 decimal places)
            error = 'Must be a valid price';
        } else if (parseFloat(value) > itemPrice) {
            error = `Price must be lower than ${itemPrice}`;
        } else if (parseFloat(value) < 1) {
            error = 'Price must be at least $1';
        }
        return error;
    }

    const priceChange = async (newPrice: number) => {
        try {
            if (handlePriceChange) {
                await handlePriceChange(newPrice);
            } else {
                throw new Error("handlePriceChange function not provided");
            }
        } catch (error) {
            console.error(error);
        }
    }

    const adjustPriceValidationSchema = Yup.object().shape({
        price: Yup.number()
            .typeError('Price must be a number')
            .min(1, 'Price must be at least $1')
            .max(itemPrice, `Price must be lower than ${itemPrice}`)
            .test('Must be a valid price', 'Must be a valid price', function (value) {
                if (value === undefined) return true;
                return /^\d+(\.\d{1,2})?$/.test(String(value));
            })
            .test('price-discount-validation', 'Either price or discount is required', function (value) {
                return value || this.parent.discount; // Returns true if either price or discount is true
            }),
        discount: Yup.number()
            .typeError('Discount must be a number')
            .min(1, 'Discount must be at least 1%')
            .test('Discount cannot result in price less than $1', 'Discount cannot result in price less than $1', function (value) {
                return itemPrice * (1 - (value === undefined ? 1 : value) / 100) >= 1;
            })
            .test('price-discount-validation', 'Either price or discount is required', function (value) {
                return value || this.parent.price; // Returns true if either price or discount is true
            })
    })

    const handleNewPrice = async (values: { price: string, discount: string }, actions: FormikHelpers<{ price: string, discount: string }>) => {
        if (values.price) {
            await priceChange(parseFloat(values.price));
        } else if (values.discount) {
            await priceChange(itemPrice * (1 - parseFloat(values.discount) / 100));
        }
        actions.setSubmitting(false);
        onAdjustPriceClose();
    }

    const renderHeading = (meetup: Meetup) => {
        if (meetup.schedule_enabled) {
            if (!meetup.buyer_met && !meetup.seller_met) {
                if (confirmed) {
                    if (buyer) {
                        return "Good news!"
                    } else {
                        return "Thank you for confirming the meetup!"
                    }
                } else {
                    if (buyer) {
                        return "Thank you for your purchase!"
                    } else {
                        return "A buyer wants to check out your item."
                    }
                }
            } else if (meetup.buyer_met && meetup.seller_met) { // verify screen
                return "Check-in complete."
            } else {
                return "Check-in Status"
            }
        } else {
            if (!meetup.buyer_met && !meetup.seller_met) {
                if (buyer) {
                    return "Thank you for your purchase!"
                } else {
                    return "Good news! The buyer has completed the payemnt."
                }
            } else if (meetup.buyer_met && meetup.seller_met) { // verify screen
                if (!meetup.buyer_confirmed && !meetup.seller_confirmed) {
                    return "Check-in complete."
                } else if (meetup.buyer_confirmed && !meetup.seller_confirmed) {
                    return buyer ? "Wait for the seller to confirm the purchase." : "Confirm the purchase to complete the transaction."
                } else if (!meetup.buyer_confirmed && meetup.seller_confirmed) {
                    return buyer ? "Confirm the purchase to complete the transaction." : "Wait for the buyer to confirm the purchase."
                } else {
                    return "Got it!"
                }
            } else {
                return "Check-in Status"
            }
        }
    }

    const renderDescription = (meetup: Meetup) => {
        if (confirmed) {
            if (meetup.buyer_met === false && meetup.seller_met === false) {
                if (!meetup.schedule_enabled) {
                    return buyer ? "As a next step, contact and plan to meet the seller using the details available." : "As a next step, please plan to meet the buyer using the details available. Once you arrive at the meetup location, press the 'Check In' button on the screen.";
                } else {
                    return buyer ? "The seller has confirmed a time and place to meet up. As a next step, plan to meet the seller at the specified time window and place." : "You have confirmed a time and place to meet up. As a next step, please prepare to meet at the agreed time and location to finalize the transaction.";
                }
            } else if (meetup.buyer_met === true && meetup.seller_met === false) {
                return buyer ? `You have checked in at ${meetup.buyer_met_at ? new Date(meetup.buyer_met_at).toLocaleString() : ""} and we let the seller know.` : `The buyer has arrived at ${meetup.buyer_met_at ? new Date(meetup.buyer_met_at).toLocaleString() : ""}. View their notes and check in once you have met.`;
            } else if (meetup.buyer_met === false && meetup.seller_met === true) {
                return buyer ? `The seller has checked in at ${meetup.seller_met_at ? new Date(meetup.seller_met_at).toLocaleString() : ""}. View their notes and check in once you have met.` : `You have checked in at ${meetup.seller_met_at ? new Date(meetup.seller_met_at).toLocaleString() : ""} and we let the buyer know.`;
            } else if (meetup.buyer_met === true && meetup.seller_met === true) {
                if (buyer) {
                    if (!meetup.buyer_confirmed && !meetup.seller_confirmed) {
                        return "Examine the item. If you're satisfied with it, click the 'Confirm Buy' button. If you're not satisfied, click the 'Cancel Buy' button to cancel the purchase or talk to the seller to negotiate a lower price."
                    } else if (meetup.buyer_confirmed && !meetup.seller_confirmed) {
                        return "You have confirmed the purchase. Wait for the seller to confirm the purchase."
                    } else if (!meetup.buyer_confirmed && meetup.seller_confirmed) {
                        return "The seller has confirmed the purchase. Confirm the purchase to complete the transaction."
                    } else {
                        return "We have gotten verification from both parties. Wait while we sent payment to the seller."
                    }
                } else {
                    if (!meetup.buyer_confirmed && !meetup.seller_confirmed) {
                        return "Please hand over the item to the buyer so they can verify it. If the buyer requests a price change, you can adjust it by pressing the 'Adjust Price' button."
                    } else if (meetup.buyer_confirmed && !meetup.seller_confirmed) {
                        return "The buyer has confirmed the purchase. Confirm the purchase to complete the transaction."
                    } else if (!meetup.buyer_confirmed && meetup.seller_confirmed) {
                        return "You have confirmed the purchase. Wait for the buyer to confirm the purchase."
                    } else {
                        return "We have gotten verification from both parties. Wait while we sent payment to you."
                    }
                }
            } else {
                return buyer ? `You have checked in at ${meetup.buyer_met_at ? new Date(meetup.buyer_met_at).toLocaleString() : ""}. The seller has checked in at ${meetup.seller_met_at ? new Date(meetup.seller_met_at).toLocaleString() : ""}.` : `The buyer has checked in at ${meetup?.buyer_met_at ? new Date(meetup.buyer_met_at).toLocaleString() : ""}. You have checked in at ${meetup?.seller_met_at ? new Date(meetup.seller_met_at).toLocaleString() : ""}.`;
            }
        } else if (meetup.buyer_met === true && meetup.seller_met === true) { // verify screen
            if (buyer) {
                return "Examine the item. If you're satisfied with it, click the 'Confirm Buy' button. If you're not satisfied, click the 'Cancel Buy' button to cancel the purchase or talk to the seller to negotiate a lower price."
            } else {
                return `Give the item to the buyer so they can look at the product. The buyer may request to lower the price if they are not satisfied with the quality. You can lower the price here if they refuse to buy otherwise.`
            }
        } else {
            if (buyer) {
                return "You will be notified after the seller picks a time slot. If the seller doesn't select a time slot within 24 hours of your purchase, the transaction will be canceled, and the hold on your card will be released."
            } else {
                return `The buyer has selected ${meetup.potential_meetups.length} slots for meeting up. You need to select one of these within 24 hours of purchasing, to give the buyer enough time. If no slots are selected within the allotted time, the item will be canceled.`
            }
        }
    }

    const renderUnconfirmedMeetup = () => {
        return mapsAPIKey && locations && <ScheduledMeetup user={user} meetup={meetup} view={buyer} confirmed={confirmed} locations={locations} mapsAPIKey={mapsAPIKey} development={development} />
    }

    const renderContentCard = (meetup: Meetup) => {
        return (
            !meetup.buyer_met || !meetup.seller_met) && mapsAPIKey && locations && (
                <VStack align={"left"} height={"100%"}>
                    <LiveMeetupCard
                        meetup={meetup}
                        buyerLocation={(meetup.buyer_location as Coordinate | null) ?? undefined}
                        sellerLocation={(meetup.seller_location as Coordinate | null) ?? undefined}
                        googleMapsAPIKey={mapsAPIKey}
                        location={locations.find((loc) => loc.id === meetup.location) ?? undefined}
                        buyer={buyer}
                    />
                </VStack>
            )
    }

    const renderActionButton = (meetup: Meetup, buyer: boolean) => {
        if (meetup.buyer_met === true && meetup.seller_met === true) {
            if (buyer) {
                return (
                    <VStack align={"left"}>
                        <Button colorScheme="green" onClick={onBuyerConfirmationToggle} isLoading={meetup.buyer_confirmed} loadingText={"Waiting for seller"}>Confirm Buy</Button>
                    </VStack>
                )
            } else {
                return (
                    <VStack align={"left"}>
                        <Button colorScheme="green" onClick={onSellerConfirmationOpen} isLoading={!meetup.buyer_confirmed} loadingText={"Waiting for buyer"}>Confirm Sale</Button>
                    </VStack>
                )
            }
        } else if (meetup.status === "meeting") {
            return (
                // <Button colorScheme={(buyer ? meetup.buyer_met : meetup.seller_met) ? "green" : "blue"} onClick={openCheckInModal} loadingText={"Checking You In"} leftIcon={<CheckIcon />} isDisabled={(buyer ? meetup.buyer_met : meetup.seller_met)}>{(buyer ? meetup.buyer_met : meetup.seller_met) ? "Checked In" : "Check In"}</Button>
                <Button colorScheme={(buyer ? meetup.buyer_met : meetup.seller_met) ? "green" : "blue"} onClick={checkInWrapper} leftIcon={<CheckIcon />} isDisabled={(buyer ? meetup.buyer_met : meetup.seller_met)} isLoading={checkingIn}>{(buyer ? meetup.buyer_met : meetup.seller_met) ? "Checked In" : "Check In"}</Button>

            )
        } else {
            return null
        }
    }

    const renderSecondaryActionButton = (meetup: Meetup, buyer: boolean, location?: Location) => {
        const time = meetup.time ?? new Date().toISOString();
        let endDate = new Date(time);
        endDate.setMinutes(endDate.getMinutes() + 30)

        if (meetup.buyer_met && meetup.seller_met) {
            return (
                <HStack>
                    <Button colorScheme="blue" onClick={openItemModal}>Meetup Status</Button>
                    {buyer && (!meetup.buyer_confirmed ? <CancelMeetupDialog meetup={meetup} handleCancel={cancelMeetup} handleNewCancel={newCancelMeetup} /> : <Button colorScheme="blue" onClick={() => handleUnconfirmBuy()} isLoading={isLoadingUnconfirm}>Unconfirm Buy</Button>)}
                </HStack>
            )
        } else {
            return (
                <HStack>
                    <Button colorScheme="blue" onClick={openItemModal}>Meetup Status</Button>
                    <CancelMeetupDialog meetup={meetup} handleCancel={cancelMeetup} handleNewCancel={newCancelMeetup} />
                </HStack>
            )
        }
    }

    const renderMainView = (meetup: Meetup) => {
        const calculatedFontWeight = Math.min(400 + (holdProgress / 50) * 400, 800);
        const isCompleted = (buyer ? meetup.buyer_confirmed : meetup.seller_confirmed);

        if (!meetup.buyer_met || !meetup.seller_met) {
            return meetup && mapsAPIKey && <ChatDisplay meetup={meetup} buyer={buyer} mapsAPIKey={mapsAPIKey} handleSendMessage={handleSendMessage} handleShareLocation={handleShareLocation} messages={messages ?? []} />
        } else {
            return <VStack height={"100%"}>
                <Spacer />
                <Heading>Confirm Purchase</Heading>
                <CircularProgress value={(isCompleted ? 50 : holdProgress) + (buyer ? (meetup.seller_confirmed ? 50 : 0) : (meetup.buyer_confirmed ? 50 : 0))} color="green.300" size={"2xs"} onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchEnd={handleMouseUp}
                    cursor={isLoadingConfirm || isCompleted ? "not-allowed" : "pointer"}
                    display="inline-block"
                    userSelect="none"
                >
                    <CircularProgressLabel fontSize="2xl">
                        {(isLoadingConfirm || isLoadingUnconfirm) ? (
                            <Spinner size="md" />
                        ) : isCompleted ? (
                            <CheckIcon color="green.500" />
                        ) : (
                            <Text opacity={(buyer || meetup.buyer_confirmed) ? "1" : "0.5"} fontWeight={calculatedFontWeight}>
                                Hold
                            </Text>
                        )}
                    </CircularProgressLabel>
                </CircularProgress>
                <Text opacity={0.5} fontSize="sm">Hold above or click below to confirm</Text>
                <Spacer />
            </VStack>
        }
    }

    const renderMeetup = (meetup: Meetup | null, locations: Location[] | null, confirmed: boolean) => {
        const location = locations?.find((loc) => loc.id === meetup?.location) ?? undefined // will be undefined if location is not found, in the case of quick meetup
        return (
            <VStack align={"left"} height={"100%"}>
                {isMobile ?
                    <>
                        <HStack>
                            <Skeleton isLoaded={!!meetup}>
                                <Text fontSize={"2xl"} fontWeight={500}>Meetup Details</Text>
                            </Skeleton>
                            <Spacer />
                            {meetup ? renderSecondaryActionButton(meetup, buyer, location) : <Skeleton><Button>Loading</Button></Skeleton>}
                        </HStack>
                        <Skeleton height="50px" isLoaded={!!meetup}>
                            <ExpiryDetails expiryDate={meetup?.expires_at ?? ""} />
                        </Skeleton>
                    </>
                    : <HStack>
                        <Skeleton isLoaded={!!meetup}>
                            <Text fontSize={"2xl"} fontWeight={500}>Meetup Details</Text>
                        </Skeleton>
                        <Center height='50px'>
                            <Divider orientation='vertical' borderColor={"#ceb888"} />
                        </Center>
                        <Skeleton isLoaded={!!meetup}>
                            <ExpiryDetails expiryDate={meetup?.expires_at ?? ""} />
                        </Skeleton>
                        <Spacer />
                        {meetup ? renderSecondaryActionButton(meetup, buyer, location) : <Skeleton><Button>Loading</Button></Skeleton>}
                    </HStack>
                }
                <Divider borderWidth={2} borderColor={"black"} />
                {meetup && locations ?
                    <>
                        {confirmed ? <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                            <GridItem colSpan={isMobile && !(meetup.buyer_met && meetup.seller_met) ? 2 : 1}>
                                {renderContentCard(meetup)}
                            </GridItem>
                            <GridItem colSpan={(isMobile || (meetup.buyer_met && meetup.seller_met) ? 2 : 1)}>
                                <VStack align={"left"} height={"100%"}>
                                    {renderMainView(meetup)}
                                </VStack>
                            </GridItem>
                        </Grid> :
                            renderUnconfirmedMeetup()}
                        {renderActionButton(meetup, buyer)}
                    </> : <Skeleton height={isMobile ? "300px" : "100%"} />}
            </VStack >
        )
    }

    useEffect(() => {
        if (meetup) {
            setItemPrice(meetup.item_price)
        }
    }, [meetup])

    return (
        <>
            <ItemInfo
                heading={meetup ? renderHeading(meetup) : null}
                description={meetup ? renderDescription(meetup) : null}
                actionContent={renderMeetup(meetup, locations, confirmed)}
                onAdjustPriceOpen={onAdjustPriceOpen}
                meetup={meetup}
                isMobile={isMobile}
                buyer={buyer}
            />

            {/* Buyer confirmation */}
            <AlertDialog
                isOpen={isBuyerConfirmationOpen}
                leastDestructiveRef={cancelRef}
                onClose={onBuyerConfirmationClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Confirm Purchase
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to confirm the purchase?
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <HStack>
                                <Button ref={cancelRef} onClick={onBuyerConfirmationClose}>
                                    Cancel
                                </Button>
                                <Button colorScheme={"green"} onClick={() => handleBuyerConfirmation()} isLoading={isLoadingConfirm}>Confirm</Button>
                            </HStack>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            {/* Adjust Price */}
            <Modal
                isCentered
                onClose={onAdjustPriceClose}
                isOpen={isAdjustPriceOpen && !meetup?.buyer_confirmed}
                motionPreset='slideInRight'
            >
                <ModalOverlay />
                <ModalContent>
                    <Formik
                        initialValues={{ price: '', discount: '' }}
                        onSubmit={handleNewPrice}
                        validationSchema={adjustPriceValidationSchema}
                    >
                        {(props) => (
                            <Form>
                                <ModalHeader>Adjust Price</ModalHeader>
                                <ModalCloseButton />
                                <ModalBody>
                                    <Field name='price'>
                                        {({ field, form }: any) => (
                                            <FormControl isInvalid={form.errors.price && form.touched.price}>
                                                <FormLabel>New Price</FormLabel>
                                                <InputGroup>
                                                    <InputLeftElement pointerEvents='none' color='gray.300' fontSize='1.2em'>
                                                        $
                                                    </InputLeftElement>
                                                    <Input
                                                        {...field}
                                                        placeholder={meetup?.meetup_price.toFixed(2)}
                                                        type='number'
                                                        value={field.value}
                                                        onChange={e => {
                                                            form.setFieldValue(field.name, e.target.value);
                                                            if (validatePrice(e.target.value) === undefined) {
                                                                setPriceComplete(true);
                                                            } else if (e.target.value === '') {
                                                                setPriceComplete(null);
                                                            } else {
                                                                setPriceComplete(false);
                                                            }
                                                        }} />
                                                    {priceComplete === true ? (
                                                        <InputRightElement>
                                                            <CheckIcon color='green.500' />
                                                        </InputRightElement>
                                                    ) : priceComplete === false ? (
                                                        <InputRightElement>
                                                            <CloseIcon color='red.500' />
                                                        </InputRightElement>
                                                    ) : null}
                                                </InputGroup>
                                                {priceComplete === null ? <FormHelperText>Enter a price less than or equal to ${itemPrice.toFixed(2)}</FormHelperText> : <FormErrorMessage>{form.errors.price}</FormErrorMessage>}
                                            </FormControl>
                                        )}
                                    </Field>

                                </ModalBody>

                                <ModalFooter>
                                    <Button mr={3} onClick={onAdjustPriceClose}>
                                        Close
                                    </Button>
                                    <Button
                                        colorScheme='blue'
                                        isLoading={props.isSubmitting}
                                        type='submit'
                                    >
                                        Save
                                    </Button>
                                </ModalFooter>
                            </Form>
                        )}
                    </Formik>
                </ModalContent>
            </Modal>

            {/* Seller Confirmation */}
            <AlertDialog isOpen={isSellerConfirmationOpen} leastDestructiveRef={cancelRef} onClose={onSellerConfirmationClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Confirm Payment
                        </AlertDialogHeader>
                        <AlertDialogBody>{`Are you sure you want to accept payment for $${meetup?.meetup_price}?`}</AlertDialogBody>
                        <AlertDialogFooter>
                            <HStack>
                                <Button ref={cancelRef} onClick={onSellerConfirmationClose}>Cancel</Button>
                                <Button
                                    colorScheme={"green"}
                                    onClick={handleSellerConfirm}
                                    isLoading={isLoadingSellerConfirm}
                                >
                                    {`Confirm`}
                                </Button>
                            </HStack>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
}