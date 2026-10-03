/**
 * Navigation.tsx
 * Component that is used to show users how to navigate the pages, and what each page has.
 * @AshokSaravanan222
 * 09-24-2024
 */
import { BellIcon } from "@chakra-ui/icons";
import { UnorderedList, ListItem, Icon } from "@chakra-ui/react";
import { IoAccessibility } from "react-icons/io5";
import { MdDashboard, MdOutlineAccountCircle, MdSell, MdShoppingCart } from "react-icons/md";

export default function Navigation() {
    return (
        <UnorderedList>
            <ListItem>Click the <b>Buy</b> <Icon as={MdShoppingCart} /> page to browse all items available for purchase. </ListItem>
            <ListItem>Click the <b>Sell</b> <Icon as={MdSell} /> page to create and edit listings.</ListItem>
            <ListItem>Click the <b>My Stuff</b> <Icon as={MdDashboard} /> page to see updates about your items.</ListItem>
            <ListItem>Click the <b>Alerts</b> <BellIcon /> icon to see notifications.</ListItem>
            <ListItem>Click the <b>Profile</b> <Icon as={MdOutlineAccountCircle} /> icon to manage account settings, preferences, and logout.</ListItem>
            <ListItem>If you ever need help, you can press the  <b>Help</b> <Icon as={IoAccessibility} /> icon in the top right corner for more info.</ListItem>
        </UnorderedList>
    )
}