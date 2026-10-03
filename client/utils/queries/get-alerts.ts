import { TypedSupabaseClient } from "@/types";

export async function getAlerts(client: TypedSupabaseClient, userId: string) {
    const {data, error} = await client
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .eq('deleted', false)
    .order('created_at', {ascending: false});
    
    if (error) {
        throw new Error(error.message);
    }
    return data;
}