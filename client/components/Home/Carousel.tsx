/**
 * Carouse.tsx
 * A carousel that will display the 'who we are not' section of the website, scroll through the different slides.
 * @AshokSaravanan222
 * @2024-08-26
 */
import React, { useState, useEffect } from 'react';
import { Box, IconButton, Flex, Text, VStack, Heading, AspectRatio, Grid, GridItem, HStack, Table, Tfoot, SimpleGrid, useBreakpointValue, Spacer, Button, Icon, ButtonGroup, Stat, Tag } from '@chakra-ui/react';
import { ArrowForwardIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useSwipeable } from 'react-swipeable';
import { TableCaption, Tbody, Td, Th, Thead, Tr, TableContainer } from '@chakra-ui/react';
import * as NextLink from 'next/link';
import AnimatedIcon from '../Common/Other/AnimatedIcon';
import {
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
} from '@chakra-ui/react'
import Image from 'next/image';

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false); // Track user interaction

  const items = [
    {
      title: 'Secure marketplace.',
      description: "Your safety is our top priority. Server-validated identities, participant-only transaction access, and two-sided price approval help protect each exchange.",
      image: '/images/home/safe.png',
      ctaText: 'Create Account',
      ctaLink: '/signup',
    },
    {
      title: 'Convenient for your needs.',
      description: "Our platform is specifically designed to feature popular items that college students need, rather than just any random products. As we continue to expand, our goal is to become a one-stop shop for all college essentials at affordable prices.",
      image: '/images/home/marketplace.png',
      ctaText: 'View Collection',
      ctaLink: '/buy',
    },
    {
      title: 'Quick and easy transactions.',
      description: "Our mission is to streamline the buying and selling process, allowing students to focus on campus life without unnecessary distractions. With our intuitive interface, you can quickly list items, schedule meetups, and complete transactions.",
      image: '/images/home/easy.png',
      ctaText: 'Get Started',
      ctaLink: '/signup',
    },
  ];

  const isMobile = useBreakpointValue({ base: true, md: false }) ?? true;

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    setIsInteracting(true);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
    setIsInteracting(true);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      handleNext();
    },
    onSwipedRight: () => {
      handlePrev();
    },
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
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isInteracting) {
        handleNext();
      } else {
        setIsInteracting(false); // Reset interaction flag after auto-scroll
      }
    }, 5000); // Scroll every 5 seconds

    return () => clearInterval(timer);
  }, [isInteracting]);

  const renderTime = (time: number) => {
    return (isMobile ? Math.round(time) : time.toFixed(2)) + 's';
  }

  const height = isMobile ? '275px' : '400px';

  return (
    <VStack position="relative" width="100%" mx="auto" p={4} borderRadius="lg" bg="gray.100" boxShadow="md" align={"left"}>
      <Box {...handlers} overflow="hidden">
        {items.map((item, index) => (
          <Box
            key={index}
            display={index === currentIndex ? 'block' : 'none'}
            overflow="hidden"
          >
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} minH={height}>
              <AspectRatio ratio={1} width="100%" maxH={height}>
                <Image
                  src={item.image}
                  alt={item.title}
                  width={500}
                  height={500}
                />
              </AspectRatio>
              {/* {item.image ? (
                <AspectRatio ratio={1} width="100%" maxH={height}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={500}
                    height={500}
                  />
                </AspectRatio>
              ) : (
                <Box width="100%" overflowX="auto" overflowY="hidden" maxH={height}>
                  <TableContainer borderWidth={1} borderRadius="lg" height={"100%"} pb={10}>
                    <Table variant="simple" size={isMobile ? "sm" : "md"}>
                      <Thead>
                        <Tr>
                          <Th>Times</Th>
                          <Th>Quick</Th>
                          <Th>Schedule</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>
                            <HStack>
                              <AnimatedIcon
                                src="https://cdn.lordicon.com/fnxnvref.json"
                                trigger="hover"
                                colors="primary:#000000"
                                style={{ width: "25px", height: "25px" }}
                              />
                              <Text>Sell</Text>
                            </HStack>
                          </Td>
                          <Td>{renderTime(36.69)}</Td>
                          <Td>{renderTime(30.11)}</Td>
                        </Tr>
                        <Tr>
                          <Td>
                            <HStack>
                              <AnimatedIcon
                                src="https://cdn.lordicon.com/pbrgppbb.json"
                                trigger="hover"
                                colors="primary:#000000"
                                style={{ width: "25px", height: "25px" }}
                              />
                              <Text>Buy</Text>
                            </HStack>
                          </Td>
                          <Td>{renderTime(12.90)}</Td>
                          <Td>{renderTime(30.1)}</Td>
                        </Tr>
                        <Tr>
                          <Td>
                            <HStack>
                              <AnimatedIcon
                                src="https://cdn.lordicon.com/gjjvytyq.json"
                                trigger="hover"
                                colors="primary:#000000"
                                style={{ width: "25px", height: "25px" }}
                              />
                              <Text>Pay</Text>
                            </HStack>
                          </Td>
                          <Td>{renderTime(32.40)}</Td>
                          <Td>{renderTime(30.1)}</Td>
                        </Tr>
                        <Tr>
                          <Td>
                            <HStack>
                              <AnimatedIcon
                                src="https://cdn.lordicon.com/lomfljuq.json"
                                trigger="hover"
                                colors="primary:#000000"
                                style={{ width: "25px", height: "25px" }}
                              />
                              <Text>Check-In</Text>
                            </HStack>
                          </Td>
                          <Td>-</Td>
                          <Td>{renderTime(10.48)}</Td>
                        </Tr>
                        <Tr>
                          <Td>
                            <HStack>
                              <AnimatedIcon
                                src="https://cdn.lordicon.com/ogkflacg.json"
                                trigger="hover"
                                colors="primary:#000000"
                                style={{ width: "25px", height: "25px" }}
                              />
                              <Text>Confirm</Text>
                            </HStack>
                          </Td>
                          <Td>{renderTime(25.14)}</Td>
                          <Td>{renderTime(5.64)}</Td>
                        </Tr>
                      </Tbody>
                      <Tfoot>
                        <Tr>
                          <Th>Total</Th>
                          <Th>{renderTime(110.56)}</Th>
                          <Th>{renderTime(107.43)}</Th>
                        </Tr>
                      </Tfoot>
                    </Table>
                  </TableContainer>
                </Box>
              )} */}
              {/* {index === 0 ?
                <VStack width={"100%"} align={"left"}>
                  <HStack>
                    <Spacer />
                    <Stat>
                      <VStack spacing={0}>
                        <StatLabel>Blue Light Poles</StatLabel>
                        <StatNumber>50+</StatNumber>
                        <StatHelpText>
                          <StatArrow type='increase' />
                          23.36%
                        </StatHelpText>
                      </VStack>
                    </Stat>
                  </HStack>
                  <HStack>
                    <Stat>
                      <VStack spacing={0}>
                        <StatLabel>Time Saved</StatLabel>
                        <StatNumber>10X</StatNumber>
                        <StatHelpText>Create a listing using 10x</StatHelpText>
                      </VStack>
                    </Stat>
                    <Spacer />
                  </HStack>
                  <HStack>
                    <Spacer />
                    <Stat>
                      <VStack spacing={0}>
                        <StatLabel>Collected Fees</StatLabel>
                        <StatNumber>£0.00</StatNumber>
                        <StatHelpText>Feb 12 - Feb 28</StatHelpText>
                      </VStack>
                    </Stat>
                  </HStack>
                </VStack> : index === 1 ?
                  <VStack width={"100%"} align={"left"}>
                    <Tag colorScheme='green'>Shoes</Tag>
                    <Tag>Microwaves</Tag>
                    <Tag>Fridges</Tag>
                    <Text>Google Calendar</Text>
                    <Text>AI Autofill</Text>
                    <Text>Share Location</Text>
                  </VStack> :
                  <Box width="100%" overflowX="auto" overflowY="hidden" maxH={height}>
                    <TableContainer borderWidth={1} borderRadius="lg" height={"100%"} pb={10}>
                      <Table variant="simple" size={isMobile ? "sm" : "md"}>
                        <Thead>
                          <Tr>
                            <Th>Times</Th>
                            <Th>Quick</Th>
                            <Th>Schedule</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          <Tr>
                            <Td>
                              <HStack>
                                <AnimatedIcon
                                  src="https://cdn.lordicon.com/fnxnvref.json"
                                  trigger="hover"
                                  colors="primary:#000000"
                                  style={{ width: "25px", height: "25px" }}
                                />
                                <Text>Sell</Text>
                              </HStack>
                            </Td>
                            <Td>{renderTime(36.69)}</Td>
                            <Td>{renderTime(30.11)}</Td>
                          </Tr>
                          <Tr>
                            <Td>
                              <HStack>
                                <AnimatedIcon
                                  src="https://cdn.lordicon.com/pbrgppbb.json"
                                  trigger="hover"
                                  colors="primary:#000000"
                                  style={{ width: "25px", height: "25px" }}
                                />
                                <Text>Buy</Text>
                              </HStack>
                            </Td>
                            <Td>{renderTime(12.90)}</Td>
                            <Td>{renderTime(30.1)}</Td>
                          </Tr>
                          <Tr>
                            <Td>
                              <HStack>
                                <AnimatedIcon
                                  src="https://cdn.lordicon.com/gjjvytyq.json"
                                  trigger="hover"
                                  colors="primary:#000000"
                                  style={{ width: "25px", height: "25px" }}
                                />
                                <Text>Pay</Text>
                              </HStack>
                            </Td>
                            <Td>{renderTime(32.40)}</Td>
                            <Td>{renderTime(30.1)}</Td>
                          </Tr>
                          <Tr>
                            <Td>
                              <HStack>
                                <AnimatedIcon
                                  src="https://cdn.lordicon.com/lomfljuq.json"
                                  trigger="hover"
                                  colors="primary:#000000"
                                  style={{ width: "25px", height: "25px" }}
                                />
                                <Text>Check-In</Text>
                              </HStack>
                            </Td>
                            <Td>-</Td>
                            <Td>{renderTime(10.48)}</Td>
                          </Tr>
                          <Tr>
                            <Td>
                              <HStack>
                                <AnimatedIcon
                                  src="https://cdn.lordicon.com/ogkflacg.json"
                                  trigger="hover"
                                  colors="primary:#000000"
                                  style={{ width: "25px", height: "25px" }}
                                />
                                <Text>Confirm</Text>
                              </HStack>
                            </Td>
                            <Td>{renderTime(25.14)}</Td>
                            <Td>{renderTime(5.64)}</Td>
                          </Tr>
                        </Tbody>
                        <Tfoot>
                          <Tr>
                            <Th>Total</Th>
                            <Th>{renderTime(110.56)}</Th>
                            <Th>{renderTime(107.43)}</Th>
                          </Tr>
                        </Tfoot>
                      </Table>
                    </TableContainer>
                  </Box>} */}

              <VStack align={"left"} height="100%">
                <Heading>{item.title}</Heading>
                <Text noOfLines={6} fontSize={isMobile ? "lg" : "2xl"}>{item.description}</Text>
                <ButtonGroup>
                  <Button
                    role='group'
                    as={NextLink.default}
                    href={item.ctaLink}
                    colorScheme='blue'
                    rightIcon={
                      <Icon
                        as={ArrowForwardIcon}
                        transition="transform 0.2s"
                        _groupHover={{ transform: 'translateX(5px)' }}
                      />
                    }
                  >
                    {item.ctaText}
                  </Button>
                </ButtonGroup>
              </VStack>
            </SimpleGrid>
            {/* Icons */}
            <IconButton
              aria-label="Previous Image"
              icon={<ChevronLeftIcon color={"#ceb888"} boxSize={8} stroke="black" strokeWidth="0.3" />}
              background={"transparent"}
              size={"sm"}
              position="absolute"
              left={isMobile ? "0px" : "-40px"}
              top={isMobile ? "30%" : "50%"}
              transform="translateY(-50%)"
              onClick={handlePrev}
            />
            <IconButton
              aria-label="Next Image"
              icon={<ChevronRightIcon color={"#ceb888"} boxSize={8} stroke="black" strokeWidth="0.3" />}
              size={"sm"}
              background={"transparent"}
              position="absolute"
              right={isMobile ? "0px" : "-40px"}
              top={isMobile ? "30%" : "50%"}
              transform="translateY(-50%)"
              onClick={handleNext}
            />
          </Box>
        ))}
      </Box>

      {/* Dots for Pagination */}
      <Flex justifyContent="center" mt={4}>
        {items.map((_, index) => (
          <Box
            key={index}
            width="8px"
            height="8px"
            borderRadius="50%"
            backgroundColor={currentIndex === index ? "#ceb888" : "transparent"}
            border="1px solid black"
            mx="2px"
          />
        ))}
      </Flex>
    </VStack >
  );
}
