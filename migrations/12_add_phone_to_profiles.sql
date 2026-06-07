-- Add phone field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create 'avatar' bucket for profile avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatar', 'avatar', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload avatars
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatar' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Allow authenticated users to update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatar' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Allow authenticated users to delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatar' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to all avatars
CREATE POLICY "Allow public read access to avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatar');
