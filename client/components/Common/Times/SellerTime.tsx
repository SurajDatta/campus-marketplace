/**
 * SellerTime.tsx
 * Shows all the times available for a user to select from (or add if shown on the seller screen).
 * Allows mobile users to drag left or right to select times without interfering with vertical scrolling.
 * Desktop functionality remains unchanged.
 * @author  
 * @updated 2024-07-22
 *
 */
import React, { useState, useEffect } from 'react';
import {
    Box,
    Checkbox,
    SimpleGrid,
    HStack,
    Heading,
    VStack,
    Text,
    Center,
    Divider,
    ButtonGroup,
    Button,
    useDisclosure,
    useToast,
    Icon,
    CheckboxGroup,
    Spacer,
    Kbd,
    IconButton,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon, RepeatClockIcon } from '@chakra-ui/icons';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react';
import { Availability, Schedule, Time } from '@/types';
import { FaCircle } from 'react-icons/fa';

export type SellerTimeProps = {
    allTimes: Time[];
    sellerSchedule: Schedule;
    setSellerSchedule: React.Dispatch<React.SetStateAction<Schedule>>;
    selectedDay?: string;
    isMobile: boolean;
    googleCalendarUnavailability?: Availability;
};

const SellerTime = ({
    allTimes,
    setSellerSchedule,
    isMobile,
    googleCalendarUnavailability,
    sellerSchedule,
    selectedDay: originalSelectedDay,
}: SellerTimeProps) => {
    const [isSelecting, setIsSelecting] = useState(false);
    const [processedIds, setProcessedIds] = useState<Set<number>>(new Set());
    const [startTouchX, setStartTouchX] = useState<number | null>(null);
    const [startTouchY, setStartTouchY] = useState<number | null>(null);

    const selectedDay =
        originalSelectedDay ?? Object.keys(sellerSchedule.days as Availability)[0];
    const daysOfWeek = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
    ];

    const isWeekday = daysOfWeek.includes(selectedDay);

    const weekdayMap: {
        [key: number]:
        | 'sunday'
        | 'monday'
        | 'tuesday'
        | 'wednesday'
        | 'thursday'
        | 'friday'
        | 'saturday';
    } = {
        0: 'sunday',
        1: 'monday',
        2: 'tuesday',
        3: 'wednesday',
        4: 'thursday',
        5: 'friday',
        6: 'saturday',
    };

    const handleTimeSelect = (id: number, isSelected: boolean) => {
        setSellerSchedule((prevSchedule) => {
            let newAvailability = { ...prevSchedule };
            if (isSelected) {
                if ((newAvailability.days as Availability)[selectedDay]) {
                    (newAvailability.days as Availability)[selectedDay] = (
                        newAvailability.days as Availability
                    )[selectedDay].filter((time: number) => time !== id);
                } else {
                    if (isWeeklyChecked(selectedDay)) {
                        const weekday = isWeekday ? (selectedDay as "sunday"
                            | "monday"
                            | "tuesday"
                            | "wednesday"
                            | "thursday"
                            | "friday"
                            | "saturday"
                        ) : weekdayMap[new Date(selectedDay).getDay()];
                        const weekdayAvailability = sellerSchedule[
                            weekday as keyof Schedule
                        ] as number[];
                        newAvailability[weekday] = weekdayAvailability.filter(
                            (time: number) => time !== id
                        );
                    } else {
                        (newAvailability.days as Availability)[selectedDay] = [];
                    }
                }
            } else {
                if (isWeeklyChecked(selectedDay)) {
                    const weekday = isWeekday ? (selectedDay as "sunday"
                        | "monday"
                        | "tuesday"
                        | "wednesday"
                        | "thursday"
                        | "friday"
                        | "saturday"
                    ) : weekdayMap[new Date(selectedDay).getDay()];
                    if (!sellerSchedule[weekday].includes(id)) {
                        newAvailability[weekday].push(id);
                    }
                } else {
                    if ((newAvailability.days as Availability)[selectedDay]) {
                        if (
                            !(newAvailability.days as Availability)[selectedDay].includes(id)
                        ) {
                            (newAvailability.days as Availability)[selectedDay].push(id);
                        }
                    } else {
                        (newAvailability.days as Availability)[selectedDay] = [id];
                    }
                }
            }
            return newAvailability;
        });
    };

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
    };

    const isSelectedCheck = (day: string, id: number) => {
        if (day == 'sunday' || day == 'monday' || day == 'tuesday' || day == 'wednesday' || day == 'thursday' || day == 'friday' || day == 'saturday') {
            return sellerSchedule[day].includes(id);
        } else {
            if (!(sellerSchedule.days as Availability)[day]) {
                const weekday = weekdayMap[new Date(day).getDay()];
                const weekdayAvailability = sellerSchedule[
                    weekday as keyof Schedule
                ] as number[];
                return weekdayAvailability.includes(id);
            } else if ((sellerSchedule.days as Availability)[day].length === 0) {
                return false;
            } else {
                return (sellerSchedule.days as Availability)[day].includes(id);
            }
        }
    };

    const handleMouseDown = (id: number, isSelected: boolean) => {
        setIsSelecting(true);
        setProcessedIds(new Set([id]));
        handleTimeSelect(id, isSelected);
    };

    const handleMouseEnter = (id: number, isSelected: boolean) => {
        if (!isSelecting) return;
        if (!processedIds.has(id)) {
            handleTimeSelect(id, isSelected);
            setProcessedIds((prev) => new Set(prev).add(id));
        }
    };

    const handleMouseUp = () => {
        setIsSelecting(false);
        setProcessedIds(new Set());
    };

    // Updated touch handlers to allow horizontal dragging on mobile
    const handleTouchStart = (
        e: React.TouchEvent,
        id: number,
        isSelected: boolean
    ) => {
        const touch = e.touches[0];
        setStartTouchX(touch.clientX);
        setStartTouchY(touch.clientY);
        setIsSelecting(true);
        setProcessedIds(new Set());
        // Do not select yet; wait to see if it's a tap or drag
    };

    const handleTouchMove = (
        e: React.TouchEvent,
        id: number,
        isSelected: boolean
    ) => {
        if (!isSelecting) return;
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - (startTouchX || 0));
        const deltaY = Math.abs(touch.clientY - (startTouchY || 0));
        if (deltaX > deltaY && deltaX > 10) {
            e.preventDefault(); // Prevent horizontal scrolling
            if (!processedIds.has(id)) {
                handleTimeSelect(id, isSelected);
                setProcessedIds((prev) => new Set(prev).add(id));
            }
        }
    };

    const handleTouchEnd = (
        e: React.TouchEvent,
        id: number,
        isSelected: boolean
    ) => {
        if (!isSelecting) return;
        const touch = e.changedTouches[0];
        const deltaX = Math.abs(touch.clientX - (startTouchX || 0));
        const deltaY = Math.abs(touch.clientY - (startTouchY || 0));

        if (deltaX < 10 && deltaY < 10) {
            // Considered a tap
            handleTimeSelect(id, isSelected);
        }
        setIsSelecting(false);
        setProcessedIds(new Set());
        setStartTouchX(null);
        setStartTouchY(null);
    };

    const isWeeklyChecked = (selectedDay: string) => {
        if (isWeekday) {
            return true
        }
        const weekday = weekdayMap[new Date(selectedDay).getDay()];
        const daily = (sellerSchedule.days as Availability)[selectedDay];
        return sellerSchedule[weekday]?.length !== 0 && !daily;
    };

    return (
        <VStack align={'left'}>
            <VStack align={'left'}>
                <HStack>
                    <Heading fontSize={'3xl'}>
                        {isWeekday ? (selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)) : new Date(selectedDay).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </Heading>
                    <Spacer />
                    <Button
                        colorScheme='red'
                        leftIcon={<CloseIcon />}
                        onClick={() => {
                            if (!(sellerSchedule.days as Availability)[selectedDay]) {
                                setSellerSchedule((prevSchedule) => {
                                    let newAvailability = { ...prevSchedule };
                                    const weekday = isWeekday ? (selectedDay as "sunday"
                                        | "monday"
                                        | "tuesday"
                                        | "wednesday"
                                        | "thursday"
                                        | "friday"
                                        | "saturday"
                                    ) : weekdayMap[new Date(selectedDay).getDay()];
                                    newAvailability[weekday] = [];
                                    return newAvailability;
                                });
                            } else {
                                setSellerSchedule((prevSchedule) => {
                                    let newAvailability = { ...prevSchedule };
                                    delete (newAvailability.days as Availability)[selectedDay];
                                    return newAvailability;
                                });
                            }
                        }}
                        isDisabled={!(sellerSchedule.days as Availability)[selectedDay] && sellerSchedule[isWeekday ? (selectedDay as "sunday"
                            | "monday"
                            | "tuesday"
                            | "wednesday"
                            | "thursday"
                            | "friday"
                            | "saturday"
                        ) : weekdayMap[new Date(selectedDay).getDay()]]
                            ?.length === 0}
                    >
                        Clear
                    </Button>
                </HStack>
                <HStack>
                    {!isWeekday && <Checkbox
                        isInvalid={false}
                        isChecked={isWeeklyChecked(selectedDay)}
                        isDisabled={
                            !(sellerSchedule.days as Availability)[selectedDay] &&
                            sellerSchedule[weekdayMap[new Date(selectedDay).getDay()]]
                                ?.length === 0
                        }
                        onChange={(e) => {
                            if (e.target.checked) {
                                // Switch from daily to weekly
                                setSellerSchedule((prevSchedule) => {
                                    let newAvailability = { ...prevSchedule };
                                    const dailyAvailability = (
                                        newAvailability.days as Availability
                                    )[selectedDay] as number[];
                                    const weekday = weekdayMap[new Date(selectedDay).getDay()];
                                    newAvailability[weekday] = dailyAvailability;
                                    delete (newAvailability.days as Availability)[selectedDay];
                                    return newAvailability;
                                });
                            } else {
                                // Switch from weekly to daily
                                setSellerSchedule((prevSchedule) => {
                                    let newAvailability = { ...prevSchedule };
                                    const weekday = weekdayMap[new Date(selectedDay).getDay()];
                                    const weekdayAvailability = sellerSchedule[weekday];
                                    (newAvailability.days as Availability)[selectedDay] =
                                        weekdayAvailability;
                                    return newAvailability;
                                });
                            }
                        }}
                    >
                        Every {uppercaseFirst(weekdayMap[new Date(selectedDay).getDay()])}
                    </Checkbox>}
                    {/* <Spacer />
                    <Button
                        colorScheme='red'
                        onClick={() => {
                            setSellerSchedule((prevSchedule) => {
                                let newAvailability = { ...prevSchedule };
                                const weekday = weekdayMap[new Date(selectedDay).getDay()];
                                newAvailability[weekday] = [];
                                return newAvailability;
                            });
                        }}
                        isDisabled={
                            sellerSchedule[weekdayMap[new Date(selectedDay).getDay()]]
                                .length === 0
                        }
                    >
                        Clear {uppercaseFirst(weekdayMap[new Date(selectedDay).getDay()])}
                    </Button> */}
                </HStack>
            </VStack>

            <SimpleGrid
                columns={isMobile ? 4 : 2}
                spacing={2}
                maxH={425}
                overflowY={'auto'}
            >
                {allTimes.map(({ id, timez }) => {
                    const isSelected = isSelectedCheck(selectedDay, id);
                    const isBusy = googleCalendarUnavailability
                        ? googleCalendarUnavailability[selectedDay]?.includes(id)
                        : false;
                    if (isBusy) {
                        return null;
                    }
                    return (
                        <Box
                            onMouseDown={() => handleMouseDown(id, isSelected)}
                            onMouseEnter={() => handleMouseEnter(id, isSelected)}
                            onMouseUp={handleMouseUp}
                            onTouchStart={(e) => handleTouchStart(e, id, isSelected)}
                            onTouchMove={(e) => handleTouchMove(e, id, isSelected)}
                            onTouchEnd={(e) => handleTouchEnd(e, id, isSelected)}
                            width={'100%'}
                            key={id}
                            style={{ touchAction: 'pan-y' }} // Allow vertical scrolling
                        >
                            <Box
                                p={2}
                                as='button'
                                type='button'
                                display='flex'
                                alignItems='center'
                                justifyContent='center'
                                borderRadius='lg'
                                borderColor='gray.300'
                                bg={isSelected ? 'blue.500' : 'gray.200'}
                                isTruncated
                                width={'100%'}
                            >
                                <VStack spacing={0}>
                                    <Text color={isSelected ? 'white' : 'black'}>
                                        {formatTime(timez)}
                                    </Text>
                                </VStack>
                            </Box>
                        </Box>
                    );
                })}
            </SimpleGrid>
            {/* {isMobile ? (
                // <Text>
                //     Swipe <Kbd>right/left</Kbd> to select multiple times
                // </Text>
                <></>
            ) : isShiftPressed ? (
                <HStack width={'100%'}>
                    <Text>
                        Selecting times with <Kbd>shift</Kbd>
                    </Text>
                    <Spacer />
                    <Button
                        size={'xs'}
                        colorScheme='blue'
                        onClick={() => {
                            setIsShiftPressed(false);
                        }}
                    >
                        Unselect
                    </Button>
                </HStack>
            ) : (
                <HStack width={'100%'}>
                    <Text>
                        Hold <Kbd>shift</Kbd> to allow mouse drag selection
                    </Text>
                    <Spacer />
                    <Button
                        size={'xs'}
                        colorScheme='blue'
                        onClick={() => {
                            setIsShiftPressed(true);
                        }}
                    >
                        Select
                    </Button>
                </HStack>
            )} */}
        </VStack>
    );
};

export default SellerTime;
