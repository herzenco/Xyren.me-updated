'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'
import type { Database } from '@/types/database.types'

type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert']

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
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

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
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

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
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { error } = await (supabase.from('blog_posts') as any).delete().eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/blog')
    revalidatePath('/resources/blog', 'layout')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete post'
    throw new Error(message)
  }
}

export async function toggleBlogPublished(id: string, currentStatus: boolean) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { error } = await (supabase.from('blog_posts') as any)
      .update({
        is_published: !currentStatus,
        published_at: !currentStatus ? new Date().toISOString() : null,
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/blog')
    revalidatePath('/resources/blog', 'layout')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to toggle publish status'
    throw new Error(message)
  }
}
