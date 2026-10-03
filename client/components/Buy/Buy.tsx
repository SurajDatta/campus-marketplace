/**
 * Buy.tsx
 * Buy page that users can look at marketplace. Going to use react query for this to prefetch the data, right now, setting user and userProfile to null.
 * @AshokSaravanan222
 * 09-26-2024
 */
'use client'

import Layout from "@/components/Layout/Layout"
import { Categories, Item, Profile, User } from "@/types";
import useSupabaseBrowser from "@/utils/supabase/supabase-browser";
import { getBuyItems } from "@/utils/queries/get-buy-items";
import { Grid, GridItem, HStack, Icon, Skeleton, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useBreakpoint, useBreakpointValue, VStack } from "@chakra-ui/react";
import ItemsList from "@/components/Common/Item/ItemsList";
import { FaShop } from "react-icons/fa6";
import { FaFileContract, FaHeart } from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import { IconType } from "react-icons";
import { MdEvent, MdPhoneIphone, MdHome, MdLocalMall, MdDirectionsBike, MdBook, MdWeekend, MdSportsEsports, MdBuild } from "react-icons/md";
import { getCategories } from "@/utils/queries/get-categories";
import { getUserProfile } from "@/utils/queries/get-user-profile";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUser } from "@/utils/queries/get-user";
import { getAlerts } from "@/utils/queries/get-alerts";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import BuyContent from "./BuyContent";

type BuyProps = {
    development: boolean;
}

const categoryIcons: { [key: string]: IconType } = {
    "Tickets & Events": MdEvent,
    "Electronics & Gadgets": MdPhoneIphone,
    "Dorm & Apartment Essentials": MdHome,
    "Textbooks & Study Materials": MdBook,
    "Clothing & Accessories": MdLocalMall,
    "Bikes & Transportation": MdDirectionsBike,
    "Books & Media": MdBook,
    "Furniture": MdWeekend,
    "Leisure & Hobbies": MdSportsEsports,
    "Tools & Home Improvement": MdBuild,
    "Housing Leases & Subleases": FaFileContract
};

export default function Buy({ development }: BuyProps) {
    const supabase = useSupabaseBrowser()
    const queryClient = useQueryClient();
    const isMobile = useBreakpointValue({ base: true, md: false }) ?? true;
    const categoryId = 0; // dont know why this issue cannot be fixed!

    const getFavoriteItems = (items: Item[] | null | undefined, userProfile: Profile | null) => {
        return items?.filter((item) => userProfile?.favorites.includes(item.id)) ?? null
    }

    // This useQuery could just as well happen in some deeper
    // child to <Posts>, data will be available immediately either way
    const { data: items, isLoading: loadingItems } = useQuery({
        queryKey: ['items'],
        queryFn: () => getBuyItems(supabase, development)
    })

    const { data: categories, isLoading: loadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => getCategories(supabase)
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



    const renderBuyContent = (items: Item[] | undefined, categories: Categories[] | undefined) => {
        return (
            <Tabs key={categoryId} variant={"solid-rounded"} colorScheme='blue' size={"lg"} defaultIndex={categoryId}>
                <Grid
                    templateColumns="repeat(5, 1fr)"
                    gap={6}
                >
                    <GridItem colSpan={isMobile ? 5 : 1}>
                        <TabList overflowX="auto">
                            <Stack direction={isMobile ? "row" : "column"} width={"100%"}>
                                <Tab key={"all"} width="100%">
                                    <HStack justify="flex-start" width="100%">
                                        <Icon as={FaShop} boxSize={5} />
                                        <Text isTruncated>All</Text>
                                    </HStack>
                                </Tab>
                                <Tab key={"favorites"} width="100%">
                                    <HStack justify="flex-start" width="100%">
                                        <Icon as={FaHeart} boxSize={5} />
                                        <Text isTruncated>Favorites</Text>
                                    </HStack>
                                </Tab>
                                {loadingCategories ? (
                                    [...Array(7).keys()].map((key) => (
                                        <Tab key={key} width="100%">
                                            <Skeleton borderRadius={"lg"} width="100%">
                                                <VStack>
                                                    <Icon as={MdCategory} boxSize={5} />
                                                    <Text>Category</Text>
                                                </VStack>
                                            </Skeleton>
                                        </Tab>
                                    ))
                                ) : (
                                    categories && categories.map((category) => {
                                        return (
                                            <Tab key={category.id}>
                                                <HStack justify="flex-start" width="100%">
                                                    <Icon as={categoryIcons[category.name] || MdCategory} boxSize={5} />
                                                    <Text isTruncated>{category.short}</Text>
                                                </HStack>
                                            </Tab>
                                        );
                                    }))}
                            </Stack>
                        </TabList>
                    </GridItem>

                    <GridItem colSpan={isMobile ? 5 : 4}>
                        <TabPanels>
                            <TabPanel key={"all"}>
                                <ItemsList items={items ?? null} loading={loadingItems || loadingProfile} heading='All Items'
                                    userProfile={userProfile ?? null} filterType='history' isMobile={isMobile} buyCard />
                            </TabPanel>
                            <TabPanel key={"favorites"}>
                                <ItemsList items={getFavoriteItems(items, userProfile ?? null)} loading={loadingItems || loadingProfile} heading='Favorites'
                                    userProfile={userProfile ?? null} filterType='history' isMobile={isMobile} buyCard />
                            </TabPanel>
                            {categories && categories
                                .sort((a, b) => {
                                    if (a.short === "Misc") return 1;
                                    if (b.short === "Misc") return -1;
                                    return 0; // Maintain original order for other categories
                                })
                                .map((category) => {
                                    return (
                                        <TabPanel key={category.id}>
                                            <ItemsList
                                                items={items?.filter((item) => item.categories.includes(category.id)) ?? null}
                                                loading={loadingItems || loadingProfile}
                                                heading={category.name}
                                                filterType='history'
                                                isMobile={isMobile}
                                                userProfile={userProfile ?? null}
                                                buyCard
                                            />
                                        </TabPanel>
                                    );
                                })}
                        </TabPanels>
                    </GridItem>
                </Grid>
            </Tabs>
        )
    }

    useEffect(() => {
        if (items) {
            for (const item of items) {
                queryClient.setQueryData(["item", item.id], item);
            }
        }
    }, [items])

    // return (
    //     <Layout user={user} userProfile={userProfile} alerts={alerts} loadingUser={loadingUser} loadingProfile={loadingProfile} loadingAlerts={loadingAlerts} visitorContent={renderBuyContent(items, categories)}>
    //         {renderBuyContent(items, categories)}
    //     </Layout>
    // )

    return (
        <Layout user={user} userProfile={userProfile} alerts={alerts} loadingUser={loadingUser} loadingProfile={loadingProfile} loadingAlerts={loadingAlerts} visitorContent={<BuyContent items={items} categories={categories} userProfile={userProfile} loadingItems={loadingItems} loadingProfile={loadingProfile} isMobile={isMobile} loadingCategories={loadingCategories} />}>
            <BuyContent items={items} categories={categories} userProfile={userProfile} loadingItems={loadingItems} loadingProfile={loadingProfile} isMobile={isMobile} loadingCategories={loadingCategories} />
        </Layout>
    )
}