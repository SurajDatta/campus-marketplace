/**
 * Sell.tsx
 * The sell component to be used with react query to show what items they are currently selling.
 * @AshokSaravanan222
 * 09-26-2024
 */
"use client"
import React, { use, useEffect, useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { useToast, Spinner, HStack, Heading, Spacer, Button, Skeleton, ButtonGroup, useBreakpointValue, Text, Link, VStack, Progress, Box, CircularProgress, CircularProgressLabel, Badge, IconButton, Center, Alert, AlertIcon, AlertTitle, AlertDescription, useDisclosure } from '@chakra-ui/react';
import { Item, Profile, Schedule, User } from '@/types';
import { fetchUser } from '@/utils/services/auth';
import { createSellerAccount, fetchUserProfile } from '@/utils/services/account';
import ItemsList from '@/components/Common/Item/ItemsList';
import { fetchSellItems } from '@/utils/services/buy';
import * as NextLink from 'next/link';
import { AddIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { MdPerson } from 'react-icons/md';
import { FaMagic } from 'react-icons/fa';
import { subscribeToProfileUpdates, subscribeToSellItems } from '@/utils/services/realtime';
import useStripeConnect from '@/hooks/useStripeConnect';
import { ConnectAccountOnboarding, ConnectComponentsProvider } from '@stripe/react-connect-js';
import { createOnboardingLink, createStripeAccount, createSubscriptionSession } from '@/utils/services/stripe';
import SubscriptionDrawer from '@/components/Sell/Profile/SubscriptionDrawer';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useSupabaseBrowser from '@/utils/supabase/supabase-browser';
import { getUser } from '@/utils/queries/get-user';
import { getUserProfile } from '@/utils/queries/get-user-profile';
import { getAlerts } from '@/utils/queries/get-alerts';
import { getSellItems } from '@/utils/queries/get-sell-items';
import { getUserSchedules } from '@/utils/queries/get-user-schedules';
import { getTotalTimes } from '@/utils/getTotalTimes';
import {AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay} from '@chakra-ui/react';

type SellPageProps = {
    development: boolean;
};

const SellPage = ({ development }: SellPageProps) => {
    const queryClient = useQueryClient();
    const supabase = useSupabaseBrowser()
    const isMobile = useBreakpointValue({ base: true, md: false }) ?? true;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef(null);

    const toast = useToast();
    const pathname = usePathname();
    const router = useRouter();

    const [sellerStatusLoadingNow, setSellerStatusLoadingNow] = useState<boolean>(false);
    const [sellerStatusLoadingLater, setSellerStatusLoadingLater] = useState<boolean>(false);
    const [subscriptionLoading, setSubscriptionLoading] = useState<boolean>(false);
    const [stripeUrl, setStripeUrl] = useState<string | null>(null);

    const handleSignUp = async (user: User, userProfile: Profile, development: boolean, completeNow: boolean) => {
        if (completeNow) {
            setSellerStatusLoadingNow(true);
        } else {
            setSellerStatusLoadingLater(true);
        }
        try {
            const { accountId, error: stripeError } = await createStripeAccount(userProfile, user, development);
            if (accountId) {
                const { success, error } = await createSellerAccount(userProfile.id, accountId, development)
                if (!success) {
                    throw new Error("Failed to create account: " + error)
                } else {
                    queryClient.invalidateQueries({
                        queryKey: ["userProfile", user.id],
                    })
                    queryClient.invalidateQueries({
                        queryKey: ["user", user.id],
                    })
                    const onboardingLink = await createOnboardingLink(accountId, pathname, true);
                    setStripeUrl(onboardingLink);
                    if (completeNow) {
                        toast({
                            title: 'Seller Account Created.',
                            description: 'We will now redirect you to the page to sign up.',
                            status: 'success',
                            duration: 5000,
                            isClosable: true,
                        });
                        router.push(onboardingLink ?? pathname);
                    } else {
                        toast({
                            title: 'Seller Account Created.',
                            description: 'You can complete the process later.',
                            status: 'success',
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                    return;
                }
            } else {
                throw new Error("Failed to create account: " + stripeError)
            }
        } catch (error: any) {
            toast({
                title: 'Error creating account.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            if (completeNow) {
                setSellerStatusLoadingNow(false);
            } else {
                setSellerStatusLoadingLater(false);
                onClose();
            }
        }
    };

    const handleSubscription = async () => {
        setSubscriptionLoading(true);
        try {
            if (user) {
                const url = await createSubscriptionSession(
                    user,
                    pathname,
                    development
                );
                if (url) {
                    router.push(url);
                } else {
                    throw new Error("Failed to create subscription session.")
                }
            } else {
                throw new Error("User or profile not found.")
            }
        } catch (error: any) {
            toast({
                title: 'Error signing up for subscription.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setSubscriptionLoading(false)
        }
    }


    const { data: user, isLoading: loadingUser } = useQuery({
        queryKey: ["user"],
        queryFn: () => getUser(supabase),
    });

    const { data: items, isLoading: loadingItems } = useQuery({
        queryKey: ["sellItems", user?.id],
        queryFn: () => getSellItems(supabase, user!.id, development),
        enabled: !!user,
    })

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

    useEffect(() => {
        async function fetchStripeUrl(userProfile: Profile) {
            if (development) {
                if (userProfile.test_account_id && !stripeUrl) {
                    const onboardingLink = await createOnboardingLink(userProfile.test_account_id, pathname, true);
                    setStripeUrl(onboardingLink);
                }
            } else {
                if (userProfile.account_id && !stripeUrl) {
                    const onboardingLink = await createOnboardingLink(userProfile.account_id, pathname, true);
                    setStripeUrl(onboardingLink);
                }
            }
        }

        if (userProfile) {
            fetchStripeUrl(userProfile)
        }
    }, [userProfile]);

    const getPercentage = (development: boolean, userProfile: Profile) => {
        return 100 - (((development ? (userProfile.test_account_requirements ? userProfile.test_account_requirements.length : 12) : (userProfile.account_requirements ? userProfile.account_requirements.length : 12)) / 12) * 100)
    }

    const getIneligibleItems = (items: Item[], schedules: Schedule[]): string[] => {
        // get the schedule preferences for the items
        // if any of the schedules are empty with getTotalTimes(), then add the title of the item to the list
        let ineligibleItems: string[] = [];
        items.forEach(item => {
            const seller_schedules = item.schedule_preferences.map(id => schedules.find(schedule => schedule.id === id));
            if (seller_schedules.some(schedule => schedule && getTotalTimes(schedule, new Date()) === 0)) {
                ineligibleItems.push(item.title);
            }
        })
        return ineligibleItems;
    }

    return (
        <Layout
            user={user}
            userProfile={userProfile ?? undefined}
            alerts={alerts}
            loadingUser={loadingUser}
            loadingProfile={loadingProfile}
            loadingAlerts={loadingAlerts}
        >
            <Skeleton isLoaded={!loadingProfile} height={(!loadingProfile) ? "auto" : "100vh"}>
                {(user && userProfile) &&
                    <VStack align={"left"}>
                        {(development ? userProfile.test_account_id : userProfile.account_id) ? (
                            <>
                                {userProfile && getPercentage(development, userProfile) !== 100 && <Box top={2}>
                                    <HStack>
                                        <CircularProgress p={2} value={getPercentage(development, userProfile)} >
                                            <CircularProgressLabel>{getPercentage(development, userProfile).toFixed(0)}%</CircularProgressLabel>
                                        </CircularProgress>
                                        <Alert status='warning'>
                                            <AlertIcon />
                                            <AlertTitle>Your Stripe account is incomplete.</AlertTitle>
                                            <AlertDescription>You cannot recieve payment until you finish the requirements. Click <Link color="teal" href={stripeUrl ?? ""} as={NextLink.default}>here</Link> to continue.</AlertDescription>
                                        </Alert>
                                    </HStack>
                                </Box>}
                                {/* {items && schedules && getIneligibleItems(items, schedules).length !== 0 && <Box position="sticky" top={2}>
                                <Alert status='info'>
                                    <AlertIcon />
                                    <AlertTitle>We have detected that your {getIneligibleItems(items, schedules).length} items are ineligible for purchase!</AlertTitle>
                                    <AlertDescription>There are no meetup times available on the following items: {getIneligibleItems(items, schedules)}</AlertDescription>
                                </Alert>
                            </Box>} */}
                                <ItemsList items={items ?? null} loading={loadingItems || loadingProfile} heading='My Listings' filterType='active' userProfile={userProfile ?? null} isMobile={isMobile} />
                            </>
                        ) : (
                            <VStack align={"left"} spacing={4}>
                                <Text fontSize={{ base: '5xl', md: '7xl' }}>Begin your seller journey on Licks.</Text>
                                <VStack>
                                    <Text fontSize={{ base: 'md', md: '2xl' }} opacity="0.5">
                                        In order to become a seller on our platform, we require that you enter personal information (to verify your identity) and bank information (to receive funds to your bank account). This process should take no more than 5 minutes.
                                    </Text>
                                    <Text fontSize={{ base: 'md', md: '2xl' }} opacity="0.5">
                                        We use <Link href='https://stripe.com/privacy' isExternal color='teal.500'>
                                            Stripe <ExternalLinkIcon mx='2px' />
                                        </Link> for this process, a secure payment provider service. If you want to learn more, you can view our <Link href='/terms' color='teal.500' as={NextLink.default}>Terms & Conditions</Link> and <Link href='/privacy' color='teal.500' as={NextLink.default}>Privacy Policy.</Link> By proceeding, you agree to these terms.
                                    </Text>
                                </VStack>
                                <ButtonGroup>
                                    <Button colorScheme="blue" onClick={() => {
                                        if (user && userProfile) {
                                            handleSignUp(user, userProfile, development, true)
                                        } else {
                                            toast({
                                                title: 'Could not find account.',
                                                description: 'Please login or sign up to continue.',
                                                status: 'info',
                                                duration: 5000,
                                                isClosable: true,
                                            });
                                        }
                                    }
                                    } isLoading={sellerStatusLoadingNow}>Complete Requirements</Button>
                                    <Button colorScheme="blue" onClick={onOpen} variant={'outline'}>Complete Later</Button>
                                </ButtonGroup>
                            </VStack>
                        )}
                    </VStack>}
            </Skeleton >
            {/* <VStack align={"left"}
                position="fixed"
                bottom={4}
                left={4}
            >
                {(development ? userProfile.test_customer_id : userProfile.customer_id) ? <Badge colorScheme={"green"} as={NextLink.default} href={`${window.location.origin}/account?tab=sell`}>Verified Seller</Badge> : <SubscriptionDrawer handleSellerSubscription={handleSubscription} submitLoading={subscriptionLoading} />}
                <Button
          as={NextLink.default}
          href={"/sell/preferences"}
          leftIcon={<FaMagic />}
          colorScheme='blue'
          isLoading={!(userProfile && user)}
          pointerEvents={userProfile ? (development ? userProfile.test_account_id : userProfile.account_id) ? "auto" : "none" : "none"}
          isDisabled={userProfile ? (development ? userProfile.test_account_id : userProfile.account_id) ? false : true : true}
        >
          Preferences
        </Button>

            </VStack> */}
            {/* {isMobile ? <IconButton
                  aria-label="Create Listing"
                  icon={<AddIcon />}
                  position="fixed"
                  bottom={4}
                  right={4}
                  colorScheme="blue"
                  as={NextLink.default}
                  href={"/sell/listing"}
                /> :
                  } */}
            {/* <Button
                as={NextLink.default}
                href={"/sell/listing"}
                leftIcon={<AddIcon />}
                position="fixed"
                bottom={4}
                left={4}
                right={4}
                colorScheme="blue"
                isLoading={!(userProfile && user)}
                pointerEvents={
                    userProfile
                        ? development
                            ? userProfile.test_account_id
                                ? "auto"
                                : "none"
                            : userProfile.account_id
                                ? "auto"
                                : "none"
                        : "none"
                }
                isDisabled={
                    userProfile
                        ? development
                            ? userProfile.test_account_id
                                ? false
                                : true
                            : userProfile.account_id
                                ? false
                                : true
                        : true
                }
            >
                {
                    userProfile
                        ? development
                            ? userProfile.test_account_id
                                ? "Create Listing"
                                : "Sign up to create a listing"
                            : userProfile.account_id
                                ? "Create Listing"
                                : "Sign up to create a listing"
                        : "Sign up to create a listing"
                }
            </Button> */}
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            Complete Requirements Later
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Licks will hold all of your sales until you complete the requirements to add payment details. Do you acknowledge this and wish to proceed?
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <HStack>
                                <Button ref={cancelRef} onClick={onClose}>
                                    Close
                                </Button>
                                <Button
                                    colorScheme={'blue'}
                                    isLoading={sellerStatusLoadingLater}
                                    onClick={() => {
                                        if (user && userProfile) {
                                            handleSignUp(user, userProfile, development, false)
                                        } else {
                                            toast({
                                                title: 'Could not find account.',
                                                description: 'Please login or sign up to continue.',
                                                status: 'info',
                                                duration: 5000,
                                                isClosable: true,
                                            });
                                        }
                                    }}
                                >
                                    Acknowlege
                                </Button>
                            </HStack>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Layout >
    );
};

export default SellPage;

