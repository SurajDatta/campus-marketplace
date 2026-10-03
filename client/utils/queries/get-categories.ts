import { TypedSupabaseClient } from "@/types";

export async function getCategories(client: TypedSupabaseClient) {
    const { data, error } = await client
        .from('categories')
        .select('*')
        .order('short', { ascending: true });
    if (error) {
        throw new Error(error.message);
    }
    return data
}