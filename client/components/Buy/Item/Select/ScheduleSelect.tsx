/**
 * ScheduleSelect.tsx
 * Component that allows the buyer to select the desired schedules for the meetup.
 * @AshokSaravanan222
 * 10-17-2024
 */


import SelectedLocations from "@/components/Common/Locations/SelectedLocations";
import { Availability, AvailabilityLocations, BuyerMeetups, Location, MeetupTimes, Time } from "@/types";
import { Box, Grid, GridItem, HStack, Icon, IconButton, Skeleton, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import LocationCardSelect from "./LocationCardSelect";
import BuyerCalendarPicker from "@/components/Common/Times/Calendar/BuyerCalendarPicker";
import { FaCircle } from "react-icons/fa";
import { CloseIcon } from "@chakra-ui/icons";



type ScheduleSelectProps = {
    sellerTimes: Availability;
    sellerLocations: AvailabilityLocations;
    buyerLocations: number[];
    buyerMeetups: BuyerMeetups
    setBuyerMeetups: React.Dispatch<React.SetStateAction<BuyerMeetups>>;
    isLoadingLocations: boolean;
    isLoadingTimes: boolean;
    schedulesComplete: boolean;
    allLocations: Location[];
    allTimes: Time[]
    isMobile: boolean;
    days: string[];
    googleCalendarUnavailability: Availability; // times that are blocked in google calendar
    googleMapsAPIKey: string | null
}


export default function ScheduleSelect({ sellerTimes, sellerLocations, buyerMeetups, setBuyerMeetups, isLoadingLocations, schedulesComplete, allLocations, allTimes, isMobile, googleMapsAPIKey, isLoadingTimes, days, googleCalendarUnavailability, buyerLocations }: ScheduleSelectProps) {

    const [availability, setAvailability] = useState<MeetupTimes>({});

    const renderLegend = () => {
        return (
            <Box border={"1px solid"} borderColor={"gray.200"} p={2} borderRadius={"lg"} width={"100%"}>
                <HStack>
                    <Icon as={FaCircle} color="green.500" />
                    <Text>Available</Text>
                </HStack>
                <HStack>
                    <Icon as={FaCircle} color="red.500" />
                    <Text>Unavailable</Text>
                </HStack>
            </Box>
        )
    }

    const weekdayMap: { [key: string]: string } = {
        0: "sunday",
        1: "monday",
        2: "tuesday",
        3: "wednesday",
        4: "thursday",
        5: "friday",
        6: "saturday"
    };

    const getWeekday = (day: string) => {
        const date = new Date(day);
        return weekdayMap[date.getDay()];
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



    const handleRemoveTime = (day: string, timeId: number) => {
        setAvailability(prevAvailability => ({
            ...prevAvailability,
            [day]: prevAvailability[day].filter(id => id !== timeId)
        })
        );
    };

    useEffect(() => {
        const newBuyerMeetups = Object.keys(availability).reduce((acc, day) => {
            return {
                ...acc,
                [day]: availability[day].reduce((acc, timeId) => {

                    const dayLocationsIds = (sellerLocations && sellerLocations[day] && sellerLocations[day][Number(timeId)]) ? sellerLocations[day][Number(timeId)] : []
                    const weekdayLocationIds = (sellerLocations && sellerLocations[getWeekday(day)] && sellerLocations[getWeekday(day)][Number(timeId)]) ? sellerLocations[getWeekday(day)][Number(timeId)] : []
                    const locationIds = [...weekdayLocationIds, ...dayLocationsIds].filter(locationId => buyerLocations.includes(locationId))

                    return {
                        ...acc,
                        [Number(timeId)]: {
                            location: (buyerMeetups[day] && buyerMeetups[day][Number(timeId)] ? buyerMeetups[day][Number(timeId)].location : (locationIds.length > 0 ? locationIds[0] : 0))
                        }
                    }
                }, {})
            }
        }, {}) as BuyerMeetups
        setBuyerMeetups(newBuyerMeetups)
    }, [availability])


    return (
        <Skeleton isLoaded={!isLoadingTimes || isLoadingLocations}>
            <VStack align={"left"}>
                <BuyerCalendarPicker days={days} allTimes={allTimes} availability={availability} setAvailability={setAvailability} sellerAvailability={sellerTimes} isMobile={true} googleCalendarUnavailability={googleCalendarUnavailability} legend={renderLegend()} onlyShowAvailable buyerLocations={buyerLocations} />
                <VStack align={"left"} spacing={4}>
                    {Object.keys(availability).map((day) => {
                        const times = availability[day];
                        return (
                            times.sort().map((timeId) => {
                                const dayLocationsIds = (sellerLocations && sellerLocations[day] && sellerLocations[day][Number(timeId)]) ? sellerLocations[day][Number(timeId)] : []
                                const weekdayLocationIds = (sellerLocations && sellerLocations[getWeekday(day)] && sellerLocations[getWeekday(day)][Number(timeId)]) ? sellerLocations[getWeekday(day)][Number(timeId)] : []
                                const locationIds = [...weekdayLocationIds, ...dayLocationsIds].filter(locationId => buyerLocations.includes(locationId))

                                const currentLocation = buyerMeetups && buyerMeetups[day] && buyerMeetups[day][Number(timeId)] ? buyerMeetups[day][Number(timeId)].location : (locationIds.length > 0 ? locationIds[0] : 0)

                                const locations = (locationIds ? locationIds.map(locationId => allLocations.find(location => location.id === locationId)).filter(location => location !== undefined) : []) as Location[]

                                const fetchedTime = allTimes.find(timeObj => timeObj.id === Number(timeId))
                                const formattedTime = fetchedTime ? formatTime(fetchedTime.timez) : ''
                                return currentLocation !== 0 && (
                                    <Grid templateColumns="repeat(2, 1fr)" gap={4} borderWidth={1} borderRadius={"lg"} p={4} position={"relative"}>
                                        <GridItem colSpan={isMobile ? 2 : 1}>
                                            <VStack align={"left"}>
                                                <Text as={"b"} fontSize={"lg"}>{`${new Date(day).toLocaleDateString()} at ${formattedTime}`}</Text>
                                                <LocationCardSelect
                                                    locations={locations} currentLocation={currentLocation} setCurrentLocation={(location) => {
                                                        const newBuyerMeetups = {
                                                            ...buyerMeetups,
                                                            [day]: {
                                                                ...buyerMeetups[day],
                                                                [Number(timeId)]: {
                                                                    location: location
                                                                }
                                                            }
                                                        }
                                                        setBuyerMeetups(newBuyerMeetups)
                                                    }} />
                                            </VStack>
                                        </GridItem>
                                        <GridItem colSpan={isMobile ? 2 : 1}>
                                            {googleMapsAPIKey && <SelectedLocations sellerLocations={[currentLocation]} allLocations={allLocations} isMobile={isMobile} minimumLocations={1} maximumLocations={1} googleMapsAPIKey={googleMapsAPIKey} loading={false} />}
                                            <IconButton
                                                aria-label="Remove location"
                                                icon={<CloseIcon />}
                                                size="sm"
                                                colorScheme="red"
                                                position="absolute"
                                                top="-10px"
                                                right="-10px"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveTime(day, timeId);
                                                }}
                                            />
                                        </GridItem>
                                    </Grid>
                                )
                            })
                        )
                    })}
                </VStack>
                {/* <VStack borderWidth="1px" borderRadius="lg" p={4} align={"left"}>
                    <HStack>
                        <Text fontSize="xl">Locations</Text>
                        {<CircularProgress value={(getCurrentCompleted(buyerMeetups) / getCurrentSelected(availability)) * 100} color={meetsRequirement() ? "green.400" : "red.400"}><CircularProgressLabel>{renderInnerProgress()}</CircularProgressLabel></CircularProgress>}
                    </HStack>
                    <Text>{getCurrentSelected(availability) === 0 ? "Pick a time to see the seller's locations!" : "Seller's preferred locations. Choose one for each of the potential meetup times."}</Text>

                </VStack> */}
            </VStack>
        </Skeleton>
    )
}
