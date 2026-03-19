'use client'

import { useEffect } from 'react'

export function PrintTrigger() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 500)
    return () => clearTimeout(t)
  }, [])

  return null
}

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors"
    >
      Print / Save PDF
    </button>
  )
}
