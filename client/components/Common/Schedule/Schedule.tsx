/**
 * Schedule.tsx
 * Component that will be used to enable or disable certain schedules.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-10-14
 *
 *
 */
import { Availability, Location, Profile, Schedule, SellerSchedule, Time, User } from "@/types";
import { AspectRatio, Box, Checkbox, Divider, Grid, GridItem, HStack, Icon, IconButton, SimpleGrid, Spinner, Stack, Switch, Text, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react"
import { updateContactDetails, updateLocationSchedule, updateTimeSchedule } from "@/utils/services/account";
import { AddIcon, EmailIcon, MinusIcon, PhoneIcon } from "@chakra-ui/icons";
import { FaFacebook, FaInstagram, FaSnapchatGhost } from "react-icons/fa";
import ScheduleCard from "./ScheduleCard";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import AddScheduleModal from "@/components/Common/Schedule/AddScheduleModal";
import { addSchedule } from "@/utils/services/schedule";
import { FiPlusCircle } from "react-icons/fi";

type ScheduleProps = {
    allLocations: Location[]
    allTimes: Time[]
    userProfile: Profile | null
    isLoadingLocations: boolean
    isLoadingTimes: boolean
    isMobile: boolean
    mapsApiKey: string
    days: string[]
    schedules: string[];
    setSchedules: React.Dispatch<React.SetStateAction<string[]>>;
    scheduleData: Schedule[] | undefined;
    googleCalendarUnavailability?: Availability; // times that are blocked in google calendar
    googleCalendarId?: string;
}

export default function Schedules({ schedules, setSchedules, scheduleData, allLocations, allTimes, isMobile, userProfile, isLoadingLocations, isLoadingTimes, mapsApiKey, days, googleCalendarUnavailability, googleCalendarId }: ScheduleProps) {
    const [loadingType, setLoadingType] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const handleAdd = async (monday: number[], tuesday: number[], wednesday: number[], thursday: number[], friday: number[], saturday: number[], sunday: number[], days: Availability, location: number): Promise<{ success: boolean, error: string }> => {
        try {
            if (!userProfile) {
                throw new Error("User profile not found")
            }
            const { success, error, data } = await addSchedule(userProfile.id, location, monday, tuesday, wednesday, thursday, friday, saturday, sunday, days);
            if (!success || !data) {
                throw new Error("Failed to add schedule: " + error)
            } else {
                const id = data.id;
                setSchedules([...schedules, id]);
                queryClient.invalidateQueries({
                    queryKey: ['schedule', userProfile.id]
                });
            }
            return { success: true, error: "" }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }

    const handleSave = async (id: string, newSchedule: Schedule): Promise<{ success: boolean, error: string }> => {
        if (!userProfile) {
            return { success: false, error: "User profile not found." }
        }
        if (JSON.stringify(newSchedule) === JSON.stringify(scheduleData?.find((schedule) => schedule.id === id))) {
            return { success: true, error: "" }
        }
        setLoadingType(id);

        const { success: scheduleTimeSuccess } = await updateTimeSchedule(id, newSchedule.monday, newSchedule.tuesday, newSchedule.wednesday, newSchedule.thursday, newSchedule.friday, newSchedule.saturday, newSchedule.sunday, newSchedule.days);
        if (!scheduleTimeSuccess) {
            return { success: false, error: "Error updating schedule times." }
        }

        const { success: scheduleLocationSuccess } = await updateLocationSchedule(id, newSchedule.location);
        if (!scheduleLocationSuccess) {
            return { success: false, error: "Error updating schedule location." }
        }
        queryClient.invalidateQueries({
            queryKey: ['schedule', userProfile.id]
        })
        setLoadingType(null);
        return { success: true, error: "" }
    }

    const handleCheckboxChange = (key: string) => {
        if (schedules.includes(key)) {
            setSchedules(schedules.filter((scheduleKey) => scheduleKey !== key));
        } else {
            setSchedules([...schedules, key]);
        }
    }

    const renderLocationImage = (locationId: number) => {
        const location = allLocations.find((potentialLocation) => potentialLocation.id === locationId)
        return (
            <Box width={50} height={50}>
                <AspectRatio ratio={1} width={"100%"} height={"100%"}>
                    <Image
                        src={location ? location.img_url : process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/photos/default.webp"}
                        alt={location ? location.name : "Unknown Location"}
                        width={500}
                        height={500}
                        style={{ borderRadius: "5px" }}
                    />
                </AspectRatio>
            </Box>
        )
    }

    return (
        <Stack direction={isMobile ? "column" : "row"}>
            <VStack align={"left"} maxH={200} overflowY={"auto"} width={isMobile ? "100%" : "50%"}>
                {scheduleData && scheduleData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((schedule) => {
                    const key = schedule.id
                    const isChecked = schedules.includes(key);
                    if (isChecked) {
                        return (
                            <HStack key={key}>
                                <HStack>
                                    <IconButton aria-label="Remove Schedule" colorScheme={"red"} onClick={() => handleCheckboxChange(key)} icon={<MinusIcon />} size={"sm"}/>
                                    {renderLocationImage(schedule.location)}
                                </HStack>
                                {loadingType === key ? <Spinner /> : (
                                    <ScheduleCard
                                        schedule={schedule}
                                        saveSchedule={handleSave}
                                        allLocations={allLocations}
                                        allTimes={allTimes}
                                        userProfile={userProfile}
                                        isLoadingLocations={isLoadingLocations}
                                        isLoadingTimes={isLoadingTimes}
                                        isMobile={isMobile}
                                        mapsApiKey={mapsApiKey}
                                        days={days}
                                        googleCalendarUnavailability={googleCalendarUnavailability}
                                        googleCalendarId={googleCalendarId}
                                    />
                                )}
                            </HStack>
                        )
                    }
                })}
                <AddScheduleModal allLocations={allLocations} allTimes={allTimes} userProfile={userProfile} days={days} googleCalendarId={googleCalendarId} googleCalendarUnavailability={googleCalendarUnavailability} isLoadingLocations={isLoadingLocations} isLoadingTimes={isLoadingTimes} mapsApiKey={mapsApiKey} isMobile={isMobile} addSchedule={handleAdd} schedule={{
                    monday: [],
                    tuesday: [],
                    wednesday: [],
                    thursday: [],
                    friday: [],
                    saturday: [],
                    sunday: [],
                    days: {},
                    location: 0,
                    user_id: "",
                    id: "",
                    created_at: "",
                    active: true
                }} />
                {/* {scheduleData && scheduleData.length < 3 && <AddScheduleButton userProfile={userProfile} />} */}
            </VStack>
            <Divider orientation={isMobile ? "horizontal" : "vertical"} />
            <VStack align={"left"} maxH={200} overflowY={"auto"} width={isMobile ? "100%" : "50%"}>
                {scheduleData && scheduleData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((schedule) => {
                    const key = schedule.id
                    const isChecked = schedules.includes(key);
                    if (!isChecked) {
                        return (
                            <HStack key={key}>
                                <HStack>
                                    <IconButton aria-label="Add Schedule" colorScheme={"green"} onClick={() => handleCheckboxChange(key)} icon={<AddIcon />} size={"sm"}/>
                                    {renderLocationImage(schedule.location)}
                                </HStack>
                                {loadingType === key ? <Spinner /> : (
                                    <ScheduleCard
                                        schedule={schedule}
                                        saveSchedule={handleSave}
                                        allLocations={allLocations}
                                        allTimes={allTimes}
                                        userProfile={userProfile}
                                        isLoadingLocations={isLoadingLocations}
                                        isLoadingTimes={isLoadingTimes}
                                        isMobile={isMobile}
                                        mapsApiKey={mapsApiKey}
                                        days={days}
                                        googleCalendarUnavailability={googleCalendarUnavailability}
                                        googleCalendarId={googleCalendarId}
                                    />
                                )}
                            </HStack>
                        )
                    }
                })}

            </VStack>
        </Stack>
    )

    //     return (
    //         <Grid templateColumns="repeat(2, 1fr)" gap={6}>
    //             <GridItem colSpan={1}>
    //                 <VStack align={"left"}>
    //                     {scheduleData && scheduleData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((schedule) => {
    //                         const key = schedule.id
    //                         const isChecked = schedules.includes(key);
    //                         if (isChecked) {
    //                             return (
    //                                 <HStack key={key}>
    //                                     {/* <HStack>
    //                             {renderLocationImage(schedule.location)}
    //                             <Switch
    //                                 isChecked={isChecked}
    //                                 onChange={() => handleCheckboxChange(key)}
    //                             />
    //                         </HStack> */}
    //                                     {renderLocationImage(schedule.location)}
    //                                     {loadingType === key ? <Spinner /> : (
    //                                         <ScheduleCard
    //                                             schedule={schedule}
    //                                             saveSchedule={handleSave}
    //                                             allLocations={allLocations}
    //                                             allTimes={allTimes}
    //                                             userProfile={userProfile}
    //                                             isLoadingLocations={isLoadingLocations}
    //                                             isLoadingTimes={isLoadingTimes}
    //                                             isMobile={isMobile}
    //                                             mapsApiKey={mapsApiKey}
    //                                             days={days}
    //                                             googleCalendarUnavailability={googleCalendarUnavailability}
    //                                             googleCalendarId={googleCalendarId}
    //                                         />
    //                                     )}
    //                                 </HStack>
    //                             )
    //                         }
    //                     })}
    //                     {scheduleData && scheduleData.length < 3 && <AddScheduleModal allLocations={allLocations} allTimes={allTimes} userProfile={userProfile} days={days} googleCalendarId={googleCalendarId} googleCalendarUnavailability={googleCalendarUnavailability} isLoadingLocations={isLoadingLocations} isLoadingTimes={isLoadingTimes} mapsApiKey={mapsApiKey} isMobile={isMobile} addSchedule={handleAdd} schedule={{
    //                         monday: [],
    //                         tuesday: [],
    //                         wednesday: [],
    //                         thursday: [],
    //                         friday: [],
    //                         saturday: [],
    //                         sunday: [],
    //                         days: {},
    //                         location: 0,
    //                         user_id: "",
    //                         id: "",
    //                         created_at: "",
    //                         active: true
    //                     }} />}
    //                     {/* {scheduleData && scheduleData.length < 3 && <AddScheduleButton userProfile={userProfile} />} */}
    //                 </VStack>
    //             </GridItem>
    //             <GridItem colSpan={1}>
    //                 <Text>Other Schedules</Text>
    //                 {scheduleData && scheduleData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((schedule) => {
    //                     const key = schedule.id
    //                     const isChecked = schedules.includes(key);
    //                     if (!isChecked) {
    //                         return (
    //                             <HStack key={key}>
    //                                 {/* <HStack>
    //                             {renderLocationImage(schedule.location)}
    //                             <Switch
    //                                 isChecked={isChecked}
    //                                 onChange={() => handleCheckboxChange(key)}
    //                             />
    //                         </HStack> */}
    //                                 <Checkbox isChecked={isChecked} onChange={() => handleCheckboxChange(key)} />
    //                                 {renderLocationImage(schedule.location)}
    //                                 {loadingType === key ? <Spinner /> : (
    //                                     <ScheduleCard
    //                                         schedule={schedule}
    //                                         saveSchedule={handleSave}
    //                                         allLocations={allLocations}
    //                                         allTimes={allTimes}
    //                                         userProfile={userProfile}
    //                                         isLoadingLocations={isLoadingLocations}
    //                                         isLoadingTimes={isLoadingTimes}
    //                                         isMobile={isMobile}
    //                                         mapsApiKey={mapsApiKey}
    //                                         days={days}
    //                                         googleCalendarUnavailability={googleCalendarUnavailability}
    //                                         googleCalendarId={googleCalendarId}
    //                                     />
    //                                 )}
    //                             </HStack>
    //                         )
    //                     }
    //                 })}
    //             </GridItem>
    //         </Grid>
    //     )

}
