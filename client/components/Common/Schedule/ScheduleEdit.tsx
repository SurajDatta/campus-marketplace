/**
 * ScheduleEdit.tsx
 * Component that will allow someone to edit a schedule
 * @AshokSaravanan222
 * 10-14-2024
 */

import AddLocationModal from "@/components/Sell/Preferences/AddLocationModal"
import DeleteScheduleDialog from "@/components/Sell/Preferences/DeleteScheduleDialog"
import { Box, Button, Divider, HStack, Icon, Input, Spacer, Text, VStack } from "@chakra-ui/react"
import SellerCalendarPicker from "../Times/Calendar/SellerCalendarPicker"
import SelectedTimes from "../Times/SelectedTimes"
import { Availability, Location, MeetupTimes, Profile, Schedule, SellerSchedule, Time } from "@/types"
import { FaCircle, FaMagic } from "react-icons/fa"
import { useEffect, useState } from "react"
import { deleteSchedule, resetSchedule } from "@/utils/services/schedule"
import ResetScheduleDialog from "@/components/Sell/Preferences/ResetScheduleDialog"
import ScheduleTimesDialog from "./ScheduleTimesDialog"
import LinkGoogleCalendar from "../Times/LinkGoogleCalendar"

type ScheduleEditProps = {
    userProfile: Profile | null;
    isLoadingTimes: boolean;
    isLoadingLocations: boolean;
    allTimes: Time[]
    allLocations: Location[]
    googleMapsAPIKey: string;
    days: string[];
    isMobile: boolean;
    googleCalendarUnavailability?: Availability; // times that are blocked in google calendar
    googleCalendarId?: string;
    sellerSchedule: Schedule
    setSellerSchedule: (newSchedule: Schedule) => void;
    onReset: () => void;
    onDelete: () => void;
    showDelete: boolean;
}


export default function ScheduleEdit({ userProfile, isLoadingLocations, allTimes, allLocations, googleMapsAPIKey, days, isMobile, googleCalendarUnavailability, sellerSchedule, setSellerSchedule, onReset, onDelete, googleCalendarId, showDelete }: ScheduleEditProps) {
    const [schedule, setSchedule] = useState<Schedule>(JSON.parse(JSON.stringify(sellerSchedule)));

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

    const formatTime = (timez: string) => {
        const [hours, minutes] = timez.split(':');
        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);
        const isPM = hour >= 12;
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        const formattedMinute = minute < 10 ? `0${minute}` : minute;
        return `${formattedHour}:${formattedMinute} ${isPM ? 'PM' : 'AM'}`;
    };

    const getBlockedTimes = (times: MeetupTimes | undefined) => {
        if (!times) {
            return 'Since this is your general preferences page, you will not be able to see specific timeslots blocked. When creating a listing, you will be able to see the blocked timeslots.';
        }
        const blockedTimes = Object.keys(times).map((day) => {
            return times[day].map((id) => {
                const time = allTimes.find(t => t.id === id)?.timez;
                return `${day} ${formatTime(time || '')}`;
            })
        }, []).flat().join(', ');

        return blockedTimes;
    }


    useEffect(() => {
        if (schedule) {
            setSellerSchedule(JSON.parse(JSON.stringify(schedule)));
        }
    }, [schedule])

    return (
        <Box p={2} key={sellerSchedule.id}>
            <VStack align={"left"}>
                <HStack>
                    <AddLocationModal userProfile={userProfile} sellerSchedule={schedule} setSellerSchedule={setSchedule} mapsAPIKey={googleMapsAPIKey} allLocations={allLocations} locationsLoading={isLoadingLocations} isMobile={isMobile} />
                    <Spacer />
                    {showDelete && <DeleteScheduleDialog userProfile={userProfile} allLocations={allLocations} locationId={schedule.location} scheduleId={schedule.id} onDelete={(scheduleId) => {
                        onDelete();
                        return deleteSchedule(scheduleId)
                    }} isMobile={isMobile} />}
                    {/* <DeleteScheduleDialog onDelete={deleteSchedule} locationId={schedule.location} allLocations={allLocations} scheduleId={schedule.id} /> */}
                    {/* <ResetScheduleDialog onReset={(scheduleId) => {
                        onReset();
                        return resetSchedule(scheduleId)
                    }} locationId={schedule.location} allLocations={allLocations} scheduleId={schedule.id} isMobile={isMobile} userProfile={userProfile} /> */}
                </HStack>
                {/* <Text mt={2} opacity={"0.5"} >Choose the times you're available to meet during the week for your preferred location. The more options you provide, the better the chance of finding a convenient time for both parties.</Text> */}

                <Divider />
                <HStack>
                    <ScheduleTimesDialog setSchedule={setSchedule} isMobile={isMobile} />
                    <Text fontSize={"sm"} opacity={"0.5"}>Use a description of when you are available to generate a schedule.</Text>
                </HStack>
                <Divider />
                {/* <HStack>
                    <LinkGoogleCalendar userProfile={userProfile} allTimes={allTimes} isDisabled={false} googleCalendarUnavailability={googleCalendarUnavailability} isMobile={isMobile} googleCalendarId={googleCalendarId} />
                    <Text fontSize={"sm"} opacity={"0.5"}>{googleCalendarId ? getBlockedTimes(googleCalendarUnavailability) : "Use your calendar to block off unavailable times."}</Text>
                </HStack> */}

                <SellerCalendarPicker userProfile={userProfile} allTimes={allTimes} sellerSchedule={schedule} setSellerSchedule={setSchedule} days={days} isMobile={isMobile} googleCalendarUnavailability={googleCalendarUnavailability} showLinkCalendar legend={renderLegend()} isDisabled={false} showWeekdayFirst={!showDelete} />

                <SelectedTimes sellerSchedule={schedule} allTimes={allTimes} minimumTimes={6} isMobile={isMobile} isSelecting={false} setSellerSchedule={setSchedule} days={days} />
            </VStack>
        </Box>
    )
}