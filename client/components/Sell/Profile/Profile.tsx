/**
 * Profile.tsx
 * Used for the sell page for people to view the profile of the seller. It will show the seller's profile and the items they have listed for sale. Will use react query to speed up times.
 * @AshokSaravanan222
 * 09-26-2024
 */
"use client"
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { useToast, Spinner, useBreakpointValue } from '@chakra-ui/react';
import { Item, Profile, User } from '@/types';
import { usePathname } from 'next/navigation';
import ItemsList from '@/components/Common/Item/ItemsList';
import useSupabaseBrowser from '@/utils/supabase/supabase-browser';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/utils/queries/get-user-profile';
import { getUser } from '@/utils/queries/get-user';
import { getAlerts } from '@/utils/queries/get-alerts';
import { getSellItems } from '@/utils/queries/get-sell-items';

type SellProfilePageProps = {
    sellerId: string;
    development: boolean;
}

const SellProfilePage = ({ development, sellerId }: SellProfilePageProps) => {
    const supabase = useSupabaseBrowser()
    const isMobile = useBreakpointValue({ base: true, md: false }) ?? true;
    const pathname = usePathname();
    const [displayPathname, setDisplayPathname] = useState<string>('');


    // will be using prefetched seller profile
    const { data: sellerProfile, isLoading: loadingSellerProfile } = useQuery({
        queryKey: ['userProfile', sellerId],
        queryFn: () => getUserProfile(supabase, sellerId),
    })

    const {data: items, isLoading: loadingItems } = useQuery({
        queryKey: ['sellItems', sellerId],
        queryFn: () => getSellItems(supabase, sellerId, development),
    })


    const { data: user, isLoading: loadingUser } = useQuery({
        queryKey: ["user"],
        queryFn: () => getUser(supabase),
    });

    // Step 2: Fetch user profile, only if user exists
    const { data: userProfile, isLoading: loadingProfile } = useQuery({
        queryKey: ["userProfile", user?.id],
        queryFn: () => getUserProfile(supabase, user!.id),
        enabled: !!user, // This query will only run if `user` is not null
    });

    // Step 3: Fetch alerts, only if userProfile exists
    const { data: alerts, isLoading: loadingAlerts } = useQuery({
        queryKey: ["alerts", user?.id],
        queryFn: () => getAlerts(supabase, userProfile!.id),
        enabled: !!user, // This query will only run if `userProfile` is not null
    });

    useEffect(() => {
        if (sellerProfile) {
            var paths = pathname.split('/');
            for (let i = 0; i < paths.length; i++) {
                if (paths[i] === sellerId) {
                    paths[i] = sellerProfile.first_name + ' ' + sellerProfile.last_name;
                }
            }
            setDisplayPathname(paths.join('/'));
        }
    }, [sellerProfile])

    const renderProfile = () => {
        return (
            <ItemsList items={items?.filter((item) => item.active === true) ?? null} loading={loadingItems || loadingProfile} heading={sellerProfile?.first_name + " " + sellerProfile?.last_name + "'s Listings"} userProfile={userProfile ?? null} filterType='history' isMobile={isMobile} />
        )
    }

    return (
        <Layout
            user={user}
            userProfile={userProfile}
            alerts={alerts}
            loadingUser={loadingUser}
            loadingProfile={loadingProfile}
            loadingAlerts={loadingAlerts}
            loadingPathName={loadingSellerProfile}
            displayPathName={displayPathname}
            visitorContent={renderProfile()}>
            {renderProfile()}
        </Layout>
    );
};


export default SellProfilePage;

