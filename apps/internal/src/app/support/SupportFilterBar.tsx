'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { TicketStatusEnum, TicketPriorityEnum } from '@/lib/api/schemas/support'

const STATUSES   = TicketStatusEnum.options
const PRIORITIES = TicketPriorityEnum.options

interface Props {
  defaultQ:        string
  defaultStatus:   string
  defaultPriority: string
}

export function SupportFilterBar({ defaultQ, defaultStatus, defaultPriority }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function update(next: Record<string, string | null>) {
    const qs = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === '') qs.delete(k)
      else qs.set(k, v)
    }
    qs.delete('page')
    startTransition(() => {
      router.push(qs.toString() ? `/support?${qs.toString()}` : '/support')
    })
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const q = (data.get('q') as string).trim()
    update({ q: q || null })
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-wrap items-center gap-3 mb-6"
      data-testid="tickets-filterbar"
      aria-busy={isPending}
    >
      <label className="flex-1 min-w-[220px]">
        <span className="sr-only">Search tickets</span>
        <input
          type="search"
          name="q"
          defaultValue={defaultQ}
          placeholder="Search by subject or email"
          data-testid="tickets-search"
          className="w-full border border-gray-200 rounded-sm px-3 py-2 font-body text-sm bg-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-1"
        />
      </label>

      <select
        defaultValue={defaultStatus}
        onChange={(e) => update({ status: e.target.value || null })}
        data-testid="tickets-status"
        className="border border-gray-200 rounded-sm px-3 py-2 font-body text-sm bg-white"
        aria-label="Status filter"
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
        ))}
      </select>

      <select
        defaultValue={defaultPriority}
        onChange={(e) => update({ priority: e.target.value || null })}
        data-testid="tickets-priority"
        className="border border-gray-200 rounded-sm px-3 py-2 font-body text-sm bg-white"
        aria-label="Priority filter"
      >
        <option value="">All priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p} className="capitalize">{p}</option>
        ))}
      </select>

      <button
        type="submit"
        className="border border-gray-200 rounded-sm px-3 py-2 font-mono text-2xs uppercase tracking-wider text-gray-900 hover:border-gray-900 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
      >
        Search
      </button>
    </form>
  )
}
