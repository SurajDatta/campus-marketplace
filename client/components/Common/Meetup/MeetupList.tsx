/**
 * MeetupList.tsx
 * Component to show all the meetups on the MyStuff page, very similar to ItemsList
 * @AshokSaravanan222
 * 10-08-2024
 */
import React, { useEffect, useState } from 'react';
import { Box, Flex, Text, SimpleGrid, Button, VStack, HStack, Spacer, IconButton, useBreakpointValue, Heading, Select, Input, InputGroup, InputLeftAddon, filter, useToast, AspectRatio, Icon } from '@chakra-ui/react';
import ItemCard from '@/components/Common/Item/Card/ItemCard';
import { Click, Item, Meetup, MeetupStatus, Profile } from '@/types';
import { DragHandleIcon, HamburgerIcon, SearchIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { MdArrowDropDown } from 'react-icons/md';
import { updateFavorites, updateItemClick } from '@/utils/services/buy';
import { FaCamera } from 'react-icons/fa';
import MeetupCard from './MeetupCard';

type MeetupListProps = {
    loading: boolean;
    userProfile: Profile | null;
    meetups: Meetup[] | null;
    heading: string;
    isMobile: boolean;
};

const variants = {
    grid: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20
        }
    },
    list: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20
        }
    }
};

export function MeetupList({ loading, heading, isMobile, meetups, userProfile }: MeetupListProps) {
    const [filteredMeetups, setFilteredMeetups] = useState<Meetup[] | null>(meetups);
    const [status, setStatus] = useState<string>('All');
    const [loadingMore, setLoadingMore] = useState(false);
    const meetupsPerPage = useBreakpointValue({ base: 4, sm: 4, md: 6, lg: 8, xl: 8 }) ?? 60;
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [visibleMeetups, setVisibleMeetups] = useState<number>(meetupsPerPage + 1);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const oneDay = 24 * 60 * 60 * 1000;
    const toast = useToast();


    const loadMoreMeetups = () => {
        setLoadingMore(true);
        setVisibleMeetups((prev) => prev + meetupsPerPage);
        setLoadingMore(false);
    };

    useEffect(() => {
        const perRow = meetupsPerPage / 2;
        const newVisibleMeetups = Math.ceil(visibleMeetups / perRow) * perRow;
        setVisibleMeetups(newVisibleMeetups);
    }, [meetupsPerPage]);

    const showFilterOptions = () => {
        return (
            <>
                <option value='pending'>Pending</option>
                <option value='meeting'>Meeting</option>
                <option value='canceled'>Canceled</option>
                <option value='complete'>Complete</option>
            </>
        );
    };

    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const status = event.target.value;
        setStatus(status);
        if (meetups === null || status === "") {
            setFilteredMeetups(meetups);
        } else if (userProfile) {
            setFilteredMeetups(meetups.filter((meetup) => meetup.status === status && (meetup.buyer_id === userProfile.id || meetup.seller_id === userProfile.id)));
        } else {
            setFilteredMeetups(meetups);
        }
    };

    useEffect(() => {
        setFilteredMeetups(meetups);
    }, [meetups]);

    return (
        <Box p={4}>
            <VStack align={"left"}>
                <HStack>
                    <Heading>{heading}</Heading>
                    <Spacer />
                    <Select icon={<MdArrowDropDown />} placeholder='All' w={isMobile ? "auto" : "20%"} onChange={handleStatusChange} value={status}>
                        {showFilterOptions()}
                    </Select>
                </HStack>
                <HStack>
                    <InputGroup>
                        <InputLeftAddon children={<SearchIcon />} />
                        <Input
                            placeholder='Search for an item...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                    <Spacer />
                    <HStack>
                        <IconButton
                            colorScheme='blue'
                            aria-label='Grid View'
                            icon={<DragHandleIcon />}
                            onClick={() => {
                                setViewMode('grid');
                            }}
                            bg={viewMode === 'grid' ? 'blue.500' : 'blue.100'}
                        />
                        <IconButton
                            colorScheme='blue'
                            aria-label='List View'
                            icon={<HamburgerIcon />}
                            onClick={() => setViewMode('list')}
                            bg={viewMode === 'list' ? 'blue.500' : 'blue.100'}
                        />
                    </HStack>
                </HStack>
            </VStack>
            <AnimatePresence>
                <SimpleGrid as={motion.div}
                    layout
                    animate={viewMode === 'grid' ? 'grid' : 'list'}
                    variants={variants}
                    columns={viewMode === 'grid' ? { base: 2, sm: 2, md: 3, lg: 4, xl: 4 } : 1}
                    spacing={4}
                    justifyItems="start">
                    {(filteredMeetups == null) ? (
                        [...Array(meetupsPerPage).keys()].map((key) => (
                            <MeetupCard
                                key={String(key)}
                                meetup={null}
                                linkTo='/my-stuff'
                                viewMode={viewMode}
                                variants={variants}
                                loading={true}
                                isMobile={isMobile}
                            />
                        ))
                    ) : filteredMeetups.length === 0 ? (
                        <Text as={"b"} p={2}>No items found.</Text>
                    ) : (
                        filteredMeetups.filter((meetup) => (meetup.item_title + meetup.item_description).toLowerCase().includes(searchTerm.toLowerCase())).slice(0, visibleMeetups).map((meetup) => {
                            return (
                                <MeetupCard
                                    key={meetup.id}
                                    meetup={loading ? null : meetup}
                                    linkTo={`/my-stuff/${meetup.id}`}
                                    viewMode={viewMode}
                                    variants={variants}
                                    loading={loading}
                                    isMobile={isMobile}
                                />
                            )
                        })
                    )}
                </SimpleGrid>
            </AnimatePresence>
            {(filteredMeetups && (visibleMeetups < filteredMeetups.length)) && (
                <Flex justify="center" mt={4}>
                    <Button onClick={loadMoreMeetups} isLoading={loadingMore} loadingText="Loading more meetups" colorScheme='blue'>
                        Show More
                    </Button>
                </Flex>
            )}
        </Box>
    );
}

export default MeetupList;
