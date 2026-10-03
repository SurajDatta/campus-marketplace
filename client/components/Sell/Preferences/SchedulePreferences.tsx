/**
 * SchedulePreferences.tsx
 * Component that will be used to show the time and location preferences of the seller.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-29
 *
 *
 */
import { Availability, Location, MeetupLocations, MeetupSchedule, MeetupTimes, Profile, Schedule, SellerSchedule, Time } from "@/types";
import { Badge, Box, Button, HStack, Icon, IconButton, Link, Skeleton, Spacer, Text, Tooltip, VStack } from "@chakra-ui/react";
import { FaCircle, FaGoogle } from "react-icons/fa";
import AddScheduleModal from "@/components/Common/Schedule/AddScheduleModal";
import ScheduleEdit from "@/components/Common/Schedule/ScheduleEdit";
import { CloseIcon, DeleteIcon } from "@chakra-ui/icons";
import DeleteScheduleDialog from "./DeleteScheduleDialog";
import { deleteSchedule } from "@/utils/services/schedule";
import AddScheduleButton from "@/components/Common/Schedule/AddScheduleButton";

type SchedulePreferencesProps = {
    userProfile: Profile | null;
    isLoadingTimes: boolean;
    isLoadingLocations: boolean;
    sellerSchedules: Schedule[];
    setSellerSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
    allTimes: Time[];
    allLocations: Location[]
    googleMapsAPIKey: string;
    days: string[];
    isMobile: boolean;
    googleCalendarUnavailability?: Availability; // times that are blocked in google calendar
    isDisabled: boolean;
}

export default function SchedulePreferences({ userProfile, isLoadingTimes, isLoadingLocations, sellerSchedules, setSellerSchedules, allTimes, allLocations, googleMapsAPIKey, days, isMobile, googleCalendarUnavailability, isDisabled }: SchedulePreferencesProps) {

    return (
        <Skeleton isLoaded={!isLoadingTimes}>
            <VStack align={"left"} spacing={4}>
                {sellerSchedules.sort(
                    // use .created_at to sort by creation date
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                ).map((schedule) => {
                    return (
                        <ScheduleEdit
                            key={schedule.id}
                            userProfile={userProfile}
                            isLoadingLocations={isLoadingLocations}
                            allTimes={allTimes}
                            allLocations={allLocations}
                            googleMapsAPIKey={googleMapsAPIKey}
                            days={days}
                            isMobile={isMobile}
                            googleCalendarUnavailability={googleCalendarUnavailability}
                            googleCalendarId={"googleCalendarId"} // FOR NOW, SINCE it will be delted
                            sellerSchedule={schedule}
                            setSellerSchedule={(newSchedule) => {
                                const newSchedules = sellerSchedules.map((s) => {
                                    if (s.id === newSchedule.id) {
                                        return newSchedule;
                                    }
                                    return s;
                                })
                                setSellerSchedules(newSchedules);
                            }}
                            isLoadingTimes={isLoadingTimes}
                            onReset={() => { }}
                            onDelete={() => {}}
                            showDelete={false}
                        />
                    )
                })}
            </VStack>
            {sellerSchedules && sellerSchedules.length < 3 && <AddScheduleButton userProfile={userProfile} />}
        </Skeleton>
    )
}