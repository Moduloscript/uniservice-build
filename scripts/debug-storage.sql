-- Debugging script for Supabase Storage
-- Run this in your Supabase SQL editor to check storage setup

-- Check if storage buckets exist
SELECT 
  id, 
  name, 
  public, 
  created_at
FROM storage.buckets 
ORDER BY created_at;

-- Check storage policies
SELECT 
  policyname,
  tablename,
  cmd,
  permissive,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects'
ORDER BY policyname;

-- Check if storage.objects has RLS enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- Check current user context
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- Check if current user exists in public.user table
SELECT 
  id,
  name,
  email,
  role
FROM public."user" 
WHERE id::uuid = auth.uid();

-- Test if storage functions exist
SELECT 
  proname as function_name,
  pronamespace::regnamespace as schema
FROM pg_proc 
WHERE proname IN ('user_owns_file', 'is_admin')
  AND pronamespace = 'storage'::regnamespace;

-- Check recent storage objects (if any)
SELECT 
  bucket_id,
  name,
  id,
  owner,
  created_at
FROM storage.objects 
ORDER BY created_at DESC 
LIMIT 10;
