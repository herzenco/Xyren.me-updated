'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { getServerSession } from 'next-auth'
import { slugify } from '@/lib/utils'
import { adjustCategoryCount } from '@/lib/actions/categories'
import type { Database } from '@/types/database.types'

type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert']

async function requireAuth() {
  const session = await getServerSession()
  if (!session?.user) throw new Error('Unauthorized')
  return session.user
}

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  category: z.string().min(1, 'Category is required'),
  excerpt: z.string().min(1, 'Excerpt is required').max(500),
  content: z.string().min(1, 'Content is required'),
  author: z.string().max(255).optional().default('Xyren.me Team'),
  reading_time: z.coerce.number().int().positive().optional(),
  tags: z.string().optional().transform((val) => val?.split(',').map((t) => t.trim()).filter(Boolean) || []),
  is_published: z.coerce.boolean().optional().default(false),
})

export async function createBlogPost(formData: FormData) {
  try {
    await requireAuth()
    const supabase = createAdminClient()

    const data = Object.fromEntries(formData)
    const validated = blogSchema.parse(data)

    const insertData: BlogPostInsert = {
      title: validated.title,
      slug: validated.slug,
      category: validated.category,
      excerpt: validated.excerpt,
      content: validated.content,
      author: validated.author,
      reading_time: validated.reading_time || undefined,
      tags: validated.tags || undefined,
      is_published: validated.is_published,
      published_at: validated.is_published ? new Date().toISOString() : null,
    }

    const { error } = await (supabase.from('blog_posts') as any).insert(insertData)

    if (error) throw error

    revalidatePath('/dashboard/blog')
    revalidatePath('/resources/blog', 'layout')
    redirect('/dashboard/blog')
  } catch (err) {
    const message = err instanceof z.ZodError
      ? err.issues.map((i) => i.message).join(', ')
      : err instanceof Error
        ? err.message
        : 'Failed to create post'
    throw new Error(message)
  }
}

export async function updateBlogPost(id: string, formData: FormData) {
  try {
    await requireAuth()
    const supabase = createAdminClient()

    const data = Object.fromEntries(formData)
    const validated = blogSchema.parse(data)

    const updateData: BlogPostInsert = {
      title: validated.title,
      slug: validated.slug,
      category: validated.category,
      excerpt: validated.excerpt,
      content: validated.content,
      author: validated.author,
      reading_time: validated.reading_time || undefined,
      tags: validated.tags || undefined,
      is_published: validated.is_published,
      published_at: validated.is_published ? new Date().toISOString() : null,
    }

    const { error } = await (supabase.from('blog_posts') as any)
      .update(updateData)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/blog')
    revalidatePath('/resources/blog', 'layout')
    redirect('/dashboard/blog')
  } catch (err) {
    const message = err instanceof z.ZodError
      ? err.issues.map((i) => i.message).join(', ')
      : err instanceof Error
        ? err.message
        : 'Failed to update post'
    throw new Error(message)
  }
}

export async function deleteBlogPost(id: string) {
  try {
    await requireAuth()
    const supabase = createAdminClient()

    const { data: post } = await (supabase.from('blog_posts') as any)
      .select('category, is_published')
      .eq('id', id)
      .single()

    const { error } = await (supabase.from('blog_posts') as any).delete().eq('id', id)

    if (error) throw error

    if (post?.category && post.is_published) {
      await adjustCategoryCount(post.category, -1).catch(console.error)
      revalidatePath(`/resources/blog/${post.category}`)
    }

    revalidatePath('/dashboard/blog')
    revalidatePath('/resources/blog', 'layout')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete post'
    throw new Error(message)
  }
}

export async function toggleBlogPublished(id: string, currentStatus: boolean) {
  try {
    await requireAuth()
    const supabase = createAdminClient()

    const { data: post } = await (supabase.from('blog_posts') as any)
      .select('category')
      .eq('id', id)
      .single()

    const { error } = await (supabase.from('blog_posts') as any)
      .update({
        is_published: !currentStatus,
        published_at: !currentStatus ? new Date().toISOString() : null,
      })
      .eq('id', id)

    if (error) throw error

    if (post?.category) {
      await adjustCategoryCount(post.category, currentStatus ? -1 : 1).catch(console.error)
      revalidatePath(`/resources/blog/${post.category}`)
    }

    revalidatePath('/dashboard/blog')
    revalidatePath('/resources/blog', 'layout')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to toggle publish status'
    throw new Error(message)
  }
}
