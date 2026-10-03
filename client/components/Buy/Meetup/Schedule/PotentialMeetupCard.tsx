/**
 * PotentialMeetupCard.tsx
 * Card that will be shown as a potential meetup location while the seller is confirming the meetup. This will show the location name, a map of the location, and the time of the meetup. 
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React from 'react';
import { AspectRatio, Badge, Box, Button, Center, Divider, HStack, Icon, Spacer, Text, VStack } from '@chakra-ui/react';
import { Item, Location, Meetup } from '@/types';
import AddToCalendar from '../CheckIn/AddToCalendar';
import { FaApple, FaGoogle } from 'react-icons/fa';
import ExpiryDetails from '@/components/Common/Item/ExpiryDetails';

type PotentialMeetupCardProps = {
  meetup: Meetup | null;
  time: string;
  location: Location | null;
  isDisabled: boolean;
  isSelected: boolean;
  mapsAPIKey: string;
  onClick: () => void;
  isMobile: boolean;
};

type CalendarType = 'google' | 'apple';

const PotentialMeetupCard = ({ time, location, isDisabled, isSelected, onClick, mapsAPIKey, meetup, isMobile }: PotentialMeetupCardProps) => {
  const expiryTime = new Date(meetup?.expires_at ?? "");

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      padding="4"
      onClick={onClick}
      backgroundColor={isSelected ? 'teal.200' : 'white'}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
    >
      {/* {isMobile ?
        <>
          <HStack>
            <Text fontSize={"xl"}>{location ? location.name : "Location Name"}</Text>
          </HStack>
          <ExpiryDetails expiryDate={expiryTime.toISOString()} />
        </>
        : <HStack p={2}>
          <Text fontSize={"xl"}>{location ? location.name : "Location Name"}</Text>
          <Center height={10}>
            <Divider orientation='vertical' />
          </Center>
          <ExpiryDetails expiryDate={expiryTime.toISOString()} />
        </HStack>
      } */}
      <HStack>
        <Text fontSize={"lg"} noOfLines={1}>{location ? location.name : "Location Name"}</Text>
        <Spacer />
        {location && location.blue_light && <Badge colorScheme="blue">Safe Meetup</Badge>}
      </HStack>
      {(location && mapsAPIKey) && <AspectRatio ratio={16 / 9} width="100%" maxH="100%">
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/directions?key=${mapsAPIKey}&origin=${`${location.latitude},${location.longitude}`}&destination=${`${location.latitude},${location.longitude}`}&mode=walking&zoom=16`}
        >
        </iframe>
        {/* {location.latitude && location.longitude ?
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/directions?key=${mapsAPIKey}&origin=${location.latitude + "," + location.longitude}&destination=${location.latitude + "," + location.longitude}&mode=walking&zoom=16`}>
          </iframe> :
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/search?key=${mapsAPIKey}&q=${encodeURIComponent(location.name)}`}>
          </iframe>} */}

      </AspectRatio>}
      <Text as={"b"}>{new Date(time).toLocaleString("en-US", { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</Text>
    </Box >
  );
};

export default PotentialMeetupCard;
