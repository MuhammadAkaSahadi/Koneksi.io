-- migrations/07_admin_additions.sql
-- Run this in your Supabase SQL Editor to prepare the database columns for the Admin Dashboard.

-- 1. Tambahkan kolom category dan status di tabel themes
ALTER TABLE themes ADD COLUMN category TEXT DEFAULT 'Hardware (IoT)';
ALTER TABLE themes ADD COLUMN status TEXT DEFAULT 'Published';

-- 2. Tambahkan kolom status dan banned_reason di tabel profiles
ALTER TABLE profiles ADD COLUMN status TEXT DEFAULT 'Aktif';
ALTER TABLE profiles ADD COLUMN banned_reason TEXT;

-- 3. Tambahkan kolom transfer_proof_url di tabel transactions
ALTER TABLE transactions ADD COLUMN transfer_proof_url TEXT;
