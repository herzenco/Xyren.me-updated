'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Pencil, Save, X } from 'lucide-react'
import { updateCategory } from '@/lib/actions/categories'

type Category = {
  id: string
  slug: string
  name: string
  seo_title: string | null
  meta_description: string | null
  intro: string | null
  post_count: number
}

export function CategoryEditor({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(category.name)
  const [seoTitle, setSeoTitle] = useState(category.seo_title ?? '')
  const [metaDesc, setMetaDesc] = useState(category.meta_description ?? '')
  const [intro, setIntro] = useState(category.intro ?? '')

  function handleSave() {
    startTransition(async () => {
      await updateCategory(category.slug, {
        name,
        seo_title: seoTitle || undefined,
        meta_description: metaDesc || undefined,
        intro: intro || undefined,
      })
      setEditing(false)
    })
  }

  function handleCancel() {
    setName(category.name)
    setSeoTitle(category.seo_title ?? '')
    setMetaDesc(category.meta_description ?? '')
    setIntro(category.intro ?? '')
    setEditing(false)
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            {editing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 w-48"
              />
            ) : (
              <h3 className="font-semibold text-lg">{category.name}</h3>
            )}
            <Badge variant="outline" className="text-xs font-mono">
              {category.slug}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {category.post_count} posts
            </Badge>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isPending}
                  className="gap-1"
                >
                  <Save className="h-4 w-4" />
                  {isPending ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(true)}
                className="gap-1"
              >
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-3 mt-4">
            <div>
              <Label className="text-xs text-muted-foreground">SEO Title</Label>
              <Input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="SEO title for category page..."
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Meta Description
              </Label>
              <Input
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                placeholder="Meta description (120-155 chars)..."
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Intro Paragraph
              </Label>
              <Textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                placeholder="Intro paragraph for the category landing page..."
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1 text-sm text-muted-foreground">
            {category.seo_title && (
              <p>
                <span className="text-xs uppercase tracking-wider">SEO:</span>{' '}
                {category.seo_title}
              </p>
            )}
            {category.meta_description && (
              <p className="line-clamp-1">{category.meta_description}</p>
            )}
            {!category.seo_title && !category.meta_description && (
              <p className="italic">No SEO metadata -- click Edit to add</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
