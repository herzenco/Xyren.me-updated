'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth-helpers'
import { runSeoAudit } from '@/lib/seo-audit'

export async function triggerSeoAudit(): Promise<void> {
  await requireAuth()
  const supabase = createAdminClient()

  await runSeoAudit()
  revalidatePath('/dashboard/seo')
}
