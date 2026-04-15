'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  TicketStatusEnum,
  TicketPriorityEnum,
  type TicketStatus,
  type TicketPriority,
} from '@/lib/api/schemas/support'
import { updateTicketAction, assignToMeAction, unassignAction } from '../actions'

const STATUSES   = TicketStatusEnum.options
const PRIORITIES = TicketPriorityEnum.options
const NOTES_MAX  = 5000

interface Props {
  ticketId:        string
  currentStatus:   TicketStatus
  currentPriority: TicketPriority
  currentNotes:    string
  assignedToMe:    boolean
  assignedTo:      string | null
}

export function TicketUpdateForm({
  ticketId,
  currentStatus,
  currentPriority,
  currentNotes,
  assignedToMe,
  assignedTo,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)

  const [status,   setStatus]   = useState<TicketStatus>(currentStatus)
  const [priority, setPriority] = useState<TicketPriority>(currentPriority)
  const [notes,    setNotes]    = useState(currentNotes)

  const dirty =
    status   !== currentStatus   ||
    priority !== currentPriority ||
    notes    !== currentNotes

  function onSave(e: React.FormEvent) {
    e.preventDefault()
    setApiError(null); setSuccess(false)

    startTransition(async () => {
      const result = await updateTicketAction(ticketId, {
        status,
        priority,
        notes: notes.trim() ? notes : null,
      })
      if (!result.ok) { setApiError(result.message); return }
      setSuccess(true)
      router.refresh()
    })
  }

  function onAssign() {
    setApiError(null); setSuccess(false)
    startTransition(async () => {
      const result = await assignToMeAction(ticketId)
      if (!result.ok) { setApiError(result.message); return }
      router.refresh()
    })
  }

  function onUnassign() {
    setApiError(null); setSuccess(false)
    startTransition(async () => {
      const result = await unassignAction(ticketId)
      if (!result.ok) { setApiError(result.message); return }
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={onSave}
      data-testid="ticket-update-form"
      className="flex flex-col gap-4"
    >
      {apiError && (
        <p role="alert" data-testid="ticket-error" className="border border-error rounded-sm px-3 py-2 font-body text-sm text-error">
          {apiError}
        </p>
      )}
      {success && !apiError && (
        <p role="status" data-testid="ticket-success" className="border border-mist-border bg-mist text-mist-text rounded-sm px-3 py-2 font-body text-sm">
          Ticket updated.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-body text-sm font-medium text-gray-900">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TicketStatus)}
            data-testid="ticket-status-select"
            className={inputCls()}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-body text-sm font-medium text-gray-900">Priority</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TicketPriority)}
            data-testid="ticket-priority-select"
            className={inputCls()}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p} className="capitalize">{p}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="font-body text-sm font-medium text-gray-900">
          Internal notes
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, NOTES_MAX))}
          rows={4}
          placeholder="Not visible to the customer."
          data-testid="ticket-notes"
          className={`${inputCls()} resize-y`}
        />
        <span className="font-mono text-2xs text-gray-400 self-end">
          {notes.length.toLocaleString()} / {NOTES_MAX.toLocaleString()}
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isPending || !dirty}
          data-testid="ticket-save"
          className="bg-gray-900 text-white font-mono text-2xs uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>

        {assignedToMe ? (
          <button
            type="button"
            onClick={onUnassign}
            disabled={isPending}
            data-testid="ticket-unassign"
            className="border border-gray-200 rounded-sm px-4 py-3 font-mono text-2xs uppercase tracking-wider text-gray-900 hover:border-gray-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Unassign
          </button>
        ) : (
          <button
            type="button"
            onClick={onAssign}
            disabled={isPending}
            data-testid="ticket-assign-me"
            className="border border-gray-200 rounded-sm px-4 py-3 font-mono text-2xs uppercase tracking-wider text-gray-900 hover:border-gray-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {assignedTo ? 'Reassign to me' : 'Assign to me'}
          </button>
        )}
      </div>
    </form>
  )
}

function inputCls() {
  return [
    'w-full border border-gray-200 rounded-sm px-3 py-2 font-body text-base text-gray-900 bg-white',
    'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-1',
  ].join(' ')
}
