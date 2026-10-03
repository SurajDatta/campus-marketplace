/**
 * app/signup/page.tsx
 * Signup page where users can create a new account, entering their name, email, phone, and password.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use client"
import React, { useState } from 'react';
import { Link, Text, Box, Button, Icon, Skeleton, Center, AspectRatio, VStack } from '@chakra-ui/react';
import * as NextLink from 'next/link';
import { FormikHelpers } from 'formik';
import { useRouter } from 'next/navigation';
import { encryptOTPHash } from '@/utils/services/encrypt';
import { adminSignUp, checkUserEmail, checkUserPhone, checkValidStudent } from '@/utils/services/auth';
import { ArrowBackIcon } from '@chakra-ui/icons';
import Image from 'next/image';
import SignupForm, { SignupFormData } from '@/components/Auth/SignupForm';

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const convertPhoneNumberToPlain = (formattedPhoneNumber: string) => {
    // Remove all non-digit characters to get plain phone number
    return "+1" + formattedPhoneNumber.replace(/\D/g, '');
  }

  const handleSignUp = async (values: SignupFormData, actions: FormikHelpers<SignupFormData>) => {
    setErrorMessage(null);
    const email = values.email;
    const phone = convertPhoneNumberToPlain(values.phone);
    const phoneConfirm = values.phoneConfirm;
    const password = values.password;

    const { success: successEmail } = await checkUserEmail(email)
    if (successEmail) {
      setErrorMessage("An account with this email already exists. Please choose a different one.")
    } else {
      const name = values.name.trim();
      const firstName = name.split(' ')[0];
      const lastName = name.split(' ').slice(1).join(' ');
      const { success, errorCode, user } = await adminSignUp(firstName, lastName, email, phone, password, phoneConfirm, window.location.origin);
      if (success && user) {
        const userId = user.id
        const hash = await encryptOTPHash(userId, "phone")
        router.push(`/verify/account/${hash}/signup`)
        setLoading(true);
      } else {
        setErrorMessage("Something went wrong: " + errorCode + "Please contact us at campus-marketplace.local/contact")
      }
    }
    actions.setSubmitting(false);
  }

  const handleValidateInfo = async (values: SignupFormData) => {
    setErrorMessage(null);
    const email = values.email
    const phone = convertPhoneNumberToPlain(values.phone);
    const { success: validCampusEmail } = await checkValidStudent(email)
    const { success: successEmail, userId: userIdEmail } = await checkUserEmail(email)
    const { success: successPhone, userId: userIdPhone } = await checkUserPhone(phone.slice(1))
    if (!validCampusEmail) {
      setErrorMessage("Please enter a valid .edu campus email.")
    } else {
      if (successEmail && successPhone) {
        if (userIdEmail == userIdPhone) {
          setErrorMessage("An account with this email and phone already exists. Please login.")
        } else {
          setErrorMessage("There exists separate accounts with this email and phone. Please login to your account!")
        }
      } else if (!successEmail && successPhone) {
        setErrorMessage("An account with this phone already exists. Please login.")
      } else if (successEmail && !successPhone) {
        setErrorMessage("An account with this email already exists. Please login.")
      } else {
        return true;
      }
    }
    return false
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
          <VStack maxW="md" mx="auto" mt={8} p={4} borderWidth={1} borderRadius="lg" boxShadow="lg">
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <SignupForm handleSignup={handleSignUp} handleValidateInfo={handleValidateInfo} />
            {errorMessage && <Text color='red'>{errorMessage}</Text>}
            <Box position="absolute" left={8} top={8} role="group">
              <Button
                as={NextLink.default}
                href="/"
                py={2}
                px={4}
                borderRadius="md"
                colorScheme='blue'
                variant={'outline'}
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
            <Link href="/login" color="teal.500" as={NextLink.default}>
              I already have an account
            </Link>
          </VStack>
        </VStack>
      </Skeleton>
    </div>
  );
}
