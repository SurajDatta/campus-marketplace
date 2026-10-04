/**
 * SellGuide.tsx
 * Component that shows how to sell an item, from the process of signing up with stripe to creating/editing a listing.
 * @AshokSaravanan222
 * 09-24-2024
 */

import { AspectRatio, Divider, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";

export default function SellGuide() {
    return (
        <VStack align={"left"}>
            <Text as="b">Seller Signup (Full)</Text>
            <AspectRatio ratio={16 / 9}>
                <iframe
                    src="https://player.vimeo.com/video/1154510960?badge=0&autopause=0&player_id=0&app_id=58479&title=0&portrait=0&byline=0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                    title="Licks Seller Signup"
                    width="640"
                    height="360"
                    allowFullScreen
                ></iframe>
            </AspectRatio>
            <Divider />
            <Text as={"b"}>Instructions</Text>
            <Text>1. Navigate to the sell page</Text>
            <AspectRatio ratio={16 / 9}>
                <Image
                    src={"/images/help/sell1.png"}
                    alt={"Navigate to sell page to sign up with Stripe Connect, and sell items on marketplace"}
                    width={200}
                    height={200}
                />
            </AspectRatio>

            <Text>2. Create Stripe Account</Text>
            <AspectRatio ratio={16 / 9}>
                <Image
                    src={"/images/help/sell2.png"}
                    alt={"Create Stripe account to sell items on marketplace, and get paid directly to bank account, enter bank details, personal information"}
                    width={200}
                    height={200}
                />
            </AspectRatio>

            <Text>3. Add General Preferences</Text>
            <AspectRatio ratio={16 / 9}>
                <Image
                    src={"/images/help/sell3.png"}
                    alt={"Add general preferences to sell items on marketplace, like preferred meetup locations, and contact details, use Google Calendar, and ETS (blue light poles) from police"}
                    width={200}
                    height={200}
                />
            </AspectRatio>

            <Text>4. Create a listing</Text>
            <AspectRatio ratio={16 / 9}>
                <Image
                    src={"/images/help/sell4.png"}
                    alt={"Create listing to sell items on marketplace, use generative AI Autofill, Google Calendar Linking, and Blue Light Locations"}
                    width={200}
                    height={200}
                />
            </AspectRatio>

            <Text>5. Edit listing for fine-grained details</Text>
            <AspectRatio ratio={16 / 9}>
                <Image
                    src={"/images/help/sell5.png"}
                    alt={"Edit listing for fine-grained details, like title, description, price, and images, similar to Facebook Marketplace, Craigslist, eBay, or OfferUp"}
                    width={200}
                    height={200}
                />
            </AspectRatio>
        </VStack>
    )
}