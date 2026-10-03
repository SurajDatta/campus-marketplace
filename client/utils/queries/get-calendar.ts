import { Time, TypedSupabaseClient } from "@/types";
import { fetchBusyTimes } from "../services/google";

export async function getCalendar(client: TypedSupabaseClient, userId: string, days: string[], times: Time[]) {
    const { data, error } = await client
        .from('calendar')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)

    if (error || !data) {
        throw new Error(error.message);
    }
    try {
        const calendar = data[0];
        const unavailability = await fetchBusyTimes(calendar, days, times);
        return {calendarId: calendar.id, meetupTimes: unavailability}
    } catch (error: any) {
        throw new Error(error.message);
    }
}

