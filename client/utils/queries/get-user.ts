import { TypedSupabaseClient } from "@/types";

export async function getUser(client: TypedSupabaseClient) {
    // const { data, error } = await client.auth.getUser()
    // if (error) {
    //     throw new Error(error.message);
    // }
    // return data.user
    const { data, error } = await client.auth.getSession()
    if (error) {
        throw new Error(error.message);
    }
    return data.session?.user
}