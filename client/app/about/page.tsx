/**
 * app/about/page.tsx 
 * About page for the Marketplace. Contains information about the platform, how it works, and frequently asked questions.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use client"
import React from 'react'
import { Text, Box, Heading, Stack, VStack, Link, HStack } from '@chakra-ui/react'
import { Location } from '@/types';
import Layout from '@/components/Layout/Layout';
import * as NextLink from 'next/link';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import BuyGuide from '@/components/Common/Help/BuyGuide';
import FAQ from '@/components/Home/FAQ';
import Navigation from '@/components/Common/Help/Navigation';
import useSupabaseBrowser from '@/utils/supabase/supabase-browser';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/utils/queries/get-user';
import { getUserProfile } from '@/utils/queries/get-user-profile';
import { getAlerts } from '@/utils/queries/get-alerts';
import { getLocations } from '@/utils/queries/get-locations';
import Image from 'next/image';

type AboutContentProps = {
  locations: Location[]
}

const AboutContent = ({ locations }: AboutContentProps) => {
  return (
    <VStack align={"left"} spacing={8}>
      <VStack align={"left"}>
        <Heading>Our Mission</Heading>
        <Stack spacing={3}>
          <Text>We serve as the trusted intermediary for your payments and meetup arrangements, helping you avoid scams and ensuring smooth, secure transactions. This allows you to focus on what matters most—selling your product or purchasing a sought-after item.</Text>
          <Text>As a payment-first platform, the buyer submits payment before the exchange of goods. This guarantees the buyer's genuine intent to purchase. However, we only finalize the transaction once the item exchange is confirmed, at which point we release the funds to the seller.</Text>
          <Text>Our process ensures that both buyers and sellers can trust Campus Marketplace to handle the payment transfer. Unlike traditional methods, we offer flexibility in payment options. For example, the buyer can pay via Cash App, while the seller can receive the funds directly into their bank account.</Text>
        </Stack>
      </VStack>

      <VStack align={"left"} id='buy' border="1px solid" borderRadius="lg" p={4}>
        <Heading>How to Buy</Heading>
        <Box width={{ base: '100%', md: '50%' }} height={400} overflowY={"auto"}>
          <BuyGuide />
        </Box>
      </VStack>

      <VStack align={"left"} id='sell-details'>
        <Heading>How to Sell</Heading>
        <Box borderWidth={1} borderRadius="lg" p={4}>
          <Text fontSize={"xl"}>What we need from you</Text>
          <Text>In order to sell on our platform, we require that you sign up for a Stripe Connect account. You will need to enter personal information (to verify your identity) and bank information (to receive funds to your bank account). This process should take no longer than 2-5 minutes. Click to learn more about <Link href='https://stripe.com/privacy' isExternal color='teal.500' as={NextLink.default}>
            Stripe <ExternalLinkIcon mx='2px' />
          </Link> and <Link href='https://stripe.com/connect' isExternal color='teal.500' as={NextLink.default}>
              Stripe Connect<ExternalLinkIcon mx='2px' />
            </Link>.</Text>
        </Box>

        <Box borderWidth={1} borderRadius="lg" p={4}>
          <Text fontSize={"xl"}>How it works</Text>
          <Text>Whenever a purchase is made on the platform, funds will be directly transferred to your bank account. Note that we take <b>$1.00</b> out of every transaction as a service fee. Click <Link href='#pricing' color={"teal.500"}>below</Link> for more.</Text>
        </Box>
        <Box borderWidth={1} borderRadius="lg" p={4}>
          <Text fontSize={"xl"}>Manage Account</Text>
          <Text>Your account page will contain all the info to view personal details, payments, and payouts.</Text>
        </Box>
      </VStack>

      <VStack align={"left"} id='faq'>
        <Heading>FAQ</Heading>
        <FAQ />
      </VStack>

      <VStack align={"left"} id='navigation'>
        <Heading>Navigation</Heading>
        <Navigation />
      </VStack>

      <VStack align={"left"} id='credits'>
        <Heading>Credits</Heading>
        <Text>A huge thank you goes to <b>Jessica Wong</b> for designing our bag logo!</Text>
      </VStack>


      <VStack align={"left"} id='pricing'>
        <Heading>Pricing</Heading>
        <Text>We take a <b>$1.00</b> flat fee out of every <b>completed</b> transaction on the platform (that is greater than or equal $2.00). This means that if you are unhappy with the item, the transansaction can be canceled at no cost. Currently, the $1.00 charge is taken from the <b>seller</b>. If negotiable is enabled for a purchase, the maximum price the buyer can pay is whatever the seller has listed (minimum price for an item is $1.00).</Text>
      </VStack>

      <VStack align={"left"} id='blue-light'>
        <Heading>Blue Light Locations</Heading>
        <Text>Here is a list of the current public meetup locations we support. Campus Marketplace is an independent student project and is not affiliated with a university or police department.</Text>
        <Text fontSize={"sm"} opacity={0.5}>{locations.filter((loc) => loc.blue_light === true).length} Locations in Total</Text>
        <VStack align={"left"} height={"400px"} overflowY={"auto"}>
          {locations.filter((loc) => loc.blue_light === true).map((location, index) => (
            <HStack key={index} borderWidth={1} borderRadius="lg" p={4}>
              <Image
                src={location.img_url}
                alt={"Blue Light Location - " + location.name}
                width={50}
                height={50}
              />
              <Box>
                <Text fontSize={"xl"}>{location.name}</Text>
                {/* <Text>Latitude: {location.latitude}</Text>
                <Text>Longitude: {location.longitude}</Text> */}
              </Box>
            </HStack>
          ))}
        </VStack>
      </VStack>

      <VStack align={"left"} id='returns'>
        <Heading>Return Policy</Heading>
        <Text>Currently, we do not accept returns. There is an option to cancel the transaction during the meetup process, but once completed, we are not liable if the buyer is not satisfied with the product and wants to return it later.</Text>
      </VStack>
    </VStack>
  );
};

export default function About() {
  const supabase = useSupabaseBrowser()

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
    queryFn: () => getAlerts(supabase, user!.id),
    enabled: !!user, // This query will only run if `userProfile` is not null
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => getLocations(supabase),
  })

  return (
    <Layout user={user} userProfile={userProfile} alerts={alerts} loadingUser={loadingUser} loadingProfile={loadingProfile} loadingAlerts={loadingAlerts} visitorContent={
      <AboutContent locations={locations ?? []} />
    }>
      <AboutContent locations={locations ?? []} />
    </Layout>
  );
}
