import React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
  Section,
  Img,
} from 'npm:@react-email/components@0.0.22'

interface ConfirmationEmailProps {
  confirmation_url: string
  site_url: string
  email: string
}

export const ConfirmationEmail = ({
  confirmation_url,
  site_url,
  email,
}: ConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>تایید حساب کاربری شما</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Heading style={h1}>🏥 سیستم مدیریت داروخانه</Heading>
        </Section>
        
        <Section>
          <Heading style={h2}>خوش آمدید!</Heading>
          <Text style={text}>
            سلام و خوش آمدید به سیستم مدیریت داروخانه. برای تکمیل فرآیند ثبت‌نام، لطفاً حساب کاربری خود را تایید کنید.
          </Text>
          
          <Text style={text}>
            ایمیل شما: <strong>{email}</strong>
          </Text>
        </Section>

        <Section style={buttonSection}>
          <Button
            href={confirmation_url}
            style={button}
          >
            تایید حساب کاربری
          </Button>
        </Section>

        <Section>
          <Text style={smallText}>
            اگر دکمه بالا کار نمی‌کند، لینک زیر را کپی کرده و در مرورگر خود بازکنید:
          </Text>
          <Link href={confirmation_url} style={link}>
            {confirmation_url}
          </Link>
        </Section>

        <Section style={footerSection}>
          <Text style={footer}>
            اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید.
          </Text>
          <Text style={footer}>
            با تشکر،<br />
            تیم سیستم مدیریت داروخانه
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ConfirmationEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  direction: 'rtl' as const,
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '12px',
  margin: '40px auto',
  padding: '40px',
  width: '600px',
  maxWidth: '100%',
}

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const h1 = {
  color: '#1a365d',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#2d3748',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
}

const text = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#3182ce',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  border: 'none',
  cursor: 'pointer',
}

const link = {
  color: '#3182ce',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
}

const smallText = {
  color: '#718096',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '16px 0 8px 0',
}

const footerSection = {
  borderTop: '1px solid #e2e8f0',
  marginTop: '32px',
  paddingTop: '24px',
}

const footer = {
  color: '#a0aec0',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '8px 0',
  textAlign: 'center' as const,
}