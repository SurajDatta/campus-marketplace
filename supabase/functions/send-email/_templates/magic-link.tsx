import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface MagicLinkEmailProps {
    token: string
    supabaseURL: string
}

export const MagicLinkEmail = ({
    token,
}: MagicLinkEmailProps) => (
    <Html>
        <Head />
        <Preview>Verification Code</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Verification Code</Heading>
                <Text style={{ ...text, marginBottom: '14px' }}>
                    Enter this code to verify your account:
                </Text>
                <Text style={code}>{token}</Text>
            </Container>
        </Body>
    </Html>
)

export default MagicLinkEmail

const main = {
    backgroundColor: '#ffffff',
}

const container = {
    paddingLeft: '12px',
    paddingRight: '12px',
    margin: '0 auto',
}

const h1 = {
    color: '#333',
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '40px 0',
    padding: '0',
}

const text = {
    color: '#333',
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: '14px',
    margin: '24px 0',
}

const code = {
    display: 'inline-block',
    padding: '16px 4.5%',
    width: '90.5%',
    backgroundColor: '#f4f4f4',
    borderRadius: '5px',
    border: '1px solid #eee',
    color: '#333',
}