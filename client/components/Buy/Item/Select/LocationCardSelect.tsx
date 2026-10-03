/**
 * LocationCardSelect.tsx
 * Component that will allow the buyer to select their locations to meetup. 
 * @AshokSaravanan222
 * 09-06-2024
 */

import { useEffect, useState } from "react";
import { Badge, Box, HStack, Radio, RadioGroup, Text, VStack } from "@chakra-ui/react";
import { Location } from "@/types";


type LocationCardSelectProps = {
    locations: Location[];
    currentLocation: number
    setCurrentLocation: (location: number) => void;
}

export default function LocationCardSelect({ locations, currentLocation, setCurrentLocation }: LocationCardSelectProps) {
    const [selectedLocation, setSelectedLocation] = useState<string>(String(currentLocation));


    useEffect(() => {
        setSelectedLocation(String(currentLocation));
    }, [currentLocation]);
    return (
        <>
            <RadioGroup onChange={(e) => {
                setSelectedLocation(e);
                setCurrentLocation(Number(e));
            }} value={selectedLocation}>
                <VStack spacing="24px" align="left">
                    {locations.map((location) => (
                        <HStack key={location.id}>
                            <Radio value={String(location.id)} isInvalid={false}>
                                <Box
                                    bg={Number(selectedLocation) === location.id ? 'blue.500' : 'gray.200'}
                                    color={Number(selectedLocation) === location.id ? 'white' : 'black'}
                                    p={4}
                                    borderRadius="md"
                                    width="100%"
                                    textAlign="left"
                                >
                                    <HStack spacing="24px">
                                        <Text>{location.name}</Text>
                                    </HStack>
                                </Box>
                            </Radio>
                            {location.blue_light && <Badge colorScheme="blue">Safe Meetup</Badge>}
                        </HStack>
                    ))}
                </VStack>
            </RadioGroup>
        </>
    )
}