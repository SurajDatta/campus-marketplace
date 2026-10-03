/**
 * MeetupCard.tsx
 * Component to show each individual meetup, very similar to the ItemCard component.
 * @AshokSaravanan222
 * 10-08-2024
 */
import React, { useEffect, useState } from 'react';
import {
    Box,
    Image,
    Text,
    Badge,
    Circle,
    HStack,
    VStack,
    Skeleton,
    Grid,
    GridItem,
    AspectRatio,
    Stack,
    IconButton,
    Flex,
    Icon,
    Tooltip,
    Spinner,
} from '@chakra-ui/react';
import { AddIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, EditIcon, ExternalLinkIcon, WarningIcon } from '@chakra-ui/icons';
import { Item, Meetup, MeetupStatus, Profile } from '@/types';
import { Link } from '@chakra-ui/react';
import * as NextLink from 'next/link';
import { motion } from 'framer-motion';
import { FaCamera, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useSwipeable } from 'react-swipeable';
import ItemPrice from '../Item/ItemPrice';


type MeetupCardProps = {
    key: string;
    meetup: Meetup | null;
    viewMode: 'grid' | 'list';
    linkTo: string;
    variants: any;
    loading: boolean;
    isMobile: boolean;
};

const MotionBox = motion(Box);
const MotionImage = motion(Image);
const MotionGridItem = motion(GridItem);
const MotionAspectRatio = motion(AspectRatio);
const MotionVStack = motion(VStack);

const ItemCard = ({ linkTo, viewMode, variants, loading, isMobile, meetup }: MeetupCardProps) => {
    const [isClicking, setIsClicking] = React.useState(false);

    const calculatePosition = (photoSize: { x: number, y: number, w: number, h: number }) => {
        if (!photoSize || photoSize.w === undefined) {
            return '50% 50%'; // Default to center if no size data is available
        }
        const x = photoSize.w === 100 ? photoSize.x : (photoSize.x / (100 - photoSize.w)) * 100;
        const y = photoSize.h === 100 ? photoSize.y : (photoSize.y / (100 - photoSize.h)) * 100;
        return `${x}% ${y}%`;
    };

    const color = (meetup: Meetup | null) => {
        switch (meetup?.status) {
            case "pending":
                return "orange"
            case "meeting":
                return "blue";
            case "confirmed":
                return "yellow"
            case "complete":
                return "green"
            case "canceled":
                return "red"
            default:
                return "gray";
        }
    }

    const renderBadge = (meetup: Meetup | null) => {
        return (
            <Box
                position="absolute"
                bottom={2}
                right={2}
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
            >
                <Badge colorScheme={color(meetup)} borderRadius="full" px={2} py={1} mb={1}>
                    <Box
                        as="span"
                        bg={color(meetup)}
                        borderRadius="full"
                        boxSize={2}
                        display="inline-block"
                        mr={1}
                    />
                    {meetup ? meetup.status : "status"}
                </Badge>
            </Box>
        );
    };

    const GridContent = ({ meetup, meetupLoading }: { meetup: Meetup | null, meetupLoading: boolean }) => {
        const [isHovered, setIsHovered] = useState(isMobile);
        const [currentIndex, setCurrentIndex] = useState(0);

        const handlePrev = () => {
            if (meetup === null) return;
            setCurrentIndex((prevIndex) => (prevIndex === 0 ? meetup.item_photo_urls.length - 1 : prevIndex - 1));
        };

        const handleNext = () => {
            if (meetup === null) return;
            setCurrentIndex((prevIndex) => (prevIndex === meetup.item_photo_urls.length - 1 ? 0 : prevIndex + 1));
        };

        const handlers = useSwipeable({
            onSwipedLeft: () => handleNext(),
            onSwipedRight: () => handlePrev(),
        });

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') {
                handlePrev();
            } else if (event.key === 'ArrowRight') {
                handleNext();
            }
        };

        useEffect(() => {
            if (isHovered) {
                window.addEventListener('keydown', handleKeyDown);
            } else {
                window.removeEventListener('keydown', handleKeyDown);
            }

            // Cleanup event listener on component unmount
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            };
        }, [isHovered]);

        return (
            <MotionVStack
                align={"left"}
                spacing={1}
                position="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <MotionAspectRatio
                    ratio={1}
                    layout
                    variants={variants}
                    whileHover={{ scale: 1.05 }} // Scale up slightly on hover
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    {meetup ? (
                        <MotionBox borderWidth="1px" borderRadius="lg" overflow="hidden" position="relative">
                            {renderBadge(meetup)}
                            {meetupLoading ? <Spinner /> : <MotionImage
                                {...handlers}
                                src={meetup.item_photo_urls ? meetup.item_photo_urls[currentIndex] : process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/photos/default.webp"}
                                alt={meetup.item_title + ": " + meetup.item_description}
                                boxSize={"100%"}
                                objectFit="cover"
                                objectPosition={calculatePosition(meetup.item_photo_sizes[0] as { x: number, y: number, w: number, h: number })}
                                layout
                                onClick={(e) => {
                                    setIsClicking(true);
                                }
                                }
                            />}
                            {/* Conditionally render the dots when hovered */}
                            {isHovered && (
                                <>
                                    {isMobile === false && <><IconButton
                                        aria-label="Previous Image"
                                        icon={<ChevronLeftIcon color={"#ceb888"} boxSize={8} stroke="black" strokeWidth="0.3" />}
                                        background={"transparent"}
                                        size="sm"
                                        position="absolute"
                                        left="5px"
                                        top="50%"
                                        transform="translateY(-50%)"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePrev();
                                        }}
                                        zIndex={1}
                                    />

                                        <IconButton
                                            aria-label="Next Image"
                                            icon={<ChevronRightIcon color={"#ceb888"} boxSize={8} stroke="black" strokeWidth="0.3" />}
                                            background={"transparent"}
                                            size="sm"
                                            position="absolute"
                                            right="5px"
                                            top="50%"
                                            transform="translateY(-50%)"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleNext();
                                            }}
                                            zIndex={1}
                                        /></>}
                                    <Flex position="absolute" bottom="10px" width="100%" justifyContent="center">
                                        {meetup.item_photo_urls.map((_, index) => (
                                            <Box
                                                key={index}
                                                width="8px"
                                                height="8px"
                                                borderRadius="50%"
                                                backgroundColor={currentIndex === index ? "#ceb888" : "transparent"}
                                                border="1px solid black" // Black outline
                                                borderColor="black" // Inner border color
                                                mx="4px"
                                            />
                                        ))}
                                    </Flex>
                                </>
                            )}
                        </MotionBox>
                    ) : (
                        <Skeleton borderRadius={"lg"} />
                    )}
                </MotionAspectRatio>
                <Skeleton isLoaded={!loading} borderRadius={"lg"}>
                    <Stack direction={"column"}>
                        <Text fontWeight="bold" fontSize="lg" isTruncated={!isMobile} noOfLines={isMobile ? 2 : 0}>
                            {meetup ? meetup.item_title : "Title"}
                        </Text>
                    </Stack>
                </Skeleton>
                <Skeleton isLoaded={!loading} borderRadius={"lg"}>
                    <ItemPrice price={meetup ? meetup.meetup_price : 0} listingPrice={meetup ? meetup.item_price : 0} size="small" isMobile={isMobile} />
                </Skeleton>
            </MotionVStack>
        );
    };


    const ListContent = ({ meetup, meetupLoading }: { meetup: Meetup | null, meetupLoading: boolean }) => {
        return isMobile ? (
            <MotionBox borderWidth={1} borderRadius={"lg"} p={2} position="relative">
                <VStack align={"left"}>
                    <MotionAspectRatio ratio={1}>
                        {meetup ? (
                            <MotionBox borderWidth="1px" borderRadius="lg" overflow="hidden" position="relative">
                                {renderBadge(meetup)}
                                {meetupLoading ? <Spinner /> : <MotionImage
                                    src={meetup ? meetup.item_photo_urls[0] : process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/photos/default.webp"}
                                    alt={meetup.item_title + ": " + meetup.item_description}
                                    boxSize={"100%"}
                                    objectFit="cover"
                                    objectPosition={calculatePosition(meetup.item_photo_sizes[0] as { x: number, y: number, w: number, h: number })}
                                    layout
                                    onClick={(e) => {
                                        setIsClicking(true);
                                    }}
                                />}
                            </MotionBox>
                        ) : (
                            <Skeleton borderRadius={"lg"} />
                        )}
                    </MotionAspectRatio>
                    <Skeleton isLoaded={!loading}>
                        <Text fontWeight="bold" fontSize="xl" mb={2} noOfLines={2}>
                            {meetup ? meetup.item_title : "Title"}
                        </Text>
                    </Skeleton>
                    <Skeleton isLoaded={!loading}>
                        <Text color="gray.600" mb={2}>
                            {meetup ? meetup.item_condition : "Condition"}
                        </Text>
                    </Skeleton>
                    <Skeleton isLoaded={!loading}>
                        <ItemPrice price={meetup ? meetup.meetup_price : 0} listingPrice={meetup ? meetup.item_price : 0} size="" isMobile={isMobile} />
                    </Skeleton>
                    <Skeleton isLoaded={!loading}>
                        <Text noOfLines={2}>
                            {meetup ? meetup.item_description : "Description"}
                        </Text>
                    </Skeleton>
                </VStack>
            </MotionBox>
        ) : (
            <Grid
                templateColumns="repeat(5, 1fr)"
                gap={4}
                w={"100%"}
                borderWidth={1}
                borderRadius={"lg"}
                position="relative"
            >
                <MotionGridItem layout colSpan={{ sm: 3, md: 2, xl: 1 }}>
                    <MotionAspectRatio ratio={1}>
                        {meetup ? (
                            <MotionBox borderWidth="1px" borderRadius="lg" overflow="hidden" position="relative">
                                {renderBadge(meetup)}
                                {meetupLoading ? <Spinner /> : <MotionImage
                                    src={meetup ? meetup.item_photo_urls[0] : process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/photos/default.webp"}
                                    alt={meetup.item_title + ": " + meetup.item_description}
                                    boxSize={"100%"}
                                    objectFit="cover"
                                    objectPosition={calculatePosition(meetup.item_photo_sizes[0] as { x: number, y: number, w: number, h: number })}
                                    layout
                                    onClick={(e) => {
                                        setIsClicking(true);
                                    }}
                                />}
                            </MotionBox>
                        ) : (
                            <Skeleton borderRadius={"lg"} />
                        )}
                    </MotionAspectRatio>
                </MotionGridItem>
                <MotionGridItem layout colSpan={{ sm: 2, md: 3, xl: 4 }} p={4}>
                    <VStack align={"left"}>
                        <Skeleton isLoaded={!loading}>
                            <Text fontWeight="bold" fontSize="xl" mb={2} noOfLines={2}>
                                {meetup ? meetup.item_title : "Title"}
                            </Text>
                        </Skeleton>
                        <Skeleton isLoaded={!loading}>
                            <Text color="gray.600" mb={2}>
                                {meetup ? meetup.item_condition : "Condition"}
                            </Text>
                        </Skeleton>
                        <Skeleton isLoaded={!loading}>
                            <ItemPrice price={meetup ? meetup.meetup_price : 0} listingPrice={meetup ? meetup.item_price : 0} size="" isMobile={isMobile} />
                        </Skeleton>
                        <Skeleton isLoaded={!loading}>
                            <Text noOfLines={2}>
                                {meetup ? meetup.item_description : "Description"}
                            </Text>
                        </Skeleton>
                    </VStack>
                </MotionGridItem>
            </Grid>
        );
    };

    return (
        <MotionBox
            cursor="pointer"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            position="relative"
            p={4}
            w={"100%"}
            layout
        >
            {(linkTo) ? <Link href={linkTo} as={NextLink.default} style={{ textDecoration: "none" }}>
                {viewMode === 'grid' ? <GridContent meetup={meetup} meetupLoading={isClicking} /> : <ListContent meetup={meetup} meetupLoading={isClicking} />}
            </Link> : <>{viewMode === 'grid' ? <GridContent meetup={meetup} meetupLoading={isClicking} /> : <ListContent meetup={meetup} meetupLoading={isClicking} />}</>}
        </MotionBox>
    );
};

export default ItemCard;
