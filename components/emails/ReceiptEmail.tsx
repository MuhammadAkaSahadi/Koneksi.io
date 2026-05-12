import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface ReceiptEmailProps {
  userName: string;
  themeTitle: string;
  orderId: string;
  totalAmount: string;
}

export const ReceiptEmail = ({
  userName = "Siswa",
  themeTitle = "Kursus IoT Fundamental",
  orderId = "TRX-12345",
  totalAmount = "Rp 199.000",
}: ReceiptEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Tanda Terima Pembelian: {themeTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Koneksi.io</Heading>
          <Text style={text}>Halo {userName},</Text>
          <Text style={text}>
            Terima kasih telah melakukan pembelian di Koneksi.io. Akses Anda
            menuju materi premium telah diaktifkan!
          </Text>
          <Section style={orderSection}>
            <Text style={orderText}>
              <strong>ID Pesanan:</strong> {orderId}
            </Text>
            <Text style={orderText}>
              <strong>Materi:</strong> {themeTitle}
            </Text>
            <Text style={orderText}>
              <strong>Total Pembayaran:</strong> {totalAmount}
            </Text>
          </Section>
          <Section style={btnContainer}>
            <Button style={button} href="https://koneksi-io.vercel.app/dashboard">
              Mulai Belajar Sekarang
            </Button>
          </Section>
          <Text style={footer}>
            Jika Anda memiliki pertanyaan, balas email ini atau hubungi
            support@koneksi.io
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ReceiptEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
};

const h1 = {
  color: "#1164b8",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 48px",
};

const orderSection = {
  padding: "24px 48px",
  backgroundColor: "#f8f9fa",
  margin: "24px 48px",
  borderRadius: "8px",
};

const orderText = {
  fontSize: "14px",
  margin: "8px 0",
  color: "#374151",
};

const btnContainer = {
  textAlign: "center" as const,
  marginTop: "32px",
};

const button = {
  backgroundColor: "#b1de01",
  borderRadius: "8px",
  color: "#1f2937",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
  fontWeight: "bold",
  margin: "0 auto",
  width: "200px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 48px",
  marginTop: "48px",
};
