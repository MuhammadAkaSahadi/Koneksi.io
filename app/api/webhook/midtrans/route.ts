import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { ReceiptEmail } from "@/components/emails/ReceiptEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

// Use service role key to bypass RLS in webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate signature
    const signatureKey = body.signature_key;
    const orderId = body.order_id;
    const statusCode = body.status_code;
    const grossAmount = body.gross_amount;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    
    const hash = crypto
      .createHash("sha512")
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest("hex");
      
    if (hash !== signatureKey) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;

    let status = "pending";

    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        status = "challenge";
      } else if (fraudStatus == "accept") {
        status = "success";
      }
    } else if (transactionStatus == "settlement") {
      status = "success";
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      status = "failed";
    } else if (transactionStatus == "pending") {
      status = "pending";
    }

    // 1. Update Transaction Status
    await supabaseAdmin
      .from("transactions")
      .update({ status: status })
      .eq("transaction_id_midtrans", orderId);

    // 2. If Success, grant access (insert to enrollments)
    if (status === "success") {
      // First, get the transaction details to know user_id and item_name
      // We might need to store theme_id in transactions. Let's assume we can fetch it, 
      // or we should have saved theme_id in metadata/transactions.
      // Since our schema only has item_name, we can look up theme by item_name or title.
      const { data: trx } = await supabaseAdmin
        .from("transactions")
        .select("user_id, item_name")
        .eq("transaction_id_midtrans", orderId)
        .single();
        
      if (trx) {
        // Find theme by title
        const { data: theme } = await supabaseAdmin
          .from("themes")
          .select("id, title")
          .eq("title", trx.item_name)
          .single();
          
        if (theme) {
          // Grant access (ignoring conflict if they already have it)
          await supabaseAdmin.from("enrollments").upsert({
            user_id: trx.user_id,
            theme_id: theme.id,
          }, { onConflict: "user_id,theme_id" });

          // Send Email Receipt
          try {
            const { data: userRecord } = await supabaseAdmin.auth.admin.getUserById(trx.user_id);
            if (userRecord && userRecord.user && userRecord.user.email) {
               await resend.emails.send({
                 from: 'Koneksi.io <noreply@reprodigital.id>', // Using a generic domain or change as needed
                 to: userRecord.user.email,
                 subject: `Akses Dibuka: ${theme.title}`,
                 react: ReceiptEmail({
                   userName: userRecord.user.email.split("@")[0],
                   themeTitle: trx.item_name,
                   orderId: orderId,
                   totalAmount: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(grossAmount)
                 }),
               });
            }
          } catch (emailError) {
            console.error("Failed to send receipt email:", emailError);
            // Don't fail the webhook if email fails
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
