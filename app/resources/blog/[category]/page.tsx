import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import { siteConfig } from '@/lib/config'
import { createAdminClient } from '@/lib/supabase/admin'

type Props = { params: Promise<{ category: string }> }

async function getCategory(slug: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('blog_categories')
    .select('slug, name, seo_title, meta_description, intro, post_count')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data
}

async function getCategoryPosts(categorySlug: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug, title, excerpt, category, reading_time, published_at, cover_image, tags')
    .eq('category', categorySlug)
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching category posts:', error)
    return []
  }

  return data ?? []
}

function titleCase(slug: string) {
  return slug.charAt(0).toUpperCase() + slug.slice(1)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params
  const category = await getCategory(slug)

  if (!category) return {}

  const title = category.seo_title || `${category.name || titleCase(slug)} Articles — Blog`
  const description =
    category.meta_description ||
    `Browse all ${(category.name || titleCase(slug)).toLowerCase()} articles for service business owners on Xyren.me.`

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/resources/blog/${slug}`,
    },
  }
}

export default async function BlogCategoryPage({ params }: Props) {
  const { category: slug } = await params

  const category = await getCategory(slug)
  if (!category) notFound()

  const posts = await getCategoryPosts(slug)
  const categoryName = category.name || titleCase(slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.seo_title || `${categoryName} Articles`,
    description:
      category.meta_description ||
      `Browse all ${categoryName.toLowerCase()} articles on ${siteConfig.name}.`,
    url: `${siteConfig.url}/resources/blog/${slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    ...(posts.length > 0 && {
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: posts.length,
        itemListElement: posts.map((post, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${siteConfig.url}/resources/blog/${slug}/${post.slug}`,
          name: post.title,
        })),
      },
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/resources/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> All articles
            </Link>

            <h1 className="text-4xl font-extrabold tracking-tight mb-4">{categoryName}</h1>

            {category.intro && (
              <p className="text-lg text-muted-foreground mb-4">{category.intro}</p>
            )}

            <p className="text-muted-foreground mb-12">
              {posts.length} article{posts.length !== 1 ? 's' : ''}
            </p>

            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No articles in this category yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {posts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/resources/blog/${slug}/${post.slug}`}
                    className="group"
                  >
                    <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all">
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5" />
                      <CardContent className="p-5 space-y-3">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {post.category}
                        </Badge>
                        <h2 className="font-bold leading-snug group-hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                          <span>
                            {new Date(post.published_at ?? Date.now()).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.reading_time} min read
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                          Read more <ArrowRight className="h-3 w-3" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
