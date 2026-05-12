import midtransClient from "midtrans-client";

// Create Snap API instance
export const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === "production" ? true : false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
});
