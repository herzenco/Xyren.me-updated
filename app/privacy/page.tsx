import type { Metadata } from 'next'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Xyren.me by Herzen Co.',
  alternates: { canonical: `${siteConfig.url}/privacy` },
}

export default function PrivacyPage() {
  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl prose prose-invert prose-sm">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-gradient inline-block mb-6 not-prose">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Last updated: March 19, 2026
          </p>

          <h2>Information We Collect</h2>
          <p>
            When you use our contact form or request a consultation, we collect
            the information you provide, including your name, email address,
            phone number, and project details. We also collect standard usage
            data through analytics tools (pages visited, time on site, device
            type).
          </p>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Respond to your inquiries and consultation requests</li>
            <li>Deliver our web design and development services</li>
            <li>Improve our website and user experience</li>
            <li>Send relevant project updates and communications</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            Our website uses essential cookies to ensure basic functionality
            and analytics cookies (Google Analytics) to understand how visitors
            interact with our site. You can manage cookie preferences through
            your browser settings.
          </p>

          <h2>Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li>
              <strong>Google Analytics</strong> — website traffic analysis
            </li>
            <li>
              <strong>Supabase</strong> — data storage and authentication
            </li>
            <li>
              <strong>Vercel</strong> — website hosting
            </li>
            <li>
              <strong>Resend</strong> — transactional email delivery
            </li>
          </ul>
          <p>
            These services may process data in accordance with their own
            privacy policies.
          </p>

          <h2>Data Retention</h2>
          <p>
            We retain your personal information only as long as necessary to
            fulfill the purposes for which it was collected, typically for the
            duration of our business relationship plus any legally required
            retention period.
          </p>

          <h2>Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your
            personal data at any time by contacting us.
          </p>

          <h2>Contact</h2>
          <p>
            If you have questions about this privacy policy, contact us at{' '}
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
