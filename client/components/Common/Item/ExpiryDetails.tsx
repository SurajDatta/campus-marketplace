/**
 * ExpiryDetails.tsx
 * Component to show the expiry details of an item. This will show the expiry date and a countdown to the expiry date. TODO: make this the central component that is used, and reduce the imports to react countdown, keeping it simple.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React from "react";
import {Text } from "@chakra-ui/react";
import Countdown from 'react-countdown';
import { Meetup } from "@/types";

type ExpiryDetailsProps = {
  expiryDate: Meetup['expires_at']; // iso string
};

type CountdownProps = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
};

// Completionist component for when the countdown is complete
const Completionist = () => <Text color="red.500">The item has expired!</Text>;

// Renderer callback with condition
const renderer = ({ days, hours, minutes, seconds, completed }: CountdownProps) => {
  if (completed) {
    // Render a completed state
    return <Completionist />;
  } else {
    // Render a countdown
    return (
      <Text fontSize={"sm"} isTruncated>
        Expires in: {days}d {hours}h {minutes}m {seconds}s
      </Text>
    );
  }
};

const ExpiryDetails: React.FC<ExpiryDetailsProps> = ({ expiryDate }: ExpiryDetailsProps) => {

  return (
    <>
      {expiryDate == null ? (
        <Text color="green.500">This item has been bought!</Text>
      ) : (
        <Countdown
          date={new Date(expiryDate)}
          renderer={renderer}
        />
      )}
    </>
  )

  // return (
  //   <Box
  //     p={4}
  //     borderWidth={1}
  //     borderRadius="lg"
  //     boxShadow="lg"
  //     maxW="md"
  //     mx="auto"
  //     mt={8}
  //     textAlign="center"
  //   >
  //     <Heading size="lg" mb={4}>Expiry Details</Heading>
  //     {expiryDate == null ? (
  //       <Text color="green.500">This item has been bought!</Text>
  //     ): (
  //       <Box>
  //           <Text fontSize="lg" mb={2}>Expiry Date: {new Date(expiryDate).toLocaleString()}</Text>
  //           <Countdown
  //               date={new Date(expiryDate)}
  //               renderer={renderer}
  //           />
  //       </Box>
  //     )}

  //   </Box>
  // );
};

export default ExpiryDetails;
