-- Migrasi: Menambahkan kolom preview_video_url ke tabel themes
ALTER TABLE themes ADD COLUMN preview_video_url TEXT;
