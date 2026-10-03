/**
 * ItemCard.tsx
 * Component that is used to display the details of an item, on the buy page. Has 2 different views, list and grid view which can be toggled on the ItemsList.tsx component to switch the view type.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React, { useEffect, useState } from 'react';
import {
    Box,
    Image,
    Text,
    Badge,
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
    Spacer,
} from '@chakra-ui/react';
import { AddIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, EditIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Item } from '@/types';
import { Link } from '@chakra-ui/react';
import * as NextLink from 'next/link';
import { motion } from 'framer-motion';
import ItemPrice from '../ItemPrice';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useSwipeable } from 'react-swipeable';
import { BsFillGridFill } from 'react-icons/bs';


type ItemCardProps = {
    key: string;
    item: Item | null;
    cardType: 'buy' | 'edit' | 'create' | 'bulk';
    viewMode: 'grid' | 'list';
    linkTo: string;
    variants: any;
    loading: boolean;
    isMobile: boolean;
    isFavorite: boolean;
    updateFavorite: (itemId: string, favorite: boolean) => void;
    handleUpdateClick: () => void;
};

const MotionBox = motion(Box);
const MotionImage = motion(Image);
const MotionGridItem = motion(GridItem);
const MotionAspectRatio = motion(AspectRatio);
const MotionVStack = motion(VStack);
const MotionHStack = motion(HStack);

const ItemCard = ({ item, cardType, linkTo, viewMode, variants, loading, isMobile, isFavorite, updateFavorite, handleUpdateClick }: ItemCardProps) => {
    const [isFavoriteState, setIsFavoriteState] = React.useState(isFavorite);
    const [isClicking, setIsClicking] = React.useState(false);
    const development = process.env.NEXT_PUBLIC_ENV === 'development';

    const renderFavoriteIcon = () => (
        <Tooltip label={`Click to ${isFavoriteState ? "unfavorite" : "favorite"}`}><IconButton
            icon={isFavoriteState ? <Icon as={FaHeart} color="red" /> : <Icon as={FaRegHeart} />}
            size={"sm"}
            isRound
            aria-label="Favorite"
            variant="ghost"
            // position="absolute"
            // top={2}
            // left={2}
            onClick={(e) => {
                e.preventDefault(); // Prevent triggering the link
                setIsFavoriteState((favoriteState) => {
                    updateFavorite(item ? item.id : "", !favoriteState);
                    return !favoriteState
                })
            }}
        /></Tooltip>
    );

    const renderShareIcon = () => {

        const share = async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: item ? item.title : "Title",
                        text: item ? item.description : "Description",
                        url: item ? `${window.location.origin}/buy/${item.seller_id}/${item.id}` : window.location.href,
                    });
                } catch (error) {
                    console.error('Error sharing:', error);
                }
            } else {
                console.log("Web Share API not supported");
            }
        }

        return (
            <Tooltip label={`Click to share`}><IconButton
                icon={<ExternalLinkIcon />}
                size={"sm"}
                isRound
                aria-label="Share"
                variant="ghost"
                // position="absolute"
                // top={2}
                // right={2}
                onClick={(e) => {
                    e.preventDefault(); // Prevent triggering the link
                    share();
                }}
            /></Tooltip>)
    }

    const calculatePosition = (photoSize: { x: number, y: number, w: number, h: number }) => {
        if (!photoSize || photoSize.w === undefined) {
            return '50% 50%'; // Default to center if no size data is available
        }
        const x = photoSize.w === 100 ? photoSize.x : (photoSize.x / (100 - photoSize.w)) * 100;
        const y = photoSize.h === 100 ? photoSize.y : (photoSize.y / (100 - photoSize.h)) * 100;
        return `${x}% ${y}%`;
    };

    const color = (isActive: boolean) => {
        if (isActive) {
            return 'green'
        } else {
            return 'red'
        }
    }

    const renderIconBubble = () => {
        if (cardType === 'edit') {
            return (
                <Tooltip label="You can edit this item"><IconButton
                    icon={<EditIcon color={"blue.500"} />}
                    size={"sm"}
                    aria-label="Edit"
                    variant="ghost"
                    isRound
                    position="absolute"
                    top={2}
                    right={2}
                /></Tooltip>
            );
        } else if (item && (development ? item.test_verified : item.verified)) {
            return <Tooltip label="The seller is verified"><IconButton
                icon={<CheckCircleIcon color={"green.500"} boxSize={5} />}
                size={"sm"}
                aria-label="Verified"
                variant="ghost"
                background={"transparent"}
                _hover={{ background: "transparent" }}
                position="absolute"
                top={2}
                right={2}
            /></Tooltip>
        }
        return null;
    };

    const renderBadge = (item: Item | null) => {
        return (
            <Box
                position="absolute"
                bottom={2}
                right={2}
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
            >
                {cardType === 'edit' && (
                    <Badge colorScheme={item ? (item.active ? "blue" : "red") : "none"} borderRadius="full" px={2} py={1}>
                        <Box
                            as="span"
                            bg={item ? (item.active ? "blue" : "red") : "none"}
                            borderRadius="full"
                            boxSize={2}
                            display="inline-block"
                            mr={1}
                        />
                        {item ? (item.active ? "active" : "inactive") : "activity"}
                    </Badge>
                )}
            </Box>
        );
    };

    const GridContent = ({ item, itemLoading }: { item: Item | null, itemLoading: boolean }) => {
        const [isHovered, setIsHovered] = useState(isMobile);
        const [currentIndex, setCurrentIndex] = useState(0);

        const handlePrev = () => {
            if (item?.photo_urls === undefined) return;
            setCurrentIndex((prevIndex) => (prevIndex === 0 ? item.photo_urls.length - 1 : prevIndex - 1));
        };

        const handleNext = () => {
            if (item?.photo_urls === undefined) return;
            setCurrentIndex((prevIndex) => (prevIndex === item.photo_urls.length - 1 ? 0 : prevIndex + 1));
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
                    {item ? (
                        <MotionBox borderWidth="1px" borderRadius="lg" overflow="hidden" position="relative">
                            {renderBadge(item)}
                            {itemLoading ? <Spinner /> : <MotionImage
                                {...handlers}
                                src={item.photo_urls ? item.photo_urls[currentIndex] : process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/photos/default.webp"}
                                alt={item.title + ": " + item.description}
                                boxSize={"100%"}
                                objectFit="cover"
                                objectPosition={calculatePosition(item.photo_sizes[0] as { x: number, y: number, w: number, h: number })}
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
                                    {!isMobile && <Flex position="absolute" bottom="10px" width="100%" justifyContent="center">
                                        {item.photo_urls.map((_, index) => (
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
                                    </Flex>}
                                </>
                            )}
                        </MotionBox>
                    ) : (
                        <Skeleton borderRadius={"lg"} />
                    )}
                </MotionAspectRatio>
                <Skeleton isLoaded={!loading} borderRadius={"lg"}>
                    <Stack direction={"column"}>
                        {isMobile ? <Text fontWeight="bold" fontSize="lg" isTruncated={false} noOfLines={2}>
                            {item ? item.title : "Title"}
                        </Text> : <Text fontWeight="bold" fontSize="lg" isTruncated>
                            {item ? item.title : "Title"}
                        </Text>}
                    </Stack>
                </Skeleton>
                <MotionHStack isTruncated>
                    <Skeleton isLoaded={!loading} borderRadius={"lg"}>
                        <ItemPrice price={item ? item.price : 0} listingPrice={item ? item.listing_price : 0} size="small" truncate isMobile={isMobile} />
                    </Skeleton>
                    <Spacer />
                    {!isMobile && <Skeleton isLoaded={!loading}>
                        <MotionHStack spacing={0}>
                            {renderFavoriteIcon()}
                            {renderShareIcon()}
                        </MotionHStack>
                    </Skeleton>}
                </MotionHStack>
            </MotionVStack>
        );
    };


    const ListContent = ({ item, itemLoading }: { item: Item | null, itemLoading: boolean }) => {

        const [isHovered, setIsHovered] = useState(isMobile);
        const [currentIndex, setCurrentIndex] = useState(0);

        const handlePrev = () => {
            if (item?.photo_urls === undefined) return;
            setCurrentIndex((prevIndex) => (prevIndex === 0 ? item.photo_urls.length - 1 : prevIndex - 1));
        };

        const handleNext = () => {
            if (item?.photo_urls === undefined) return;
            setCurrentIndex((prevIndex) => (prevIndex === item.photo_urls.length - 1 ? 0 : prevIndex + 1));
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

        return isMobile ? (
            <MotionBox borderWidth={1} borderRadius={"lg"} p={2} position="relative">
                <MotionVStack
                    align={"left"}
                    spacing={1}
                    position="relative"
                >
                    <MotionAspectRatio ratio={1}>
                        {item ? (
                            <MotionBox borderWidth="1px" borderRadius="lg" overflow="hidden" position="relative">
                                {renderBadge(item)}
                                {itemLoading ? <Spinner /> : <MotionImage
                                    src={item.photo_urls ? item.photo_urls[0] : process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/photos/default.webp"}
                                    alt={item.title + ": " + item.description}
                                    boxSize={"100%"}
                                    objectFit="cover"
                                    objectPosition={calculatePosition(item.photo_sizes[0] as { x: number, y: number, w: number, h: number })}
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
                    <MotionHStack>
                        <Skeleton isLoaded={!loading}>
                            <Text fontWeight="bold" fontSize="xl" mb={2} noOfLines={2}>
                                {item ? item.title : "Title"}
                            </Text>
                        </Skeleton>
                        <Spacer />
                        <Skeleton isLoaded={!loading} borderRadius={"lg"}>
                            <MotionHStack spacing={0}>
                                {renderFavoriteIcon()}
                                {renderShareIcon()}
                            </MotionHStack>
                        </Skeleton>
                    </MotionHStack>
                    <Skeleton isLoaded={!loading}>
                        <Text color="gray.600" mb={2}>
                            {item ? item.condition : "Condition"}
                        </Text>
                    </Skeleton>
                    <Skeleton isLoaded={!loading}>
                        <ItemPrice price={item ? item.price : 0} listingPrice={item ? item.listing_price : 0} size="" isMobile={isMobile} />
                    </Skeleton>
                    <Skeleton isLoaded={!loading}>
                        <Text noOfLines={2}>
                            {item ? item.description : "Description"}
                        </Text>
                    </Skeleton>
                </MotionVStack>
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
                <MotionGridItem layout colSpan={{ sm: 3, md: 2, xl: 1 }} onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}>
                    <MotionAspectRatio
                        ratio={1}
                        layout
                        variants={variants}
                        whileHover={{ scale: 1.05 }} // Scale up slightly on hover
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                        {item ? (
                            <MotionBox borderWidth="1px" borderRadius="lg" overflow="hidden" position="relative">
                                {renderBadge(item)}
                                {itemLoading ? <Spinner /> : <MotionImage
                                    {...handlers}
                                    src={item.photo_urls ? item.photo_urls[currentIndex] : process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/photos/default.webp"}
                                    alt={item.title + ": " + item.description}
                                    boxSize={"100%"}
                                    objectFit="cover"
                                    objectPosition={calculatePosition(item.photo_sizes[0] as { x: number, y: number, w: number, h: number })}
                                    layout
                                    onClick={(e) => {
                                        setIsClicking(true);
                                    }}
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
                                        {!isMobile && <Flex position="absolute" bottom="10px" width="100%" justifyContent="center">
                                            {item.photo_urls.map((_, index) => (
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
                                        </Flex>}
                                    </>
                                )}
                            </MotionBox>
                        ) : (
                            <Skeleton borderRadius={"lg"} />
                        )}
                    </MotionAspectRatio>
                </MotionGridItem>
                <MotionGridItem layout colSpan={{ sm: 2, md: 3, xl: 4 }} p={2} onClick={(e) => {
                    setIsClicking(true);
                }}>
                    <MotionVStack align={"left"}>
                        <MotionVStack align={"left"} spacing={0}>
                            <MotionHStack>
                                <Skeleton isLoaded={!loading}>
                                    <Text fontWeight="bold" fontSize="xl" noOfLines={1}>
                                        {item ? item.title : "Title"}
                                    </Text>
                                </Skeleton>
                                <Spacer />
                                <Skeleton isLoaded={!loading} borderRadius={"lg"}>
                                    <MotionHStack spacing={0}>
                                        {renderFavoriteIcon()}
                                        {renderShareIcon()}
                                    </MotionHStack>
                                </Skeleton>
                            </MotionHStack>
                            <Skeleton isLoaded={!loading}>
                                <Text color="gray.600">
                                    {item ? item.condition : "Condition"}
                                </Text>
                            </Skeleton>
                        </MotionVStack>
                        <Skeleton isLoaded={!loading}>
                            <ItemPrice price={item ? item.price : 0} listingPrice={item ? item.listing_price : 0} size="" isMobile={isMobile} />
                        </Skeleton>
                        <Skeleton isLoaded={!loading}>
                            <Text noOfLines={2}>
                                {item ? item.description : "Description"}
                            </Text>
                        </Skeleton>
                    </MotionVStack>
                </MotionGridItem>
            </Grid>
        );
    };

    const CreateCard = ({ viewMode, itemLoading }: { viewMode: string, itemLoading: boolean }) => {
        return (
            <Box
                borderWidth="2px"
                borderRadius="lg"
                position="relative"
                justifyContent="center"
                alignItems="center"
                h={viewMode === 'grid' ? "100%" : "50px"}
                borderColor={"black"}
            >
                <AspectRatio ratio={1} w="100%" h={"100%"}>
                    <Stack direction={isMobile && viewMode === 'grid' ? "column" : "row"}>
                        <AddIcon />
                        <Text as={"b"}>Create Listing</Text>
                    </Stack>
                </AspectRatio>
            </Box>
        );
    };

    const CreateBulkCard = ({ viewMode, itemLoading }: { viewMode: string, itemLoading: boolean }) => {
        return (
            <Box
                borderWidth="2px"
                borderRadius="lg"
                position="relative"
                justifyContent="center"
                alignItems="center"
                h={viewMode === 'grid' ? "100%" : "50px"}
                borderColor={"black"}
            >
                <AspectRatio ratio={1} w="100%" h={"100%"}>
                    <Stack direction={isMobile && viewMode === 'grid' ? "column" : "row"}>
                        <Icon as={BsFillGridFill} />
                        <Text as={"b"}>Create Bulk Listing</Text>
                    </Stack>
                </AspectRatio>
            </Box>
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
            onClick={() => {
                if (cardType === 'edit') return;
                handleUpdateClick()
            }}
        >
            {(linkTo) ? <Link href={linkTo} as={NextLink.default} style={{ textDecoration: "none" }}>
                {cardType === 'bulk' ? <CreateBulkCard viewMode={viewMode} itemLoading={isClicking} /> : cardType === 'create' ? <CreateCard viewMode={viewMode} itemLoading={isClicking} /> : viewMode === 'grid' ? <GridContent item={item} itemLoading={isClicking} /> : <ListContent item={item} itemLoading={isClicking} />}
            </Link> : <>{cardType === 'bulk' ? <CreateBulkCard viewMode={viewMode} itemLoading={isClicking} /> : cardType === 'create' ? <CreateCard viewMode={viewMode} itemLoading={isClicking} /> : viewMode == 'grid' ? <GridContent item={item} itemLoading={isClicking} /> : <ListContent item={item} itemLoading={isClicking} />}</>}
        </MotionBox>
    );
};

export default ItemCard;
