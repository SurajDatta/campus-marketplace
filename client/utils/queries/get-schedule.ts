import { TypedSupabaseClient } from "@/types";

export async function getSchedule(client: TypedSupabaseClient, scheduleId: string) {
    const { data, error } = await client
        .from('schedules')
        .select('*')
        .eq('id', scheduleId)
        .single();
    if (error) {
        throw new Error(error.message);
    }
    return data
}

