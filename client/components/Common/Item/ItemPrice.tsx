/**
 * ItemPhotoModal.tsx
 * Component to be used to show the discounted price of the item.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-31
 *
 *
 */

import { HStack, Text } from "@chakra-ui/react";
type ItemPriceProps = {
    listingPrice: number | null;
    price: number | null;
    size: string
    truncate?: boolean
    isMobile: boolean
}


export default function ItemPrice({ listingPrice, price, size, truncate, isMobile }: ItemPriceProps) {

    const numChar = (price?.toString().length ?? 0) + (listingPrice?.toString().length ?? 0)

    const originalPriceSize = (size === "small" ? "md" : "lg")
    const listingPriceSize = (size === "small" ? "md" : "2xl") 

    return (
        <HStack>
            {(Number(listingPrice) > Number(price)) && (numChar <= 6 || !truncate) &&  <Text as='s' fontSize={originalPriceSize} textAlign="center" color={"green.500"} fontWeight="bold">${(listingPrice ?? 0).toFixed(2)}</Text>}
            <Text fontSize={listingPriceSize} textAlign="center" color={"green.500"} fontWeight="bold">${(price ?? 0).toFixed(2)}</Text>
        </HStack>
    );
}