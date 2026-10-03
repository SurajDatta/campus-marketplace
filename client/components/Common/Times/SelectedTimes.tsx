import React from 'react';
import { HStack, Tag, TagCloseButton, TagLabel, Box, Text, CircularProgress, CircularProgressLabel, SimpleGrid, Stack, VStack } from '@chakra-ui/react';
import { CheckCircleIcon, CheckIcon } from '@chakra-ui/icons';
import { Availability, MeetupTimes, Schedule, SellerSchedule } from '@/types';
import { getCurrentDays, getTotalTimes } from '@/utils/getTotalTimes';

type SelectedTimesProps = {
    allTimes: { id: number, timez: string }[];
    days: string[];
    sellerSchedule: Schedule; // for seller sellerSchedule
    setSellerSchedule: React.Dispatch<React.SetStateAction<Schedule>>; // for seller sellerSchedule
    minimumTimes?: number;
    maximumTimes?: number;
    isMobile?: boolean;
    isSelecting: boolean;
}

export default function SelectedTimes({ days, allTimes, sellerSchedule, minimumTimes, maximumTimes, isMobile, isSelecting, setSellerSchedule }: SelectedTimesProps) {

    const weekdayMap: { [key: string]: string } = {
        0: "sunday",
        1: "monday",
        2: "tuesday",
        3: "wednesday",
        4: "thursday",
        5: "friday",
        6: "saturday"
    };

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[];

    const formatTime = (timez: string) => {
        const [hours, minutes] = timez.split(':');
        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);
        const isPM = hour >= 12;
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        const formattedMinute = minute < 10 ? `0${minute}` : minute;
        return `${formattedHour}:${formattedMinute} ${isPM ? 'PM' : 'AM'}`;
    };


    const getTimeLabel = (day: string, timeId: number) => {
        const timeObj = allTimes.find(time => time.id === timeId);
        if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(day)) {
            return timeObj ? formatTime(timeObj.timez) : '';
        } else {
            return timeObj ? `${new Date(day).toLocaleString("en-US", {month: "2-digit", "day": "2-digit"})} ${formatTime(timeObj.timez)}` : '';
        }
    };

    const handleRemoveTime = (day: string, timeId: number) => {
        setSellerSchedule(prevSchedule => {
            const newSchedule = { ...prevSchedule };
            if (day === 'monday') {
                newSchedule.monday = newSchedule.monday.filter(time => time !== timeId);
            } else if (day === 'tuesday') {
                newSchedule.tuesday = newSchedule.tuesday.filter(time => time !== timeId);
            } else if (day === 'wednesday') {
                newSchedule.wednesday = newSchedule.wednesday.filter(time => time !== timeId);
            } else if (day === 'thursday') {
                newSchedule.thursday = newSchedule.thursday.filter(time => time !== timeId);
            } else if (day === 'friday') {
                newSchedule.friday = newSchedule.friday.filter(time => time !== timeId);
            } else if (day === 'saturday') {
                newSchedule.saturday = newSchedule.saturday.filter(time => time !== timeId);
            } else if (day === 'sunday') {
                newSchedule.sunday = newSchedule.sunday.filter(time => time !== timeId);
            } else {
                (newSchedule.days as Availability)[day] = (newSchedule.days as Availability)[day].filter(time => time !== timeId);
            }
            return newSchedule;
        });
    }

    const meetsRequirement = () => {
        return (!minimumTimes || getTotalTimes(sellerSchedule, new Date(days[0])) >= minimumTimes) && (!maximumTimes || getTotalTimes(sellerSchedule, new Date(days[0])) <= maximumTimes);
    }

    const renderInnerProgress = () => {
        if (meetsRequirement()) {
            return (
                <CheckIcon color="green.400" />
            )
        } else {
            return (
                <>
                    {getTotalTimes(sellerSchedule, new Date(days[0]))}/{maximumTimes ?? minimumTimes}
                </>
            )
        }
    };

    const renderTimeText = () => {
        if (minimumTimes && maximumTimes) {
            if (minimumTimes === maximumTimes) {
                return `Choose ${minimumTimes} slots`;
            } else {
                return `You are required to select ${minimumTimes}-${maximumTimes} slots`;
            }
        } else if (minimumTimes) {
            return `You must select at least ${minimumTimes} ${minimumTimes === 1 ? 'slot' : 'slots'}`;
        } else if (maximumTimes) {
            return `You are required to select at most ${maximumTimes} slots`;
        } else {
            return `Select your desired slots`;
        }
    }

    return (
        <SimpleGrid columns={isMobile ? 1 : 7} p={4} maxH={200} overflowY={"auto"}>
            {daysOfWeek.map((weekday) => {
                return (
                    <VStack key={weekday} align={isMobile ? "left" : "center"}>
                        <Text as={"b"}>{weekday.charAt(0).toUpperCase() + weekday.slice(1)}</Text>
                        <SimpleGrid columns={isMobile ? 2 : 1} p={2} spacing={4}>
                            {[...Object.entries({ [weekday]: sellerSchedule[weekday] }),
                            ...Object.entries(getCurrentDays(sellerSchedule, new Date(days[0]))).filter(([day, _]) => weekdayMap[new Date(day).getDay()] === weekday)].map(([day, timeIds]) => {
                                const cleanedTimeIds = [...new Set(timeIds)].sort();
                                return cleanedTimeIds.map(timeId => (
                                    <Tag
                                        size={"sm"}
                                        key={`${day}-${timeId}`}
                                        borderRadius='full'
                                        variant='solid'
                                        colorScheme='green'
                                        display="inline-flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                    >
                                        <TagLabel noOfLines={2}>{getTimeLabel(day, timeId)}</TagLabel>
                                        <TagCloseButton onClick={() => handleRemoveTime(day, timeId)} />
                                    </Tag>
                                ))
                            })}
                        </SimpleGrid>
                    </VStack>
                )
            })}
        </SimpleGrid>
    )

    return (
        <Box borderWidth="1px" borderRadius="lg" p={4}>
            <HStack>
                <Text fontSize="xl">Selected Times</Text>
                {(maximumTimes || minimumTimes) && (<CircularProgress value={(getTotalTimes(sellerSchedule, new Date(days[0])) / (maximumTimes ?? minimumTimes ?? 1)) * 100} color={meetsRequirement() ? "green.400" : "red.400"}><CircularProgressLabel>{renderInnerProgress()}</CircularProgressLabel></CircularProgress>)}
            </HStack>
            <Text>{renderTimeText() + ". "}</Text>


            <SimpleGrid columns={isMobile ? 1 : 7} p={4} spacing={4} maxH={200} overflowY={"auto"}>
                {daysOfWeek.map((weekday) => {
                    return (
                        <VStack key={weekday} align={"left"}>
                            <Text>{weekday.charAt(0).toUpperCase() + weekday.slice(1)}</Text>
                            <SimpleGrid columns={isMobile ? 2 : 1} p={4} spacing={4} maxH={200} overflowY={"auto"}>
                                {[...Object.entries({ [weekday]: sellerSchedule[weekday] }),
                                ...Object.entries(getCurrentDays(sellerSchedule, new Date(days[0]))).filter(([day, _]) => weekdayMap[new Date(day).getDay()] === weekday)].map(([day, timeIds]) => {
                                    return timeIds.map(timeId => (
                                        <Tag
                                            size={"md"}
                                            key={`${day}-${timeId}`}
                                            borderRadius='full'
                                            variant='solid'
                                            colorScheme='green'
                                            display="inline-flex"
                                            alignItems="center"
                                            justifyContent="space-between"
                                        >
                                            <TagLabel>{getTimeLabel(day, timeId)}</TagLabel>
                                            <TagCloseButton onClick={() => handleRemoveTime(day, timeId)} />
                                        </Tag>
                                    ))
                                })}
                            </SimpleGrid>
                        </VStack>
                    )
                })}
            </SimpleGrid>
            {/* <SimpleGrid columns={7} spacing={4} p={4} maxH={200} overflowY={"auto"}>
                {[...Object.entries({ "monday": sellerSchedule.monday }),
                ...Object.entries({ "tuesday": sellerSchedule.tuesday }),
                ...Object.entries({ "wednesday": sellerSchedule.wednesday }),
                ...Object.entries({ "thursday": sellerSchedule.thursday }),
                ...Object.entries({ "friday": sellerSchedule.friday }),
                ...Object.entries({ "saturday": sellerSchedule.saturday }),
                ...Object.entries({ "sunday": sellerSchedule.sunday }),
                ...Object.entries(getCurrentDays(sellerSchedule, new Date(days[0])))].map(([day, timeIds]) => {
                    return timeIds.map(timeId => (
                        <Tag
                            size={"md"}
                            key={`${day}-${timeId}`}
                            borderRadius='full'
                            variant='solid'
                            colorScheme='green'
                            display="inline-flex"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <TagLabel>{getTimeLabel(day, timeId)}</TagLabel>
                            <TagCloseButton onClick={() => handleRemoveTime(day, timeId)} />
                        </Tag>
                    ))
                })}
            </SimpleGrid> */}
        </Box>
    );
}
