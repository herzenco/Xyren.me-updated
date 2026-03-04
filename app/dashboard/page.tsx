import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, BookOpen, HelpCircle, MessageSquare, LogOut } from 'lucide-react'
import Link from 'next/link'

async function signOut() {
  'use server'
  const { createClient: createServerClient } = await import('@/lib/supabase/server')
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/auth')
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const stats = [
    { label: 'Blog Posts', value: '—', icon: FileText, href: '/dashboard/blog' },
    { label: 'How-To Guides', value: '—', icon: BookOpen, href: '/dashboard/how-to' },
    { label: 'FAQ Items', value: '—', icon: HelpCircle, href: '/dashboard/faq' },
    { label: 'Contact Submissions', value: '—', icon: MessageSquare, href: '/dashboard/submissions' },
  ]

  return (
    <div className="py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.label} href={stat.href}>
                <Card className="hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/blog/new"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <FileText className="h-4 w-4" /> New Blog Post
            </Link>
            <Link
              href="/dashboard/how-to/new"
              className="inline-flex items-center gap-2 border px-4 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors"
            >
              <BookOpen className="h-4 w-4" /> New How-To Guide
            </Link>
            <Link
              href="/dashboard/faq/new"
              className="inline-flex items-center gap-2 border px-4 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors"
            >
              <HelpCircle className="h-4 w-4" /> New FAQ Item
            </Link>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Badge variant="outline" className="text-xs">
            Connect Supabase to see live data
          </Badge>
        </div>
      </div>
    </div>
  )
}
