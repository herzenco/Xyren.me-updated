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
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    label: 'Content',
    href: '/dashboard/content',
    icon: LayoutList,
  },
  {
    label: 'Blog',
    href: '/dashboard/blog',
    icon: FileText,
  },
  {
    label: 'How-To Guides',
    href: '/dashboard/how-to',
    icon: BookOpen,
  },
  {
    label: 'FAQ',
    href: '/dashboard/faq',
    icon: HelpCircle,
  },
  {
    label: 'Submissions',
    href: '/dashboard/submissions',
    icon: Mail,
  },
  {
    label: 'Users',
    href: '/dashboard/users',
    icon: Users,
  },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <ul className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
