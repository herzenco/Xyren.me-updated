import { createAdminClient } from '@/lib/supabase/admin'
import { PageHeader } from '@/components/dashboard/page-header'
import { DataTable } from '@/components/dashboard/data-table'
import { deleteBlogPost, toggleBlogPublished } from '@/lib/actions/blog'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

export default async function BlogListPage() {
  const supabase = createAdminClient()

  const { data: posts } = await (supabase
    .from('blog_posts') as any)
    .select('id, title, category, is_published, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const columns = [
    { header: 'Title', accessor: 'title' as const },
    { header: 'Category', accessor: 'category' as const },
    {
      header: 'Status',
      accessor: (row: any) => row.is_published ? 'Published' : 'Draft',
      render: (value: any, row: any) => (
        <form action={toggleBlogPublished.bind(null, row.id, row.is_published)}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-secondary"
          >
            {row.is_published ? (
              <>
                <Eye className="h-4 w-4" /> Published
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" /> Draft
              </>
            )}
          </button>
        </form>
      ),
    },
    {
      header: 'Actions',
      accessor: () => '',
      render: (value: any, row: any) => (
        <Link href={`/dashboard/blog/${row.id}/edit`}>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Blog Posts">
        <Link href="/dashboard/blog/new">
          <Button>New Post</Button>
        </Link>
      </PageHeader>

      <DataTable
        columns={columns}
        data={posts || []}
        onDelete={deleteBlogPost}
        showDeleteAction={true}
      />
    </>
  )
}
