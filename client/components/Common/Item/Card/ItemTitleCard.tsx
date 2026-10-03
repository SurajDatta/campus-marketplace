/**
 * ItemTitleCard.tsx
 * Alternative view for the item card, which only displays the title and the price of the item. Used in the buy page to confirm and the buyer confirmation page. TODO: Also implement this in the sell page, if that does not complicate matters further.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import { Item } from '@/types';
import { HStack, VStack, Image, Heading, Text, Box, Skeleton, AspectRatio, GridItem, Grid, Button, ButtonGroup, Badge } from '@chakra-ui/react'
import { IoPeople } from 'react-icons/io5';
import { MdPerson } from 'react-icons/md';
import ItemPrice from '../ItemPrice';

type ItemTitleCardProps = {
    confirmed: boolean;
    negotiable: boolean;
    title: string
    photoUrl: string
    photoSize: { x: number, y: number, w: number, h: number }
    price: number
    newPrice: number
    loading: boolean;
    isMobile: boolean;
    buyer_met: boolean;
    seller_met: boolean;
    buyer_confirmed: boolean;
    onAdjustPriceOpen: () => void;
    buyer: boolean;
}


export default function ItemTitleCard({ negotiable, title, price, photoUrl, photoSize, newPrice, loading, isMobile,
    buyer_met, seller_met, buyer_confirmed, onAdjustPriceOpen, buyer, confirmed
}: ItemTitleCardProps) {

    const calculatePosition = (photoSize: { x: number, y: number, w: number, h: number }) => {
        if (!photoSize || photoSize.w === undefined) {
            return '50% 50%'; // Default to center if no size data is available
        }
        const x = photoSize.w === 100 ? photoSize.x : (photoSize.x / (100 - photoSize.w)) * 100;
        const y = photoSize.h === 100 ? photoSize.y : (photoSize.y / (100 - photoSize.h)) * 100;
        return `${x}% ${y}%`;
    };

    return (
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            <GridItem colSpan={1}>
                <AspectRatio ratio={1}>
                    {!loading ? (
                        <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
                            <Image
                                src={photoUrl}
                                alt={title}
                                boxSize={"100%"}
                                objectFit="cover"
                                objectPosition={calculatePosition(photoSize)}
                            />
                        </Box>
                    ) : <Skeleton borderRadius={"lg"} />}
                </AspectRatio>
            </GridItem>
            <GridItem colSpan={1}>
                <VStack align={"left"}>
                    <Skeleton isLoaded={!loading}>
                        <Heading size="xl" textAlign="left">{title}</Heading>
                    </Skeleton>
                    <Skeleton isLoaded={!loading}>

                        {/* <HStack>
                            {(price != newPrice) && <Text as='s' fontSize="2xl" textAlign="center" color={"green.500"}>${price.toFixed(2)}</Text>}
                            <Text fontSize="4xl" textAlign="center" color={"green.500"}>${newPrice.toFixed(2)}</Text>
                        </HStack> */}
                        <VStack align={"left"} borderWidth="1px" borderRadius="lg" p={4} h={"100%"}>
                            <HStack>
                                <Text as='b'>Listing Price</Text>
                                <Badge colorScheme={negotiable ? "green" : "red"}>{negotiable ? "Negotiable" : "Non-Negotiable"}</Badge>
                            </HStack>
                            <Text fontSize="5xl" textAlign="center" color={"green.500"} as={"b"}>${price.toFixed(2)}</Text>
                            <HStack>
                                <Text as='b'>Final Price</Text>
                            </HStack>
                            <Text as='b'>
                                {loading ? <Skeleton height={50} /> : <Text fontSize="5xl" textAlign="center" color={"green.500"}>${newPrice.toFixed(2)}</Text>}
                            </Text>
                        </VStack>
                    </Skeleton>
                    <Skeleton isLoaded={!loading}>
                        <VStack align={"left"}>
                            {!buyer && buyer_met && seller_met && !confirmed && <Button colorScheme="red" onClick={onAdjustPriceOpen} isDisabled={buyer_confirmed || !negotiable}>Adjust Price</Button>}
                        </VStack>
                    </Skeleton>
                    {/* <ButtonGroup>
                        {handleShowItemStatus && <Skeleton isLoaded={!loading}>
                            <Button colorScheme="blue" onClick={handleShowItemStatus} leftIcon={<IoPeople />}>Meetup Status</Button>
                        </Skeleton>}
                    </ButtonGroup> */}

                </VStack>
            </GridItem>
        </Grid>
    )
}