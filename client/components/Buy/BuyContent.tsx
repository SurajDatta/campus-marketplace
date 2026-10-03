/**
 * BuyContent.tsx
 * This will be used to get the cateogry to start off with, since useSearchParams will not work on native page.
 * @AshokSaravanan222
 * 09-26-2024
 */

import { Categories, Item, Profile } from "@/types";
import { Grid, GridItem, HStack, Icon, Skeleton, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, VStack } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { IconType } from "react-icons";
import { FaFileContract, FaHeart } from "react-icons/fa";
import { FaShop } from "react-icons/fa6";
import { MdCategory } from "react-icons/md";
import { MdEvent, MdPhoneIphone, MdHome, MdLocalMall, MdDirectionsBike, MdBook, MdWeekend, MdSportsEsports, MdBuild } from "react-icons/md";
import ItemsList from "../Common/Item/ItemsList";

type BuyContentProps = {
    categories: Categories[] | undefined;
    items: Item[] | undefined;
    loadingCategories: boolean;
    loadingItems: boolean;
    loadingProfile: boolean;
    userProfile: Profile | undefined
    isMobile: boolean;
};

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

export default function BuyContent({ categories, items, loadingCategories, loadingItems, loadingProfile, userProfile, isMobile }: BuyContentProps) {
    const categoryId = useSearchParams().get("category") ? parseInt(useSearchParams().get("category") as string) : 0;

    const getFavoriteItems = (items: Item[] | null | undefined, userProfile: Profile | null) => {
        return items?.filter((item) => userProfile?.favorites.includes(item.id)) ?? null
    }

    return (
        <Tabs variant={"solid-rounded"} colorScheme='blue' size={"lg"} defaultIndex={categoryId}>
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
                                    <Skeleton borderRadius={"lg"} width="100%">
                                        <Tab key={key} width="100%">
                                            <VStack>
                                                <Icon as={MdCategory} boxSize={5} />
                                                <Text>Category</Text>
                                            </VStack>
                                        </Tab>
                                    </Skeleton>
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