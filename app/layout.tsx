import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { siteConfig } from '@/lib/config'
import { seoMetadata } from '@/lib/seo'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: seoMetadata.home.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: seoMetadata.home.title,
    description: seoMetadata.home.description,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoMetadata.home.title,
    description: seoMetadata.home.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} antialiased dark`}>
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded-md"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
