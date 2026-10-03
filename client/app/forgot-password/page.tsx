/**
 * app/forgot-password/page.tsx
 * Forgot password page where users can enter their email to receive a 6 digit OTP to reset their password.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use client"
import React, { useState } from 'react';
import { Link, Text, VStack, Button, Box, Icon, Skeleton, Center, AspectRatio } from '@chakra-ui/react';
import { FormikHelpers } from 'formik';
import ForgotPasswordForm, { ForgotPasswordFormData } from '@/components/Auth/ForgotPasswordForm';
import { useRouter } from 'next/navigation';
import * as NextLink from 'next/link';
import { encryptOTPHash } from '@/utils/services/encrypt';
import { checkUserEmail, checkUserPhone, otpLogin, resendSignupConfirmationEmail, retriveUser } from '@/utils/services/auth';
import { ArrowBackIcon } from '@chakra-ui/icons';
import Image from 'next/image';

export default function ForgotPassword() {
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter()

  const convertPhoneNumberToPlain = (formattedPhoneNumber: string) => {
    // Remove all non-digit characters to get plain phone number
    return "+1" + formattedPhoneNumber.replace(/\D/g, '');
  }

  const handleForgotPasswordLogin = async (values: ForgotPasswordFormData, actions: FormikHelpers<ForgotPasswordFormData>, type: 'phone' | 'email') => {
    const username = values.username;
    const email = type == 'email' ? username : null;
    const phoneUnformatted = type == 'phone' ? username : null;
    const phone = phoneUnformatted ? convertPhoneNumberToPlain(phoneUnformatted) : null;

    const { success: checkUserSuccess, userId: retrivedUserId } = (type === 'email' && email) ? await checkUserEmail(email) : (type === 'phone' && phone) ? await checkUserPhone(phone.slice(1)) : { success: false, userId: null };


    if (checkUserSuccess && retrivedUserId) {
      const { success, user } = await retriveUser(retrivedUserId)
      if (success && user && user.email) {
        if (user.email_confirmed_at == null) {
          const confirmationSentAt = new Date(user.confirmation_sent_at ?? "")
          const currentTime = new Date()
          const timeDifference = Math.abs(currentTime.getTime() - confirmationSentAt.getTime())
          // send if it has been longer than 2 minutes
          if (timeDifference > 2 * 60 * 1000) {
            const {success, error} = await resendSignupConfirmationEmail(user.email, window.location.origin)
            if (!success) {
              setErrorMessage(error);
            } else {
              setErrorMessage("You cannot receive a code to reset your password because your email is not confirmed. We just sent another one, just in case the original one got lost. Please reach out to support if you cannot find the confirmation email.");
            }
          } else {
            setErrorMessage(`You cannot receive a code to reset your password because your email is not confirmed. It has been ${timeDifference * 1000} seconds since we last sent one. Try again when this number reaches 2 minutes. Please reach out to support if you cannot find the confirmation email.`);
          }
        } else {
          const { success, error } = await otpLogin(user.email, null);
          const hash = await encryptOTPHash(retrivedUserId, type)
          if (!success) {
            setErrorMessage(error);
          } else {
            const callbackUrl = encodeURIComponent('/account#restricted'); // redirect to account page
            router.push(`/verify/account/${hash}/login?callback_url=${callbackUrl}`); // redirect to verification page
            setLoading(true);
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
              <h1 className="text-3xl font-bold text-center">Forgot Password</h1>
              <ForgotPasswordForm handleLogin={handleForgotPasswordLogin} />
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
              <Link href="/login" color="teal.500">
                I would like to login instead
              </Link>
          </VStack>
        </VStack>
      </Skeleton>
    </div>
  )
}
