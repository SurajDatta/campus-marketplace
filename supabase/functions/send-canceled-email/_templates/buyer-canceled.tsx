/**
 * BuyerCanceled.tsx
 * Email template for sending the meetup being canceled email to the buyer.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-10-24
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


interface BuyerCanceledProps {
    supabaseURL: string;
    link: string;
    imgURL: string;
    itemTitle: string;
    cancelReason: string;
    timeCompleted: string;
    expiresAt: string | null;
}

export const BuyerCanceled: React.FC<Readonly<BuyerCanceledProps>> = ({
    supabaseURL,
    itemTitle,
    imgURL,
    link,
    cancelReason,
    timeCompleted,
    expiresAt
}: BuyerCanceledProps) => (
    <Html>
        <Head />
        <Preview>
            Your Purchase Request Has Been Canceled
        </Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={supabaseURL + "/storage/v1/object/public/photos/logo/campus-marketplace-logo.png"}
                    width="75"
                    height="75"
                    alt="Licks Logo"
                    style={logo}
                />
                <Text style={heading}>Your Purchase Request Has Been Canceled</Text>
                <Img src={imgURL} alt={itemTitle + " Image"} width={200} style={image} />
                <Text style={paragraph}>
                    <Markdown>
                        {
                            expiresAt ?
                                `The request to purchase **${itemTitle}** was canceled on **${new Date(timeCompleted).toLocaleString('en-US')}** due to the transaction expiring (expired at: **${new Date(expiresAt).toLocaleString('en-US')}**). The hold on your card has been released, and the item's status is now canceled. For more details, check the MyStuff page. No further action is needed from you at this time.` : `The request to purchase **${itemTitle}** was canceled on **${new Date(timeCompleted).toLocaleString('en-US')}** for the following reason: ${cancelReason}. The hold on your card has been released, and the item's status is now canceled. For more details, check the MyStuff page. No further action is needed from you at this time.`
                        }
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
                    Need help? Contact us at <Link href="licks.local/contact">licks.local/contact</Link>
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

export default BuyerCanceled;
