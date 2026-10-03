/**
 * SellerTime.tsx
 * Shows all the times available for a user to select from (or add if shown on the seller screen). TODO: make this component more user friendly with outlines of the boxes, and implement the onlyShowAvailableDays prop (used on the buy screen).
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React from 'react';
import {
    Box, Checkbox, SimpleGrid, HStack, Wrap,
    Heading,
    VStack,
    Switch,
    Text,
    Center,
    Divider,
    ButtonGroup,
    Button,
    useDisclosure,
    useToast,
    Icon
} from '@chakra-ui/react';
import { render } from 'react-dom';
import { CheckIcon, RepeatClockIcon } from '@chakra-ui/icons';
import { AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay } from '@chakra-ui/react';
import { updateTimes } from '@/utils/services/account';
import { Availability, ItemSchedule, MeetupLocations, MeetupSchedule, MeetupTimes, Profile, SellerSchedule, Time } from '@/types';
import { FaCircle } from 'react-icons/fa';

export type BuyerTimeProps = {
    allTimes: Time[];
    availability: Availability; // for buyer side
    setAvailability: React.Dispatch<React.SetStateAction<Availability>>; // for buyer side
    sellerAvailability: Availability; // for buyer side
    isMobile: boolean;
    onlyShowAvailable: boolean;
    googleCalendarUnavailability: Availability;
    selectedDay?: string;
};

const BuyerTime = ({ allTimes, availability, sellerAvailability, isMobile, onlyShowAvailable, googleCalendarUnavailability, setAvailability, selectedDay: originalSelectedDay }: BuyerTimeProps) => {
    const selectedDay = originalSelectedDay ?? Object.keys(availability)[0];
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];


    const handleTimeSelect = (id: number) => {
        const newAvailability = { ...availability };
        if (newAvailability[selectedDay]) {
            newAvailability[selectedDay] = newAvailability[selectedDay].includes(id) ? newAvailability[selectedDay].filter((time) => time !== id) : [...newAvailability[selectedDay], id];
        } else {
            newAvailability[selectedDay] = [id];
        }
        setAvailability(newAvailability);
    }


    const formatTime = (timez: string) => {
        const [hours, minutes] = timez.split(':');
        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);
        const isPM = hour >= 12;
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        const formattedMinute = minute < 10 ? `0${minute}` : minute;
        return `${formattedHour}:${formattedMinute} ${isPM ? 'PM' : 'AM'}`;
    };

    const uppercaseFirst = (str: string) => {
        if (!str) {
            return str;
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const getDayOfWeek = (selectedDay: string) => {
        const date = new Date(selectedDay);
        return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    }

    return (
        <>
            <VStack align={"left"}>
                <Wrap>
                    <HStack>
                        <Heading fontSize={"3xl"}>{daysOfWeek.includes(selectedDay) ? selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1) : selectedDay}</Heading>
                    </HStack>
                </Wrap>
                {/* <Text opacity={0.5}>Pick a time to see the seller's locations!</Text> */}
                <SimpleGrid columns={isMobile || onlyShowAvailable ? 3 : 8} spacing={2} mt={2}>
                    {allTimes.map(({ id, timez }) => {
                        const isAvailable = sellerAvailability ? ((sellerAvailability[selectedDay] && sellerAvailability[selectedDay].includes(id)) || (sellerAvailability[getDayOfWeek(selectedDay)] && sellerAvailability[getDayOfWeek(selectedDay)].includes(id))) : true;
                        const isSelected = availability[selectedDay]?.includes(id) ?? false;
                        const isBusy = googleCalendarUnavailability ? googleCalendarUnavailability[selectedDay]?.includes(id) : false;
                        const isNow = ((((new Date().getHours()) * 2) + Math.ceil(new Date().getMinutes() / 30)) >= id) && new Date().toDateString() === new Date(selectedDay).toDateString();
                        if ((onlyShowAvailable && !isAvailable) || isBusy || isNow) {
                            return null;
                        }
                        return (
                            <Box
                                as="button"
                                p={4}
                                type='button'
                                width={!isMobile ? "100%" : "auto"}
                                isTruncated
                                key={id}
                                onClick={() => handleTimeSelect(id)}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                borderRadius="lg"
                                borderColor="gray.300"
                                bg={isAvailable ? (isSelected ? "blue.500" : (!sellerAvailability || onlyShowAvailable ? "gray.200" : "green.500")) : "gray.300"}
                                disabled={!isAvailable}
                            >
                                <VStack spacing={0}>
                                    <Text color={availability[selectedDay]?.includes(id) ? 'white' : 'black'}> {formatTime(timez)}</Text>
                                </VStack>
                            </Box>
                        );
                    })}
                </SimpleGrid>
            </VStack>
        </>
    );
};

export default BuyerTime;
