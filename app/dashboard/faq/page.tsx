import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { DataTable } from '@/components/dashboard/data-table'
import { deleteFaqItem, toggleFaqPublished } from '@/lib/actions/faq'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

export default async function FaqListPage() {
  const supabase = await createClient()

  const { data: items } = await (supabase
    .from('faq_items') as any)
    .select('*')
    .order('sort_order', { ascending: true })

  const columns = [
    {
      header: 'Question',
      accessor: 'question' as const,
      render: (value: any) => (
        <span className="line-clamp-1">{value}</span>
      ),
    },
    { header: 'Category', accessor: 'category' as const },
    {
      header: 'Status',
      accessor: (row: any) => row.is_published ? 'Published' : 'Draft',
      render: (value: any, row: any) => (
        <form action={toggleFaqPublished.bind(null, row.id, row.is_published)}>
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
        <Link href={`/dashboard/faq/${row.id}/edit`}>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="FAQ Items">
        <Link href="/dashboard/faq/new">
          <Button>New Item</Button>
        </Link>
      </PageHeader>

      <DataTable
        columns={columns}
        data={items || []}
        onDelete={deleteFaqItem}
        showDeleteAction={true}
      />
    </>
  )
}
