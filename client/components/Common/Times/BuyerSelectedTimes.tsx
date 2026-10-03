import React from 'react';
import { HStack, Tag, TagCloseButton, TagLabel, Box, Text, CircularProgress, CircularProgressLabel, SimpleGrid } from '@chakra-ui/react';
import { CheckCircleIcon, CheckIcon } from '@chakra-ui/icons';
import { MeetupTimes } from '@/types';

type SelectedTimesProps = {
    allTimes: { id: number, timez: string }[];
    times: MeetupTimes
    setAvailability: React.Dispatch<React.SetStateAction<MeetupTimes>>;
    minimumTimes?: number;
    maximumTimes?: number;
    isMobile?: boolean;
    isSelecting: boolean;
}

export default function BuyerSelectedTimes({ times, allTimes, setAvailability, minimumTimes, maximumTimes, isMobile, isSelecting }: SelectedTimesProps) {

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
        return timeObj ? `${day.charAt(0).toUpperCase() + day.slice(1)} : ${formatTime(timeObj.timez)}` : '';
    };

    const handleRemoveTime = (day: string, timeId: number) => {
        setAvailability(prevAvailability => ({
            ...prevAvailability,
            [day]: prevAvailability[day].filter(id => id !== timeId)
        })
        );
    };

    const meetsRequirement = () => {
        const totalTimes = Object.values(times).reduce((acc, curr) => acc + (curr ? curr.length : 0), 0);
        return (!minimumTimes || totalTimes >= minimumTimes) && (!maximumTimes || totalTimes <= maximumTimes);
    }

    const renderInnerProgress = () => {
        if (meetsRequirement()) {
            return (
                <CheckIcon color="green.400" />
            )
        } else {
            return (
                <>
                    {Object.values(times).reduce((acc, curr) => acc + (curr ? curr.length : 0), 0)}/{maximumTimes ?? minimumTimes}
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
        <Box borderWidth="1px" borderRadius="lg" p={4}>
            <HStack>
                <Text fontSize="xl">Selected Times</Text>
                {(maximumTimes || minimumTimes) && (<CircularProgress value={(Object.values(times).reduce((acc, curr) => acc + (curr ? curr.length : 0), 0) / (maximumTimes ?? minimumTimes ?? 1)) * 100} color={meetsRequirement() ? "green.400" : "red.400"}><CircularProgressLabel>{renderInnerProgress()}</CircularProgressLabel></CircularProgress>)}
            </HStack>
            <Text>{renderTimeText() + ". "}</Text>
            <SimpleGrid columns={isMobile ? 1 : 3} spacing={4} p={4} maxH={200} overflowY={"auto"}>
                {Object.entries(times).map(([day, timeIds]) =>
                    timeIds && timeIds.map(timeId => (
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
                )}
            </SimpleGrid>
        </Box>
    );
}
