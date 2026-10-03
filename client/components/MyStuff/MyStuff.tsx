/**
 * MyStuff.tsx
 * Will be used with react query to get the data about the user's current pending/meeting/bought/sold items.
 * @AshokSaravanan222
 * 09-26-2024
 */
"use client"
import React from 'react';
import { useBreakpointValue } from '@chakra-ui/react';
import Layout from '@/components/Layout/Layout';
import ItemsList from '@/components/Common/Item/ItemsList';
import useSupabaseBrowser from '@/utils/supabase/supabase-browser';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/utils/queries/get-user';
import { getUserProfile } from '@/utils/queries/get-user-profile';
import { getAlerts } from '@/utils/queries/get-alerts';
import { getMeetups } from '@/utils/queries/get-meetups';
import MeetupList from '../Common/Meetup/MeetupList';

type MyStuffPageProps = {
  development: boolean;
}

export default function MyStuffPage({ development }: MyStuffPageProps) {
  const supabase = useSupabaseBrowser()
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? true;

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

  const { data: meetups, isLoading: loadingMeetups } = useQuery({
    queryKey: ['meetups', user?.id],
    queryFn: () => getMeetups(supabase, user!.id, development),
    enabled: !!user, // This query will only run if `user` is not null
  })

  // Step 3: Fetch alerts, only if userProfile exists
  const { data: alerts, isLoading: loadingAlerts } = useQuery({
    queryKey: ["alerts", user?.id],
    queryFn: () => getAlerts(supabase, userProfile!.id),
    enabled: !!user, // This query will only run if `userProfile` is not null
  });

  return (
    <Layout
      user={user}
      userProfile={userProfile}
      alerts={alerts}
      loadingUser={loadingUser}
      loadingProfile={loadingProfile}
      loadingAlerts={loadingAlerts}
    >
      <MeetupList meetups={meetups ?? null} loading={loadingMeetups || loadingProfile} heading='My Stuff' userProfile={userProfile ?? null} isMobile={isMobile} />
      {/* <MeetupList meetups={meetups && userProfile ? meetups.filter((meetup) => meetup.buyer_id === userProfile.id) : null} loading={loadingMeetups || loadingProfile} heading='Purchases' userProfile={userProfile ?? null} isMobile={isMobile} />
      <MeetupList meetups={meetups && userProfile ? meetups.filter((meetup) => meetup.seller_id === userProfile.id) : null} loading={loadingMeetups || loadingProfile} heading='Sales' userProfile={userProfile ?? null} isMobile={isMobile} /> */}

    </Layout>
  );
}
