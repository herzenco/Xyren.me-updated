'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createHowToGuide, updateHowToGuide } from '@/lib/actions/how-to'
import { slugify } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const howToSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Content is required'),
  reading_time: z.coerce.number().int().optional(),
  tags: z.string().optional(),
  is_published: z.boolean().optional(),
})

interface HowToFormProps {
  id?: string
  defaultValues?: Record<string, any>
}

export function HowToForm({ id, defaultValues }: HowToFormProps) {
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(howToSchema),
    defaultValues: {
      difficulty: defaultValues?.difficulty || 'beginner',
      tags: defaultValues?.tags?.join(', ') || '',
      ...defaultValues,
    },
  })

  const title = watch('title')

  const onSubmit = (data: z.infer<typeof howToSchema>) => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value))
          }
        })

        if (id) {
          await updateHowToGuide(id, formData)
        } else {
          await createHowToGuide(formData)
        }
      } catch (err) {
        console.error(err)
        alert(err instanceof Error ? err.message : 'Failed to save guide')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register('title')}
          onChange={(e) => {
            register('title').onChange(e)
            if (!id) {
              setValue('slug', slugify(e.target.value))
            }
          }}
          className="mt-1"
        />
        {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" {...register('slug')} className="mt-1" />
        {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <select
            id="difficulty"
            {...register('difficulty')}
            className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          {errors.difficulty && <p className="text-sm text-destructive mt-1">{errors.difficulty.message}</p>}
        </div>

        <div>
          <Label htmlFor="reading_time">Reading Time (minutes)</Label>
          <Input id="reading_time" type="number" {...register('reading_time')} className="mt-1" />
          {errors.reading_time && <p className="text-sm text-destructive mt-1">{errors.reading_time.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" {...register('excerpt')} className="mt-1" rows={3} />
        {errors.excerpt && <p className="text-sm text-destructive mt-1">{errors.excerpt.message}</p>}
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" {...register('content')} className="mt-1" rows={10} />
        {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input id="tags" {...register('tags')} className="mt-1" />
        {errors.tags && <p className="text-sm text-destructive mt-1">{errors.tags.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_published" {...register('is_published')} />
        <Label htmlFor="is_published" className="cursor-pointer">
          Publish immediately
        </Label>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : id ? 'Update Guide' : 'Create Guide'}
      </Button>
    </form>
  )
}
