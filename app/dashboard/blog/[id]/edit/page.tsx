import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { BlogForm } from '@/components/dashboard/blog-form'

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: post } = await (supabase
    .from('blog_posts') as any)
    .select('*')
    .eq('id', id)
    .single()

  if (!post) {
    notFound()
  }

  return (
    <>
      <PageHeader title={`Edit: ${(post as any).title}`} />
      <BlogForm id={id} defaultValues={post as any} />
    </>
  )
}
