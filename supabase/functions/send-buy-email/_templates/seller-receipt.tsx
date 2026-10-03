/**
 * SellerReceipt.tsx
 * Email template for sending a purchase confirmation email to the seller.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-10-19
 *
 */
import {
    Body,
    Container,
    Html,
    Link,
    Section,
    Markdown,
    Text,
    Img,
    Button,
    Hr,
    Head,
    Preview,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'


interface SellerReceiptProps {
    supabaseURL: string;
    link: string;
    imgURL: string;
    itemTitle: string;
    itemPrice: number;
    quickMeetup: boolean;
    scheduledMeetup: boolean;
    selectedContact: string; // list joined together with commas
    meetupLocations: string; // list joined together with commas
    expiryTime: string;
    boughtAt: string;
}

export const SellerReceipt: React.FC<Readonly<SellerReceiptProps>> = ({
    supabaseURL,
    itemTitle,
    itemPrice,
    selectedContact,
    imgURL,
    link,
    quickMeetup,
    scheduledMeetup,
    meetupLocations,
    expiryTime,
    boughtAt,
}: SellerReceiptProps) => (
    <Html>
        <Head />
        <Preview>
            Purchase Confirmation
        </Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={supabaseURL + "/storage/v1/object/public/photos/logo/campus-marketplace-logo.png"}
                    width="75"
                    height="75"
                    alt="Campus Marketplace Logo"
                    style={logo}
                />
                <Text style={heading}>Purchase Confirmation</Text>
                <Img src={imgURL} alt={itemTitle + " Image"} width={200} style={image} />
                <Text style={paragraph}>
                    <Markdown>
                        {quickMeetup && scheduledMeetup ? (
                            `A buyer has requested to purchase **${itemTitle}** for **$${itemPrice.toFixed(2)}** at **${new Date(boughtAt).toLocaleString('en-US')}** through Quick and Scheduled Meetup, using the following contact methods: **${selectedContact}** and proposing meeting at: ${meetupLocations}. Make a selection of which time works best for you, and we will notify the buyer. You need to confirm a meetup time within the next 24 hours (you have until **${new Date(expiryTime).toLocaleString('en-US')}**), or the transaction will be canceled.`
                        ) : quickMeetup ? (
                            `A buyer has requested to purchase **${itemTitle}** for **$${itemPrice.toFixed(2)}** at **${new Date(boughtAt).toLocaleString('en-US')}** through Quick Meetup, providing the following contact methods: **${selectedContact}**. Next, please reach out to the buyer using the contact information avaiable on the meetup page to exchange and verify the item.`
                        ) : scheduledMeetup ? (
                            `A buyer has requested to purchase **${itemTitle}** for **$${itemPrice.toFixed(2)}** at **${new Date(boughtAt).toLocaleString('en-US')}**, proposing meeting at: ${meetupLocations}. Make a selection of which time works best for you, and we will notify the buyer. You need to confirm a meetup time before **${new Date(expiryTime).toLocaleString()}**, or the transaction will be canceled.`
                        ) : (
                            `You have requested to purchase **${itemTitle}** for **$${itemPrice.toFixed(2)}** at **${new Date(boughtAt).toLocaleString('en-US')}**. Next, please reach out to the seller using the contact information avaiable on the meetup page to exchange and verify the item.`
                        )}
                    </Markdown>
                </Text>
                <Section style={btnContainer}>
                    <Button style={button} href={link}
                        target="_blank">
                        View Meetup
                    </Button>
                </Section>
                <Hr style={hr} />
                <Text style={footer}>
                    Need help? Contact us at <Link href="campus-marketplace.local/contact">campus-marketplace.local/contact</Link>
                </Text>
            </Container>
        </Body>
    </Html>
);



const main = {
    backgroundColor: "#ffffff",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const image = {
    display: "block",
    margin: "20px auto",
    borderRadius: "4px",
}

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
};

const logo = {
    margin: "0 auto",
};

const heading = {
    fontSize: "32px",
    lineHeight: "42px",
    textAlign: "center" as const,
};

const paragraph = {
    fontSize: "16px",
    lineHeight: "26px",
};

const btnContainer = {
    textAlign: "center" as const,
};

const button = {
    backgroundColor: "#ceb888",
    borderRadius: "3px",
    color: "#fff",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px",
};

const hr = {
    borderColor: "#cccccc",
    margin: "20px 0",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
};


export default SellerReceipt;
