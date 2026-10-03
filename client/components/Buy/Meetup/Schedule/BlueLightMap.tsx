/**
 * BlueLightMap.tsx
 * Card to show the three blue light locations they can choose from on the map. 
 * @AshokSaravanan222
 * @2024-09-08
 */

import { Location } from '@/types';
import { AspectRatio, Box, Button, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { useRef } from 'react';
import { FaCircle } from 'react-icons/fa';


type BlueLightMapProps = {
    locationId: number;
    allLocations: Location[];
    blueLightLocations: [Location | undefined, Location | undefined, Location | undefined]; // of length 3
    mapsAPIKey: string;
    selectedLocation: number | undefined;
    setSelectedLocation: React.Dispatch<React.SetStateAction<number | undefined>>;
};

export default function BlueLightMap({
    locationId,
    allLocations,
    blueLightLocations,
    mapsAPIKey,
    selectedLocation,
    setSelectedLocation
}: BlueLightMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const calculateCentroid = (locations: (Location | undefined)[]): { latitude: number, longitude: number } | null => {
        const validLocations = locations.filter((location): location is Location => !!location);

        if (validLocations.length === 0) return null;

        const totalLat = validLocations.reduce((sum, loc) => sum + (loc.latitude ?? 0), 0);
        const totalLng = validLocations.reduce((sum, loc) => sum + (loc.longitude ?? 0), 0);

        return {
            latitude: totalLat / validLocations.length,
            longitude: totalLng / validLocations.length,
        };
    };



    // Function to convert lat/lng to x/y on canvas relative to current location
    const calculatePosition = (lat: number, lng: number, centerLat: number, centerLng: number) => {
        const scaleFactor = 60000; // Smaller scale factor for closer items
        const x = (lng - centerLng) * scaleFactor * Math.cos(centerLat * (Math.PI / 180));
        const y = (lat - centerLat) * -scaleFactor
        return { x, y };
    };

    const meetupLocation = allLocations.find(location => location.id === locationId);
    const centroid = calculateCentroid(blueLightLocations);

    return (
        <Box borderWidth="1px" borderRadius="lg" padding="4" backgroundColor="white">
            <VStack align={"left"}>
                <HStack>
                    <Text fontSize={"xl"}>
                        {meetupLocation?.name + ": "}{selectedLocation
                            ? `Blue Light ${blueLightLocations.findIndex(location => location?.id === selectedLocation) + 1}`
                            : `Pick a blue light location`}
                    </Text>
                </HStack>

                {meetupLocation && meetupLocation.latitude && meetupLocation.longitude && mapsAPIKey && centroid && (
                    <AspectRatio ratio={16 / 9} width="100%" maxH="100%">
                        <Box position="relative" width="100%" height="100%" ref={containerRef}>
                            <iframe
                                width="100%"
                                height="100%"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://www.google.com/maps/embed/v1/directions?key=${mapsAPIKey}&origin=${meetupLocation.latitude + "," + meetupLocation.longitude}&destination=${meetupLocation.latitude + "," + meetupLocation.longitude}&mode=walking&zoom=16&center=${centroid.latitude + "," + centroid.longitude}`}
                                style={{ pointerEvents: 'none' }}
                            />

                            {/* Overlay ChakraUI components */}
                            {blueLightLocations.map((location, index) => {
                                if (!location || !location.latitude || !location.longitude || !meetupLocation) return null;
                                if (!meetupLocation.latitude || !meetupLocation.longitude) return null;
                                const { x, y } = calculatePosition(
                                    location.latitude,
                                    location.longitude,
                                    meetupLocation.latitude,
                                    meetupLocation.longitude
                                );

                                return (
                                    <Box
                                        key={location.id}
                                        position="absolute"
                                        left={`calc(50% + ${x}px)`}
                                        top={`calc(50% + ${y}px)`}
                                        transform="translate(-50%, -50%)"
                                        zIndex={1}
                                    >
                                        <Button
                                            aria-label={`Blue Light ${index + 1}`}
                                            colorScheme="blue"
                                            borderRadius="full"
                                            onClick={() =>
                                                selectedLocation === location.id
                                                    ? setSelectedLocation(undefined)
                                                    : setSelectedLocation(location.id)
                                            }
                                            width={10}
                                            height={10}
                                            minWidth={10}
                                            minHeight={10}
                                            border={"1px solid black"}
                                            padding={0}
                                            fontSize="sm"
                                            fontWeight="bold"
                                            color={selectedLocation === location.id ? 'white' : 'blue.500'}
                                            bg={selectedLocation === location.id ? 'blue.500' : 'white'}
                                            _hover={{ bg: selectedLocation === location.id ? 'blue.600' : 'blue.50' }}
                                        >
                                            {index + 1}
                                        </Button>
                                    </Box>
                                );
                            })}

                            {/* Red dot for the meetup location */}
                            {meetupLocation && (
                                <Box
                                    position="absolute"
                                    left="50%"
                                    top="50%"
                                    transform="translate(-50%, -50%)"
                                >
                                    <Icon as={FaCircle} color={"red.500"} border="1px solid white" borderRadius={"lg"} />
                                </Box>
                            )}
                        </Box>
                    </AspectRatio>
                )}
            </VStack>
        </Box>
    );
}