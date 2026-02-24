import { createClient } from '@/utils/supabase/client'

export async function uploadImage(file: File): Promise<string | null> {
  const supabase = createClient()
  
  // 1. Create a unique file name to prevent overwriting
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
  const filePath = `editor_images/${fileName}`

  try {
    // 2. Upload to your public bucket
    const { error: uploadError } = await supabase.storage
      .from('mednexus_assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload failed:', uploadError.message)
      return null
    }

    // 3. Retrieve the public URL
    const { data } = supabase.storage
      .from('mednexus_assets')
      .getPublicUrl(filePath)

    return data.publicUrl

  } catch (error) {
    console.error('Unexpected error during image upload:', error)
    return null
  }
}