import { TypedSupabaseClient } from "@/types";

export async function getTimes(client: TypedSupabaseClient) {
    const { data, error } = await client
        .from('times')
        .select('*');
    if (error) {
        throw new Error(error.message);
    }
    return data
}

