/**
 * BuyGuide.tsx
 * Component that shows how to buy an item, either with quick or scheudled meet.
 * @AshokSaravanan222
 * 09-24-2024
 */

import { AspectRatio, Divider, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";

export default function BuyGuide() {
    return (
        <VStack align={"left"}>
            <Text as="b">Purchase Walkthrough</Text>
            <AspectRatio ratio={16 / 9}>
                <iframe
                    src="https://player.vimeo.com/video/1154510950?badge=0&autopause=0&player_id=0&app_id=58479&title=0&portrait=0&byline=0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                    title="Licks Purchase"
                    width="640"
                    height="360"
                    allowFullScreen
                ></iframe>
            </AspectRatio>

            <Divider />
            <Text as={"b"}>Instructions</Text>
            <Text>1. Select an item from the Buy page</Text>
            <AspectRatio ratio={16 / 9}>
                <Image
                    src={"/images/help/new/buy1.png"}
                    alt={"Buy college items marketplace, shoes, clothes, electronics, furniture, textbooks"}
                    width={200}
                    height={200}
                />
            </AspectRatio>
            <Text>2. Schedule a Meetup</Text>
            <VStack align={"left"}>
                <Text>A. Choose desired meetup times</Text>
                <AspectRatio ratio={16 / 9}>
                    <Image
                        src={"/images/help/new/buy2A.png"}
                        alt={"Select meetup times for scheduled meetup, easy with Google Calendar and college busy classes"}
                        width={200}
                        height={200}
                    />
                </AspectRatio>

                <Text>B. Make payment for the item</Text>
                <AspectRatio ratio={16 / 9}>
                    <Image
                        src={"/images/help/new/buy2B.png"}
                        alt={"Make payment on Stripe for item with scheduled meetup"}
                        width={200}
                        height={200}
                    />
                </AspectRatio>

                <Text>C. Wait for the seller to confirm the meetup</Text>
                <AspectRatio ratio={16 / 9}>
                    <Image
                        src={"/images/help/new/buy2C.png"}
                        alt={"Wait for seller to confirm meetup for scheduled meetup, with Google Calendar, and ETS (blue light poles) from police"}
                        width={200}
                        height={200}
                    />
                </AspectRatio>
            </VStack>
            <Text>3. Check-in to the meetup</Text>
            <AspectRatio ratio={16 / 9}>
                <Image
                    src={"/images/help/new/buy3.png"}
                    alt={"Check-in to meetup with seller, buyer, and share location with Google Maps, add to Google, Apple, or Outlook Calendar"}
                    width={200}
                    height={200}
                />
            </AspectRatio>

            <Text>4. Inspect quality and negotiate price if available</Text>
            <AspectRatio ratio={16 / 9}>
                <Image
                    src={"/images/help/new/buy4.png"}
                    alt={"Inspect quailty of item, and negotiate price, unlike Facebook Marketplace, Craigslist, eBay, or OfferUp"}
                    width={200}
                    height={200}
                />
            </AspectRatio>

            <Text>5. Confirm purchase</Text>
            <AspectRatio ratio={16 / 9}>
                <Image
                    src={"/images/help/new/buy5.png"}
                    alt={"Confirm purchase of item using 2 way verification, unlike Facebook Marketplace, Craigslist, eBay, or OfferUp"}
                    width={200}
                    height={200}
                />
            </AspectRatio>
        </VStack>
    )
}