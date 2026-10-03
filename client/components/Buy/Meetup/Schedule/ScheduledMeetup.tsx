/**
 * ScheduledMeetup.tsx
 * Component that will show the buyer and seller side of the scheduled meetup. It will show which ones the seller can pick from (seller side) and which ones are still available for the meetup (buyer side). TODO: seperate this functionality into two components, one for the seller and one for the buyer.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React, { useState } from 'react';
import {
  Button,
  Text,
  VStack,
  useToast,
  Spinner,
  Radio,
  RadioGroup,
  HStack,
  SimpleGrid,
  useDisclosure,
  Stack,
  AspectRatio,
  useBreakpointValue
} from '@chakra-ui/react';
import { updateMeetupConfirmed, updateMeetupStatus } from '@/utils/services/buy';
import PotentialMeetupCard from './PotentialMeetupCard';
import { Coordinate, Item, Location, Meetup, PotentialMeetup, User } from '@/types';
import {
  AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter
} from '@chakra-ui/react';
import { createAlert, sendEmail } from '@/utils/services/alerts';
import { FaLocationArrow } from 'react-icons/fa';
import BlueLightMap from './BlueLightMap';
import { ArrowForwardIcon, CheckIcon, ViewIcon } from '@chakra-ui/icons';
import { createSellerCheckoutSession } from '@/utils/services/stripe';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

type ScheduledMeetupProps = {
  user: User | null;
  meetup: Meetup | null;
  mapsAPIKey: string
  locations: Location[];
  view: boolean;
  confirmed: boolean;
  development: boolean;
};

type CountdownProps = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
};

const ScheduledMeetup = ({ user, meetup, view, confirmed, locations, mapsAPIKey, development }: ScheduledMeetupProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [selectedMeetup, setSelectedMeetup] = useState<string>();
  const potentialMeetups = meetup ? meetup.potential_meetups as PotentialMeetup[] : [];
  const [selectedBlueLightLocation, setSelectedBlueLightLocation] = useState<number | undefined>();
  const router = useRouter();
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const queryClient = useQueryClient();

  const calculateBlueLightLocations = (locationId: number): [Location | undefined, Location | undefined, Location | undefined] => {
    if (locationId === 0) {
      return [undefined, undefined, undefined];
    } else {
      const location = locations.find((loc) => loc.id === locationId);
      if (!location) {
        return [undefined, undefined, undefined];
      }
      const blueLightLocations = locations.filter((loc) => loc.blue_light);
      const blueLightLocationsSorted = blueLightLocations.sort((a, b) => {
        if (!location.latitude || !location.longitude) return 0;
        if (!a.latitude || !a.longitude) return 0;
        if (!b.latitude || !b.longitude) return 0;
        const distanceA = Math.sqrt(
          Math.pow(a.latitude - location.latitude, 2) +
          Math.pow(a.longitude - location.longitude, 2)
        );
        const distanceB = Math.sqrt(
          Math.pow(b.latitude - location.latitude, 2) +
          Math.pow(b.longitude - location.longitude, 2)
        );
        return distanceA - distanceB;
      });
      return [blueLightLocationsSorted[0], blueLightLocationsSorted[1], blueLightLocationsSorted[2]]
    }
  }

  const handleCardClick = (meetup: string) => {
    setSelectedMeetup(meetup);
  };

  // const handleSubmit = async () => {
  //   setLoading(true);
  //   try {
  //     if (!meetup) {
  //       throw new Error('Meetup not found.');
  //     }
  //     if (!selectedMeetup) {
  //       throw new Error('Please select a meetup time.');
  //     }
  //     // if (meetup.safe_meetup_enabled && !selectedBlueLightLocation) {
  //     //   throw new Error('Please select a blue light location.');
  //     // }
  //     const potentialMeetup = JSON.parse(selectedMeetup) as PotentialMeetup;
  //     // const meetupLocation = (meetup.safe_meetup_enabled ? selectedBlueLightLocation : potentialMeetup.location) ?? 0;
  //     const meetupLocation = potentialMeetup.location ?? 0;

  //     const { success: meetupTimeSuccess } = await updateMeetupTime(meetup.id, potentialMeetup.time, meetupLocation);
  //     if (!meetupTimeSuccess) {
  //       throw new Error('Error updating meetup time.');
  //     }

  //     const { success: meetupStatusSuccess } = await updateMeetupStatus(meetup.id, 'meeting');
  //     if (!meetupStatusSuccess) {
  //       throw new Error('Error updating meetup status.');
  //     }

  //     const location = locations.find((loc) => loc.id == meetupLocation) ?? null;
  //     if (!location) {
  //       throw new Error('Location not found');
  //     }
  //     // sending email
  //     const buyerAlertId = await createAlert(
  //       meetup.buyer_id,
  //       `The seller for **${meetup.item_title}** has selected a meetup time: **${new Date(potentialMeetup.time).toLocaleString()}**. As a reminder, the chosen location is: **${location.name}**. You can view this information anytime on the MyStuff page. When you arrive at the designated location at the specified time, please check in to notify the seller of your arrival. As a next step, prepare to meet the seller at the meetup time and location.`,
  //       meetup.item_photo_urls[0],
  //       `${window.location.origin}/my-stuff/${meetup.id}`
  //     );

  //     if (!buyerAlertId) {
  //       throw new Error("Failed to create alert for the buyer");
  //     }

  //     // sending email to the buyer
  //     // const { success: sendBuyerEmailSuccess } = await sendEmail(meetup.buyer_id, buyerAlertId, `Meetup Time Confirmed for ${meetup.item_title}`, meetup.item_title, "View Meetup", "Confirmed Meetup Details");
  //     // if (!sendBuyerEmailSuccess) {
  //     //   throw new Error("Failed to send email to buyer");
  //     // }

  //     toast({
  //       title: 'Meetup confirmed.',
  //       description: 'The meetup has been successfully confirmed.',
  //       status: 'success',
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //   } catch (error: any) {
  //     toast({
  //       title: 'Error confirming meetup.',
  //       description: error.message,
  //       status: 'error',
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handleConfirm = async () => {
    setLoadingConfirm(true);
    try {
      if (!meetup) {
        throw new Error('Meetup not found.');
      }
      if (!selectedMeetup) {
        throw new Error('Please select a meetup time.');
      }
      if (!user || !user.email) {
        throw new Error('User not found.');
      }
      // creating alerts for the buyer and seller
      const potentialMeetup = JSON.parse(selectedMeetup) as PotentialMeetup;
      // const meetupLocation = (meetup.safe_meetup_enabled ? selectedBlueLightLocation : potentialMeetup.location) ?? 0;
      const meetupLocation = potentialMeetup.location ?? 0;
      const location = locations.find((loc) => loc.id == meetupLocation) ?? null;
      if (!location) {
        throw new Error('Location not found');
      }
      const session = await createSellerCheckoutSession(user.email, meetup.id, meetup.buyer_id, meetup.seller_id, meetup.item_price, meetup.item_title, meetup.item_photo_urls[0], location.img_url, potentialMeetup.time, potentialMeetup.location, development, meetup.item_id);
      if (session.url) {
        router.push(session.url);
      } else {
        throw new Error('Failed to create checkout session');
      }

    } catch (error: any) {
      toast({
        title: 'Error confirming meetup.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingConfirm(false);
    }
  }

  const handleConfirmManual = async (chooseBlueLight: boolean): Promise<{ success: boolean, error: string }> => {
    setLoadingConfirm(true);
    try {
      if (!meetup) {
        throw new Error('Meetup not found.');
      }
      if (!selectedMeetup) {
        throw new Error('Please select a meetup time.');
      }
      if (!user || !user.email) {
        throw new Error('User not found.');
      }
      // creating alerts for the buyer and seller
      const potentialMeetup = JSON.parse(selectedMeetup) as PotentialMeetup;
      const meetupLocation = (chooseBlueLight ? selectedBlueLightLocation : potentialMeetup.location) ?? 0;
      const location = locations.find((loc) => loc.id == meetupLocation) ?? null;
      if (!location) {
        throw new Error('Location not found');
      }

      const { success: meetupTimeSuccess } = await updateMeetupConfirmed(meetup.id, potentialMeetup.time, potentialMeetup.location, null);
      if (!meetupTimeSuccess) {
        throw new Error('Error updating meetup time.');
      }

      const { success: meetupStatusSuccess } = await updateMeetupStatus(meetup.id, 'meeting');
      if (!meetupStatusSuccess) {
        throw new Error('Error updating meetup status.');
      }

      // sending email
      const buyerAlertId = await createAlert(
        meetup.buyer_id,
        `The seller for **${meetup.item_title}** has selected a meetup time: **${new Date(potentialMeetup.time).toLocaleString()}**. As a reminder, the chosen location is: **${location.name}**. You can view this information anytime on the MyStuff page. When you arrive at the designated location at the specified time, please check in to notify the seller of your arrival. As a next step, prepare to meet the seller at the meetup time and location.`,
        meetup.item_photo_urls[0],
        `${origin}/my-stuff/${meetup.id}`
      );

      if (!buyerAlertId) {
        throw new Error("Failed to create alert for the buyer");
      }

      const sellerAlertId = await createAlert(
        meetup.seller_id,
        `You have selected a meetup time for the purchase of **${meetup.item_title}**: **${new Date(potentialMeetup.time).toLocaleString()} at ${location.name}**. You can view this information anytime on the MyStuff page. When you arrive at the designated location at the specified time, please check in to notify the buyer of your arrival. As a next step, prepare to meet the buyer at the meetup time and location.`,
        meetup.item_photo_urls[0],
        `${origin}/my-stuff/${meetup.id}`
      );

      if (!sellerAlertId) {
        throw new Error("Failed to create alert for the buyer");
      }

      queryClient.invalidateQueries({
        queryKey: ['meetup', meetup.id]
      });
      queryClient.invalidateQueries({
        queryKey: ['alerts', user.id]
      });

      return { success: true, error: "" };
    } catch (error: any) {
      toast({
        title: 'Error confirming meetup.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return { success: false, error: error.message };
    } finally {
      setLoadingConfirm(false);
    }
  }


  const showDate = (selectedTime: string | undefined) => {
    const formattedDate = new Date(selectedTime ?? "").toLocaleDateString('en-US', {
      weekday: 'long', // "Monday"
      year: 'numeric', // "2024"
      month: 'long',   // "August"
      day: 'numeric'   // "20"
    });

    const formattedTime = new Date(selectedTime ?? "").toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });

    return `${formattedDate} at ${formattedTime}`;
  }

  const showLocation = (locationId: number | undefined) => {
    const location = locations.find((loc) => loc.id == locationId) ?? null;
    return location?.name ?? "";
  }

  const blueLightLocations = calculateBlueLightLocations((selectedMeetup ? JSON.parse(selectedMeetup) as PotentialMeetup : { location: 0 }).location);

  const selectedMeetupLocation = locations.find((loc) => loc.id == (selectedMeetup ? JSON.parse(selectedMeetup) as PotentialMeetup : { location: 0 }).location) ?? null;
  const selectedBlueLightMeetupLocation = blueLightLocations.find((loc) => loc?.id === selectedBlueLightLocation) ?? null;

  const isMobile = useBreakpointValue({ base: true, md: false }) ?? true;

  return (
    <VStack spacing={4} align="stretch">
      {loading || !locations ? (
        <Spinner />
      ) : (
        <>
          {view ? (
            <VStack align={"left"}>
              <Text fontSize="lg" fontWeight="bold">The seller must pick between these meetups: </Text>
              <SimpleGrid columns={meetup ? (meetup.potential_meetups.length < 2 ? meetup.potential_meetups.length : 2) : 2} spacing={5} overflowY={"auto"} maxH={300}>
                {potentialMeetups.map(({ time, location }) => {
                  // const expiryTime = new Date(new Date(time).getTime() - 24 * 60 * 60 * 1000);
                  const expiryTime = new Date(meetup?.expires_at ?? "");
                  const isDisabled = new Date() > expiryTime;
                  return (
                    <PotentialMeetupCard
                      key={time}
                      time={time}
                      location={locations.find((loc) => loc.id == location) ?? null}
                      isDisabled={isDisabled}
                      onClick={() => { }}
                      isSelected={false}
                      mapsAPIKey={mapsAPIKey}
                      isMobile={isMobile}
                      meetup={meetup}
                    />
                  )
                })}
              </SimpleGrid>
            </VStack>
          ) : (
            <>
              <Text fontSize="lg" fontWeight="bold">Pick between these meetups: </Text>
              <RadioGroup value={selectedMeetup} onChange={setSelectedMeetup}>
                <SimpleGrid columns={meetup ? (meetup.potential_meetups.length < 2 ? meetup.potential_meetups.length : 2) : 2} spacing={5} overflowY={"auto"} maxH={300}>
                  {potentialMeetups.map(({ time, location }) => {
                    // const expiryTime = new Date(new Date(time).getTime() - 24 * 60 * 60 * 1000);
                    const expiryTime = new Date(meetup?.expires_at ?? "");
                    const isDisabled = new Date() > expiryTime;
                    return (
                      <Radio value={JSON.stringify({ time, location })}>
                        <PotentialMeetupCard
                          key={time}
                          time={time}
                          location={locations.find((loc) => loc.id == location) ?? null}
                          isDisabled={isDisabled}
                          onClick={() => handleCardClick(JSON.stringify({ time, location }))}
                          isSelected={selectedMeetup === JSON.stringify({ time, location })}
                          mapsAPIKey={mapsAPIKey}
                          isMobile={isMobile}
                          meetup={meetup}
                        />
                      </Radio>
                    )
                  })}
                </SimpleGrid>
              </RadioGroup>
              {(meetup?.safe_meetup_enabled && !selectedMeetupLocation?.blue_light) && <VStack align={"left"}>
                {/* <Text fontSize="lg" fontWeight="bold">Safe Meetup</Text> */}
                {selectedMeetup ?
                  <>
                    {/* <Text>Pick one of the following blue light locations to meet up at: </Text> */}
                    <BlueLightMap
                      locationId={selectedMeetupLocation?.id ?? 0}
                      allLocations={locations}
                      blueLightLocations={blueLightLocations}
                      mapsAPIKey={mapsAPIKey}
                      selectedLocation={selectedBlueLightLocation}
                      setSelectedLocation={setSelectedBlueLightLocation}
                    />
                    <Stack direction={{ base: 'column', md: 'row' }}>
                      <Button colorScheme={"blue"} variant={selectedBlueLightLocation === blueLightLocations[0]?.id ? "solid" : "outline"} leftIcon={<FaLocationArrow />} onClick={() => setSelectedBlueLightLocation(blueLightLocations[0]?.id)}>Blue Light 1</Button>
                      <Button colorScheme={"blue"} variant={selectedBlueLightLocation === blueLightLocations[1]?.id ? "solid" : "outline"} leftIcon={<FaLocationArrow />} onClick={() => setSelectedBlueLightLocation(blueLightLocations[1]?.id)} >Blue Light 2</Button>
                      <Button colorScheme={"blue"} variant={selectedBlueLightLocation === blueLightLocations[2]?.id ? "solid" : "outline"} leftIcon={<FaLocationArrow />} onClick={() => setSelectedBlueLightLocation(blueLightLocations[2]?.id)} >Blue Light 3</Button>
                    </Stack>
                  </> :
                  <></>
                  // <Text>Select a meetup to view blue light locations!</Text>
                }
              </VStack>}

              <Button onClick={onOpen} colorScheme="blue" isDisabled={!selectedMeetup} rightIcon={<ArrowForwardIcon />}>
                Select
              </Button>
              {/* <Button onClick={handleConfirm} colorScheme="blue" isDisabled={!selectedMeetup} rightIcon={<ArrowForwardIcon />} isLoading={loadingConfirm}>
                Confirm Meetup
              </Button> */}

              {/* <Button onClick={handleConfirmManual} colorScheme="blue" isDisabled={!selectedMeetup} rightIcon={<ArrowForwardIcon />} isLoading={loadingConfirm}>
                Confirm Meetup
              </Button> */}

              {/* <Button onClick={onOpen} colorScheme="blue" isDisabled={!selectedMeetup} rightIcon={<ArrowForwardIcon />}>
                Select
              </Button> */}
              <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
              >
                <AlertDialogOverlay>
                  <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                      Confirm Selection
                    </AlertDialogHeader>

                    {!selectedMeetupLocation?.blue_light ? <AlertDialogBody>
                      <VStack align="left">
                        <AspectRatio ratio={16 / 9} width="100%" maxH="100%">
                          {meetup?.safe_meetup_enabled && selectedBlueLightMeetupLocation ?
                            <iframe
                              width="100%"
                              height="100%"
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              src={`https://www.google.com/maps/embed/v1/directions?key=${mapsAPIKey}&origin=${selectedBlueLightMeetupLocation.latitude + "," + selectedBlueLightMeetupLocation.longitude}&destination=${selectedBlueLightMeetupLocation.latitude + "," + selectedBlueLightMeetupLocation.longitude}&center=${selectedBlueLightMeetupLocation.latitude + "," + selectedBlueLightMeetupLocation.longitude}&mode=walking&zoom=18`}>
                            </iframe> : selectedMeetupLocation ? <iframe
                              width="100%"
                              height="100%"
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              src={`https://www.google.com/maps/embed/v1/directions?key=${mapsAPIKey}&origin=${selectedMeetupLocation.latitude + "," + selectedMeetupLocation.longitude}&destination=${selectedMeetupLocation.latitude + "," + selectedMeetupLocation.longitude}&center=${selectedMeetupLocation.latitude + "," + selectedMeetupLocation.longitude}&mode=walking&zoom=18`}>
                            </iframe> : <></>
                          }
                        </AspectRatio>
                        <Text>
                          Are you sure you want to choose <b>{meetup?.safe_meetup_enabled ? "Blue Light " + (blueLightLocations.findIndex(location => location?.id === selectedBlueLightLocation) + 1) : showLocation(selectedMeetup ? (JSON.parse(selectedMeetup) as PotentialMeetup).location : undefined)}</b> at <b>{showDate(selectedMeetup ? (JSON.parse(selectedMeetup) as PotentialMeetup).time : undefined)}</b> as the meetup?</Text>
                      </VStack>
                    </AlertDialogBody> : <AlertDialogBody>
                      <VStack align="left">
                        <AspectRatio ratio={16 / 9} width="100%" maxH="100%">
                          {selectedMeetupLocation ? <iframe
                            width="100%"
                            height="100%"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps/embed/v1/directions?key=${mapsAPIKey}&origin=${selectedMeetupLocation.latitude + "," + selectedMeetupLocation.longitude}&destination=${selectedMeetupLocation.latitude + "," + selectedMeetupLocation.longitude}&center=${selectedMeetupLocation.latitude + "," + selectedMeetupLocation.longitude}&mode=walking&zoom=18`}>
                          </iframe> : <></>
                          }
                        </AspectRatio>
                        <Text>
                          Are you sure you want to choose <b>{showLocation(selectedMeetup ? (JSON.parse(selectedMeetup) as PotentialMeetup).location : undefined)}</b> at <b>{showDate(selectedMeetup ? (JSON.parse(selectedMeetup) as PotentialMeetup).time : undefined)}</b> as the meetup?</Text>
                      </VStack>
                    </AlertDialogBody>}

                    <AlertDialogFooter>
                      <HStack>
                        <Button ref={cancelRef} onClick={onClose}>
                          Close
                        </Button>
                        <Button
                          colorScheme={'blue'}
                          isLoading={loadingConfirm}
                          onClick={async () => {
                            const confirmPromise = handleConfirmManual(!!(meetup?.safe_meetup_enabled && !selectedMeetupLocation?.blue_light));
                            toast.promise(confirmPromise, {
                              success: {
                                title: `Meetup Confirmed.`,
                                description: `The meetup has been successfully confirmed.`,
                                duration: 5000,
                                isClosable: true,
                              },
                              error: {
                                title: 'Error confirming meetup.',
                                description: 'An error occurred while confirming the meetup.',
                                duration: 5000,
                                isClosable: true,
                              },
                              loading: {
                                title: 'Confirming meetup...',
                                description: 'Please wait while we confirm the meetup.',
                                duration: 5000,
                                isClosable: true,
                              }
                            });
                            const { success, error } = await confirmPromise;
                            if (success) {
                              onClose();
                            } else {
                              console.error(error);
                            }
                          }}
                          leftIcon={<CheckIcon />}
                        >
                          Confirm
                        </Button>
                      </HStack>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialogOverlay>
              </AlertDialog>
            </>
          )}
        </>
      )
      }
    </VStack >
  );
};

export default ScheduledMeetup;
