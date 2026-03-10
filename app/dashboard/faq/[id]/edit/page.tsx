import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { FaqForm } from '@/components/dashboard/faq-form'

export default async function EditFaqItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: item } = await (supabase
    .from('faq_items') as any)
    .select('*')
    .eq('id', id)
    .single()

  if (!item) {
    notFound()
  }

  return (
    <>
      <PageHeader title={`Edit: ${(item as any).question}`} />
      <FaqForm id={id} defaultValues={item as any} />
    </>
  )
}
