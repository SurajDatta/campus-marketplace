/**
 * AlertCard.tsx
 * Card used to display an alert message with an image. This will be shown in the header after clicking the bell icon to see the alerts.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-31
 *
 *
 */
import { Alert } from "@/types"
import { removeBoldMarkers } from "@/utils/textConversion"
import { AspectRatio, Box, Grid, GridItem, Image, Link, Skeleton, SkeletonText, Text, VStack } from "@chakra-ui/react"
type AlertCardProps = {
    alert: Alert | null
}

export default function AlertCard({ alert }: AlertCardProps) {
    return (
        <Grid
            templateColumns="repeat(4, 1fr)"
            gap={2}
            p={2}
            bg={alert ? !alert.read ? "blue.100" : "white" : "white"}
            borderRadius={"lg"}
            borderWidth={1}
            width={"100%"}
        >
            <GridItem colSpan={1}>
                <AspectRatio ratio={1}>
                    {alert != null ? (
                        <Image src={alert.image_url} alt={"Image of Alert"} objectFit="cover" objectPosition="50% 50%" borderRadius={"lg"} />
                    ) : <Skeleton borderRadius={"lg"} />}
                </AspectRatio>
            </GridItem>
            <GridItem colSpan={3}>
                <VStack align={"left"} spacing={0}>
                    {alert != null ? (
                        <>
                            <Text noOfLines={3} fontSize={"xs"}>{removeBoldMarkers(alert.message)}</Text>
                        </>
                    ) : <SkeletonText noOfLines={1} spacing={4} />}

                </VStack>
            </GridItem>
        </Grid>
    )
}