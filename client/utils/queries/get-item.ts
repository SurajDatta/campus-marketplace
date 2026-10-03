import { TypedSupabaseClient } from "@/types";

export async function getItem(client: TypedSupabaseClient, itemId: string, development: boolean) {
    const { data, error } = await client
        .from('items')
        .select('*')
        .eq('id', itemId)
        .eq('deleted', false)
        .eq('live', !development)
        .single();
    if (error) {
        throw new Error(error.message);
    }
    return data;
}

