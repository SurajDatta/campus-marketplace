import { TypedSupabaseClient } from "@/types";


export async function getBuyItems(client: TypedSupabaseClient, development: boolean) {
    const {data, error} = await client
        .from('items')
        .select('*')
        .eq('active', true)
        .eq('deleted', false)
        .eq('live', !development)
        .order('created_at', {ascending: false});
    if (error) {
        throw new Error(error.message);
    }
    return data;
}

// export async function fetchBuyItems(client: TypedSupabaseClient, development: boolean) {
//     const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/items`;

//     // Build the query string
//     const query = new URLSearchParams({
//         select: '*',
//         active: 'eq.true',
//         live: `eq.${!development}`,
//         status: 'eq.available',
//     });

//     const headers = {
//         'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
//         'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
//         'Content-Type': 'application/json',
//     };

//     // Fetch data using fetch API
//     const response = await fetch(`${url}?${query.toString()}`, {
//         method: 'GET',
//         headers: headers,
//     });

//     if (!response.ok) {
//         throw new Error('Failed to fetch buy items');
//     }

//     const data = await response.json();
//     return data;
// }
