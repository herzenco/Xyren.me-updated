import type { Metadata } from 'next'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for Xyren.me by Herzen Co.',
  alternates: { canonical: `${siteConfig.url}/terms` },
}

export default function TermsPage() {
  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl prose prose-invert prose-sm">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-gradient inline-block mb-6 not-prose">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Last updated: March 19, 2026
          </p>

          <h2>Service Description</h2>
          <p>
            Xyren by Herzen Co. provides custom website design and development
            services for service-based businesses. Our services include
            website design, front-end and back-end development, SEO
            optimization, hosting, and ongoing maintenance.
          </p>

          <h2>Payment Terms</h2>
          <p>
            Services are billed as a one-time setup fee plus a recurring
            monthly subscription. The setup fee is due before work begins and
            is non-refundable. Monthly fees are billed in advance on the same
            date each month. All prices are listed in USD.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            Upon full payment, you own the custom content, copy, and media you
            provide. Xyren retains ownership of proprietary code, frameworks,
            templates, and tools used to build your site. You receive a
            perpetual license to use the delivered website for your business
            purposes.
          </p>

          <h2>Client Responsibilities</h2>
          <p>
            You are responsible for providing accurate business information,
            content, and timely feedback during the design process. Delays in
            providing materials may extend project timelines.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            Xyren by Herzen Co. shall not be liable for any indirect,
            incidental, special, or consequential damages arising from the use
            of our services. Our total liability shall not exceed the amount
            paid for the services in question.
          </p>

          <h2>Termination</h2>
          <p>
            Either party may terminate the monthly subscription at any time
            with 30 days&apos; written notice. Upon termination, we will
            provide an export of your website files upon request. The one-time
            setup fee is non-refundable regardless of termination.
          </p>

          <h2>Governing Law</h2>
          <p>
            These terms are governed by the laws of the State of Florida,
            United States. Any disputes shall be resolved in the courts of
            Miami-Dade County, Florida.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to update these terms at any time. Continued
            use of our services constitutes acceptance of the updated terms.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms? Contact us at{' '}
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
