/**
 * ItemDetails.tsx
 * Main page to be show after someone has clicked on an item from the buy page. Will show the details of the item, including the title, price, condition, category, description, photos, and contact/schedule information.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */

import { Box, Grid, GridItem, VStack, HStack, Text, Divider, Spacer, Skeleton, Icon, SimpleGrid, AspectRatio, Image, FormControl, FormLabel, Switch, FormErrorMessage, Button, Link, Accordion, Checkbox, Badge, useToast } from "@chakra-ui/react";
import { Availability, AvailabilityLocations, BuyerMeetups, Categories, Location, Profile, Schedule, Time, User } from '@/types';
import ImageCarousel from "../../../Common/Item/ImageCarousel";
import {LockIcon } from "@chakra-ui/icons";
import { FaLightbulb, FaMoneyBill, FaShoppingBag } from "react-icons/fa";
import { CgNotes } from "react-icons/cg";
import ItemPrice from "@/components/Common/Item/ItemPrice";
import BlockedScreen from "@/components/Common/Other/BlockedScreen";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { BsPersonRaisedHand } from "react-icons/bs";
import { MdChecklist } from "react-icons/md";
import * as Yup from 'yup';
import * as NextLink from 'next/link';
import React, { useEffect } from "react";
import AuthButton from "@/components/Layout/Header/AuthButton";
import ScheduleSelect from "../Select/ScheduleSelect";
import { updateFavorites } from "@/utils/services/buy";
import { useQueryClient } from "@tanstack/react-query";

export type ItemDetailsProps = {
  id?: string;
  title: string;
  listing_price: number; // orginal price of the item
  price: number;
  condition: string;
  quantity: number;
  categories: number[];
  description: string;
  photos: { photo_url: string, photo_size: { x: number, y: number, w: number, h: number } }[];
  sellerContact: string[];
  sellerSchedules: Schedule[]
  isMobile: boolean;
  allCategories: Categories[];
  allTimes: Time[];
  allLocations: Location[];

  itemLoading: boolean;
  scheduleLoading: boolean;
  contactLoading: boolean;
  timesLoading: boolean;
  locationsLoading: boolean;

  contactEnabled: boolean;
  scheduleEnabled: boolean;
  safeMeetupEnabled: boolean;

  days: string[] // used to show the days that can be selected from
  googleCalendarUnavailability: Availability; // times that are blocked in google calendar
  editable: boolean;
  isActive: boolean,
  negotiable: boolean;
  verified: boolean;
  contact?: boolean;
  schedule?: boolean;
  safeMeetup?: boolean;
  setContact?: React.Dispatch<React.SetStateAction<boolean>>;
  setSchedule?: React.Dispatch<React.SetStateAction<boolean>>;
  setSafeMeetup?: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: (values: BuyerSelectFormData, actions: FormikHelpers<BuyerSelectFormData>) => void;
  locked: boolean; // if the screen should be locked
  sellerId: string | null;
}

type ItemSelectProps = {
  user: User | null;
  userProfile: Profile | null;
  googleMapsAPIKey: string | null;
  allSellerLocations: Location[];
  buyerLocations?: number[];
  setBuyerLocations?: React.Dispatch<React.SetStateAction<number[]>>;
  buyerContact?: string[];
  setBuyerContact?: React.Dispatch<React.SetStateAction<string[]>>;
  buyerMeetups?: BuyerMeetups
  setBuyerMeetups?: React.Dispatch<React.SetStateAction<BuyerMeetups>>;
}


export type BuyerSelectFormData = {
  contact: boolean;
  schedule: boolean;
  buyerLocations: number[];
  buyerContact: string[];
  buyerMeetups: BuyerMeetups;
  safeMeetup: boolean;
}

export default function ItemDetails({ id, title, listing_price, price, condition, categories, description, photos, contact, schedule, sellerContact, sellerSchedules, isMobile, allCategories, allTimes, allLocations, itemLoading, timesLoading, locationsLoading, contactLoading, days, editable, isActive, setContact, setSchedule, user, userProfile, googleMapsAPIKey, buyerContact, setBuyerContact, contactEnabled, scheduleEnabled, negotiable, verified, googleCalendarUnavailability, buyerMeetups, setBuyerMeetups, safeMeetupEnabled, setSafeMeetup, safeMeetup, scheduleLoading, handleSubmit, locked, quantity, sellerId, buyerLocations, setBuyerLocations, allSellerLocations }: ItemDetailsProps & ItemSelectProps) {

  const queryClient = useQueryClient();
  const daysOfWeek: ('sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday')[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  const toast = useToast();


  const scheduleToTimes = (schedules: Schedule[], buyerLocations: number[]): Availability => {
    return schedules.filter((schedule) => buyerLocations.includes(schedule.location)).reduce((acc, schedule) => {
      for (const weekday of daysOfWeek) {
        if (schedule[weekday]) {
          if (acc[weekday]) {
            acc[weekday] = [
              ...new Set([...(acc[weekday] || []), ...(schedule[weekday] || [])]),
            ];
          } else {
            acc[weekday] = schedule[weekday] || [];
          }
        }
      }
      const availability = schedule.days as Availability;
      for (const day of Object.keys(availability)) {
        if (availability[day]) {
          if (acc[day]) {
            acc[day] = [
              ...new Set([...(acc[day] || []), ...(availability[day] || [])]),
            ];
          } else {
            acc[day] = availability[day] || [];
          }
        }
      }
      return acc;
    }, {} as Availability);
  };


  const scheduleToLocations = (schedules: Schedule[]): AvailabilityLocations => {
    return schedules.reduce((acc, schedule) => {
      for (const weekday of daysOfWeek) {
        if (schedule[weekday]) {
          if (acc[weekday]) {
            acc[weekday] = [...(schedule[weekday] || []), ...Object.keys(acc[weekday])]
              .reduce((acc2, time) => {
                acc2[Number(time)] = [
                  ...new Set([schedule.location, ...(acc[weekday][Number(time)] || [])]),
                ];
                return acc2;
              }, {} as AvailabilityLocations["key"]);
          } else {
            acc[weekday] = (schedule[weekday] || []).reduce((acc2, time) => {
              acc2[time] = [schedule.location];
              return acc2;
            }, {} as AvailabilityLocations["key"]);
          }
        }
      }
      const availability = schedule.days as Availability;
      for (const day of Object.keys(availability)) {
        if (availability[day]) {
          if (acc[day]) {
            acc[day] = [...(availability[day] || []), ...Object.keys(acc[day])]
              .reduce((acc2, time) => {
                acc2[Number(time)] = [
                  ...new Set([schedule.location, ...(acc[day][Number(time)] || [])]),
                ];
                return acc2;
              }, {} as AvailabilityLocations["key"]);
          } else {
            acc[day] = (availability[day] || []).reduce((acc2, time) => {
              acc2[time] = [schedule.location];
              return acc2;
            }, {} as AvailabilityLocations["key"]);
          }
        }
      }
      return acc;
    }, {} as AvailabilityLocations);
  };

  const isContactComplete = (buyerContact: string[]) => {
    return buyerContact.length >= 0 && isContactValid(buyerContact);
  }

  const isContactValid = (buyerContact: string[]) => {
    // check that all of the contact details are filled out
    for (const contact of buyerContact) {
      if (contact === 'email' || contact === 'phone') {
        continue;
      } else if (userProfile && userProfile.contact_details && !(userProfile.contact_details as { [key: string]: string })[contact]) {
        return false;
      }
    }
    return true
  }

  const isScheduleComplete = (buyerMeetups: BuyerMeetups) => {
    // find number of timeIds
    const totalMeetups = Object.keys(buyerMeetups).reduce((acc, day) => {
      return acc + Object.keys(buyerMeetups[day]).length;
    }, 0);
    return (totalMeetups >= 1) && isScheduleValid(buyerMeetups);
  }

  const isScheduleValid = (buyerMeetups: BuyerMeetups) => {
    // want to count number of locations that are not 0
    const numSelected = Object.keys(buyerMeetups).reduce((acc, day) => acc + Object.keys(buyerMeetups[day]).length, 0)
    const numCompleted = Object.keys(buyerMeetups).reduce((acc, day) => acc + Object.keys(buyerMeetups[day]).reduce((acc, timeId) => acc + (buyerMeetups[day][Number(timeId)].location !== 0 ? 1 : 0), 0), 0)
    return numSelected === numCompleted;
  }

  const listingValidationSchema = Yup.object().shape({
    contact: Yup.boolean()
      .test(
        'contact-required',
        'Either quick or scheduled meetup must be enabled, but not both.',
        function (value) {
          const { schedule } = this.parent;
          return (value || schedule) && !(value && schedule);
        }
      ),
    schedule: Yup.boolean()
      .test(
        'schedule-required',
        'Either quick or scheduled meetup must be enabled, but not both.',
        function (value) {
          const { contact } = this.parent;
          return (value || contact) && !(value && contact);
        }
      ),
    buyerLocations: Yup.array().when('schedule', {
      is: true,
      then: (schema) =>
        schema
          .test('is-complete', 'One contact location is required', (value) => {
            return value && value.length > 0;
          }),
      otherwise: (schema) => schema.notRequired(),
    }),
    buyerContact: Yup.array().when('contact', {
      is: true,
      then: (schema) =>
        schema
          .test('is-valid', 'One or more contact details are empty', (value) => {
            return value && (value.length === 0 || isContactValid(value));
          })
          .test('is-complete', 'One contact detail is required', (value) => {
            return value && isContactComplete(value);
          }),
      otherwise: (schema) => schema.notRequired(),
    }),
    buyerMeetups: Yup.object().when('schedule', {
      is: true,
      then: (schema) =>
        schema
          .test('is-valid', 'A location must be chosen for each timeslot', (value) => {
            return value && (Object.keys(value).length === 0 || isScheduleValid(value));
          })
          .test('is-complete', 'At least 1 time slot is required', (value) => {
            return value && isScheduleComplete(value);
          }),
      otherwise: (schema) => schema.notRequired(),
    })
  });

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

  const weekdayMap: { [key: string]: string } = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday"
};

const getWeekday = (day: string) => {
    const date = new Date(day);
    return weekdayMap[date.getDay()];
}

  const renderRequest = (sellerLocations: Location[]) => {
    return (
      <Formik
        initialValues={{
          contact: false,
          schedule: true,
          buyerLocations: sellerLocations.map((loc) => loc.id),
          buyerContact: [],
          buyerMeetups: {},
          safeMeetup: true,
        } as BuyerSelectFormData}
        validationSchema={listingValidationSchema}
        validateOnBlur={true}
        validateOnChange={true}
        onSubmit={handleSubmit}
      >
        {(props) => {
          useEffect(() => {
            if (Object.keys(props.errors).length > 0 && props.isSubmitting) {
              [...new Set(Object.values(props.errors))].forEach((error: any) => {
                if (!((error === "A location must be chosen for each timeslot" || error === "At least 1 time slot is required") && isScheduleComplete(props.values.buyerMeetups))) {
                  toast({
                    title: 'Validation Error',
                    description: error,
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                  });
                }
              });
            }
          }, [props.errors, toast, props.submitCount]);

          return (
            <Form>
              <VStack align={"left"}>
                <FormControl isInvalid={!!((props.errors.schedule && props.touched.schedule) || (props.errors.contact && props.touched.contact))}>
                  <Skeleton isLoaded={!itemLoading}>
                    <VStack align={"left"}>
                      <HStack>
                        <Icon as={BsPersonRaisedHand} boxSize={5} />
                        <Text>Schedule Meetup</Text>
                      </HStack>

                      {!locked && <SimpleGrid columns={isMobile ? 3 : 5} spacing={2} mt={2}>
                        {sellerLocations.map((loc) => {
                          return (
                            <VStack align={"left"} spacing={0}>
                              <Box position={"relative"}>
                                <AspectRatio ratio={1} width={"100%"} height={"100%"}>
                                  <Image
                                    src={loc.img_url}
                                    alt={loc.name}
                                    width={500}
                                    height={500}
                                    style={{ borderRadius: "10px" }}
                                  />
                                </AspectRatio>
                                <Checkbox
                                  isChecked={props.values.buyerLocations.includes(loc.id)}
                                  onChange={(e) => {
                                    const newLocations = e.target.checked
                                      ? [...props.values.buyerLocations, loc.id]
                                      : props.values.buyerLocations.filter((locationId) => locationId !== loc.id);
                                    props.setFieldValue('buyerLocations', newLocations);

                                    // Update buyerMeetups to remove meetups with locations not in newLocations
                                    const sellerLocations = scheduleToLocations(sellerSchedules)
                                    const buyerMeetups = props.values.buyerMeetups;
                                    const newBuyerMeetups = {} as BuyerMeetups;

                                    for (const day in buyerMeetups) {
                                      const timeSlots = buyerMeetups[day];
                                      const newTimeSlots = {} as BuyerMeetups["key"]

                                      for (const timeId in timeSlots) {

                                        const dayLocationsIds = (sellerLocations && sellerLocations[day] && sellerLocations[day][Number(timeId)]) ? sellerLocations[day][Number(timeId)] : []
                                        const weekdayLocationIds = (sellerLocations && sellerLocations[getWeekday(day)] && sellerLocations[getWeekday(day)][Number(timeId)]) ? sellerLocations[getWeekday(day)][Number(timeId)] : []
                                        const locationIds = [...weekdayLocationIds, ...dayLocationsIds]

                                        const meetup = timeSlots[Number(timeId)];
                                        if (newLocations.includes(meetup.location)) {
                                          newTimeSlots[Number(timeId)] = meetup;
                                        } else {
                                          // we should only add the location if the seller has availability at that timeslot
                                          if (locationIds.includes(newLocations[0])) {
                                            newTimeSlots[Number(timeId)] = {
                                              location: newLocations[0]
                                            }
                                          }
                                        }
                                      }

                                      if (Object.keys(newTimeSlots).length > 0) {
                                        newBuyerMeetups[day] = newTimeSlots;
                                      }
                                    }

                                    props.setFieldValue('buyerMeetups', newBuyerMeetups);
                                  }}
                                  pb={2}
                                  position="absolute"
                                  top={1}
                                  right={1}
                                  size="lg"
                                  iconSize="10px"
                                  sx={{
                                    '& > span:first-of-type': {
                                      borderRadius: '50%', // Makes the checkbox circular
                                      width: '24px', // Adjusts the size of the checkbox
                                      height: '24px',
                                    }
                                  }}
                                />
                              </Box>
                              <Text isTruncated>{loc.name}</Text>
                            </VStack>
                          )
                        }
                        )}
                      </SimpleGrid>}

                      {!locked && <Field name='safeMeetup'>
                        {({ field, form }: any) => (
                          <FormControl isInvalid={form.errors.safeMeetup && form.touched.safeMeetup}>
                            <VStack align={"left"} spacing={0}>
                              <HStack >
                                <Icon as={FaLightbulb} boxSize={5} color={"#3182ce"} />
                                <FormLabel pt={2}>
                                  Require Safe Meetup
                                </FormLabel>
                                <Switch id='safeMeetup'
                                  {...field}
                                  isChecked={form.values.safeMeetup}
                                  onChange={e => {
                                    form.setFieldValue(field.name, e.target.checked);
                                  }}
                                />
                              </HStack>
                              <Text fontSize={"sm"} opacity={0.5}>If enabled, the seller will schedule the final meetup location at the nearest Blue Light Pole.</Text>
                              <FormErrorMessage>{form.errors.safeMeetup}</FormErrorMessage>
                            </VStack>
                          </FormControl>
                        )}
                      </Field>}
                    </VStack>
                  </Skeleton>
                  <Accordion allowMultiple defaultIndex={(contact || schedule) ? [] : contactEnabled ? scheduleEnabled ? [0, 1] : [0] : scheduleEnabled ? [1] : []}>
                  </Accordion>

                  {locked && <Box p={2}>
                    <HStack p={2} border="1px" borderRadius="lg" borderColor="gray.200" width="100%" bg={"blue.100"}>
                      <LockIcon boxSize={5} />
                      <Text>You must be signed in to buy this item.</Text>
                      <AuthButton />
                    </HStack>
                  </Box>}
                  <FormErrorMessage>{props.errors.schedule || props.errors.contact}</FormErrorMessage>
                </FormControl>

                <VStack align={"left"}>
                  {!locked && <Skeleton isLoaded={!locationsLoading}>
                    <Field name='buyerMeetups'>
                      {({ field, form }: any) => (
                        <FormControl isInvalid={(form.errors.buyerMeetups && form.touched.buyerMeetups)}>
                          {props.values.schedule && // want to check if contact is enabled, ideally through form
                            <ScheduleSelect
                              isLoadingLocations={locationsLoading} buyerMeetups={props.values.buyerMeetups} setBuyerMeetups={(e) => {
                                props.setFieldValue('buyerMeetups', e);
                                props.setFieldTouched('buyerMeetups', true);
                              }} schedulesComplete={isScheduleComplete(props.values.buyerMeetups)} allLocations={allLocations} isMobile={isMobile} googleMapsAPIKey={googleMapsAPIKey} allTimes={allTimes} sellerLocations={scheduleToLocations(sellerSchedules)} googleCalendarUnavailability={googleCalendarUnavailability} days={days} isLoadingTimes={timesLoading} sellerTimes={scheduleToTimes(sellerSchedules, props.values.buyerLocations)} buyerLocations={props.values.buyerLocations} />
                          }
                          <FormErrorMessage>{props.submitCount === 0 ? "" : form.errors.buyerMeetups}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  </Skeleton>}
                </VStack>

                {
                  !locked && <VStack align={"left"}>
                    <Divider borderColor={"black"} />
                    <Text fontSize={"sm"} opacity={0.5}>{userProfile?.id === sellerId ? "You cannot buy your own item." : "Your card will only be charged after you meetup and confirm the purchase."}</Text>
                    {setContact && setSchedule && !editable &&
                      <Button
                        colorScheme="blue"
                        rightIcon={<FaShoppingBag />}
                        type="button"
                        onClick={props.submitForm}
                        isDisabled={!isScheduleComplete(props.values.buyerMeetups) || !isScheduleValid(props.values.buyerMeetups) || (userProfile?.id === sellerId)}
                        isLoading={props.isSubmitting}
                      >Request Buy</Button>}
                  </VStack>
                }
              </VStack >
            </Form >
          )
        }}
      </Formik >
    )
  }

  const renderDescription = () => {
    return (
      <Skeleton isLoaded={!itemLoading}>
        <VStack align={"left"}>
          <HStack>
            <Icon as={MdChecklist} boxSize={5} />
            <Text>Condition</Text>
          </HStack>
          <Text opacity={"0.5"}>{condition.length == 0 ? "condition" : condition}</Text>
          <HStack>
            <Icon as={CgNotes} boxSize={5} />
            <Text>Description</Text>
          </HStack>
          <Text opacity={"0.5"}>{description.length === 0 ? "Your product description will go here." : description}</Text>
        </VStack>
      </Skeleton>
    )
  }

  const renderPrice = () => {
    return (
      <Skeleton isLoaded={!itemLoading}>
        <VStack align={"left"}>
          <HStack>
            <Icon as={FaMoneyBill} boxSize={5} />
            <Text>Price</Text>
            {negotiable ? <Badge colorScheme="green">Negotiable</Badge> : <Badge colorScheme="red">Non-Negotiable</Badge>}
          </HStack>
          <ItemPrice price={price} listingPrice={listing_price} size="" isMobile={isMobile} />
        </VStack>
      </Skeleton>
    )
  }


  const renderProductInfo = () => {
    const categoryList = allCategories.filter(category => categories.includes(category.id))
    const sortedAllCategories = allCategories.sort((a, b) => {
      if (a.short === "Misc") return 1;
      if (b.short === "Misc") return -1;
      return 0; // Maintain original order for other categories
    })

    return (
      <Skeleton isLoaded={!itemLoading}>
        <VStack align={"left"}>
          <HStack>
            <Text fontWeight="bold" fontSize="4xl">
              {title.length == 0 ? "Title" : title}
            </Text>
            <Spacer />
            <Skeleton isLoaded={!itemLoading}>
              {verified && <Badge colorScheme="green">Verified Seller</Badge>}
            </Skeleton>
          </HStack>
          <Skeleton isLoaded={categoryList.length !== 0 || editable}>
            {categoryList.length !== 0 ? <HStack>
              {categoryList.map((category) => <Text color={"#ceb888"} as="u"><Link as={NextLink.default} href={`/buy?category=${sortedAllCategories.indexOf(category) + 2}`}>{category.name}</Link></Text>)}
            </HStack> : <Text>Loading category</Text>}
          </Skeleton>
        </VStack>
      </Skeleton>
    )
  }

  const renderItem = () => {
    return (
      <>
        {renderProductInfo()}
        <Divider borderColor={"black"} />
        {renderPrice()}
        <Divider borderColor={"black"} />
        {renderDescription()}
        <Divider borderColor={"black"} />
        {renderRequest(allSellerLocations)}
      </>
    )
  }


  return (
    isActive ? (
      isMobile ? (
        <VStack spacing={6} align={"left"} key={JSON.stringify(allSellerLocations)}>
          <Box width={{ base: "100%", md: "50%" }}>
            <ImageCarousel photos={photos} loading={itemLoading} isMobile={isMobile} title={title} description={description} itemId={id ?? ""} sellerId={sellerId ?? ""} updateFavorite={handleFavoriteUpdate} isFavorite={userProfile ? userProfile.favorites.includes(id ?? "") : false} />
          </Box>
          {renderItem()}
        </VStack>
      ) : (
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <GridItem colSpan={1}>
            <Box position="sticky" top={0} width={"100%"}>
              <ImageCarousel photos={photos} loading={itemLoading} isMobile={isMobile} title={title} description={description} itemId={id ?? ""} sellerId={sellerId ?? ""} updateFavorite={handleFavoriteUpdate} isFavorite={userProfile ? userProfile.favorites.includes(id ?? "") : false} />
            </Box>
          </GridItem>
          <GridItem colSpan={1}>
            <VStack align={"left"} key={JSON.stringify(allSellerLocations)}>
              {renderItem()}
            </VStack>
          </GridItem>
        </Grid>
      )
    ) : (editable) ? (
      <VStack align={"left"}>
        <BlockedScreen blockedText="Your item is inactive." />
      </VStack>
    ) : (
      <>
        <BlockedScreen blockedText="This item is no longer available." />
        {editable && <Text>Click <Link as={NextLink.default} href={`${window.location.origin}/my-stuff/${id}`} color={"teal"}>here</Link> to view the past meetups.</Text>}
      </>
    )
  )
}
