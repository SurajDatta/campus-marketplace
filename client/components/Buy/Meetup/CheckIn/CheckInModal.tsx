/**
 * CheckInModal.tsx
 * Modal that allow users to check in. It will show the latest check in details as well. 
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React, { useEffect } from 'react'
import {
    Text, HStack, VStack, Modal, ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Center,
    Textarea,
    AspectRatio,
    Spinner,
    useToast,
} from '@chakra-ui/react'
import { Coordinate, Meetup } from '@/types';
import { calculateDistance, determineZoomLevel } from '@/utils/location';

type CheckInModalProps = {
    meetup: Meetup | null;
    buyer: boolean;
    isOpen: boolean;
    onClose: () => void;
    onCheckIn: (buyer: boolean, meetupId: string, notes: string, checkedIn: boolean) => void;
    isCheckingIn: boolean;
    mapsApiKey: string;
}

export default function CheckInModal({ meetup, buyer, isOpen, onClose, onCheckIn, isCheckingIn, mapsApiKey }: CheckInModalProps) {
    const [showCheckIn, setShowCheckIn] = React.useState<boolean>(meetup ? !!(buyer ? meetup.buyer_notes : meetup.seller_notes) : false);
    const [notes, setNotes] = React.useState<string>(meetup ? (buyer ? meetup.buyer_notes : meetup.seller_notes) ?? "" : "");
    const [findingLocation, setFindingLocation] = React.useState<boolean>(false)
    const [location, setLocation] = React.useState<Coordinate | null>(meetup ? (buyer ? meetup.buyer_location as Coordinate | null : meetup.seller_location as Coordinate | null) : null)
    const toast = useToast();

    const renderLocationString = (location: Coordinate) => {
        return location.latitude + ", " + location.longitude;
    }

    const findZoomLevel = (location: Coordinate): number => {
        const distance = calculateDistance(
            location.latitude,
            location.longitude,
            location.latitude,
            location.longitude
        );
        return determineZoomLevel(distance);
    }


    useEffect(() => {
        if (showCheckIn) {
            setFindingLocation(true);
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
                }, (error) => {
                    if (error.code === error.PERMISSION_DENIED) {
                        toast({
                            title: "Error finding location",
                            description: "User denied the request for Geolocation.",
                            status: "error",
                            duration: 5000,
                            isClosable: true
                        })
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        toast({
                            title: "Error finding location",
                            description: "Location information is unavailable.",
                            status: "error",
                            duration: 5000,
                            isClosable: true
                        })
                    } else if (error.code === error.TIMEOUT) {
                        toast({
                            title: "Error finding location",
                            description: "The request to get user location timed out.",
                            status: "error",
                            duration: 5000,
                            isClosable: true
                        })
                    }
                });
            } else {
                alert("Geolocation is not supported by this browser.");
            }
            setFindingLocation(false);
        }
    }, [showCheckIn])

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Text>Check In</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack align={"left"}>
                        {(showCheckIn) ?
                            <VStack align={"left"}>
                                {location ?
                                    <>
                                        <Text fontSize={"lg"}>Are you sure you want to share the following location?</Text>
                                        <AspectRatio ratio={16 / 9} width="100%" maxH="100%">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                src={`https://www.google.com/maps/embed/v1/directions?key=${mapsApiKey}&origin=${renderLocationString(location)}&destination=${renderLocationString(location)}&mode=walking&zoom=${findZoomLevel(location)}&center=${renderLocationString(location)}`}>
                                            </iframe>
                                        </AspectRatio>
                                    </> : findingLocation ?
                                        <Center w={"100%"} h={"100%"} bg="gray.100" borderRadius={"lg"}>
                                            <Spinner size={"lg"} />
                                        </Center> :
                                        <>
                                            <Text>{`Use distinct landmarks or unique details to help the ${buyer ? "seller" : "buyer"} find you. For example, "I'm in the back corner of Krach 1st floor, carrying a blue backpack."`}</Text>
                                            <Textarea
                                                placeholder={`Enter notes to help the ${buyer ? "seller" : "buyer"} find you`}
                                                value={notes ?? ""}
                                                onChange={(e) => setNotes(e.target.value)}
                                            />
                                        </>}
                            </VStack> : <Text>{`Are you sure you're at the meetup location and ready to check in?`}</Text>}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    {(showCheckIn) ?
                        <>
                            <Button colorScheme='gray' mr={3} onClick={onClose}>
                                Close
                            </Button>
                            <Button
                                onClick={() => {
                                    if (meetup) {
                                        onCheckIn(buyer, meetup.id, notes, (buyer ? meetup.buyer_met : meetup.seller_met))
                                    }

                                }} colorScheme="blue" isLoading={isCheckingIn} isDisabled={!notes && !location}
                            >
                                {(buyer ? meetup?.buyer_met : meetup?.seller_met) ? "Update Check In" : "Check In"}
                            </Button>
                        </> :
                        <HStack>
                            <Button onClick={onClose}>
                                No
                            </Button>
                            <Button colorScheme={"blue"} onClick={() => {
                                // setShowCheckIn(true);
                                if (meetup) {
                                    onCheckIn(buyer, meetup.id, notes, (buyer ? meetup.buyer_met : meetup.seller_met))
                                }
                            }} isLoading={isCheckingIn}>Yes</Button>
                        </HStack>}
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}