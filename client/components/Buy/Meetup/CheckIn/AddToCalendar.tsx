/**
 * AddToCalendar.tsx
 * Button that will allow for more calendar selection, also with a menu instead.
 * @AshokSaravanan222
 * 09-09-2024
 */
import { Menu, MenuButton, MenuItem, MenuList, Button } from '@chakra-ui/react';
import { FaApple, FaGoogle, FaMicrosoft } from 'react-icons/fa';
import { CalendarIcon } from '@chakra-ui/icons';
import * as NextLink from 'next/link';
import * as ics from 'ics';

type AddToCalendarProps = {
    title: string;
    startDate: string; // ISO string
    endDate: string;   // ISO string
    description: string;
    location: string;
};

export default function AddToCalendar({
    title,
    startDate,
    endDate,
    description,
    location
}: AddToCalendarProps) {

    // use add to calendar button if people really want it.
    const formatDateArray = (date: string) => {
        const parsedDate = new Date(date);
        return [
            parsedDate.getFullYear(),
            parsedDate.getMonth() + 1, // Months are zero-based
            parsedDate.getDate(),
            parsedDate.getHours(),
            parsedDate.getMinutes(),
        ];
    };

    const start = formatDateArray(startDate);
    const duration = {
        hours: Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60)),
        minutes: Math.floor(((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60)) % 60),
    };

    const generateGoogleCalendarLink = (title: string, startDate: string, endDate: string, description: string, location: string) => {
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
            title
        )}&dates=${startDate.replace(/-|:|\.\d\d\d/g, '')}/${endDate.replace(/-|:|\.\d\d\d/g, '')}&details=${encodeURIComponent(
            description
        )}&location=${encodeURIComponent(location)}&sf=true&output=xml`;
        return calendarUrl;
    }

    const downloadICS = () => {
        const event = {
            start: start,
            duration: duration,
            title: title,
            description: description,
            location: location,
        } as ics.EventAttributes

        ics.createEvent(event, (error, value) => {
            if (error) {
                console.log(error);
                return;
            }

            const blob = new Blob([value], { type: 'text/calendar' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/\s+/g, '_')}.ics`;
            a.click();

            URL.revokeObjectURL(url); // Clean up after the download
        });
    };

    function generateOutlookLink(title: string, startDate: string, endDate: string, description: string, location: string) {
        const baseUrl = "https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose";
        const params = new URLSearchParams({
            subject: title,
            startdt: startDate,
            enddt: endDate,
            body: description,
            location: location,
        });

        return `${baseUrl}&${params.toString()}`;
    }

    return (
        <>
            <Menu>
                <MenuButton as={Button} colorScheme='blue' leftIcon={<CalendarIcon />} size={"sm"}>
                    Add to Calendar
                </MenuButton>
                <MenuList>
                    <MenuItem icon={<FaApple />} onClick={downloadICS}>
                        Apple Calendar
                    </MenuItem>
                    <MenuItem icon={<FaGoogle />} as={NextLink.default} href={generateGoogleCalendarLink(title, startDate, endDate, description, location)} target="_blank" rel="noopener noreferrer">
                        Google Calendar
                    </MenuItem>
                    <MenuItem icon={<FaMicrosoft />} as={NextLink.default} href={generateOutlookLink(title, startDate, endDate, description, location)} target="_blank" rel="noopener noreferrer">
                        Outlook Calendar
                    </MenuItem>
                </MenuList>
            </Menu>

            {/* Hidden AddToCalendarButton components */}
            {/* <div style={{ display: 'none' }}>
                <AddToCalendarButton
                    name={title}
                    options={['Apple']}
                    location={location}
                    description={description}
                    startDate={formattedStartDate.date}
                    endDate={formattedEndDate.date}
                    startTime={formattedStartDate.time}
                    endTime={formattedEndDate.time}
                    timeZone="UTC"
                />
            </div>
            <div style={{ display: 'none' }}>
                <AddToCalendarButton
                    name={title}
                    options={['Google']}
                    location={location}
                    description={description}
                    startDate={formattedStartDate.date}
                    endDate={formattedEndDate.date}
                    startTime={formattedStartDate.time}
                    endTime={formattedEndDate.time}
                    timeZone="UTC"
                />
            </div>
            <div style={{ display: 'none' }}>
                <AddToCalendarButton
                    name={title}
                    options={['Outlook.com']}
                    location={location}
                    description={description}
                    startDate={formattedStartDate.date}
                    endDate={formattedEndDate.date}
                    startTime={formattedStartDate.time}
                    endTime={formattedEndDate.time}
                    timeZone="UTC"
                />
            </div> */}
        </>
    );
}
