/**
 * ItemInfo.tsx
 * Component that allows the user to open both the item status and the meetup details.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React from "react";
import { Text, Box, Heading, Button, HStack, Flex, Spacer, VStack, Grid, GridItem, Skeleton, Divider, Center } from "@chakra-ui/react";
import { Item, Meetup } from "@/types";
import ItemTitleCard from "@/components/Common/Item/Card/ItemTitleCard";

type ItemInfoProps = {
    meetup: Meetup | null;
    heading: string | null;
    description: string | null;
    actionContent: React.ReactNode;
    onAdjustPriceOpen: () => void;
    isMobile: boolean;
    buyer: boolean;
}

export default function ItemInfo({ actionContent, onAdjustPriceOpen, meetup, isMobile, buyer }: ItemInfoProps) {
    return (
        <VStack align={"left"}>
            {isMobile ?
                <VStack align={"left"} height={"100%"}>
                    <ItemTitleCard price={meetup ? meetup.item_price : 0} title={meetup ? meetup.item_title : "Title"} photoUrl={meetup ? meetup.item_photo_urls[0] : process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/photos/default.webp?t=2024-07-15T15%3A34%3A24.088Z"} photoSize={meetup ? meetup.item_photo_sizes[0] as { x: number, y: number, w: number, h: number } : { x: 0, y: 0, w: 100, h: 100 }} newPrice={meetup?.meetup_price ?? 0} loading={meetup == null} isMobile={true} negotiable={meetup ? meetup.item_negotiable : false} buyer={buyer} buyer_confirmed={meetup ? meetup.buyer_confirmed : false} buyer_met={meetup ? meetup.buyer_met : false} seller_met={meetup ? meetup.seller_met : false} onAdjustPriceOpen={onAdjustPriceOpen} confirmed={meetup ? meetup.status === "confirmed" || meetup.status === "canceled" || meetup.status === "complete" : false} />
                    <Divider />
                    {actionContent}
                </VStack> :
                <>
                    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                        <GridItem colSpan={1}>
                            <VStack align={"left"} height={"100%"}>
                                <ItemTitleCard price={meetup ? meetup.item_price : 0} title={meetup ? meetup.item_title : "Title"} photoUrl={meetup ? meetup.item_photo_urls[0] : process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/photos/default.webp?t=2024-07-15T15%3A34%3A24.088Z"} photoSize={meetup ? meetup.item_photo_sizes[0] as { x: number, y: number, w: number, h: number } : { x: 0, y: 0, w: 100, h: 100 }} newPrice={meetup?.meetup_price ?? 0} loading={meetup == null} isMobile={true} negotiable={meetup ? meetup.item_negotiable : false} buyer={buyer} buyer_confirmed={meetup ? meetup.buyer_confirmed : false} buyer_met={meetup ? meetup.buyer_met : false} seller_met={meetup ? meetup.seller_met : false} onAdjustPriceOpen={onAdjustPriceOpen} confirmed={meetup ? meetup.status === "confirmed" || meetup.status === "canceled" || meetup.status === "complete" : false} />
                            </VStack>
                        </GridItem>
                        <GridItem colSpan={1}>
                            {actionContent}
                        </GridItem>
                    </Grid >
                </>
            }

        </VStack>

    );
}