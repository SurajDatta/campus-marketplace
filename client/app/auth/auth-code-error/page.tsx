/**
 * app/auth/auth-code-error/page.tsx
 * Page that is shown when there is an error with the authentication process. This page will show the user an error message and instructions on how to proceed.
 * @AshokSaravanan222
 * 09-02-2024
 */
"use client"

import { Text, Button, Heading, VStack, Link } from "@chakra-ui/react";
import * as NextLink from 'next/link';
import { useEffect, useState } from "react";

export default function AuthCodeError() {
    const [error, setError] = useState("");
    const [errorCode, setErrorCode] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        // Extract the fragment part of the URL
        if (window) {
            const fragment = window.location.href.split('#')[1];
            // Parse the fragment into key-value pairs
            const fragmentParams = new URLSearchParams(fragment);

            const error = fragmentParams.get('error');
            const errorCode = fragmentParams.get('error_code');
            const errorDescription = fragmentParams.get('error_description');

            // Default message if no error is provided
            const errorMessage = errorDescription || "An unknown error occurred.";
            setError(error ?? "Unknown Error");
            setErrorCode(errorCode ?? "Unknown Error Code");
            setErrorMessage(errorMessage);
        }
    }, []);

    return (
        <VStack p={6} textAlign="center" width={{ base: "100%", md: "50%" }}>
            <Heading>Authentication Error</Heading>
            <Text mb={6}>
                An error occurred while processing your sign-up request. This may have happened due to a server issue or a misconfiguration. Please try again by clicking the button below. If the issue persists, feel free to <Link as={NextLink.default} href="/contact" color={"teal.500"}>contact us</Link> for further assistance.
            </Text>
            <Text fontSize={"xl"} fontWeight={500}>Error: {error} ({errorCode})</Text>
            <Text fontSize={"xl"} fontWeight={500}>Details: {errorMessage}</Text>
            <Button colorScheme="blue" as={NextLink.default} href={"/"}>
                Back to Homepage
            </Button>
        </VStack>

    );
}


