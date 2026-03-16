export const seoMetadata = {
  home: {
    title: 'Xyren | Websites for Small Businesses with AI Lead Tracking',
    description:
      'Get a fast, SEO-optimized website built for your service business in 5–10 days. No more chasing leads — let your website do the work.',
    image: '/og-image.png',
  },
  useCaseProfessionalServices: {
    title: 'Websites for Professional Services | Xyren',
    description:
      'Custom websites for lawyers, accountants, consultants, and other professional service providers. Built to establish authority and generate qualified leads.',
    image: '/og-image.png',
  },
  useCaseHomeServices: {
    title: 'Websites for Home Services Businesses | Xyren',
    description:
      'Custom websites for plumbers, electricians, HVAC, landscapers, and other home service providers. Built for local SEO and phone call conversions.',
    image: '/og-image.png',
  },
  resources: {
    title: 'Resources — Website Tips for Service Professionals | Xyren',
    description:
      'Guides, blog posts, and FAQs to help service professionals get more from their website. Free resources from the Xyren.me team.',
    image: '/og-image.png',
  },
  blog: {
    title: 'Blog — Website & Marketing Tips for Service Professionals | Xyren',
    description:
      'Articles on local SEO, lead generation, website design, and online marketing for service-based businesses.',
    image: '/og-image.png',
  },
  howTo: {
    title: 'How-To Guides — Website & Marketing for Service Professionals | Xyren',
    description:
      'Step-by-step guides to help service business owners improve their website, SEO, and online lead generation.',
    image: '/og-image.png',
  },
  faq: {
    title: 'FAQ — Frequently Asked Questions | Xyren',
    description:
      'Answers to the most common questions about building a website with Xyren.me. Pricing, timelines, process, and more.',
    image: '/og-image.png',
  },
  contact: {
    title: 'Contact Xyren | Get Started Today',
    description:
      'Ready to build your website? Contact us for a consultation and get a free quote for your project.',
    image: '/og-image.png',
  },
} as const

export type SEOMetadataKey = keyof typeof seoMetadata
