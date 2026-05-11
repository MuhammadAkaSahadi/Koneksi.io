-- Aktifkan RLS di semua tabel
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Contoh Policy: Hanya admin yang bisa mengelola konten
CREATE POLICY "Admin full access" ON themes 
  FOR ALL TO authenticated USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
  );

-- Contoh Policy: User hanya bisa melihat progresnya sendiri
CREATE POLICY "View own progress" ON user_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);