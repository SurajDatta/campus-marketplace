/**
 * SelectedLocations.tsx
 * Component to show the selected location picked by the seller. Will show the location on a map for now, can also make it an image, if there are too much.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-08-08
 *
 *
 */
import React from 'react';
import { HStack, Box, Text, CircularProgress, CircularProgressLabel, SimpleGrid, AspectRatio, Center, VStack, Button, Spacer, Badge, useDisclosure, Image } from '@chakra-ui/react';
import { CheckIcon, EditIcon } from '@chakra-ui/icons';
import { Location } from '@/types';
import EditLocationModal from './EditLocationModal';

type SelectedLocationsProps = {
    loading: boolean;
    allLocations: Location[];
    setAllLocations?: React.Dispatch<React.SetStateAction<Location[]>>;
    userId?: string;
    sellerLocations: number[];
    minimumLocations?: number;
    maximumLocations?: number;
    isMobile?: boolean;
    googleMapsAPIKey: string;
}

export default function SelectedLocations({ allLocations, setAllLocations, minimumLocations, maximumLocations, isMobile, googleMapsAPIKey, sellerLocations, userId, loading }: SelectedLocationsProps) {
    const [location, setLocation] = React.useState<Location | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const meetsRequirement = () => {
        const totalLocations = sellerLocations.length === 1 && sellerLocations[0] === 0 ? 0 : sellerLocations.length;
        return (!minimumLocations || totalLocations >= minimumLocations) && (!maximumLocations || totalLocations <= maximumLocations);
    }

    const renderInnerProgress = () => {
        if (meetsRequirement()) {
            return (
                <CheckIcon color="green.400" />
            )
        } else {
            return (
                <>
                    {sellerLocations.length === 1 && sellerLocations[0] === 0 ? 0 : sellerLocations.length}/{maximumLocations ?? minimumLocations}
                </>
            )
        }
    };

    const isSingleLocation = () => {
        return maximumLocations === 1 && minimumLocations === 1;
    }

    const handleLocationOpen = (locationId: number) => {
        const location = allLocations.find(location => location.id === locationId);
        if (!location) return;
        setLocation(location);
        onOpen();
    }

    const renderBadges = (selectedLocations: number[], selectedLocation: number) => {
        if (selectedLocations.length >= 1 && selectedLocations[0] === selectedLocation) {
            return <Badge colorScheme={"pink"}>Primary</Badge>
        } else if (selectedLocations.length >= 2 && selectedLocations[1] === selectedLocation) {
            return <Badge colorScheme={"cyan"}>Secondary</Badge>
        } else {
            return null;
        }
    }

    return (
        <>
            {isSingleLocation() ? (
                <Box p={2}>
                    {sellerLocations.map((locationId) => {
                        if (locationId === 0) {
                            return <></>
                        }
                        const location = allLocations.find(location => location.id === locationId);
                        if (!location) return null;
                        const loc = `${location.latitude},${location.longitude}`;
                        return (
                            <AspectRatio ratio={16 / 9} width="100%" maxH="100%" key={locationId}>
                                <iframe
                                    width="100%"
                                    height="100%"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={`https://www.google.com/maps/embed/v1/directions?key=${googleMapsAPIKey}&origin=${loc}&destination=${loc}&mode=walking&zoom=16`}>
                                </iframe>
                            </AspectRatio>
                        )
                    }
                    )}
                </Box>)
                :
                <Box borderWidth="1px" borderRadius="lg" p={4}>
                    <Text fontSize="xl">Selected Locations</Text>
                    <Text>You are required to pick a primary location and a secondary location. They will be used in linking your times to your locations so you know when and where you are meeting up. </Text>
                    {(maximumLocations || minimumLocations) && (<CircularProgress value={((sellerLocations.length === 1 && sellerLocations[0] === 0 ? 0 : sellerLocations.length) / (maximumLocations ?? minimumLocations ?? 1)) * 100} color={meetsRequirement() ? "green.400" : "red.400"}><CircularProgressLabel>{renderInnerProgress()}</CircularProgressLabel></CircularProgress>)}
                    <SimpleGrid columns={isMobile ? 1 : 3} spacing={4} p={4} maxH={600} overflowY={"auto"}>
                        {sellerLocations.map((locationId) => {
                            if (locationId === 0) return null;
                            const location = allLocations.find(location => location.id === locationId);
                            if (!location) return null;
                            const loc = `${location.latitude},${location.longitude}`;
                            return (
                                <VStack key={locationId} align="left">
                                    <AspectRatio ratio={16 / 9} width="100%" maxH="100%">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            src={`https://www.google.com/maps/embed/v1/directions?key=${googleMapsAPIKey}&origin=${loc}&destination=${loc}&mode=walking&zoom=16`}>
                                        </iframe>
                                    </AspectRatio>
                                    <HStack>
                                        <AspectRatio ratio={1} width="50px" maxH="50px">
                                            <Image
                                                src={location.img_url}
                                                alt="Location Image"
                                                objectFit="cover"
                                                objectPosition={"50 50"}
                                                width="100%"
                                                height="100%"
                                                borderRadius={"lg"}
                                            />
                                        </AspectRatio>
                                        <Text>{location.name}</Text>
                                        {renderBadges(sellerLocations, locationId)}
                                        <Spacer />
                                        <Button colorScheme="blue" leftIcon={<EditIcon />} onClick={() => handleLocationOpen(locationId)}>Edit</Button>
                                    </HStack>
                                </VStack>
                            )
                        }
                        )}
                    </SimpleGrid>
                </Box>}
            {setAllLocations && userId && <EditLocationModal isOpen={isOpen} onClose={onClose} location={location} googleMapsApiKey={googleMapsAPIKey} setAllLocations={setAllLocations} userId={userId} loading={loading} />}
        </>
    );
}
