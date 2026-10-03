/**
 * Footer.tsx
 * Footer to be shown on every screen, providing links to the main pages of the website. TODO: implement color mode, which should adjust to light/dark mode.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React from 'react'
import { Box, Text, VStack, HStack, Stack, Link } from '@chakra-ui/react'
import * as NextLink from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <Box
      as="footer"
      width="100%"
      bg={"#ceb888"}
      color="black"
      py={{ base: 4, md: 8 }}
      px={{ base: 10, md: 20 }}
    >
      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={{ base: 4, md: 10 }}
        justify="space-between"
        align="flex-start"
      >
        <VStack align="flex-start">
          <Text fontWeight="bold">Marketplace</Text>
          <Link as={NextLink.default} href='/'>Home</Link>
          <Link as={NextLink.default} href='/updates'>Updates</Link>
        </VStack>

        <VStack align="flex-start">
          <Text fontWeight="bold">Policies</Text>
          <Link as={NextLink.default} href='/terms'>Terms of Service</Link>
          <Link as={NextLink.default} href='/privacy'>Privacy Policy</Link>
        </VStack>

        <VStack align="flex-start">
          <Text fontWeight="bold">About</Text>
          <Link as={NextLink.default} href='/about'>About Us</Link>
          <Link as={NextLink.default} href='/contact'>Contact Us</Link>
        </VStack>
        
        <VStack align="flex-start">
          <Link href="/" as={NextLink.default}>
            <Image
              src={"/images/campus-marketplace-logo.png"}
              alt={`Campus Marketplace Logo`}
              width={100}
              height={100}
            />
          </Link>
        </VStack>
      </Stack>


      <HStack justify="center" mt={8}>
        <Text>© Campus Marketplace 2025</Text>
      </HStack>
    </Box>
  )
}
