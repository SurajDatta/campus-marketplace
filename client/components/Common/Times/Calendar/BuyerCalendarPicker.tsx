/**
 * CalendarPicker.tsx
 * A picker that will allow the user to select a day from a calendar, and then select the times available for that day, using the SellerTime component.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import { Badge, Box, Button, Center, Divider, Grid, GridItem, HStack, Icon, Spacer, Text, useToast, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import './Calendar.css'
import { FaCircle, FaGoogle } from 'react-icons/fa';
import BuyerTime, { BuyerTimeProps } from '../BuyerTime';

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

type BuyerCalendarPickerProps = {
    days: string[];
    legend: React.ReactNode;
    buyerLocations: number[];
} & BuyerTimeProps;

export default function BuyerCalendarPicker({ days, allTimes, availability, sellerAvailability, isMobile, onlyShowAvailable, googleCalendarUnavailability, legend, setAvailability, buyerLocations }: BuyerCalendarPickerProps) {

    const mapWeekdayToDate = (day: number) => {
        if (day === 0) {
            return 'sunday';
        } else if (day === 1) {
            return 'monday';
        } else if (day === 2) {
            return 'tuesday';
        }
        else if (day === 3) {
            return 'wednesday';
        }
        else if (day === 4) {
            return 'thursday';
        }
        else if (day === 5) {
            return 'friday';
        }
        else if (day === 6) {
            return 'saturday';
        } else {
            return ''
        }
    }

    const isActive = (date: Date) => {
        return days.some((d) => new Date(d).toDateString() === date.toDateString());
    }

    const isAvailable = (date: Date) => {
        let availableTimes: number[] = [];
        const sellerDayAvailability = sellerAvailability ? (sellerAvailability[date.toDateString()] || sellerAvailability[mapWeekdayToDate(date.getDay())]) : null;
        if (sellerDayAvailability) {
            availableTimes = sellerDayAvailability;
        } else {
            availableTimes = availability[date.toDateString()]
        }
        const busyDays = googleCalendarUnavailability ? googleCalendarUnavailability[date.toDateString()] ?? [] : [];
        // remove all times that are busy
        const availableTimesLeft = availableTimes ? availableTimes.filter((time) => !busyDays.includes(time)) : [];
        // then check if there are any times left
        return availableTimesLeft.length > 0;
    }

    const findFirstAvailableDay = () => {
        return days.find((d) => isActive(new Date(d)) && isAvailable(new Date(d)))
    }

    const [value, onChange] = useState<Value>(new Date(findFirstAvailableDay() ?? days[0]));
    const [selectedDay, setSelectedDay] = useState<string>(findFirstAvailableDay() ?? days[0]);

    const renderCalendar = () => {
        return (
            <Calendar
                onChange={(date) => {
                    if (date instanceof Date) {
                        setSelectedDay(date.toDateString());
                    }
                    onChange(date);
                }}
                value={value}
                tileContent={({ activeStartDate, date, view }) => isActive(date) ? ((isAvailable(date) ? <p><Icon as={FaCircle} color="green.500" border="1px solid white" borderRadius={"lg"} /></p> : <p><Icon as={FaCircle} color="white" border="1px solid white" borderRadius={"lg"} /></p>)) : <p><Icon as={FaCircle} color="white" border="1px solid white" borderRadius={"lg"} /></p>}
                tileDisabled={({ activeStartDate, date, view }) => !isActive(date) || (!isAvailable(date) && onlyShowAvailable!!)}
                className="react-calendar"
                formatShortWeekday={(locale, date) => {
                    if (isMobile) {
                        return date.toLocaleDateString('en-US', { weekday: 'narrow' });
                    } else {
                        return date.toLocaleDateString('en-US', { weekday: 'short' });
                    }
                }}
                minDetail='month'
                showFixedNumberOfWeeks={true}
                nextLabel={null}
                prevLabel={null}
                next2Label={null}
                prev2Label={null}
            />
        )
    }

    useEffect(() => {
        onChange(new Date(findFirstAvailableDay() ?? days[0]))
        setSelectedDay(findFirstAvailableDay() ?? days[0]);
    }, [buyerLocations])


    return (
        isMobile ?
            <VStack align={"left"} spacing={4}>
                {renderCalendar()}
                {/* {legend} */}
                <BuyerTime allTimes={allTimes} availability={availability} sellerAvailability={sellerAvailability} isMobile={isMobile} onlyShowAvailable={onlyShowAvailable} googleCalendarUnavailability={googleCalendarUnavailability} setAvailability={setAvailability} selectedDay={selectedDay} />
            </VStack>
            : <>
                <Grid
                    templateColumns="repeat(2, 1fr)"
                    gap={4}
                    mt={4}
                >
                    <GridItem colSpan={1}>
                        <VStack align={"left"} height={"100%"}>
                            {renderCalendar()}
                        </VStack>
                    </GridItem>
                    <GridItem colSpan={1}>
                        <BuyerTime allTimes={allTimes} availability={availability} sellerAvailability={sellerAvailability} isMobile={isMobile} onlyShowAvailable={onlyShowAvailable} googleCalendarUnavailability={googleCalendarUnavailability} setAvailability={setAvailability} selectedDay={selectedDay} />
                    </GridItem>
                </Grid>
                // {legend}
            </>
    );
}