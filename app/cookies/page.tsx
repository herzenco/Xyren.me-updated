import type { Metadata } from 'next'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Cookie policy for Xyren.me by Herzen Co.',
  alternates: { canonical: `${siteConfig.url}/cookies` },
}

export default function CookiesPage() {
  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl prose prose-invert prose-sm">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-gradient inline-block mb-6 not-prose">
            Cookie Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Last updated: March 19, 2026
          </p>

          <h2>What Are Cookies</h2>
          <p>
            Cookies are small text files stored on your device when you visit a
            website. They help the site remember your preferences and
            understand how you interact with it.
          </p>

          <h2>Cookies We Use</h2>

          <h3>Essential Cookies</h3>
          <p>
            These cookies are necessary for the website to function and cannot
            be disabled. They include cookies for authentication, security, and
            basic site functionality.
          </p>

          <h3>Analytics Cookies</h3>
          <p>
            We use Google Analytics to understand how visitors interact with
            our website. These cookies collect anonymized data such as pages
            visited, time spent on the site, and general location. This helps
            us improve our content and user experience.
          </p>

          <h2>Managing Cookies</h2>
          <p>
            You can control and delete cookies through your browser settings.
            Most browsers allow you to:
          </p>
          <ul>
            <li>View what cookies are stored and delete them individually</li>
            <li>Block third-party cookies</li>
            <li>Block cookies from specific sites</li>
            <li>Block all cookies</li>
            <li>Delete all cookies when you close your browser</li>
          </ul>
          <p>
            Note that disabling cookies may affect certain features of the
            website.
          </p>

          <h2>Contact</h2>
          <p>
            If you have questions about our use of cookies, contact us at{' '}
            <a href="mailto:hello@xyren.me" className="text-primary">
              hello@xyren.me
            </a>
            .
          </p>

          <p className="text-muted-foreground text-xs mt-12">
            &copy; 2026 Herzen Co. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
