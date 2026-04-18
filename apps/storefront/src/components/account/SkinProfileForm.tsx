'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Alert } from '@/components/ui/Alert'
import { extractApiError, NETWORK_MESSAGE } from '@/lib/api/client'
import { SKIN_TYPE_OPTIONS, CONCERN_OPTIONS } from '@/lib/api/schemas/profile'
import type { SkinType, Concern } from '@/types'

type EditableSkinType = Exclude<SkinType, 'all'> | null

interface SkinProfileFormProps {
  skinType: EditableSkinType
  concerns: Concern[]
}

const SKIN_TYPE_LABEL: Record<Exclude<SkinType, 'all'>, string> = {
  dry: 'Dry',
  oily: 'Oily',
  combination: 'Combination',
  sensitive: 'Sensitive',
}

const CONCERN_LABEL: Record<Concern, string> = {
  acne:     'Acne',
  dullness: 'Dullness',
  aging:    'Aging',
  pores:    'Pores',
  redness:  'Redness',
}

function formatConcerns(list: Concern[]): string {
  if (list.length === 0) return 'None noted'
  return list.map((c) => CONCERN_LABEL[c]).join(' · ')
}

export function SkinProfileForm({ skinType, concerns }: SkinProfileFormProps) {
  const router = useRouter()
  const [editing, setEditing]             = useState(false)
  const [draftSkinType, setDraftSkinType] = useState<EditableSkinType>(skinType)
  const [draftConcerns, setDraftConcerns] = useState<Concern[]>(concerns)
  const [error, setError]                 = useState<string | null>(null)
  const [saving, setSaving]               = useState(false)

  function toggleConcern(c: Concern) {
    setDraftConcerns((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    )
  }

  async function handleSave() {
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/account/profile', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ skin_type: draftSkinType, concerns: draftConcerns }),
      })
      if (!res.ok) {
        setError(await extractApiError(res, 'Could not save changes.'))
        return
      }
      setEditing(false)
      router.refresh()
    } catch {
      setError(NETWORK_MESSAGE)
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setDraftSkinType(skinType)
    setDraftConcerns(concerns)
    setError(null)
    setEditing(false)
  }

  return (
    <section
      aria-labelledby="skin-profile-heading"
      data-testid="skin-profile"
      className="mt-16"
    >
      <div className="flex items-baseline justify-between mb-2">
        <p className="font-mono text-[10px] tracking-ultra uppercase text-graphite">
          § 02 — Skin profile
        </p>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            data-testid="skin-profile-edit"
            className="font-mono text-[10px] tracking-widest uppercase text-graphite hover:text-ink border-b border-hairline hover:border-ink pb-0.5 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
          >
            Edit →
          </button>
        )}
      </div>
      <h2
        id="skin-profile-heading"
        className="font-display text-[clamp(24px,2.6vw,36px)] text-ink mb-6"
      >
        Subject profile.
      </h2>

      {!editing ? (
        <div data-testid="skin-profile-view" className="border-t border-hairline">
          <div className="grid grid-cols-[200px_1fr_auto] gap-5 py-4 border-b border-hairline/60 items-center">
            <span className="font-mono text-[10px] tracking-widest uppercase text-graphite">
              Skin type
            </span>
            <span
              className="font-body text-[13px] text-ink"
              data-testid="skin-type-value"
            >
              {skinType ? SKIN_TYPE_LABEL[skinType] : 'Not set'}
            </span>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="font-mono text-[10px] tracking-widest uppercase text-graphite hover:text-ink border-b border-hairline hover:border-ink pb-0.5 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-[200px_1fr_auto] gap-5 py-4 border-b border-hairline/60 items-center">
            <span className="font-mono text-[10px] tracking-widest uppercase text-graphite">
              Primary concerns
            </span>
            <div className="flex flex-wrap gap-1.5">
              {concerns.length === 0 ? (
                <span
                  data-testid="concerns-value"
                  className="font-body text-[13px] text-graphite"
                >
                  {formatConcerns(concerns)}
                </span>
              ) : (
                <span data-testid="concerns-value" className="flex flex-wrap gap-1.5">
                  {concerns.map((c) => (
                    <span
                      key={c}
                      className="font-mono text-[10px] tracking-widest uppercase text-graphite border border-hairline px-2 py-1"
                    >
                      {CONCERN_LABEL[c]}
                    </span>
                  ))}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="font-mono text-[10px] tracking-widest uppercase text-graphite hover:text-ink border-b border-hairline hover:border-ink pb-0.5 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
            >
              Edit
            </button>
          </div>
        </div>
      ) : (
        <div data-testid="skin-profile-editor" className="border-t border-hairline pt-5">
          {error && (
            <div className="mb-4" data-testid="skin-profile-error">
              <Alert variant="error" message={error} />
            </div>
          )}

          <fieldset className="mb-5">
            <legend className="font-mono text-[10px] tracking-widest uppercase text-graphite mb-2.5">
              Skin type
            </legend>
            <div className="flex flex-wrap gap-2">
              {SKIN_TYPE_OPTIONS.map((opt) => {
                const selected = draftSkinType === opt
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setDraftSkinType(selected ? null : opt)}
                    data-testid={`skin-type-${opt}`}
                    aria-pressed={selected}
                    className={[
                      'font-mono text-[10px] tracking-widest uppercase px-3 py-2 border transition-colors',
                      'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2',
                      selected
                        ? 'bg-ink text-paper border-ink'
                        : 'border-hairline text-ink hover:border-ink',
                    ].join(' ')}
                  >
                    {SKIN_TYPE_LABEL[opt]}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <fieldset className="mb-5">
            <legend className="font-mono text-[10px] tracking-widest uppercase text-graphite mb-2.5">
              Concerns
            </legend>
            <div className="flex flex-wrap gap-2">
              {CONCERN_OPTIONS.map((opt) => {
                const selected = draftConcerns.includes(opt)
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => toggleConcern(opt)}
                    data-testid={`concern-${opt}`}
                    aria-pressed={selected}
                    className={[
                      'font-mono text-[10px] tracking-widest uppercase px-3 py-2 border transition-colors',
                      'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2',
                      selected
                        ? 'bg-ink text-paper border-ink'
                        : 'border-hairline text-ink hover:border-ink',
                    ].join(' ')}
                  >
                    {CONCERN_LABEL[opt]}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              data-testid="skin-profile-save"
              className="inline-flex items-center justify-center font-mono text-[11px] tracking-ultra uppercase px-5 py-3 bg-ink text-paper hover:bg-ink-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              data-testid="skin-profile-cancel"
              className="inline-flex items-center justify-center font-mono text-[11px] tracking-widest uppercase px-5 py-3 border border-hairline text-ink hover:border-ink disabled:opacity-60 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
