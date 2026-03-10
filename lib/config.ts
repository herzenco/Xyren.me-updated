export const siteConfig = {
  name: 'Xyren.me',
  tagline: 'Custom Websites for Service Professionals',
  description:
    'Get a fast, SEO-optimized website built for your service business in 5–10 days. No more chasing leads — let your website do the work.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://xyren.me',
  ogImage: '/og-image.png',
  links: {
    twitter: 'https://twitter.com/xyrenme',
  },
  contact: {
    email: 'hello@xyren.me',
  },
  keywords: [
    'custom web design',
    'service business websites',
    'SEO for tradespeople',
    'lead generation websites',
    'productized web design',
    'local SEO',
    'conversion optimized websites',
    'Xyren',
    'Herzen Co',
  ],
} as const

export type SiteConfig = typeof siteConfig
