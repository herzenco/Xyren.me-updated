import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { SignOutButton } from '@/components/dashboard/sign-out-button'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const session = await auth()

  if (!session?.user) {
    redirect('/auth')
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border bg-card flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-gradient">Dashboard</h1>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <SidebarNav />
        </nav>
        <div className="p-4 border-t border-border">
          <SignOutButton className="w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden border-b border-border bg-card sticky top-0 z-40">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-gradient">Dashboard</h1>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="border-b border-border p-6">
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <nav className="p-4">
                  <SidebarNav />
                </nav>
                <div className="p-4 border-t border-border">
                  <SignOutButton className="w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors text-left" />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
