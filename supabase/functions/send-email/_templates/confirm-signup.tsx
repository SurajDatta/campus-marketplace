import {
  Body,
  Container,
  Head,
  Img,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Button,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ConfirmSignupEmailProps {
  first_name: string
  redirect_to: string
  token_hash: string
  email: string
  type: string
  supabaseURL: string
}

export const ConfirmSignupEmail = ({
  first_name,
  redirect_to,
  token_hash,
  email,
  type,
  supabaseURL,
}: ConfirmSignupEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Welcome to Campus Marketplace!
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={supabaseURL + "/storage/v1/object/public/photos/logo/campus-marketplace-logo.png"}
          width="150"
          height="150"
          alt="Campus Marketplace Logo"
          style={logo}
        />
        <Text style={paragraph}>{`Hi ${first_name},`}</Text>
        <Text style={paragraph}>
          Thank you for signing up for Campus Marketplace! Click this link to confirm your email address.
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={`${redirect_to}/auth/callback?token_hash=${token_hash}&type=${type}&redirect_to=${redirect_to}&email=${email}`}
            target="_blank">
            Confirm Email
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          Need help? Contact us at <Link href="campus-marketplace.local/contact">campus-marketplace.local/contact</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ConfirmSignupEmail


const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
};

const logo = {
  margin: "0 auto",
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
