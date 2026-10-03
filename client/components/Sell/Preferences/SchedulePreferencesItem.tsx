/**
 * SchedulePreferencesItem.tsx
 * Component that will be used to show the schedule preferences of the item for the seller. 
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-25
 *
 *
 */
import Schedules from "@/components/Common/Schedule/Schedule";
import { Availability, Location, Profile, Schedule, Time, User } from "@/types";
import { Badge, Box, Button, HStack, Skeleton, Text, Tooltip } from "@chakra-ui/react";

type SchedulePreferencesProps = {
    allLocations: Location[];
    allTimes: Time[];
    isMobile: boolean;
    userProfile: Profile | null;
    isLoadingLocations: boolean;
    isLoadingTimes: boolean;
    mapsApiKey: string;
    days: string[];
    sellerSchedules: string[];
    setSellerSchedules: React.Dispatch<React.SetStateAction<string[]>>;
    scheduleData: Schedule[] | undefined;
    scheduleDetailsComplete: boolean;
    isLoadingSchedule: boolean;
    googleCalendarUnavailability?: Availability; // times that are blocked in google calendar
    googleCalendarId?: string;
}

export default function SchedulePreferencesItem({ scheduleDetailsComplete, isLoadingSchedule, sellerSchedules, setSellerSchedules, scheduleData, allLocations, allTimes, isMobile, userProfile, isLoadingLocations, isLoadingTimes, mapsApiKey, days, googleCalendarUnavailability, googleCalendarId }: SchedulePreferencesProps) {


    return (
        <Schedules schedules={sellerSchedules} setSchedules={setSellerSchedules} scheduleData={scheduleData} allLocations={allLocations} allTimes={allTimes} isMobile={isMobile} userProfile={userProfile} isLoadingLocations={isLoadingLocations} isLoadingTimes={isLoadingTimes} mapsApiKey={mapsApiKey} days={days} googleCalendarUnavailability={googleCalendarUnavailability} googleCalendarId={googleCalendarId} />
    )
    // return (
    //     <Skeleton isLoaded={!isLoadingSchedule}>
    //         <Box borderWidth="1px" borderRadius="lg" p={6}>
    //             <HStack width="100%">
    //                 <Text fontSize="2xl">Schedules</Text>
    //                 <Tooltip label='Fill in up to 2 schedules.'><Badge colorScheme={scheduleDetailsComplete ? "green" : "red"}>
    //                     {scheduleDetailsComplete ? "Complete" : "Incomplete"}
    //                 </Badge></Tooltip>
    //             </HStack>
    //             <Text mt={2} opacity={"0.5"} >Select the schedules you would like to enable for this purchase.</Text>
    //             <Schedules schedules={sellerSchedules} setSchedules={setSellerSchedules} scheduleData={scheduleData} allLocations={allLocations} allTimes={allTimes} isMobile={isMobile} userProfile={userProfile} isLoadingLocations={isLoadingLocations} isLoadingTimes={isLoadingTimes} mapsApiKey={mapsApiKey} days={days} googleCalendarUnavailability={googleCalendarUnavailability} googleCalendarId={googleCalendarId} />
    //         </Box>
    //     </Skeleton>
    // )
}