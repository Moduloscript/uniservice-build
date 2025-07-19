-- Simplified Storage Policies for UnibenServices
-- This version only includes functions and can be run via Prisma
-- The bucket creation and RLS policies must be run in Supabase Dashboard

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
