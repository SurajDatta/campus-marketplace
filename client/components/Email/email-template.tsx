/**
 * email-template.tsx
 * Template for sending attractive and actionable emails to users.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-30
 *
 */
import * as React from "react";
import { Body, Html, Link, Section, Text, Img, Container, Heading, Markdown } from "@react-email/components";

interface EmailTemplateProps {
  message: string;
  link: string;
  imgURL: string;
  itemTitle: string;
  actionText: string;
  heading: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  message,
  link,
  imgURL,
  itemTitle,
  actionText,
  heading,
}) => (
  <Html lang="en">
    <Body style={styles.body}>
      <Container style={styles.container}>
        <Heading style={styles.heading}>{heading}</Heading>
        <Section style={styles.section}>
          <Markdown
            markdownContainerStyles={{
              padding: "12px",
              border: "solid 1px #ceb888",
            }}
          >{message}</Markdown>
          <Img src={imgURL} alt={itemTitle + " Image"} width={200} style={styles.image} />
          <Section style={styles.buttonSection}>
            <Link href={link} style={styles.button}>
              {actionText}
            </Link>
          </Section>
          <Text style={styles.footerText}>
            If you have any questions, feel free to contact us at licks.local/contact.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const styles: { [key: string]: React.CSSProperties } = {
  body: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f4f7',
    color: '#333',
    margin: 0,
    padding: '20px 0',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    color: '#333',
    textAlign: 'center',
    fontSize: '24px',
    marginBottom: '20px',
  },
  section: {
    padding: '10px 0',
  },
  itemTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  image: {
    display: 'block',
    margin: '20px auto',
    borderRadius: '4px',
  },
  buttonSection: {
    textAlign: 'center',
    margin: '30px 0',
  },
  button: {
    display: 'inline-block',
    padding: '12px 20px',
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#007bff',
    textDecoration: 'none',
    borderRadius: '5px',
  },
  footerText: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
    marginTop: '20px',
  },
};

export default EmailTemplate;
