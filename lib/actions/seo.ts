'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { runSeoAudit } from '@/lib/seo-audit'

export async function triggerSeoAudit() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const result = await runSeoAudit()
  revalidatePath('/dashboard/seo')
  return result
}
