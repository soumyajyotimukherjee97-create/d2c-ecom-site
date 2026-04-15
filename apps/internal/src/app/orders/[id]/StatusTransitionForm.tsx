'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { VALID_TRANSITIONS, type OrderStatus } from '@/lib/api/schemas/orders'
import { updateOrderStatusAction } from '../actions'

interface Props {
  orderId:           string
  currentStatus:     OrderStatus
  currentTrackingId: string
  currentCarrier:    string
  currentNotes:      string
}

export function StatusTransitionForm({
  orderId,
  currentStatus,
  currentTrackingId,
  currentCarrier,
  currentNotes,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)

  const allowed = VALID_TRANSITIONS[currentStatus]

  const [targetStatus, setTargetStatus] = useState<OrderStatus | ''>(
    allowed[0] ?? '',
  )
  const [trackingId,   setTrackingId]   = useState(currentTrackingId)
  const [carrier,      setCarrier]      = useState(currentCarrier)
  const [notes,        setNotes]        = useState(currentNotes)

  const isTerminal = allowed.length === 0
  const shippingRequired = targetStatus === 'shipped'

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError(null)
    setSuccess(false)

    if (!targetStatus) {
      setApiError('Pick a target status.')
      return
    }

    if (shippingRequired && (!trackingId.trim() || !carrier.trim())) {
      setApiError('Tracking ID and carrier are required when shipping.')
      return
    }

    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, {
        status:      targetStatus,
        tracking_id: trackingId.trim() || undefined,
        carrier:     carrier.trim()    || undefined,
        notes:       notes.trim()      || undefined,
      })
      if (!result.ok) {
        setApiError(result.message)
        return
      }
      setSuccess(true)
      router.refresh()
    })
  }

  if (isTerminal) {
    return (
      <p
        className="font-body text-sm text-gray-600"
        data-testid="status-terminal"
      >
        This order is in terminal state <span className="font-mono text-2xs uppercase tracking-wider">{currentStatus}</span>. No further transitions.
      </p>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      data-testid="status-transition-form"
      className="flex flex-col gap-4"
    >
      {apiError && (
        <p role="alert" data-testid="status-error" className="border border-error rounded-sm px-3 py-2 font-body text-sm text-error">
          {apiError}
        </p>
      )}
      {success && !apiError && (
        <p role="status" data-testid="status-success" className="border border-mist-border bg-mist text-mist-text rounded-sm px-3 py-2 font-body text-sm">
          Order updated.
        </p>
      )}

      <label className="flex flex-col gap-1">
        <span className="font-body text-sm font-medium text-gray-900">Next status</span>
        <select
          value={targetStatus}
          onChange={(e) => setTargetStatus(e.target.value as OrderStatus)}
          data-testid="status-target"
          className={inputCls()}
        >
          {allowed.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
        <span className="font-mono text-2xs uppercase tracking-wider text-gray-400">
          From <span className="capitalize">{currentStatus}</span> · allowed: {allowed.join(', ')}
        </span>
      </label>

      {(shippingRequired || currentStatus === 'shipped') && (
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm font-medium text-gray-900">
              Carrier {shippingRequired && '*'}
            </span>
            <input
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="e.g. Bluedart"
              data-testid="status-carrier"
              className={inputCls()}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm font-medium text-gray-900">
              Tracking ID {shippingRequired && '*'}
            </span>
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g. 1Z999AA10123456784"
              data-testid="status-tracking"
              className={inputCls()}
            />
          </label>
        </div>
      )}

      <label className="flex flex-col gap-1">
        <span className="font-body text-sm font-medium text-gray-900">Internal notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Not visible to the customer."
          data-testid="status-notes"
          className={`${inputCls()} resize-y`}
        />
      </label>

      <div>
        <button
          type="submit"
          disabled={isPending}
          data-testid="status-submit"
          className="bg-gray-900 text-white font-mono text-2xs uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
        >
          {isPending ? 'Saving…' : `Move to ${targetStatus || '—'}`}
        </button>
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
