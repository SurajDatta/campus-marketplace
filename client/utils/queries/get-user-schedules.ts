import { TypedSupabaseClient } from "@/types";

export async function getUserSchedules(client: TypedSupabaseClient, userId: string) {
    const { data, error } = await client
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        
    if (error) {
        throw new Error(error.message);
    }
    return data
}

