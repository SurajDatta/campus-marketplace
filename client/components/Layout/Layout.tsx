/**
 * Layout.tsx
 * Layout screen that will wrap all (most) pages to add breadcrumbs, header, and footer. Will also redirect the user to correct verification page if email/phone is not confirmed.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import React, { useEffect, useState } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Box, Spinner, Heading, useBreakpointValue, useToast, Skeleton, Icon, Link, HStack, Spacer, Text, Button, IconButton, Tooltip, VStack } from '@chakra-ui/react';
import { ChevronRightIcon, QuestionIcon, QuestionOutlineIcon } from '@chakra-ui/icons';
import Footer from './Footer/Footer';
// import Header from '@/components/Layout/Header/Header';
import Header from './Header/NewHeader';
import { useRouter } from 'next/navigation';
import { canInitSupabaseClient, markBannerViewed, markInitialModalViewed } from '@/utils/services/actions';
import { signOut } from '@/utils/services/auth';
import { Alert, Profile, User } from '@/types';
import { usePathname } from 'next/navigation';
import * as NextLink from 'next/link';
import { FaHome } from 'react-icons/fa';
import { fetchAlerts, markAlertDeleted, markAlertRead, markAlertsRead } from '@/utils/services/alerts';
import { subscribeToAlerts } from '@/utils/services/realtime';
import { MdPerson } from 'react-icons/md';
import { removeBoldMarkers } from '@/utils/textConversion';
import AnimatedIcon from '../Common/Other/AnimatedIcon';
import SellerJourneyCard from '../Sell/SellerJourneyCard';
import HelpModal from '../Common/Other/HelpModal';
import InitialModal from '../Common/Other/InitialModal';
import { encryptOTPHash } from '@/utils/services/encrypt';
import useSupabaseBrowser from '@/utils/supabase/supabase-browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
type LayoutProps = {
  children: React.ReactNode;
  user: User | undefined;
  userProfile: Profile | undefined;
  alerts: Alert[] | undefined;
  loadingUser: boolean;
  loadingProfile: boolean;
  loadingAlerts: boolean;
  visitorContent?: React.ReactNode | null;
  displayPathName?: string;
  loadingPathName?: boolean;
  fullScreen?: boolean;
};

const Layout: React.FC<LayoutProps> = ({ children, user, userProfile, alerts, displayPathName, visitorContent = null, loadingUser, loadingProfile, loadingAlerts, loadingPathName, fullScreen }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const toast = useToast();
  const pathname = usePathname();
  const finalRef = React.useRef(null);
  const [initialModalOpen, setInitialModalOpen] = useState<boolean>(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [hash, setHash] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      if (!userProfile) {
        throw new Error('User profile not found.');
      }
      await signOut();
      queryClient.invalidateQueries({
        queryKey: ['userProfile', userProfile.id]
      })
      queryClient.invalidateQueries({
        queryKey: ['user', userProfile.id]
      })
      // queryClient.removeQueries({
      //   queryKey: ['userProfile', userProfile.id]
      // })
      // queryClient.removeQueries({
      //   queryKey: ['user', userProfile.id]
      // })
      // queryClient.removeQueries({
      //   queryKey: ['alerts', userProfile.id]
      // })
      router.push(pathname)
      window.location.reload();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error signing out.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleClearAlerts = async (alertIds: string[]) => {
    try {
      if (!userProfile) {
        throw new Error('User profile not found.');
      }
      const clearAlertsPromise = markAlertsRead(alertIds);
      toast.promise(clearAlertsPromise, {
        success: {
          title: 'Alerts cleared',
          description: 'All alerts have been marked as read.',
          duration: 5000,
          isClosable: true,
        },
        error: {
          title: 'Error clearing alerts.',
          description: 'An error occurred while clearing alerts.',
          duration: 5000,
          isClosable: true,
        },
        loading: {
          title: 'Clearing alerts...',
          description: 'Please wait while we clear the alerts.',
          duration: 5000,
          isClosable: true,
        }
      });
      const { success, error } = await clearAlertsPromise;
      if (!success) {
        throw new Error(error);
      } else {
        queryClient.invalidateQueries({
          queryKey: ['alerts', userProfile.id]
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Error clearing alerts: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleMarkAlertRead = async (alertId: string, status: boolean) => {
    try {
      if (!userProfile) {
        throw new Error('User profile not found.');
      }
      const { success, error } = await markAlertRead(alertId, status);
      if (!success) {
        throw new Error(error);
      } else {
        queryClient.invalidateQueries({
          queryKey: ['alerts', userProfile.id]
        })
      }
    } catch (error: any) {
      console.error(error);
    }
  }

  const onDeleteAlert = async (alertId: string) => {
    try {
      if (!userProfile) {
        throw new Error('User profile not found.');
      }
      const { success, error } = await markAlertDeleted(alertId);
      if (!success) {
        throw new Error(error);
      } else {
        toast({
          title: 'Alert deleted',
          description: 'The alert has been deleted.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        queryClient.invalidateQueries({
          queryKey: ['alerts', userProfile.id]
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Error deleting alert: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error(error);
    }
  }

  const handleViewBanner = async () => {
    try {
      if (userProfile) {
        const { success: bannerSuccess, error: bannerError } = await markBannerViewed(userProfile.id)
        if (!bannerSuccess) {
          throw new Error(bannerError);
        } else {
          queryClient.invalidateQueries({
            queryKey: ['userProfile', userProfile.id]
          })
        }
      }
    } catch (error: any) {
      console.error(error);
    }
  }
  const getHash = async (userProfile: Profile) => {
    const hash = await encryptOTPHash(userProfile.id, "phone") // signup hash is always phone for now
    setHash(hash)
  }

  useEffect(() => {
    if (userProfile) {
      // setInitialModalOpen(!userProfile.viewed_initial && userProfile.signed_up_at !== null)
      getHash(userProfile)
    }
  }, [userProfile]);

  useEffect(() => {
    setIsSupabaseConnected(canInitSupabaseClient());
  }, []);


  // const onInsert = (alert: Alert) => {
  //   toast({
  //     title: 'New Alert',
  //     description: removeBoldMarkers(alert.message),
  //     position: 'bottom-right',
  //     status: 'info',
  //     duration: 5000,
  //     isClosable: true,
  //   });
  // }


  // useEffect(() => {
  //   const unsubscribeFromAlerts = subscribeToAlerts(
  //     userProfile ? userProfile.alerts : null,
  //     onInsert,
  //     setAlerts,
  //     (error) => {
  //       toast({
  //         title: 'Error',
  //         position: 'bottom-right',
  //         description: `Error receiving alert updates: ${error.message}`,
  //         status: 'error',
  //         duration: 5000,
  //         isClosable: true,
  //       });
  //     }
  //   );

  //   return () => {
  //     unsubscribeFromAlerts();
  //   };
  // }, [userProfile]);

  const generateBreadcrumbs = () => {
    const path = pathname.split('/');
    path.shift(); // Remove the empty string at the start of the array

    const displayPath = displayPathName?.split('/') ?? [];
    displayPath.shift(); // Remove the empty string at the start of the array

    return ((displayPath.length > 0 && displayPath.length === path.length) ? displayPath : path).map((segment, index) => {
      const href = '/' + path.slice(0, index + 1).join('/');
      const isCurrentPage = index === path.length - 1;
      var newSegment;
      if (segment.includes('-')) {
        var segments = segment.split('-')
        for (var i = 0; i < segments.length; i++) {
          segments[i] = segments[i].charAt(0).toUpperCase() + segments[i].slice(1)
        }
        newSegment = segments.join(' ')
      } else {
        newSegment = segment.charAt(0).toUpperCase() + segment.slice(1)
      }

      return (
        newSegment && <BreadcrumbItem key={href} isCurrentPage={isCurrentPage}>
          <Skeleton
            isLoaded={!loadingPathName || pathname === '/'}
          >
            {isCurrentPage ? <BreadcrumbLink href={href}>{newSegment}</BreadcrumbLink> : <BreadcrumbLink href={href} as={NextLink.default}>{newSegment}</BreadcrumbLink>}
          </Skeleton>
        </BreadcrumbItem>
      );
    });
  };

  if (!isSupabaseConnected) {
    return (
      <Box display="flex" flex="1" width="100%" flexDirection="column" alignItems="center" justifyContent="center" gap={20}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (fullScreen) {
    return (
      <>
        {children}
      </>
    );
  }

  return (
    <>
      <Header userProfile={userProfile} loggedIn={!!userProfile} loadingAlerts={loadingAlerts} loading={loadingUser || loadingProfile || loadingAlerts} isMobile={isMobile ?? false} onSignOut={handleSignOut} alerts={alerts} onClearAlerts={handleClearAlerts} onAlertRead={handleMarkAlertRead} onViewedBanner={handleViewBanner} onDeleteAlert={onDeleteAlert} />
      <Box display="flex" flex="1" width="100%" flexDirection="column" px={{ base: 4, md: 10 }} py={{ base: 4, md: 5 }}>
        <HStack pb={1}>
          <Breadcrumb spacing='8px' separator={<ChevronRightIcon color='gray.500' />} pb={2}>
            {pathname !== '/' && <BreadcrumbItem>
              <BreadcrumbLink href='/' as={NextLink.default}><Icon as={FaHome} mb={1} /></BreadcrumbLink>
            </BreadcrumbItem>}
            {generateBreadcrumbs()}
          </Breadcrumb>
          <Spacer />
          {/* <Button
                role='group'
                as={NextLink.default}
                href={"/buy"}
                colorScheme='blue'
                rightIcon={
                  <Icon
                    as={ArrowForwardIcon}
                    transition="transform 0.2s"
                    _groupHover={{ transform: 'translateX(4px)' }}
                  />
                }
              >
                Start Buying
              </Button> */}
          {/* <Tooltip hasArrow label={"Seller Journey"} placement={"left-start"}>
            <VStack role='group' spacing={0}>
              <SellerJourneyCard userProfile={userProfile} loading={loadingProfile} isMobile={isMobile ?? true} />
            </VStack>
          </Tooltip> */}
          <VStack role='group' spacing={0} ref={finalRef}>
            {/* <AnimatedIcon
                    src="https://cdn.lordicon.com/ozckswtv.json"
                    trigger="hover"
                    colors="primary:#3182ce"
                    style={{ width: "50px", height: "50px", border: "1px solid #3182ce", borderRadius: "50%" }}
                  /> */}
            <HelpModal finalFocusRef={finalRef} />
            {isMobile && <Text fontSize={"xs"}>Help</Text>}
            {/* <VStack spacing={0}>
                  <Text fontSize={"xs"} style={{ textDecoration: "none" }}>Need</Text>
                  <Text fontSize={"xs"} style={{ textDecoration: "none" }}>Assistance?</Text>
                </VStack> */}
          </VStack>


        </HStack>
        {loadingProfile || loadingUser ? (
          <>
            {children}
          </>
        ) : (
          user ? (
            <>
            {((user.phone_confirmed_at == null || user.email_confirmed_at == null) && hash !== null) ? (
                router.push(`/verify/account/${hash}/signup`)
              ) : (
                <>
                  {children}
                </>
              )}
            </>
          ) : visitorContent ? (
            <>
              {visitorContent}
            </>
          ) : (
            <Box display="flex" flex="1" width="100%" flexDirection="column" alignItems="center" justifyContent="center">
              <Heading size="lg">Please <Link color='teal' as={NextLink.default} href={`/login`}>login</Link> or <Link color='teal' as={NextLink.default} href='/signup'>sign up</Link> to view this page.</Heading>
            </Box>
          )
        )}
      </Box >
      <Footer />
      <InitialModal isOpen={initialModalOpen} onClose={() => {
        setInitialModalOpen(false)
      }} />
    </>
  );
}

export default Layout;
