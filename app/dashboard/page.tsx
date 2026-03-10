import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, BookOpen, HelpCircle, MessageSquare, BarChart3, Users, Mail } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [blogRes, guideRes, faqRes, submissionsRes, newSubmissionsRes] =
    await Promise.all([
      (supabase.from('blog_posts') as any).select('*', { count: 'exact', head: true }),
      (supabase.from('how_to_guides') as any).select('*', { count: 'exact', head: true }),
      (supabase.from('faq_items') as any).select('*', { count: 'exact', head: true }),
      (supabase.from('contact_submissions') as any).select('*', { count: 'exact', head: true }),
      (supabase
        .from('contact_submissions') as any)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new'),
    ])

  const blogCount = blogRes.count || 0
  const guideCount = guideRes.count || 0
  const faqCount = faqRes.count || 0
  const submissionCount = submissionsRes.count || 0
  const newSubmissionCount = newSubmissionsRes.count || 0

  const stats = [
    { label: 'Blog Posts', value: blogCount.toString(), icon: FileText, href: '/dashboard/blog' },
    { label: 'How-To Guides', value: guideCount.toString(), icon: BookOpen, href: '/dashboard/how-to' },
    { label: 'FAQ Items', value: faqCount.toString(), icon: HelpCircle, href: '/dashboard/faq' },
    {
      label: 'Contact Submissions',
      value: submissionCount.toString(),
      icon: MessageSquare,
      href: '/dashboard/submissions',
      badge: newSubmissionCount > 0 ? `${newSubmissionCount} new` : undefined,
    },
  ]

  return (
    <div className="py-10 px-4">
      <div className="container mx-auto max-w-5xl">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.label} href={stat.href}>
                <Card className="hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      {stat.badge && (
                        <Badge variant="outline" className="text-xs w-fit">
                          {stat.badge}
                        </Badge>
                      )}
                    </div>
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
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link
              href="/dashboard/analytics"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-blue-500/10 border border-blue-500/30 text-blue-300 px-4 py-3 rounded-lg text-sm font-medium hover:border-blue-500/60 transition-colors"
            >
              <BarChart3 className="h-4 w-4" /> Analytics
            </Link>
            <Link
              href="/dashboard/submissions"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-3 rounded-lg text-sm font-medium hover:border-amber-500/60 transition-colors"
            >
              <Mail className="h-4 w-4" /> Leads
            </Link>
            <Link
              href="/dashboard/blog/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-4 py-3 rounded-lg text-sm font-medium hover:border-cyan-500/60 transition-colors"
            >
              <FileText className="h-4 w-4" /> New Blog Post
            </Link>
            <Link
              href="/dashboard/how-to/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500/20 to-violet-500/10 border border-violet-500/30 text-violet-300 px-4 py-3 rounded-lg text-sm font-medium hover:border-violet-500/60 transition-colors"
            >
              <BookOpen className="h-4 w-4" /> New How-To
            </Link>
            <Link
              href="/dashboard/faq/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-lg text-sm font-medium hover:border-emerald-500/60 transition-colors"
            >
              <HelpCircle className="h-4 w-4" /> New FAQ Item
            </Link>
            <Link
              href="/dashboard/users"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500/20 to-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-lg text-sm font-medium hover:border-rose-500/60 transition-colors"
            >
              <Users className="h-4 w-4" /> User Management
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
