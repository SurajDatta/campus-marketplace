/**
 * ProfileButton.tsx
 * Profile menu button that allows the user to see their account, history, preferences (if seller), and logout.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import { Spinner, Center, Text, HStack, Button, IconButton, VStack } from "@chakra-ui/react";
import { Profile } from "@/types";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Icon
} from '@chakra-ui/react'
import * as NextLink from 'next/link';

import { ExternalLinkIcon } from "@chakra-ui/icons";
import { MdHistory, MdOutlineSell } from "react-icons/md";
import { IoPersonCircleOutline } from "react-icons/io5";
import { GoGear } from "react-icons/go";
import AuthButton from "./AuthButton";
import AnimatedIcon from "@/components/Common/Other/AnimatedIcon";
import { VscSettings } from "react-icons/vsc";
import { forwardRef } from "react";

type ProfileButtonProps = {
  userProfile: Profile | undefined;
  loggedIn: boolean;
  loading: boolean;
  onSignOut: () => void;
  height: number;
  isMobile: boolean;
  development: boolean;
};

export default function ProfileButton(props: ProfileButtonProps) {
  const {
    userProfile,
    loggedIn,
    loading,
    height,
    development,
    isMobile,
    onSignOut
  } = props;

  return (
    <Menu>
      {isMobile ?
        <VStack>
          <MenuButton as={IconButton} icon={
            <AnimatedIcon
              src={"https://cdn.lordicon.com/hrjifpbq.json"}
              trigger="hover"
              style={{ width: height, height: height }}
              colors="primary:#000000"
              fallback={<Icon as={IoPersonCircleOutline} boxSize={height} />}
            ></AnimatedIcon>
          } style={{ background: "transparent", border: "none" }} p={0} h={height} />
          <Text fontSize={"md"} fontWeight={400} p={0}>Profile</Text>
        </VStack> : <MenuButton fontSize={isMobile ? "md" : "lg"} fontWeight={isMobile ? 400 : 700} as={Button} leftIcon={
          <AnimatedIcon
            src={"https://cdn.lordicon.com/hrjifpbq.json"}
            trigger="hover"
            style={{ width: height, height: height }}
            colors="primary:#000000"
            fallback={<Icon as={IoPersonCircleOutline} boxSize={height} />}
          ></AnimatedIcon>
        } style={{ background: "transparent", border: "none" }} p={0}>
          Profile
        </MenuButton>}
      {/* <AnimatedIcon
        src={"https://cdn.lordicon.com/hrjifpbq.json"}
        trigger="hover"
        style={{ width: height, height: height }}
        colors="primary:#000000"
        fallback={<Icon as={IoPersonCircleOutline} boxSize={height} />}
      >
        <MenuButton />
      </AnimatedIcon> */}
      <MenuList color="black">
        {!loading ?
          <>
            {(!loggedIn || !userProfile) ?
              <Center>
                <AuthButton />
              </Center>
              :
              <>
                <MenuItem as={NextLink.default} href='/account' icon={<Icon as={GoGear} boxSize={5} />}>Account</MenuItem>
                {/* <MenuItem as={NextLink.default} href='/preferences' icon={<Icon as={VscSettings} boxSize={5} />}>Preferences</MenuItem> */}
                {/* <MenuItem as={NextLink.default} href='/history' icon={<Icon as={MdHistory} boxSize={5} />}>History</MenuItem> */}
                <MenuDivider />
                <MenuItem as={NextLink.default} href='/' icon={<ExternalLinkIcon boxSize={5} />} onClick={onSignOut} >Logout</MenuItem>
              </>}
          </>
          : <MenuItem icon={<Spinner size={"sm"} />}>Loading</MenuItem>}
      </MenuList>
    </Menu>
  );
}