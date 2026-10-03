/**
 * app/login/page.tsx
 * Login page where users can login to their account, using email/phone and password.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use client"
import React, { useState } from 'react';
import { Link, Text, VStack, Box, Button, Icon, Skeleton, AspectRatio, Center } from '@chakra-ui/react';
import { FormikHelpers } from 'formik';
import { useRouter } from 'next/navigation';
import * as NextLink from 'next/link';
import { encryptOTPHash } from '@/utils/services/encrypt';
import { checkUserEmail, checkUserPhone, login, retriveUser } from '@/utils/services/auth';
import { fetchUserProfile } from '@/utils/services/account';
import { authenticate, verifyAuthentication } from '@/utils/services/mfa';
import { startAuthentication } from '@simplewebauthn/browser';
import { ArrowBackIcon } from '@chakra-ui/icons';
import Image from 'next/image';
import LoginForm, { LoginFormData } from '@/components/Auth/LoginForm';

export default function Login() {
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter()

  const convertPhoneNumberToPlain = (formattedPhoneNumber: string | null) => {
    // Remove all non-digit characters to get plain phone number
    if (!formattedPhoneNumber) return null;
    return "+1" + formattedPhoneNumber.replace(/\D/g, '');
  }

  const initiateMFA = async (deviceIds: string[]): Promise<{ success: boolean, error: string }> => {
    const origin = window.location.origin;
    const rpID = new URL(origin).hostname;
    const { success: optionsSuccess, error: optionsError, options } = await authenticate(rpID, deviceIds);
    if (!optionsSuccess) {
      return { success: false, error: optionsError }
    }
    if (!options) {
      return { success: false, error: "No options returned" }
    }
    const attResp = await startAuthentication(options);
    const { success, error, verified } = await verifyAuthentication(rpID, origin, options, attResp);
    if (!success) {
      return { success: false, error: error }
    } else {
      if (!verified) {
        return { success: false, error: "Failed to verify authentication" }
      } else {
        return { success: true, error: "" }
      }
    }
  }

  const handleLogin = async (values: LoginFormData, actions: FormikHelpers<LoginFormData>, type: 'phone' | 'email') => {
    setErrorMessage(null);
    const username = values.username;
    const password = values.password;
    const email = type == 'email' ? username : null;
    const phoneUnformatted = type == 'phone' ? username : null;
    const phone = phoneUnformatted ? convertPhoneNumberToPlain(phoneUnformatted) : null;

    const { success: checkUserSuccess, userId: retrivedUserId } = (type === 'email' && email) ? await checkUserEmail(email) : (type === 'phone' && phone) ? await checkUserPhone(phone.slice(1)) : { success: false, userId: null };

    if (checkUserSuccess && retrivedUserId) {
      const userProfile = await fetchUserProfile(retrivedUserId);
      if (userProfile && userProfile.devices.length > 0) {
        const { success, error } = await initiateMFA(userProfile.devices);
        if (!success) {
          setErrorMessage("Failed to initiate MFA: " + error);
          console.log("Failed to initiate MFA: " + error);
        } else {
          const { success, error, errorCode } = await login(password, email, phone);
          if (!success) {
            if (errorCode == "invalid_credentials") {
              setErrorMessage("Invalid credentials. Please try again with a different password.");
            } else {
              setErrorMessage(errorCode ?? error);
            }
          } else {
            router.push("/buy");
          }
        }
      } else {
        const { success, user } = await retriveUser(retrivedUserId)
        if (success && user) {
          if (user.phone_confirmed_at == null || user.email_confirmed_at == null) {
            const hash = await encryptOTPHash(user.id, "phone")
            router.push(`/verify/account/${hash}/signup`)
            setLoading(true);
          } else {
            const { success, error, errorCode } = await login(password, email, phone);
            if (!success) {
              if (errorCode == "invalid_credentials") {
                setErrorMessage("Invalid credentials. Please try again with a different password.");
              } else {
                setErrorMessage(errorCode ?? error);
              }
            } else {
              router.push("/buy");
            }
          }
        }
      }
    } else {
      setErrorMessage("We couldn't find your account. Please sign up.");
    }
    actions.setSubmitting(false);

  }


  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <Skeleton isLoaded={!loading}>
        <VStack>
          <Center width="50%">
            <AspectRatio ratio={1} width={{ base: "30%", md: "50%" }} borderRadius={"lg"}>
              <Link href='/buy' as={NextLink.default}>
                <Image
                  src="/images/campus-marketplace-logo.png"
                  alt="Campus Marketplace Logo"
                  width={200}
                  height={200}
                />
              </Link>
            </AspectRatio>
          </Center>
          <VStack maxW="md" mx="auto" mt={8} p={10} pb={4} borderWidth={1} borderRadius="lg" boxShadow="lg">
            <h1 className="text-3xl font-bold text-center">Login</h1>
            <LoginForm handleLogin={handleLogin} />
            {errorMessage && <Text color='red'>{errorMessage}</Text>}
            <Box position="absolute" left={8} top={8} role="group">
              <Button
                as={NextLink.default}
                href="/"
                py={2}
                px={4}
                colorScheme='blue'
                variant={'outline'}
                borderRadius="md"
                leftIcon={
                  <Icon
                    as={ArrowBackIcon}
                    transition="transform 0.2s" // Adds smooth transition
                    _groupHover={{ transform: 'translateX(-4px)' }} // Moves icon left on hover
                  />
                }
              >
                Back
              </Button>
            </Box>
          </VStack>
          <VStack>
            <Link href="/signup" as={NextLink.default} color="teal.500">
              I don't have an account
            </Link>
            <Link href="/forgot-password" color="teal.500">
              Forgot password?
            </Link>
          </VStack>
        </VStack>
      </Skeleton>
    </div>
  )
}
