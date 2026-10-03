import { TypedSupabaseClient } from "@/types";

export async function getMeetups(client: TypedSupabaseClient, userId: string, development: boolean) {
    const { data, error } = await client
        .from('meetup')
        .select('*')
        .or(`buyer_id.eq.${userId}, seller_id.eq.${userId}`)
        .eq('live', !development)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }
    return data
}        