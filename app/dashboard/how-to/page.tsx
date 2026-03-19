import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { DataTable } from '@/components/dashboard/data-table'
import { deleteHowToGuide, toggleHowToPublished } from '@/lib/actions/how-to'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

export default async function HowToListPage() {
  const supabase = await createClient()

  const { data: guides } = await (supabase
    .from('how_to_guides') as any)
    .select('*')
    .order('created_at', { ascending: false })

  const columns = [
    { header: 'Title', accessor: 'title' as const },
    { header: 'Difficulty', accessor: 'difficulty' as const },
    {
      header: 'Status',
      accessor: (row: any) => row.is_published ? 'Published' : 'Draft',
      render: (value: any, row: any) => (
        <form action={toggleHowToPublished.bind(null, row.id, row.is_published)}>
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
        <Link href={`/dashboard/how-to/${row.id}/edit`}>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="How-To Guides">
        <Link href="/dashboard/how-to/new">
          <Button>New Guide</Button>
        </Link>
      </PageHeader>

      <DataTable
        columns={columns}
        data={guides || []}
        onDelete={deleteHowToGuide}
        showDeleteAction={true}
      />
    </>
  )
}
