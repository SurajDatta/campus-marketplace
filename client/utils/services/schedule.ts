/**
 * services/schedule.ts
 * Service functions used to handle scheduling for the seller.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use server"
import { Availability } from "@/types";
import { createClient } from "../supabase/server";

export const addSchedule = async (userId: string, location: number, monday: number[], tuesday: number[], wednesday: number[], thursday: number[], friday: number[], saturday: number[], sunday: number[], days: Availability) => {
    const client = createClient();
    const { data, error } = await client
        .from('schedules')
        .insert({
            user_id: userId,
            location: location,
            monday: monday,
            tuesday: tuesday,
            wednesday: wednesday,
            thursday: thursday,
            friday: friday,
            saturday: saturday,
            sunday: sunday,
            days: days,
        })
        .select('*')
        .single();

    if (error) {
        return {success: false, error: error.message, data: null};
    }
    return {success: true, error: "", data: data};
}

export const deleteSchedule = async (scheduleId: string) => {
    const client = createClient();
    const { error } = await client
        .from('schedules')
        .update({
            active: false
        })
        .eq("id", scheduleId)

    if (error) {
        return {success: false, error: error.message};
    }
    return {success: true, error: ""};
}

export const resetSchedule = async (scheduleId: string) => {
    const client = createClient();
    const { error } = await client
        .from('schedules')
        .update({
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: [],
            days: {},
        })
        .eq("id", scheduleId)

    if (error) {
        return {success: false, error: error.message};
    }
    return {success: true, error: ""};
}
