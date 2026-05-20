-- Katalog Tema Utama
CREATE TABLE themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  price_lifetime NUMERIC DEFAULT 0, -- Harga beli sekali
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Struktur Bab per Tema
CREATE TABLE chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Detail Materi Video
CREATE TABLE lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  youtube_id TEXT NOT NULL, -- Konten video YouTube
  description TEXT, -- Deskripsi opsional
  is_free BOOLEAN DEFAULT FALSE, -- Penanda materi freemium
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);