import { MDXRemote } from 'next-mdx-remote/rsc'

interface Props {
  source: string
}

export function MDXContent({ source }: Props) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none
      prose-headings:font-extrabold prose-headings:tracking-tight
      prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
      prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
      prose-pre:bg-muted prose-pre:border prose-pre:border-border
      prose-img:rounded-xl prose-img:shadow-md">
      <MDXRemote source={source} />
    </div>
  )
}
