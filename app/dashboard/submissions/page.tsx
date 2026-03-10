import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { DataTable } from '@/components/dashboard/data-table'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function SubmissionsListPage({
  searchParams,
}: PageProps) {
  const supabase = await createClient()
  const { status } = await searchParams

  let query = (supabase.from('contact_submissions') as any).select('*')

  if (status && ['new', 'reviewed', 'archived'].includes(status)) {
    query = query.eq('status', status)
  }

  const { data: submissions } = await query.order('created_at', {
    ascending: false,
  })

  const columns = [
    { header: 'Name', accessor: 'name' as const },
    { header: 'Email', accessor: 'email' as const },
    {
      header: 'Business',
      accessor: 'business' as const,
      render: (value: any) => <span className="line-clamp-1">{value || '—'}</span>,
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (value: any) => (
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
            value === 'new'
              ? 'bg-blue-500/20 text-blue-300'
              : value === 'reviewed'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-gray-500/20 text-gray-300'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      header: 'Submitted',
      accessor: 'created_at' as const,
      render: (value: any) => (
        <span className="text-sm">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: () => '',
      render: (value: any, row: any) => (
        <Link href={`/dashboard/submissions/${row.id}`}>
          <button className="text-sm px-2 py-1 rounded text-cyan-300 hover:bg-secondary">
            View
          </button>
        </Link>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Contact Submissions" />

      <div className="mb-6 flex gap-2">
        <Link
          href="/dashboard/submissions"
          className={`px-3 py-1 rounded text-sm ${
            !status ? 'bg-cyan-500/20 text-cyan-300' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </Link>
        <Link
          href="/dashboard/submissions?status=new"
          className={`px-3 py-1 rounded text-sm ${
            status === 'new' ? 'bg-blue-500/20 text-blue-300' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          New
        </Link>
        <Link
          href="/dashboard/submissions?status=reviewed"
          className={`px-3 py-1 rounded text-sm ${
            status === 'reviewed' ? 'bg-amber-500/20 text-amber-300' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Reviewed
        </Link>
        <Link
          href="/dashboard/submissions?status=archived"
          className={`px-3 py-1 rounded text-sm ${
            status === 'archived' ? 'bg-gray-500/20 text-gray-300' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Archived
        </Link>
      </div>

      <DataTable columns={columns} data={submissions || []} />
    </>
  )
}
