import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

const footerLinks = {
  Services: [
    { label: 'Professional Services', href: '/use-cases/professional-services' },
    { label: 'Home Services', href: '/use-cases/home-services' },
    { label: 'Pricing', href: '/#pricing' },
  ],
  Resources: [
    { label: 'Blog', href: '/resources/blog' },
    { label: 'How-To Guides', href: '/resources/how-to' },
    { label: 'FAQ', href: '/resources/faq' },
  ],
  Company: [
    { label: 'Contact', href: '/#contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="font-bold text-xl">
              <span className="text-primary">Xyren</span>
              <span className="text-muted-foreground">.me</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Custom websites for service professionals. Built fast, optimized for leads.
            </p>
            <p className="text-sm text-muted-foreground">
              <a href="mailto:hello@xyren.me" className="hover:text-foreground transition-colors">
                hello@xyren.me
              </a>
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {year} Xyren.me. All rights reserved.</p>
          <p>Built with Next.js &amp; Tailwind CSS</p>
        </div>
      </div>
    </footer>
  )
}
