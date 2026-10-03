/**
 * app/buy/[id]/page.tsx
 * Item page that allows the buyer to view and purchase the item. 
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import useSupabaseServer from '@/utils/supabase/supabase-server'
import { getUserProfile } from '@/utils/queries/get-user-profile'
import ItemDetailsPage from '@/components/Buy/Item/ItemDetailsPage'
import { createQueryClient } from '@/utils/react-query/queryClient'

export default async function ItemPage({ params }: { params: { sellerId: string, itemId: string } }) {
  const queryClient = createQueryClient();
  const cookieStore = cookies();
  const supabase = useSupabaseServer(cookieStore);
  const development = process.env.NEXT_PUBLIC_ENV === 'development';
  const mapsAPIKey = process.env.GOOGLE_MAPS_API_KEY;
  
  // can prefetch (most of) the seller information.
  await queryClient.prefetchQuery({
    queryKey: ['userProfile', params.sellerId],
    queryFn: () => getUserProfile(supabase, params.sellerId)
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ItemDetailsPage development={development} mapsAPIKey={mapsAPIKey} itemId={params.itemId} sellerId={params.sellerId} />
    </HydrationBoundary>
  );
}