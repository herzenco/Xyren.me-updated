import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { HowToForm } from '@/components/dashboard/how-to-form'

export default async function EditHowToGuidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: guide } = await (supabase
    .from('how_to_guides') as any)
    .select('*')
    .eq('id', id)
    .single()

  if (!guide) {
    notFound()
  }

  return (
    <>
      <PageHeader title={`Edit: ${(guide as any).title}`} />
      <HowToForm id={id} defaultValues={guide as any} />
    </>
  )
}
