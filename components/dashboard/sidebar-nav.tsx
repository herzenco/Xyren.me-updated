'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FileText,
  BookOpen,
  HelpCircle,
  Mail,
  BarChart3,
  Users,
  LayoutList,
  SearchCheck,
  PlusCircle,
  Inbox,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navGroups = [
  {
    label: 'Analytics',
    icon: BarChart3,
    basePaths: ['/dashboard/analytics', '/dashboard/seo'],
    actions: [
      { label: 'Overview', href: '/dashboard/analytics', icon: BarChart3 },
      { label: 'SEO Audit', href: '/dashboard/seo', icon: SearchCheck },
    ],
  },
  {
    label: 'Content',
    icon: LayoutList,
    basePaths: ['/dashboard/content', '/dashboard/blog', '/dashboard/how-to', '/dashboard/faq'],
    actions: [
      { label: 'Draft Queue', href: '/dashboard/content', icon: LayoutList },
      { label: 'Blog Posts', href: '/dashboard/blog', icon: FileText },
      { label: 'How-To Guides', href: '/dashboard/how-to', icon: BookOpen },
      { label: 'FAQ', href: '/dashboard/faq', icon: HelpCircle },
      { label: 'New Blog Post', href: '/dashboard/blog/new', icon: PlusCircle },
      { label: 'New Guide', href: '/dashboard/how-to/new', icon: PlusCircle },
      { label: 'New FAQ Item', href: '/dashboard/faq/new', icon: PlusCircle },
    ],
  },
  {
    label: 'Leads',
    icon: Mail,
    basePaths: ['/dashboard/submissions', '/dashboard/users'],
    actions: [
      { label: 'Submissions', href: '/dashboard/submissions', icon: Inbox },
      { label: 'Users', href: '/dashboard/users', icon: Users },
    ],
  },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <ul className="space-y-1">
      {navGroups.map((group) => {
        const GroupIcon = group.icon
        const isGroupActive = group.basePaths.some(
          (base) => pathname === base || pathname.startsWith(base + '/')
        )

        return (
          <li key={group.label}>
            {/* Section header */}
            <div
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold mb-1',
                isGroupActive
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <GroupIcon className="h-4 w-4" />
              {group.label}
            </div>

            {/* Quick actions */}
            <ul className="space-y-0.5 mb-3">
              {group.actions.map((action) => {
                const ActionIcon = action.icon
                const isActive =
                  pathname === action.href || pathname.startsWith(action.href + '/')
                return (
                  <li key={action.href}>
                    <Link
                      href={action.href}
                      className={cn(
                        'flex items-center gap-3 pl-8 pr-3 py-1.5 rounded-md text-sm transition-colors',
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      )}
                    >
                      <ActionIcon className="h-3.5 w-3.5 flex-shrink-0" />
                      {action.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
        )
      })}
    </ul>
  )
}
