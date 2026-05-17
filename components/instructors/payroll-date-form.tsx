'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  defaultFrom: string
  defaultTo: string
}

export function PayrollDateForm({ defaultFrom, defaultTo }: Props) {
  const router = useRouter()
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/instructors?from=${from}&to=${to}`)
  }

  const inputClass = 'border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <form onSubmit={submit} className="flex items-center gap-3">
      <label className="text-sm text-muted-foreground">מ</label>
      <input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className={inputClass}
        dir="ltr"
      />
      <label className="text-sm text-muted-foreground">עד</label>
      <input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className={inputClass}
        dir="ltr"
      />
      <button
        type="submit"
        className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
      >
        חשב
      </button>
    </form>
  )
}
