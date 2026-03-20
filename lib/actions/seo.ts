'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getServerSession } from 'next-auth'
import { runSeoAudit } from '@/lib/seo-audit'

async function requireAuth() {
  const session = await getServerSession()
  if (!session?.user) throw new Error('Unauthorized')
  return session.user
}

export async function triggerSeoAudit(): Promise<void> {
  await requireAuth()
  const supabase = createAdminClient()

  await runSeoAudit()
  revalidatePath('/dashboard/seo')
}
