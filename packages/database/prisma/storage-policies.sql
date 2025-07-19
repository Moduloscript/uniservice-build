-- Supabase Storage Policies for UnibenServices
-- This file sets up storage policies for file uploads and downloads
-- Run this in your Supabase SQL editor

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('verification-docs', 'verification-docs', false),
  ('student-id-cards', 'student-id-cards', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Function to check if user owns the file based on path prefix
CREATE OR REPLACE FUNCTION storage.user_owns_file(bucket_id text, file_path text)
RETURNS boolean AS $$
BEGIN
  -- Check if the file path starts with the user's ID
  RETURN file_path LIKE (auth.uid()::text || '-%');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION storage.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users u
    JOIN public."user" pu ON u.id = pu.id::uuid
    WHERE u.id = auth.uid()
    AND pu.role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- VERIFICATION-DOCS BUCKET POLICIES

-- Allow users to upload their own verification documents
CREATE POLICY "Users can upload their own verification docs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'verification-docs'
  AND auth.role() = 'authenticated'
  AND storage.user_owns_file(bucket_id, name)
);

-- Allow users to view their own verification documents
CREATE POLICY "Users can view their own verification docs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-docs'
  AND (
    storage.user_owns_file(bucket_id, name)
    OR storage.is_admin()
  )
);

-- Allow users to update their own verification documents
CREATE POLICY "Users can update their own verification docs"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'verification-docs'
  AND (
    storage.user_owns_file(bucket_id, name)
    OR storage.is_admin()
  )
)
WITH CHECK (
  bucket_id = 'verification-docs'
  AND (
    storage.user_owns_file(bucket_id, name)
    OR storage.is_admin()
  )
);

-- Allow users to delete their own verification documents
CREATE POLICY "Users can delete their own verification docs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'verification-docs'
  AND (
    storage.user_owns_file(bucket_id, name)
    OR storage.is_admin()
  )
);

-- STUDENT-ID-CARDS BUCKET POLICIES

-- Allow users to upload their own student ID cards
CREATE POLICY "Users can upload their own student ID cards"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'student-id-cards'
  AND auth.role() = 'authenticated'
  AND storage.user_owns_file(bucket_id, name)
);

-- Allow users to view their own student ID cards
CREATE POLICY "Users can view their own student ID cards"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'student-id-cards'
  AND (
    storage.user_owns_file(bucket_id, name)
    OR storage.is_admin()
  )
);

-- Allow users to update their own student ID cards
CREATE POLICY "Users can update their own student ID cards"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'student-id-cards'
  AND (
    storage.user_owns_file(bucket_id, name)
    OR storage.is_admin()
  )
);

-- Allow users to delete their own student ID cards
CREATE POLICY "Users can delete their own student ID cards"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'student-id-cards'
  AND (
    storage.user_owns_file(bucket_id, name)
    OR storage.is_admin()
  )
);

-- AVATARS BUCKET POLICIES (public bucket)

-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Allow everyone to view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Allow users to update avatars
CREATE POLICY "Authenticated users can update avatars"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Allow users to delete avatars
CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Admin policies for all storage operations
CREATE POLICY "Admins have full access to all storage"
ON storage.objects
USING (storage.is_admin())
WITH CHECK (storage.is_admin());
