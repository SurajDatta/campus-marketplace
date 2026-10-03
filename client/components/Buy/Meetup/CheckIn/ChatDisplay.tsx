/**
 * ChatDisplay.tsx
 * Screen that will be added to the MeetupDetailsModal component to show the latest status of the check in.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import { Coordinate, Meetup, Message } from "@/types"
import { Stepper, Step, StepIndicator, StepIcon, StepNumber, StepTitle, StepDescription, StepSeparator, StepStatus, useBreakpointValue, VStack, Icon, Box, Text, HStack, Link, Input, IconButton, Spacer, useToast, Center, Stack } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react"
import { ArrowUpIcon, ChatIcon, ExternalLinkIcon, RepeatIcon } from "@chakra-ui/icons";
import AnimatedIcon from "@/components/Common/Other/AnimatedIcon";
import { FaLocationArrow } from "react-icons/fa";
import * as NextLink from 'next/link';
import { generateMapLink } from "@/utils/generateMapLink";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, AspectRatio, Spinner, useDisclosure } from "@chakra-ui/react";
import { calculateDistance, determineZoomLevel } from "@/utils/location";
import LocationSharingGuide from "./LocationSharingGuide";

type ChatDisplayProps = {
    meetup: Meetup;
    messages: Message[];
    handleSendMessage: (message: string) => Promise<{ success: boolean, error: string }>;
    handleShareLocation: (latitdue: number, longitude: number) => Promise<{ success: boolean, error: string }>;
    mapsAPIKey: string;
    buyer: boolean;
}

export default function ChatDisplay({ meetup, messages, buyer, handleSendMessage, handleShareLocation, mapsAPIKey }: ChatDisplayProps) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [sendingMessage, setSendingMessage] = React.useState<boolean>(false)
    const [message, setMessage] = React.useState<string>()
    const scrollableDivRef = useRef<HTMLDivElement>(null);

    const [sharingLoading, setSharingLoading] = React.useState<boolean>(false)
    const [location, setLocation] = React.useState<Coordinate | null>(buyer ? meetup.buyer_location as Coordinate | null : meetup.seller_location as Coordinate | null)

    const toast = useToast()

    const sendMessage = async () => {
        setSendingMessage(true)
        try {
            if (!message || message.length === 0) {
                throw new Error("Message cannot be empty.")
            }
            const sendMessagePromise = handleSendMessage(message);
            toast.promise(sendMessagePromise, {
                success: {
                    title: `Message Sent.`,
                    description: `Your message has been sent.`,
                    duration: 5000,
                    isClosable: true,
                },
                error: {
                    title: 'Error sending message',
                    description: 'An error occurred while sending your message.',
                    duration: 5000,
                    isClosable: true,
                },
                loading: {
                    title: 'Sending message...',
                    description: 'Please wait while we send your message.',
                    duration: 5000,
                    isClosable: true,
                }
            })
            const { success, error } = await sendMessagePromise;
            if (!success) {
                throw new Error(error);
            } else {
                setMessage(undefined)
            }
        } catch (error: any) {
            toast({
                title: "Error sending message",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true
            })
        } finally {
            setSendingMessage(false)
        }
    }

    const shareLocation = async () => {
        setSharingLoading(true)
        try {
            if (!location) {
                throw new Error("Please share your location first.")
            }
            const shareLocationPromise = handleShareLocation(location.latitude, location.longitude);
            toast.promise(shareLocationPromise, {
                success: {
                    title: `Location Shared.`,
                    description: `Your location has been shared.`,
                    duration: 5000,
                    isClosable: true,
                },
                error: {
                    title: 'Error sharing location',
                    description: 'An error occurred while sharing your location.',
                    duration: 5000,
                    isClosable: true,
                },
                loading: {
                    title: 'Sharing location...',
                    description: 'Please wait while we share your location.',
                    duration: 5000,
                    isClosable: true,
                }
            })
            const { success, error } = await shareLocationPromise;
            if (!success) {
                throw new Error(error);
            } else {
                setLocation(null)
            }
        } catch (error: any) {
            toast({
                title: "Error sharing location",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true
            })
        } finally {
            setSharingLoading(false)
            onClose()
        }
    }

    const findLocation = () => {
        onOpen();
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
    }

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


    const renderMessages = () => {
        return messages.map((message, index) => {
            const isSelfMessage = message.sender_id === (buyer ? meetup.buyer_id : meetup.seller_id)
            const content = message.message
            const location = message.location as Coordinate | null

            return (
                <Stack direction={isSelfMessage ? "row-reverse" : "row"} align={"center"} p={2}>
                    <HStack
                        key={index}
                        alignSelf={isSelfMessage ? "flex-end" : "flex-start"}
                        bg={isSelfMessage ? "blue.300" : "gray.300"}
                        p={2}
                        borderRadius="2xl"
                        maxWidth="70%"
                    >
                        <Text fontSize="sm">{content}{location ? <Link href={generateMapLink({ latitude: location.latitude, longitude: location.longitude })} isExternal color='teal.500' as={NextLink.default} passHref>
                            <HStack>
                                <Text>(Directions)</Text>
                                <ExternalLinkIcon />
                            </HStack>
                        </Link> : ""}
                        </Text>
                    </HStack>
                    <Text fontSize="xs" opacity={0.5}>
                        {new Date(message.created_at).toLocaleString()}
                    </Text>
                </Stack>
            );
        });
    };


    // Scroll to the bottom whenever messages chang

    useEffect(() => {
        if (scrollableDivRef.current) {
          scrollableDivRef.current.scrollTop = scrollableDivRef.current.scrollHeight;
        }
      }, [messages]);

    return (
        <>
            <VStack height={"100%"} borderWidth="1px" borderRadius="lg" p={4} align={"left"}>
                <Text fontSize={"xl"}>Chat</Text>

                <Box
                    ref={scrollableDivRef}
                    overflowY="auto"
                    height="250px"
                    bg="gray.100"
                    borderRadius="lg"
                    id="scrollable"
                >
                    <VStack
                        key={messages.map((message) => message.id).join(" | ")}
                        align="left"
                        spacing={4}
                    >
                        {renderMessages()}
                    </VStack>
                </Box>

                <Spacer />
                <HStack>
                    <Input key={sendingMessage + "message"} variant='outline' placeholder='Send Message' value={message} onChange={(e) => {
                        setMessage(e.target.value)
                    }} isInvalid={!!message && (message.length === 0)} />
                    <IconButton aria-label='Send Message' colorScheme="blue" icon={<ArrowUpIcon />} onClick={sendMessage} isLoading={sendingMessage} />
                </HStack>
                <Button onClick={findLocation} colorScheme="blue" leftIcon={<FaLocationArrow />}>Send Location</Button>
            </VStack>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent maxWidth="600px">
                    <ModalHeader>
                        <Text>Share Location</Text>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack align={"left"}>
                            <Text fontSize={"lg"}>Are you sure you want to share the following location?</Text>
                            {location ? <AspectRatio ratio={16 / 9} width="100%" maxH="100%">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={`https://www.google.com/maps/embed/v1/directions?key=${mapsAPIKey}&origin=${renderLocationString(location)}&destination=${renderLocationString(location)}&mode=walking&zoom=${findZoomLevel(location)}&center=${renderLocationString(location)}`}>
                                </iframe>
                            </AspectRatio> :
                                <Center w={"100%"} h={"100%"} bg="gray.100" borderRadius={"lg"}>
                                    <VStack spacing={4} p={6}>
                                        <Text textAlign="center" fontSize="xl" color="gray.500">
                                            {"Trying to find your location. If nothing happens after 10 seconds, look at the guide below."}
                                        </Text>
                                        <Spinner size={"lg"} />
                                        <LocationSharingGuide />
                                    </VStack>
                                </Center>}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='gray' mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button
                            onClick={shareLocation} colorScheme="blue" isLoading={sharingLoading} isDisabled={location == null}
                        >
                            Share Location
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}