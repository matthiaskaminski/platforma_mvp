'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Upload an image to Supabase Storage
 * @param formData - FormData containing the file
 * @param bucket - Storage bucket name (default: 'room-images')
 * @returns Object with success status and URL or error message
 */
export async function uploadImage(formData: FormData, bucket: string = 'room-images') {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    const file = formData.get('file') as File
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size exceeds 5MB limit' }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'Failed to upload image' }
  }
}

/**
 * Delete an image from Supabase Storage
 * @param url - Full public URL of the image
 * @param bucket - Storage bucket name (default: 'room-images')
 */
export async function deleteImage(url: string, bucket: string = 'room-images') {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Extract file path from URL
    const urlParts = url.split(`${bucket}/`)
    if (urlParts.length < 2) {
      return { success: false, error: 'Invalid URL format' }
    }
    const filePath = urlParts[1]

    // Delete from storage
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error: 'Failed to delete image' }
  }
}
