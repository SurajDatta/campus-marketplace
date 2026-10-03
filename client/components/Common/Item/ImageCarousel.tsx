/**
 * ImageCarousel.tsx
 * Carousel component that will be used to display images in a square format. It is used on the item page when buying an item as the edit listing page. TODO: make sure it is integrated in the item listing page, so the code for the component can be easily changed when needed.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React, { useState, useEffect } from 'react';
import { Box, Image, IconButton, Flex, Text, Center, calc, Skeleton, AspectRatio, VStack, HStack, Spacer, Icon, Checkbox, Stack, Tooltip } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon, SearchIcon } from '@chakra-ui/icons';
import { useSwipeable } from 'react-swipeable';
import ItemPhotoModal from './ItemPhotoModal';
import { HiCursorClick } from "react-icons/hi";
import { FaHeart, FaRegHeart } from 'react-icons/fa';

type ImageCarouselProps = {
    isMobile: boolean
    photos: { photo_url: string, photo_size: { x: number, y: number, w: number, h: number } }[];
    loading: boolean;
    title: string;
    description: string;
    itemId: string;
    sellerId: string;
    isFavorite: boolean;
    updateFavorite: (itemId: string, isFavorite: boolean) => void;
};


const ImageCarousel = ({ photos, loading, isMobile, title, description, itemId, sellerId, isFavorite, updateFavorite }: ImageCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [openImageModal, setOpenImageModal] = useState(false);
    const borderRadius = 50;
    const [isFavoriteState, setIsFavoriteState] = React.useState(isFavorite);

    // hover to zoom
    const [zoomEnabled, setZoomEnabled] = useState(false);
    const [zoom, setZoom] = useState(false);
    const [transformOrigin, setTransformOrigin] = useState('50% 50%'); // Initial focus at the center of the image

    const calculatePosition = (photoSize: { x: number, y: number, w: number, h: number }) => {
        if (!photoSize || photoSize.w === undefined) {
            return '50% 50%'; // Default to center if no size data is available
        }
        const x = photoSize.w === 100 ? photoSize.x : (photoSize.x / (100 - photoSize.w)) * 100;
        const y = photoSize.h === 100 ? photoSize.y : (photoSize.y / (100 - photoSize.h)) * 100;
        return `${x}% ${y}%`;
    };

    const handlePrev = () => {
        if (photos === null) return;
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? photos.length - 1 : prevIndex - 1));
    };

    const handleNext = () => {
        if (photos === null) return;
        setCurrentIndex((prevIndex) => (prevIndex === photos.length - 1 ? 0 : prevIndex + 1));
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
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [photos]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { offsetX, offsetY, target } = e.nativeEvent;
        const { offsetWidth, offsetHeight } = target as HTMLImageElement;
        const xPercent = (offsetX / offsetWidth) * 100;
        const yPercent = (offsetY / offsetHeight) * 100;

        setTransformOrigin(`${xPercent}% ${yPercent}%`);
    };

    const handleMouseEnter = () => setZoom(true);
    const handleMouseLeave = () => setZoom(false);

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
                    updateFavorite(itemId, !favoriteState);
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
                        title: title,
                        text: description,
                        url: `${window.location.origin}/buy/${sellerId}/${itemId}`
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

    const renderImageSection = () => {
        return (
            <>
                <Image
                    src={photos[currentIndex].photo_url}
                    alt={`Image ${currentIndex + 1}`}
                    boxSize={"100%"}
                    objectFit="cover"
                    objectPosition={calculatePosition(photos[currentIndex].photo_size)}
                    borderRadius={borderRadius}
                    transform={zoom && zoomEnabled ? 'scale(2)' : 'scale(1)'} // Zoom effect
                    transformOrigin={transformOrigin} // Set focus point
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    transition="transform 0.3s ease-in-out"
                />
                <Box>
                    <IconButton
                        aria-label="Previous Image"
                        icon={<ChevronLeftIcon color={"#ceb888"} boxSize={"12"} stroke="black" strokeWidth="0.3" />}
                        background={"transparent"}
                        size="lg"
                        position="absolute"
                        left="10px"
                        top="50%"
                        transform="translateY(-50%)"
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePrev();
                        }}
                        zIndex={1}
                    />

                    <IconButton
                        aria-label="Next Image"
                        icon={<ChevronRightIcon color={"#ceb888"} boxSize={"12"} stroke="black" strokeWidth="0.3" />}
                        background={"transparent"}
                        size="lg"
                        position="absolute"
                        right="10px"
                        top="50%"
                        transform="translateY(-50%)"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNext();
                        }}
                        zIndex={1}
                    />
                </Box>
                {/* Dots to indicate image count */}
                <Flex position="absolute" bottom="10px" width="100%" justifyContent="center">
                    {photos.map((_, index) => (
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
        )
    }

    const renderPreviewSection = () => {
        return (
            <Stack
                direction={isMobile ? "row" : "column"}
                overflowX={"auto"}
                overflowY={"auto"}
                p={2}
                maxH={500}
            >
                {photos.map((photo, index) => (
                    <Box
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        cursor="pointer"
                        opacity={currentIndex === index ? 1 : 0.5}
                        transition="box-shadow 0.3s"
                        m={2}
                    >
                        <AspectRatio ratio={1} width={"75px"} height={"75px"}>
                            <Image
                                src={photo.photo_url}
                                alt={`Image ${index + 1}`}
                                objectFit="cover"
                                objectPosition={calculatePosition(photo.photo_size)}
                                borderWidth="1px"
                                borderStyle="solid"
                                borderColor="gray.300"
                            />
                        </AspectRatio>
                    </Box>
                ))}
            </Stack>
        );
    }

    return (
        <Stack direction={isMobile ? "column-reverse" : "row"} p={2}>
            {renderPreviewSection()}
            <Box width="100%" p={2}>
                <AspectRatio ratio={1}>
                    {(!loading) ? (
                        <Box position="relative" borderWidth="1px" borderStyle="solid" borderColor="gray.300" display="flex" alignItems="center" justifyContent="center" cursor="pointer" borderRadius={borderRadius} onClick={() => photos.length !== 0 ? setOpenImageModal(true) : null} overflow={"hidden"} {...handlers}>
                            {photos.length === 0 ? (
                                <Center w={"100%"} h={"100%"} bg="gray.100" borderRadius={borderRadius}>
                                    <Text textAlign="center" fontSize="xl" color="gray.500">No images yet!</Text>
                                </Center>
                            ) : (
                                renderImageSection()
                            )}
                            {openImageModal && currentIndex !== null && (
                                <ItemPhotoModal
                                    photoUrl={photos[currentIndex].photo_url}
                                    photoSize={photos[currentIndex].photo_size}
                                    name={`Image ${currentIndex + 1}`}
                                    savePhotoSize={() => { }}
                                    edit={false}
                                    isOpen={openImageModal}
                                    onClose={() => setOpenImageModal(false)}
                                />
                            )}
                        </Box>
                    ) : <Skeleton borderRadius={"lg"} />}
                </AspectRatio>
                {!isMobile && <HStack p={4}>
                    {/* Could be replaced with description*/}
                    <Skeleton isLoaded={!loading} borderRadius={"lg"}>
                        <HStack>
                            {renderFavoriteIcon()}
                            {renderShareIcon()}
                        </HStack>
                    </Skeleton>
                    <Spacer />
                    <Skeleton isLoaded={!loading}>
                        <HStack>
                            <SearchIcon />
                            <Text opacity={0.5} fontSize={"sm"}>Zoom on hover</Text>
                            <Checkbox
                                size="sm"
                                colorScheme="blue"
                                isChecked={zoomEnabled}
                                onChange={() => setZoomEnabled((prev) => !prev)}
                            />
                        </HStack>
                    </Skeleton>
                    {/* <Skeleton isLoaded={!loading}>
                    <Text bg={"#ceb888"} p={2} borderRadius={borderRadius} boxShadow="sm">Image {currentIndex + 1} of {photoURLs.length}</Text>
                </Skeleton> */}

                </HStack>}
            </Box>
        </Stack>
    );
};

export default ImageCarousel;
