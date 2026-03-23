import { createAdminClient } from '@/lib/supabase/admin'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { CategoryEditor } from '@/components/dashboard/category-editor'

type Category = {
  id: string
  slug: string
  name: string
  seo_title: string | null
  meta_description: string | null
  intro: string | null
  post_count: number
}

export default async function CategoriesPage() {
  const supabase = createAdminClient()
  const { data: categories } = await (supabase as any)
    .from('blog_categories')
    .select('*')
    .order('post_count', { ascending: false })

  const cats: Category[] = categories ?? []

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Categories">
        <p className="text-sm text-muted-foreground">{cats.length} categories</p>
      </PageHeader>

      {cats.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">
              No categories yet. Run the content engine to create your first one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cats.map((cat) => (
            <CategoryEditor key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </div>
  )
}
