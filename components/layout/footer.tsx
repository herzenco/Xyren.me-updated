import Link from 'next/link'

const footerLinks = {
  Services: [
    { label: 'Home Services', href: '/use-cases/home-services' },
    { label: 'Professional Services', href: '/use-cases/professional-services' },
    { label: 'Pricing', href: '/#pricing' },
  ],
  Resources: [
    { label: 'Case Studies', href: '/resources/blog' },
    { label: 'Documentation', href: '/resources/how-to' },
    { label: 'Support', href: '/resources/faq' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/#contact' },
    { label: 'Careers', href: '/careers' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-6">
        {/* Main Footer */}
        <div className="py-12 grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div>
              <p className="text-base font-semibold text-foreground">Xyren</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                by Herzen Co.
              </p>
            </div>
            <p className="text-sm text-muted-foreground max-w-[200px] leading-relaxed">
              Productized web design for service professionals.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">
                {category}
              </h4>
              <ul className="space-y-3">
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

        {/* Bottom bar */}
        <div className="border-t border-border py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Herzen Co. All rights reserved.
          </p>
          <a
            href="mailto:hello@xyren.me"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            hello@xyren.me
          </a>
        </div>
      </div>
    </footer>
  )
}
