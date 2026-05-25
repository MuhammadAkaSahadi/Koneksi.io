-- Migrasi: Menambahkan kolom duration ke tabel lessons
ALTER TABLE lessons ADD COLUMN duration TEXT;
