/**
 * MadeForSellers.tsx
 * A collection of 3 staggerd cards that will show the benefits of becoming a seller on Licks.
 * @AshokSaravanan222
 * @2024-09-13
 */

import { AspectRatio, Box, Button, Card, CardBody, Heading, HStack, Spacer, Stack, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";
import * as NextLink from 'next/link';

type MadeForSellersProps = {
  isMobile: boolean;
}

export default function MadeForSellers({ isMobile }: MadeForSellersProps) {
  return (
    <VStack spacing={8} align="center" w="100%">
      <HStack align="center" w="100%" spacing={8}>
        {/* Left Stagger */}
        <VStack spacing={16} align="center" w="100%">
          <Card
            role="group"
            transition="transform 0.2s"
            _hover={{ transform: 'scale(1.05)' }}
          >
            <CardBody>
              <Box position="relative" width="100%" borderRadius="lg" overflow="hidden">
                <AspectRatio ratio={16 / 9}>
                  <Image
                    src={"/images/home/blueLight.png"}
                    alt={"Blue light ETS poles, make it safe to meetup at night"}
                    width={500}
                    height={500}
                  />
                </AspectRatio>
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  width="100%"
                  height="100%"
                  bgGradient="linear(to-b, blue.50, blue.100)"
                  opacity={0}
                  transition="opacity 0.2s"
                  _groupHover={{ opacity: 0.2 }}
                />
              </Box>
              <Stack mt='6' spacing='3'>
                <Heading size='md'>Blue Light Poles</Heading>
                <Text>
                  We have tracked over 50+ blue light poles on campus so you can safely meet up with your buyer and seller, right here on campus.
                </Text>
                <Button colorScheme='blue' variant='outline' as={NextLink.default} href={"/about#blue-light"}>
                  View Locations
                </Button>
              </Stack>
            </CardBody>
          </Card>

          {/* if mobile */}
          {isMobile && <Card
            role="group"
            transition="transform 0.2s"
            _hover={{ transform: 'scale(1.05)' }}
          >
            <CardBody>
              <Box position="relative" width="100%" borderRadius="lg" overflow="hidden">
                <AspectRatio ratio={16 / 9}>
                  <Image
                    src={"/images/home/schedule.png"}
                    alt={"Scheudling a meetup on marketplace, using Google Calendar"}
                    width={500}
                    height={500}
                  />
                </AspectRatio>
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  width="100%"
                  height="100%"
                  bgGradient="linear(to-b, blue.50, blue.100)"
                  opacity={0}
                  transition="opacity 0.2s"
                  _groupHover={{ opacity: 0.2 }}
                />
              </Box>
              <Stack mt='6' spacing='3'>
                <Heading size='md'>Scheduled Meetup</Heading>
                <Text>
                  We get that it is hard to find a time to meet. Features like Google Calendar integration and on-campus locations make it easy to quickly schedule a meetup.
                </Text>
                <Button colorScheme='blue' variant='outline' as={NextLink.default} href={"/signup"}>
                  Become a Seller
                </Button>
              </Stack>
            </CardBody>
          </Card>}

          {/* Second Card */}
          <Card
            role="group"
            transition="transform 0.2s"
            _hover={{ transform: 'scale(1.05)' }}
          >
            <CardBody>
              <Box position="relative" width="100%" borderRadius="lg" overflow="hidden">
                <AspectRatio ratio={16 / 9}>
                  <Image
                    src={"/images/home/cheap.png"}
                    alt={"Cheap purchase with Stripe, processing fee only $1"}
                    width={500}
                    height={500}
                  />
                </AspectRatio>
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  width="100%"
                  height="100%"
                  bgGradient="linear(to-b, blue.50, blue.100)"
                  opacity={0}
                  transition="opacity 0.2s"
                  _groupHover={{ opacity: 0.2 }}
                />
              </Box>
              <Stack mt='6' spacing='3'>
                <Heading size='md'>Only $1.00</Heading>
                <Text>
                  We know that you do not have a lot of money to spare, so we only charge a $1.00 flat service fee for each transaction (from seller).
                </Text>
                <Button colorScheme='blue' variant='outline' as={NextLink.default} href={"/about#pricing"}>
                  See Pricing
                </Button>
              </Stack>
            </CardBody>
          </Card>
        </VStack>

        {/* Right Stagger */}
        {!isMobile && <VStack spacing={16} align="center" w="100%">
          <Card
            role="group"
            transition="transform 0.2s"
            _hover={{ transform: 'scale(1.05)' }}
          >
            <CardBody>
              <Box position="relative" width="100%" borderRadius="lg" overflow="hidden">
                <AspectRatio ratio={16 / 9}>
                  <Image
                    src={"/images/home/schedule.png"}
                    alt={"Scheudling a meetup on marketplace, using Google Calendar"}
                    width={500}
                    height={500}
                  />
                </AspectRatio>
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  width="100%"
                  height="100%"
                  bgGradient="linear(to-b, blue.50, blue.100)"
                  opacity={0}
                  transition="opacity 0.2s"
                  _groupHover={{ opacity: 0.2 }}
                />
              </Box>
              <Stack mt='6' spacing='3'>
                <Heading size='md'>Scheduled Meetup</Heading>
                <Text>
                  We get that it is hard to find a time to meet. Features like Google Calendar integration and on-campus locations make it easy to quickly schedule a meetup.
                </Text>
                <Button colorScheme='blue' variant='outline' as={NextLink.default} href={"/signup"}>
                  Become a Seller
                </Button>
              </Stack>
            </CardBody>
          </Card>
        </VStack>}
      </HStack>
    </VStack>
  );
}

{/* <VStack spacing={8} align="center" w="100%">
<HStack align="center" w="100%" spacing={8}>
  <VStack spacing={16} align="center" w="100%">
    <Card
      role="group"
      transition="transform 0.2s"
      _hover={{ transform: 'scale(1.05)' }}
    >
      <CardBody>
        <Box position="relative" width="100%" borderRadius="lg" overflow="hidden">
          <AspectRatio ratio={1} width="50%">
            <Image
              src={"images/scooter.png"}
              alt={"Scooter"}
              objectFit="cover"
              objectPosition={"center"}
              width="100%"
              height="100%"
            />
          </AspectRatio>
          <Box
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            bgGradient="linear(to-b, blue.50, blue.100)"
            opacity={0}
            transition="opacity 0.2s"
            _groupHover={{ opacity: 0.2 }}
          />
        </Box>
        <Stack mt='6' spacing='3'>
          <Heading size='md'>Directly to Your Bank</Heading>
          <Text>
            We use Stripe to ensure that you get money directly to your bank account, and do not leave anything up to chance.
          </Text>
          <Button colorScheme='blue' variant='outline'>
            Become a Seller
          </Button>
        </Stack>
      </CardBody>
    </Card>

    <Card
      role="group"
      transition="transform 0.2s"
      _hover={{ transform: 'scale(1.05)' }}
    >
      <CardBody>
        <Box position="relative" width="100%" borderRadius="lg" overflow="hidden">
          <AspectRatio ratio={1} width="50%">
            <Image
              src={"images/scooter.png"}
              alt={"Scooter"}
              objectFit="cover"
              objectPosition={"center"}
              width="100%"
              height="100%"
            />
          </AspectRatio>
          <Box
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            bgGradient="linear(to-b, blue.50, blue.100)"
            opacity={0}
            transition="opacity 0.2s"
            _groupHover={{ opacity: 0.2 }}
          />
        </Box>
        <Stack mt='6' spacing='3'>
          <Heading size='md'>Only $1</Heading>
          <Text>
            We only charge a $1 as a service fee for each transaction, and nothing more. We believe in keeping things simple.
          </Text>
          <Button colorScheme='blue' variant='outline'>
            See Pricing
          </Button>
        </Stack>
      </CardBody>
    </Card>
  </VStack>

  <VStack spacing={16} align="center" w="100%">
    <Card
      role="group"
      transition="transform 0.2s"
      _hover={{ transform: 'scale(1.05)' }}
    >
      <CardBody>
        <Box position="relative" width="100%" borderRadius="lg" overflow="hidden">
          <AspectRatio ratio={1} width="50%">
            <Image
              src={"images/scooter.png"}
              alt={"Scooter"}
              objectFit="cover"
              objectPosition={"center"}
              width="100%"
              height="100%"
            />
          </AspectRatio>
          <Box
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            bgGradient="linear(to-b, blue.50, blue.100)"
            opacity={0}
            transition="opacity 0.2s"
            _groupHover={{ opacity: 0.2 }}
          />
        </Box>
        <Stack mt='6' spacing='3'>
          <Heading size='md'>Easy Negotiation</Heading>
          <Text>
            You can decide whether you are okay with negotiating prices with buyers, and even have the option to adjust the price at the time of the meetup.
          </Text>
          <Button colorScheme='blue' variant='outline'>
            Learn More
          </Button>
        </Stack>
      </CardBody>
    </Card>
  </VStack>
</HStack>
</VStack> */}