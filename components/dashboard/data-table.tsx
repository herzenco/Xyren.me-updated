import { Trash2 } from 'lucide-react'

interface DataTableProps<T> {
  columns: {
    header: string
    accessor: keyof T | ((row: T) => string | number | React.ReactNode)
    render?: (value: unknown, row: T) => React.ReactNode
  }[]
  data: T[]
  onDelete?: (id: string) => Promise<void>
  showDeleteAction?: boolean
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onDelete,
  showDeleteAction = !!onDelete,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No data yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {columns.map((column) => (
                <th
                  key={String(column.header)}
                  className="px-4 py-3 text-left font-medium text-muted-foreground"
                >
                  {column.header}
                </th>
              ))}
              {showDeleteAction && (
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-border hover:bg-secondary/20">
                {columns.map((column) => {
                  let value: unknown
                  if (typeof column.accessor === 'function') {
                    value = column.accessor(row)
                  } else {
                    value = row[column.accessor]
                  }

                  return (
                    <td
                      key={String(column.header)}
                      className="px-4 py-3 text-foreground"
                    >
                      {column.render ? column.render(value, row) : String(value)}
                    </td>
                  )
                })}
                {showDeleteAction && (
                  <td className="px-4 py-3 text-right">
                    <form
                      action={onDelete!.bind(null, row.id)}
                      className="inline"
                    >
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </form>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
