import React from "react";
import { Coordinate, Item, Location, Meetup } from "@/types";
import { AspectRatio, Box, Button, ButtonGroup, Center, HStack, Icon, Link, Spacer, Text, VStack } from "@chakra-ui/react";
import { FaApple, FaGoogle, FaLightbulb, FaLocationArrow } from "react-icons/fa";
import { calculateDistance, determineZoomLevel } from "@/utils/location";
import AnimatedIcon from "@/components/Common/Other/AnimatedIcon";
import { CalendarIcon, ExternalLinkIcon, TimeIcon } from "@chakra-ui/icons";
import { generateMapLink } from "@/utils/generateMapLink";
import * as NextLink from 'next/link';
import AddToCalendar from "./AddToCalendar";

type LiveMeetupCardProps = {
    meetup: Meetup;
    buyerLocation?: Coordinate;
    sellerLocation?: Coordinate;
    location?: Location;
    googleMapsAPIKey: string;
    buyer: boolean;
};

type MapShown = "buyer" | "seller" | "location"

export default function LiveMeetupCard({ meetup, buyerLocation, sellerLocation, location, googleMapsAPIKey, buyer }: LiveMeetupCardProps) {
    const [mapShown, setMapShown] = React.useState<MapShown>(location ? "location" : buyer ? "buyer" : "seller");
    const time = meetup.time ?? new Date().toISOString();
    const startDate = new Date(time);
    let endDate = new Date(time);
    endDate.setMinutes(endDate.getMinutes() + 30)

    const showDate = (selectedTime: string | undefined) => {
        const formattedDate = new Date(selectedTime ?? "").toLocaleDateString('en-US', {
            weekday: 'long', // "Monday"
            year: 'numeric', // "2024"
            month: 'long',   // "August"
            day: 'numeric'   // "20"
        });

        const formattedTime = new Date(selectedTime ?? "").toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });

        return `${formattedDate} at ${formattedTime}`;
    }

    let title = location ? location.name : "None";
    if (buyerLocation && !sellerLocation) {
        title = buyer ? "You" : "Buyer";
    } else if (sellerLocation && !buyerLocation) {
        title = !buyer ? "You" : "Seller";
    } else if (buyerLocation && sellerLocation) {
        title = "Both Parties";
    }

    const renderLocation = (mapShown: MapShown) => {
        if (mapShown === "buyer") {
            if (buyerLocation) {
                const loc = `${buyerLocation.latitude},${buyerLocation.longitude}`
                return (
                    <iframe
                        width="100%"
                        height="100%"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/directions?key=${googleMapsAPIKey}&origin=${loc}&destination=${loc}&mode=walking&zoom=16`}>
                    </iframe>
                );
            } else {
                return (
                    <Center w={"100%"} h={"100%"} bg="gray.100" borderRadius={"lg"}>
                        <Text textAlign="center" fontSize="xl" color="gray.500">
                            {buyer ? "Share your location to see the preview here." : "Buyer's location not shared."}
                        </Text>
                    </Center>
                )
            }
        } else if (mapShown === "seller") {
            if (sellerLocation) {
                const loc = `${sellerLocation.latitude},${sellerLocation.longitude}`
                return (
                    <iframe
                        width="100%"
                        height="100%"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/directions?key=${googleMapsAPIKey}&origin=${loc}&destination=${loc}&mode=walking&zoom=16`}>
                    </iframe>
                );
            } else {
                return (
                    <Center w={"100%"} h={"100%"} bg="gray.100" borderRadius={"lg"}>
                        <Text textAlign="center" fontSize="xl" color="gray.500">
                            {!buyer ? "Share your location to see the preview here." : "Seller's location not shared."}
                        </Text>
                    </Center>
                )
            }
        } else if (mapShown === "location" && location) {
            const loc = `${location.latitude},${location.longitude}`
            return (
                <iframe
                    width="100%"
                    height="100%"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/directions?key=${googleMapsAPIKey}&origin=${loc}&destination=${loc}&mode=walking&zoom=16`}>
                </iframe>
            );
        } else {
            return (
                <Center w={"100%"} h={"100%"} bg="gray.100" borderRadius={"lg"}>
                    <Text textAlign="center" fontSize="xl" color="gray.500">
                        {"No location shared."}
                    </Text>
                </Center>
            );
        }

    }

    return (
        <VStack borderWidth="1px" borderRadius="lg" p={4} height={"100%"} align={"left"}>
            <Text fontSize="xl">Location</Text>
            {/* <ButtonGroup>
                {location && <Button colorScheme={mapShown === "location" ? "blue" : "gray"} size={"sm"} onClick={() => {
                    setMapShown("location");
                }}>Meetup</Button>}
                <Button colorScheme={
                    buyer ? (mapShown === "buyer" ? "blue" : "gray") : (mapShown === "seller" ? "blue" : "gray")
                } size={"sm"} onClick={() => {
                    if (buyer) {
                        setMapShown("buyer");
                    } else {
                        setMapShown("seller");
                    }
                }}>You</Button>
                <Button colorScheme={
                    buyer ? (mapShown === "seller" ? "blue" : "gray") : (mapShown === "buyer" ? "blue" : "gray")
                } size={"sm"} onClick={() => {
                    if (buyer) {
                        setMapShown("seller");
                    } else {
                        setMapShown("buyer");
                    }
                }}>{buyer ? "Seller" : "Buyer"}</Button>
            </ButtonGroup> */}
            <Spacer />
            <AspectRatio ratio={16 / 9} width="100%" maxH="100%">
                {renderLocation(mapShown)}
            </AspectRatio>
            {meetup.schedule_enabled && location &&
                <VStack align={"left"}>
                    <VStack spacing={0} align={"left"}>
                        <HStack>
                            <Icon as={FaLocationArrow} />
                            <Text >{location.name}</Text>
                            <Link href={generateMapLink({ latitude: location.latitude, longitude: location.longitude })} isExternal color='teal.500' as={NextLink.default} passHref>
                                <HStack>
                                    <Text>(Directions)</Text>
                                    <ExternalLinkIcon />
                                </HStack>
                            </Link>
                        </HStack>
                        {/* <HStack >
                            <Icon as={FaLocationArrow} />
                            <Link href={generateMapLink({ latitude: location.latitude, longitude: location.longitude })} isExternal color='teal.500' as={NextLink.default} passHref>
                                <HStack>
                                    <Text>{location.latitude + ", " + location.longitude}</Text>
                                    <ExternalLinkIcon />
                                </HStack>
                            </Link>
                        </HStack> */}
                        <HStack>
                            <CalendarIcon />
                            <Text>{new Date(time).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                        </HStack>
                        <HStack>
                            {/* <AnimatedIcon
                        src="https://cdn.lordicon.com/kgdqzapd.json"
                        trigger="hover"
                        colors="primary:#000000"
                        style={{ width: "25px", height: "25px" }}
                    /> */}
                            <Icon as={TimeIcon} />
                            <Text>{new Date(time).toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit', hour12: true })}</Text>
                        </HStack>
                    </VStack>
                    <ButtonGroup>
                        <AddToCalendar
                            title={`${meetup.item_title} Meetup`}
                            startDate={`${startDate.toISOString()}`}
                            endDate={`${endDate.toISOString()}`}
                            description={`Listing Price: ${meetup.item_price.toFixed(2)}\nExpires at: ${showDate(meetup.expires_at ?? undefined)}\nMeetup Link: ${window.location.origin}/my-stuff/${meetup.id}`}
                            location={`${location ? location.name + ", " + location.address : "Unknown Location"}`}
                        />
                    </ButtonGroup>
                </VStack>}

            <Spacer />
        </VStack>
    );
}
