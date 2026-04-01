import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'content-images'

export async function uploadContentImage(
  imageBuffer: Buffer,
  filename: string,
  contentType = 'image/png'
): Promise<string> {
  const supabase = createAdminClient()
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `covers/${Date.now()}-${safeName}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, imageBuffer, { contentType, upsert: false })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
