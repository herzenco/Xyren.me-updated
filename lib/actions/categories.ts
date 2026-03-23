'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

async function requireAuth() {
  const session = await getServerSession()
  if (!session?.user) throw new Error('Unauthorized')
  return session.user
}

/** Fetch all categories ordered by post count */
export async function getCategories() {
  const supabase = createAdminClient()
  const { data, error } = await (supabase as any)
    .from('blog_categories')
    .select('*')
    .order('post_count', { ascending: false })

  if (error) throw new Error(`Failed to fetch categories: ${error.message}`)
  return data ?? []
}

/** Fetch only categories that have published posts */
export async function getCategoriesWithPosts() {
  const supabase = createAdminClient()
  const { data, error } = await (supabase as any)
    .from('blog_categories')
    .select('*')
    .gt('post_count', 0)
    .order('post_count', { ascending: false })

  if (error) throw new Error(`Failed to fetch categories: ${error.message}`)
  return data ?? []
}

/** Fetch a single category by slug */
export async function getCategoryBySlug(slug: string) {
  const supabase = createAdminClient()
  const { data, error } = await (supabase as any)
    .from('blog_categories')
    .select('*')
    .eq('slug', slug)
    .single()

  // PGRST116 = no rows found
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch category: ${error.message}`)
  }
  return data ?? null
}

/** Create or update a category (used by content engine) */
export async function upsertCategory(category: {
  slug: string
  name: string
  seo_title?: string
  meta_description?: string
  intro?: string
}) {
  const supabase = createAdminClient()
  const { error } = await (supabase as any)
    .from('blog_categories')
    .upsert(
      {
        slug: category.slug,
        name: category.name,
        seo_title: category.seo_title ?? null,
        meta_description: category.meta_description ?? null,
        intro: category.intro ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    )

  if (error) throw new Error(`Failed to upsert category: ${error.message}`)
}

/** Update category metadata from dashboard */
export async function updateCategory(slug: string, updates: {
  name?: string
  seo_title?: string
  meta_description?: string
  intro?: string
}) {
  await requireAuth()
  const supabase = createAdminClient()

  const fields: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (updates.name !== undefined) fields.name = updates.name
  if (updates.seo_title !== undefined) fields.seo_title = updates.seo_title
  if (updates.meta_description !== undefined) fields.meta_description = updates.meta_description
  if (updates.intro !== undefined) fields.intro = updates.intro

  const { error } = await (supabase as any)
    .from('blog_categories')
    .update(fields)
    .eq('slug', slug)

  if (error) throw new Error(`Failed to update category: ${error.message}`)

  revalidatePath('/dashboard/categories')
  revalidatePath(`/resources/blog/${slug}`)
}

/** Adjust post_count by delta (+1 on publish, -1 on unpublish/delete) */
export async function adjustCategoryCount(slug: string, delta: number) {
  const supabase = createAdminClient()
  const { data } = await (supabase as any)
    .from('blog_categories')
    .select('post_count')
    .eq('slug', slug)
    .single()

  if (!data) return

  const newCount = Math.max(0, (data.post_count ?? 0) + delta)
  await (supabase as any)
    .from('blog_categories')
    .update({ post_count: newCount, updated_at: new Date().toISOString() })
    .eq('slug', slug)
}
