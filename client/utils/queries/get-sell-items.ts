import { TypedSupabaseClient } from "@/types";

export async function getSellItems(client: TypedSupabaseClient, userId: string, development: boolean) {
    const { data, error } = await client
        .from('items')
        .select('*')
        .eq('seller_id', userId)
        .eq('deleted', false)
        .eq('live', !development)
    if (error) {
        throw new Error(error.message);
    }
    return data;
}