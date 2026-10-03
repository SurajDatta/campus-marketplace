/**
 * SellerCalendarPicker.tsx
 * A picker that will allow the user to select a day from a calendar, and then select the times available for that day, using the SellerTime component. I want to integrate weekday functionality, so they can directly update both general and specific days.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import { Badge, Box, Button, Center, Divider, FormControl, FormErrorMessage, FormHelperText, FormLabel, Grid, GridItem, HStack, Icon, Input, InputGroup, InputLeftElement, InputRightElement, Kbd, SimpleGrid, Spacer, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useTabsContext, useToast, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import Calendar from 'react-calendar';
import './Calendar.css'
import { FaCircle, FaGoogle, FaMagic } from 'react-icons/fa';
import { CalendarIcon, CheckIcon, CloseIcon, RepeatClockIcon, TimeIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { addGoogleCalendar, removeGoogleCalendar } from '@/utils/services/google';
import { Availability, MeetupLocations, MeetupSchedule, MeetupTimes, Profile } from '@/types';
import { updateTimes } from '@/utils/services/account';
import LinkGoogleCalendar from '../LinkGoogleCalendar';
import SellerTime, { SellerTimeProps } from '../SellerTime';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { createSchedule, ScheduleJSONOutput } from '@/utils/services/gemini';
import { MdList } from 'react-icons/md';

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

type SellerCalendarPickerProps = {
    userProfile: Profile | null;
    days: string[];
    showLinkCalendar: boolean;
    legend: React.ReactNode;
    isDisabled: boolean;
    showWeekdayFirst: boolean;
} & SellerTimeProps;

export default function SellerCalendarPicker({ userProfile, days, allTimes, sellerSchedule, setSellerSchedule, isMobile, googleCalendarUnavailability, legend, isDisabled, showWeekdayFirst }: SellerCalendarPickerProps) {
    const [aiGenerating, setAIGenerating] = useState(false);
    const toast = useToast();
    const [showCalendar, setShowCalendar] = useState(!showWeekdayFirst);

    const weekdayMap: { [key: string]: string } = {
        0: "sunday",
        1: "monday",
        2: "tuesday",
        3: "wednesday",
        4: "thursday",
        5: "friday",
        6: "saturday"
    };

    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const daysOfWeekShort = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];


    const isActive = (date: Date) => {
        return days.some((d) => new Date(d).toDateString() === date.toDateString());
    }

    const getAvailableTimes = (date: Date) => {
        const daysAvailability = (sellerSchedule.days as Availability)[date.toDateString()] ?? [];
        const weekday = weekdayMap[date.getDay()];
        if (weekday === 'monday') {
            return [...new Set([...sellerSchedule.monday, ...daysAvailability])]
        } else if (weekday === 'tuesday') {
            return [...new Set([...sellerSchedule.tuesday, ...daysAvailability])]
        } else if (weekday === 'wednesday') {
            return [...new Set([...sellerSchedule.wednesday, ...daysAvailability])]
        } else if (weekday === 'thursday') {
            return [...new Set([...sellerSchedule.thursday, ...daysAvailability])]
        } else if (weekday === 'friday') {
            return [...new Set([...sellerSchedule.friday, ...daysAvailability])]
        } else if (weekday === 'saturday') {
            return [...new Set([...sellerSchedule.saturday, ...daysAvailability])]
        } else if (weekday === 'sunday') {
            return [...new Set([...sellerSchedule.sunday, ...daysAvailability])]
        } else {
            return []
        }
    }

    const isAvailable = (date: Date) => {
        const availableTimes = getAvailableTimes(date);
        const busyDays = googleCalendarUnavailability ? googleCalendarUnavailability[date.toDateString()] ?? [] : [];
        // remove all times that are busy
        const availableTimesLeft = availableTimes ? availableTimes.filter((time) => !busyDays.includes(time)) : [];
        // then check if there are any times left
        return availableTimesLeft.length > 0;
    }

    const findFirstAvailableDay = () => {
        return days.find((d) => isActive(new Date(d)) && isAvailable(new Date(d)))
    }

    // const [selectedDay, setSelectedDay] = useState<string>(findFirstAvailableDay() ?? days[0]);
    const [selectedDay, setSelectedDay] = useState<string>((showWeekdayFirst) ? 'sunday' : findFirstAvailableDay() ?? days[0]);

    const [selectedNextMonthDay, setSelectedNextMonthDay] = useState<string>(findFirstAvailableDay() ?? days[0]);
    const [value, onChange] = useState<Value>(new Date(findFirstAvailableDay() ?? days[0]));
    const [selectedWeekday, setSelectedWeekday] = useState<string>('sunday');

    const formatDate = (day: string) => {
        return day.charAt(0).toUpperCase() + day.slice(1);
    }

    const getWeekdayTimes = (weekday: string): number => {
        if (weekday === 'monday') {
            return sellerSchedule.monday.length
        } else if (weekday === 'tuesday') {
            return sellerSchedule.tuesday.length
        } else if (weekday === 'wednesday') {
            return sellerSchedule.wednesday.length
        } else if (weekday === 'thursday') {
            return sellerSchedule.thursday.length
        } else if (weekday === 'friday') {
            return sellerSchedule.friday.length
        } else if (weekday === 'saturday') {
            return sellerSchedule.saturday.length
        } else if (weekday === 'sunday') {
            return sellerSchedule.sunday.length
        } else {
            return 0
        }
    }

    const renderCalendar = () => {

        return (
            <Calendar
                onChange={(date) => {
                    if (date instanceof Date) {
                        setSelectedDay(date.toDateString());
                        setSelectedNextMonthDay(date.toDateString());
                    }
                    onChange(date);
                }}
                value={value}
                tileContent={({ activeStartDate, date, view }) => isActive(date) ? ((isAvailable(date) ? <p><Icon as={FaCircle} color="green.500" border="1px solid white" borderRadius={"lg"} /></p> : <p><Icon as={FaCircle} color="white" border="1px solid white" borderRadius={"lg"} /></p>)) : <p><Icon as={FaCircle} color="white" border="1px solid white" borderRadius={"lg"} /></p>}
                tileDisabled={({ activeStartDate, date, view }) => !isActive(date)}
                className="react-calendar"
                formatShortWeekday={(locale, date) => {
                    if (isMobile) {
                        return date.toLocaleDateString('en-US', { weekday: 'narrow' });
                    } else {
                        return date.toLocaleDateString('en-US', { weekday: 'short' });
                    }
                }}
                minDetail='month'
                showFixedNumberOfWeeks={true}
                nextLabel={null}
                prevLabel={null}
                next2Label={null}
                prev2Label={null}
            />
        )
        // return (
        //     <Tabs variant='enclosed' colorScheme='blue' onChange={
        //         (index) => {
        //             if (index === 1) {
        //                 setSelectedDay(selectedNextMonthDay)
        //             } else {
        //                 setSelectedDay(selectedWeekday)
        //             }
        //         }
        //     }>
        //         <TabList pb={3}>
        //             <Tab width={"100%"}>
        //                 <HStack>
        //                     <Text>General</Text>
        //                     <Icon as={TimeIcon} boxSize={5} />
        //                 </HStack>
        //             </Tab>
        //             <Tab width={"100%"}>
        //                 <HStack>
        //                     <Text>Next Month</Text>
        //                     <Icon as={CalendarIcon} boxSize={5} />
        //                 </HStack>
        //             </Tab>
        //         </TabList>
        //         <TabPanels>
        //             <TabPanel p={0}>
        //                 <SimpleGrid columns={isMobile ? 7 : 1} spacing={2} mt={2}>
        //                     {daysOfWeek.map((day, index) => (
        //                         <Box
        //                             as="button"
        //                             type='button'
        //                             width={!isMobile ? "100%" : "auto"}
        //                             height={!isMobile ? "50px" : "50px"}
        //                             key={day}
        //                             value={day}
        //                             onClick={() => {
        //                                 setSelectedDay(day)
        //                                 setSelectedWeekday(day)
        //                             }}
        //                             display="flex"
        //                             alignItems="center"
        //                             justifyContent="center"
        //                             borderRadius={"lg"}
        //                             borderColor="gray.300"
        //                             bg={day == selectedDay ? "blue.500" : "gray.200"}
        //                             color={day == selectedDay ? 'white' : 'black'}
        //                         >
        //                             <Text>
        //                                 <b>{formatDate(isMobile ? daysOfWeekShort[index] : day)}</b> ({getWeekdayTimes(day)} times)
        //                             </Text>
        //                         </Box>
        //                     ))}
        //                 </SimpleGrid>
        //             </TabPanel>
        //             <TabPanel p={0}>
        //                 <VStack align={"left"} spacing={4}>
        //                     <Calendar
        //                         onChange={(date) => {
        //                             if (date instanceof Date) {
        //                                 setSelectedDay(date.toDateString());
        //                                 setSelectedNextMonthDay(date.toDateString());
        //                             }
        //                             onChange(date);
        //                         }}
        //                         value={value}
        //                         tileContent={({ activeStartDate, date, view }) => isActive(date) ? ((isAvailable(date) ? <p><Icon as={FaCircle} color="green.500" border="1px solid white" borderRadius={"lg"} /></p> : <p><Icon as={FaCircle} color="red.500" border="1px solid white" borderRadius={"lg"} /></p>)) : <p><Icon as={FaCircle} color="white" border="1px solid white" borderRadius={"lg"} /></p>}
        //                         tileDisabled={({ activeStartDate, date, view }) => !isActive(date)}
        //                         className="react-calendar"
        //                         formatShortWeekday={(locale, date) => {
        //                             if (isMobile) {
        //                                 return date.toLocaleDateString('en-US', { weekday: 'narrow' });
        //                             } else {
        //                                 return date.toLocaleDateString('en-US', { weekday: 'short' });
        //                             }
        //                         }}
        //                         minDetail='month'
        //                         showFixedNumberOfWeeks={true}
        //                         nextLabel={null}
        //                         prevLabel={null}
        //                         next2Label={null}
        //                         prev2Label={null}
        //                     />
        //                     {/* <LinkGoogleCalendar userProfile={userProfile} allTimes={allTimes} googleCalendarUnavailability={googleCalendarUnavailability} isDisabled={isDisabled} /> */}
        //                     {/* {legend} */}
        //                 </VStack>
        //             </TabPanel>
        //         </TabPanels>
        //     </Tabs>
        // )
    }

    return (
        isMobile ?
            <VStack align={"left"} spacing={4}>
                {renderCalendar()}
                <SellerTime selectedDay={selectedDay} allTimes={allTimes} sellerSchedule={sellerSchedule} setSellerSchedule={setSellerSchedule} isMobile={isMobile} googleCalendarUnavailability={googleCalendarUnavailability} />
            </VStack>
            : <>
                <Grid
                    templateColumns="repeat(2, 1fr)"
                    gap={4}
                    mt={4}
                >
                    <GridItem colSpan={1}>
                        <VStack align={"left"} height={"100%"}>
                            <Button
                                onClick={() => {
                                    if (showCalendar) {
                                        setSelectedDay(selectedWeekday)
                                    } else {
                                        setSelectedDay(selectedNextMonthDay)
                                    }
                                    setShowCalendar(!showCalendar)
                                }}
                                leftIcon={showCalendar ? <MdList /> : <CalendarIcon />}
                                colorScheme="blue"
                                variant="outline"
                                size="sm"
                            >{showCalendar ? "Use Weekday View" : "Use Calendar View"}</Button>
                            {showCalendar ?
                                renderCalendar()
                                :
                                <SimpleGrid columns={isMobile ? 7 : 1} spacing={3} mt={4}>
                                    {daysOfWeek.map((day, index) => (
                                        <Box
                                            as="button"
                                            type='button'
                                            width={!isMobile ? "100%" : "auto"}
                                            height={!isMobile ? "50px" : "50px"}
                                            key={day}
                                            value={day}
                                            onClick={() => {
                                                setSelectedDay(day)
                                                setSelectedWeekday(day)
                                            }}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            borderRadius={"lg"}
                                            borderColor="gray.300"
                                            bg={day == selectedDay ? "blue.500" : "gray.200"}
                                            color={day == selectedDay ? 'white' : 'black'}
                                        >
                                            {/* ({getWeekdayTimes(day)} times) */}
                                            <Text>
                                                <b>{formatDate(isMobile ? daysOfWeekShort[index] : day)}</b>
                                            </Text>
                                        </Box>
                                    ))}
                                </SimpleGrid>}
                        </VStack>
                    </GridItem>
                    <GridItem colSpan={1}>
                        <SellerTime selectedDay={selectedDay} allTimes={allTimes} setSellerSchedule={setSellerSchedule} sellerSchedule={sellerSchedule} isMobile={isMobile} googleCalendarUnavailability={googleCalendarUnavailability} />
                    </GridItem>
                </Grid>
            </>
    );
}