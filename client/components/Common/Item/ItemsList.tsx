/**
 * ItemsList.tsx
 * List that will display all of the items using the ItemCard.tsx component. TODO: make this page the central page used on all the respective pages (buy, sell, mystuff, history, e.t.c) to reduce the number of places you need to update the code.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
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
import { useQueryClient } from '@tanstack/react-query';

type FilterTypes = 'history' | 'active'

type ItemsListProps = {
  loading: boolean;
  userProfile: Profile | null;
  items: Item[] | null;
  heading: string;
  filterType: FilterTypes;
  isMobile: boolean;
  buyCard?: boolean;
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

export function ItemsList({ loading, items, heading, userProfile, filterType, isMobile, buyCard }: ItemsListProps) {
  const queryClient = useQueryClient()
  const [filteredItems, setFilteredItems] = useState<Item[] | null>(items);
  const [status, setStatus] = useState<string>('All');

  const [loadingMore, setLoadingMore] = useState(false);
  const itemsPerPage = useBreakpointValue({ base: 4, sm: 4, md: 6, lg: 8, xl: 8 }) ?? 60;
  const [visibleItems, setVisibleItems] = useState<number>(itemsPerPage + 1);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>("");
  const oneDay = 24 * 60 * 60 * 1000;
  const toast = useToast();

  const handleFavoriteUpdate = async (itemId: string, favorite: boolean) => {
    try {
      if (!userProfile) {
        throw new Error('You must be logged in to favorite an item.');
      }
      if (!favorite) {
        const newFavorites = userProfile.favorites.filter((id) => id !== itemId)
        const { success, error } = await updateFavorites(userProfile.id, newFavorites)
        if (!success) {
          throw new Error(error)
        }
        return;
      } else {
        const newFavorites = [...userProfile.favorites, itemId]
        const { success, error } = await updateFavorites(userProfile.id, newFavorites)
        if (!success) {
          throw new Error(error)
        }
      }
      queryClient.invalidateQueries({
        queryKey: ['userProfile', userProfile.id]
      });
    } catch (error: any) {
      if (!toast.isActive('login-required')) {
        toast({
          id: 'login-required',
          title: 'Login Required',
          description: `${error.message}`,
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  }


  const loadMoreItems = () => {
    setLoadingMore(true);
    setVisibleItems((prev) => prev + itemsPerPage);
    setLoadingMore(false);
  };

  useEffect(() => {
    const perRow = itemsPerPage / 2;
    const newVisibleItems = Math.ceil(visibleItems / perRow) * perRow;
    setVisibleItems(newVisibleItems);
  }, [itemsPerPage]);

  const showFilterOptions = (filterType: FilterTypes) => {
    if (filterType === 'history') {
      return (
        <>
          <option value='last7'>Last Week</option>
          <option value='last30'>Last Month</option>
          <option value='last90'>Last 3 Months</option>
        </>
      );
    } else if (filterType === 'active') {
      return (
        <>
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
        </>
      )
    }
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const status = event.target.value;
    setStatus(status);
    if (items === null || status === undefined) {
      setFilteredItems(items);
    } else if (status === 'last7') {
      setFilteredItems(items.filter(item => (item.created_at && (new Date(item.created_at).getTime() + 7 * oneDay) >= new Date().getTime())));
    } else if (status === 'last30') {
      setFilteredItems(items.filter(item => (item.created_at && (new Date(item.created_at).getTime() + 30 * oneDay) >= new Date().getTime())));
    } else if (status === 'last90') {
      setFilteredItems(items.filter(item => (item.created_at && (new Date(item.created_at).getTime() + 90 * oneDay) >= new Date().getTime())));
    } else if (status === 'active') {
      setFilteredItems(items.filter(item => item.active));
    } else if (status === 'inactive') {
      setFilteredItems(items.filter(item => !item.active));
    } else if (status === 'favorites' && userProfile) {
      setFilteredItems(items.filter(item => (userProfile.favorites.includes(item.id))));
    } else {
      setFilteredItems(items);
    }
  };

  const updateClick = async (userId: string, itemId: string) => {
    try {
      const { success, error } = await updateItemClick(userId, itemId);
      if (!success) {
        throw new Error(error);
      }
    } catch (error: any) {
      console.error(error);
    }
  }

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  return (
    <Box p={4}>
      <VStack align={"left"}>
        <HStack>
          <Heading>{heading}</Heading>
          <Spacer />
          <Select icon={<MdArrowDropDown />} placeholder='All' w={isMobile ? "auto" : "20%"} onChange={handleStatusChange} value={status}>
            {showFilterOptions(filterType)}
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
          {filterType === 'active' && <ItemCard
            key={"create"}
            item={null}
            cardType='create'
            linkTo='/sell/create/single'
            viewMode={viewMode}
            variants={variants}
            loading={false}
            isMobile={isMobile}
            isFavorite={false}
            updateFavorite={() => { }}
            handleUpdateClick={() => { }}
          />}
          {/* {filterType === 'active' && <ItemCard
            key={"bulk"}
            item={null}
            cardType='bulk'
            linkTo='/sell/listing'
            viewMode={viewMode}
            variants={variants}
            loading={false}
            isMobile={isMobile}
            isFavorite={false}
            updateFavorite={() => { }}
            handleUpdateClick={() => { }}
          />} */}
          {(filteredItems == null) ? (
            [...Array(itemsPerPage).keys()].map((key) => (
              <ItemCard
                key={String(key)}
                item={null}
                cardType='buy'
                linkTo='/buy'
                viewMode={viewMode}
                variants={variants}
                loading={true}
                isMobile={isMobile}
                isFavorite={false}
                updateFavorite={() => { }}
                handleUpdateClick={() => { }}
              />
            ))
          ) : filteredItems.length === 0 ? (
            filterType !== 'active' && <Text as={"b"} p={2}>No items found.</Text>
          ) : (
            filteredItems.filter((item) => (item.title + item.description).toLowerCase().includes(searchTerm.toLowerCase())).slice(0, visibleItems).map((item) => {

              let cardType: 'buy' | 'edit' | 'create' = 'buy';
              let url: string = `/buy/${item.seller_id}/${item.id}`;

              if (item.seller_id === userProfile?.id && (!buyCard)) {
                cardType = 'edit';
                url = `/sell/edit/${item.id}`;
              }
              return (
                <ItemCard
                  key={item.id}
                  item={loading ? null : item}
                  linkTo={url}
                  cardType={cardType}
                  viewMode={viewMode}
                  variants={variants}
                  loading={loading}
                  isMobile={isMobile}
                  isFavorite={userProfile ? userProfile.favorites.includes(item.id) : false}
                  updateFavorite={handleFavoriteUpdate}
                  handleUpdateClick={() => {
                    if (userProfile) {
                      updateClick(userProfile.id, item.id);
                    }
                  }}
                />
              )
            })
          )}
        </SimpleGrid>
      </AnimatePresence>
      {(filteredItems && (visibleItems < filteredItems.length)) && (
        <Flex justify="center" mt={4}>
          <Button onClick={loadMoreItems} isLoading={loadingMore} loadingText="Loading more items" colorScheme='blue'>
            Show More
          </Button>
        </Flex>
      )}
    </Box>
  );
}

export default ItemsList;
