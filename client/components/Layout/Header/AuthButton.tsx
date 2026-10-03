/**
 * AuthButton.tsx
 * Auth button component to show login and signup buttons in the header. TODO: change the color scheme to adjust to light/dark mode.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import { Link } from "@chakra-ui/react";
import { Button, Flex } from "@chakra-ui/react";
import * as NextLink from 'next/link';

export default function AuthButton() {
  return <Flex align="center" gap={4}>
    <Link href="/login" as={NextLink.default} passHref>
      <Button colorScheme="blue">Login</Button>
    </Link>
    <Link href="/signup" as={NextLink.default} passHref>
      <Button colorScheme="blue">Signup</Button>
    </Link>
  </Flex>
}
