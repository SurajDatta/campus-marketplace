/**
 * BlockedScreen.tsx
 * Screen to be shown if there is a restriction or a protected screen that the user cannot access. TODO: implement this on the layout page as the default content.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import { Box, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { LockIcon } from "@chakra-ui/icons";

type BlockedText = {
    blockedText: string;
};

export default function BlockedScreen({ blockedText}: BlockedText) {
    return (
        <Box borderWidth="1px" borderRadius="lg" p={6}>
            <VStack>
            <LockIcon boxSize={10} />
            <Text fontSize={"2xl"}>
                {blockedText}
            </Text>
            </VStack>
        </Box>
    );
}