import { PageHeader } from '@/components/dashboard/page-header'
import { DataTable } from '@/components/dashboard/data-table'
import { createAdminClient } from '@/lib/supabase/admin'

interface AuthUser {
  id: string
  email: string
  name: string | null
  image: string | null
  google_id: string | null
  last_login: string | null
  created_at: string
  updated_at: string
}

export default async function UsersPage() {
  const supabase = createAdminClient()

  const { data: users, error } = await supabase
    .from('auth_users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch users:', error)
    return (
      <div>
        <PageHeader title="Users" />
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-destructive">Failed to load users. Please try again.</p>
        </div>
      </div>
    )
  }

  const typedUsers = (users || []) as AuthUser[]

  return (
    <div>
      <PageHeader title="Users" />
      <DataTable<AuthUser>
        columns={[
          {
            header: 'Name',
            accessor: 'name',
            render: (value) => (value ? String(value) : '—'),
          },
          {
            header: 'Email',
            accessor: 'email',
          },
          {
            header: 'Last Login',
            accessor: 'last_login',
            render: (value) => {
              if (!value) return '—'
              return new Date(value as string).toLocaleDateString()
            },
          },
          {
            header: 'Joined',
            accessor: 'created_at',
            render: (value) =>
              new Date(value as string).toLocaleDateString(),
          },
        ]}
        data={typedUsers}
        showDeleteAction={false}
      />
    </div>
  )
}
