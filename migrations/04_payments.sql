-- Riwayat Pembayaran (Sesuai detail invoice)
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id_midtrans TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL, 
  subtotal NUMERIC NOT NULL, -- Contoh: 1.500.000
  voucher_amount NUMERIC DEFAULT 0, -- Contoh: 1.155.000
  total_amount NUMERIC NOT NULL, -- Contoh: 345.000
  status TEXT NOT NULL, -- Success, Pending, Failed
  payment_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);