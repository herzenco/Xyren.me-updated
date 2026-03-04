export interface BlogPost {
  id: string
  title: string
  slug: string
  category: string
  excerpt: string
  content: string
  published_at: string
  updated_at: string
  author: string
  cover_image?: string
  tags?: string[]
  reading_time?: number
}

export interface HowToGuide {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  published_at: string
  updated_at: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  cover_image?: string
  tags?: string[]
  reading_time?: number
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  category?: string
  order?: number
}

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  business?: string
  message: string
  service?: string
}

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}
