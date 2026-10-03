import { TypedSupabaseClient } from "@/types";

export async function getLocations(client: TypedSupabaseClient) {
    const { data, error } = await client
        .from('locations')
        .select('*')
        .eq('deleted', false)
        
    if (error) {
        throw new Error(error.message);
    }
    return data
}

