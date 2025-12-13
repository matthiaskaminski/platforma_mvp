-- ============================================
-- Supabase Storage Setup for Room Images
-- ============================================
-- This script creates the necessary storage bucket and policies
-- for uploading and managing room cover images.
--
-- HOW TO RUN:
-- 1. Go to your Supabase Dashboard
-- 2. Click on "SQL Editor" in the left menu
-- 3. Create a new query
-- 4. Copy and paste this entire script
-- 5. Click "Run" to execute
-- ============================================

-- Create the storage bucket for room images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'room-images',
    'room-images',
    true,  -- Public bucket - images will be accessible via public URLs
    5242880,  -- 5MB file size limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']  -- Allowed file types
)
ON CONFLICT (id) DO NOTHING;  -- Skip if bucket already exists

-- ============================================
-- Storage Policies
-- ============================================

-- Policy 1: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload room images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'room-images' AND
    -- Limit file size to 5MB
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow anyone to view room images (public access)
CREATE POLICY "Anyone can view room images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'room-images');

-- Policy 3: Allow users to update their own images
CREATE POLICY "Users can update their own room images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'room-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'room-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow users to delete their own images
CREATE POLICY "Users can delete their own room images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'room-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify the bucket was created successfully

SELECT
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
WHERE id = 'room-images';

-- ============================================
-- DONE!
-- ============================================
-- After running this script:
-- 1. Verify the bucket appears in the query results above
-- 2. Go to Storage in your Supabase Dashboard to see the bucket
-- 3. Try creating a room with an image - it should work now!
-- ============================================
