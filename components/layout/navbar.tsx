'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Home', href: '/' },
  {
    label: 'Industries',
    href: '#',
    children: [
      { label: 'Professional Services', href: '/use-cases/professional-services' },
      { label: 'Home Services', href: '/use-cases/home-services' },
    ],
  },
  {
    label: 'Resources',
    href: '#',
    children: [
      { label: 'Blog', href: '/resources/blog' },
      { label: 'How-To Guides', href: '/resources/how-to' },
      { label: 'FAQ', href: '/resources/faq' },
    ],
  },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Contact', href: '/#contact' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/50 backdrop-blur-xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <nav className="container-tight mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logos/xyren-logo-dark.png"
            alt="Xyren"
            width={100}
            height={32}
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.label} className="relative">
              {link.children ? (
                <>
                  <motion.button
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onMouseEnter={() => setOpenDropdown(link.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                    whileHover={{ scale: 1.02 }}
                  >
                    {link.label}
                    <motion.svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ rotate: openDropdown === link.label ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </motion.button>

                  <AnimatePresence>
                    {openDropdown === link.label && (
                      <motion.div
                        className="absolute top-full left-0 mt-1 w-52 rounded-lg border border-border/50 bg-card/80 backdrop-blur-sm shadow-card"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        onMouseEnter={() => setOpenDropdown(link.label)}
                        onMouseLeave={() => setOpenDropdown(null)}
                      >
                        {link.children.map((child, idx) => (
                          <motion.div
                            key={child.href}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Link
                              href={child.href}
                              className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors rounded-md mx-2 my-1"
                            >
                              {child.label}
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Link
                    href={link.href}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors block"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              )}
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button asChild size="sm" variant="hero">
            <Link href="/#contact">Get a Free Quote</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden border-t border-border/30 bg-background"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  {link.children ? (
                    <>
                      <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {link.label}
                      </p>
                      {link.children.map((child) => (
                        <motion.div key={child.href} whileHover={{ x: 4 }}>
                          <Link
                            href={child.href}
                            className="block px-6 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => setMobileOpen(false)}
                          >
                            {child.label}
                          </Link>
                        </motion.div>
                      ))}
                    </>
                  ) : (
                    <motion.div whileHover={{ x: 4 }}>
                      <Link
                        href={link.href}
                        className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              ))}
              <motion.div
                className="pt-2 border-t border-border/30 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button asChild className="w-full" variant="hero">
                  <Link href="/#contact" onClick={() => setMobileOpen(false)}>
                    Get a Free Quote
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
