'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createFaqItem, updateFaqItem } from '@/lib/actions/faq'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const faqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  category: z.string().min(1, 'Category is required'),
  sort_order: z.coerce.number().int().nonnegative(),
  is_published: z.boolean().optional(),
})

interface FaqFormProps {
  id?: string
  defaultValues?: Record<string, any>
}

export function FaqForm({ id, defaultValues }: FaqFormProps) {
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      sort_order: defaultValues?.sort_order || 0,
      ...defaultValues,
    },
  })

  const onSubmit = (data: z.infer<typeof faqSchema>) => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value))
          }
        })

        if (id) {
          await updateFaqItem(id, formData)
        } else {
          await createFaqItem(formData)
        }
      } catch (err) {
        console.error(err)
        alert(err instanceof Error ? err.message : 'Failed to save FAQ item')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div>
        <Label htmlFor="question">Question</Label>
        <Textarea
          id="question"
          {...register('question')}
          className="mt-1"
          rows={3}
        />
        {errors.question && <p className="text-sm text-destructive mt-1">{errors.question.message}</p>}
      </div>

      <div>
        <Label htmlFor="answer">Answer</Label>
        <Textarea
          id="answer"
          {...register('answer')}
          className="mt-1"
          rows={6}
        />
        {errors.answer && <p className="text-sm text-destructive mt-1">{errors.answer.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" {...register('category')} className="mt-1" />
          {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
        </div>

        <div>
          <Label htmlFor="sort_order">Sort Order</Label>
          <Input id="sort_order" type="number" {...register('sort_order')} className="mt-1" />
          {errors.sort_order && <p className="text-sm text-destructive mt-1">{errors.sort_order.message}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_published" {...register('is_published')} />
        <Label htmlFor="is_published" className="cursor-pointer">
          Publish immediately
        </Label>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : id ? 'Update Item' : 'Create Item'}
      </Button>
    </form>
  )
}
