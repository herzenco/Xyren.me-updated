import { PageHeader } from '@/components/dashboard/page-header'
import { BlogForm } from '@/components/dashboard/blog-form'

export default function NewBlogPostPage() {
  return (
    <>
      <PageHeader title="Create Blog Post" />
      <BlogForm />
    </>
  )
}
