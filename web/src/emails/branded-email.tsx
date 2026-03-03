import React from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

export interface BrandedEmailProps {
  previewText: string;
  heading: string;
  bodyText: string;
  accessLabel: string;
  contextText: string;
  ctaText: string;
  ctaUrl: string;
  fallbackLabel: string;
  marketingText: string;
  featureLabels: [string, string, string];
  footerNote: string;
}

export function BrandedEmail({
  previewText,
  heading,
  bodyText,
  accessLabel,
  contextText,
  ctaText,
  ctaUrl,
  fallbackLabel,
  marketingText,
  featureLabels,
  footerNote,
}: BrandedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logo}>
              <span style={logoVizi}>Vizi</span>
              <span style={logoAI}>AI</span>
            </Text>
          </Section>

          <Heading style={headingStyle}>{heading}</Heading>

          <Text style={bodyTextStyle}>
            {bodyText} <span style={badge}>{accessLabel}</span>.
          </Text>

          <Text style={contextStyle}>{contextText}</Text>

          <Section style={ctaSection}>
            <Button style={ctaButton} href={ctaUrl}>
              {ctaText}
            </Button>
          </Section>

          <Text style={fallbackText}>
            {fallbackLabel}{" "}
            <Link href={ctaUrl} style={fallbackLink}>
              {ctaUrl}
            </Link>
          </Text>

          <Hr style={hr} />

          <Text style={marketingHeadline}>{marketingText}</Text>

          <Row style={featuresRow}>
            <Column style={featureColumn}>
              <Text style={featureIcon}>&#128200;</Text>
              <Text style={featureLabel}>{featureLabels[0]}</Text>
            </Column>
            <Column style={featureColumn}>
              <Text style={featureIcon}>&#128274;</Text>
              <Text style={featureLabel}>{featureLabels[1]}</Text>
            </Column>
            <Column style={featureColumn}>
              <Text style={featureIcon}>&#128106;</Text>
              <Text style={featureLabel}>{featureLabels[2]}</Text>
            </Column>
          </Row>

          <Hr style={hr} />

          <Text style={footerTextStyle}>{footerNote}</Text>

          <Text style={footerBrand}>
            <Link href="https://www.viziai.app" style={footerLink}>
              ViziAI
            </Link>{" "}
            · viziai.app
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 24px",
  maxWidth: "480px",
  borderRadius: "8px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const logo = {
  fontSize: "28px",
  fontWeight: "700" as const,
  margin: "0",
};

const logoVizi = {
  color: "#0D9488",
};

const logoAI = {
  color: "#F97066",
};

const headingStyle = {
  fontSize: "22px",
  fontWeight: "600" as const,
  color: "#111827",
  textAlign: "center" as const,
  margin: "0 0 16px",
};

const bodyTextStyle = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#374151",
  textAlign: "center" as const,
  margin: "0 0 8px",
};

const contextStyle = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#6b7280",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const badge = {
  display: "inline-block",
  backgroundColor: "#f0fdfa",
  color: "#0D9488",
  padding: "2px 10px",
  borderRadius: "12px",
  fontSize: "13px",
  fontWeight: "600" as const,
};

const ctaSection = {
  textAlign: "center" as const,
  marginBottom: "12px",
};

const ctaButton = {
  backgroundColor: "#0D9488",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600" as const,
  padding: "12px 32px",
  borderRadius: "8px",
  textDecoration: "none",
};

const fallbackText = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0 0 32px",
  wordBreak: "break-all" as const,
};

const fallbackLink = {
  color: "#0D9488",
  textDecoration: "underline",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "0 0 16px",
};

const marketingHeadline = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#6b7280",
  textAlign: "center" as const,
  margin: "0 0 16px",
};

const featuresRow = {
  marginBottom: "16px",
};

const featureColumn = {
  textAlign: "center" as const,
  width: "33.33%",
};

const featureIcon = {
  fontSize: "24px",
  margin: "0 0 4px",
};

const featureLabel = {
  fontSize: "12px",
  color: "#6b7280",
  margin: "0",
  fontWeight: "500" as const,
};

const footerTextStyle = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0 0 8px",
  lineHeight: "18px",
};

const footerBrand = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0",
};

const footerLink = {
  color: "#0D9488",
  textDecoration: "none",
};
