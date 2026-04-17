'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
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
  acne: 'Acne',
  dullness: 'Dullness',
  aging: 'Aging',
  pores: 'Pores',
  redness: 'Redness',
}

function formatConcerns(list: Concern[]) {
  if (list.length === 0) return 'None noted'
  return list.map((c) => CONCERN_LABEL[c]).join(' · ')
}

export function SkinProfileForm({ skinType, concerns }: SkinProfileFormProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [draftSkinType, setDraftSkinType] = useState<EditableSkinType>(skinType)
  const [draftConcerns, setDraftConcerns] = useState<Concern[]>(concerns)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skin_type: draftSkinType, concerns: draftConcerns }),
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
    <section aria-labelledby="skin-profile-heading" data-testid="skin-profile">
      <div className="flex items-baseline justify-between mb-3">
        <h2 id="skin-profile-heading" className="font-heading text-base text-gray-900">
          Skin profile
        </h2>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            data-testid="skin-profile-edit"
            className="font-mono text-2xs uppercase tracking-wider text-gray-400 hover:text-gray-900 transition-colors rounded-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
          >
            Edit →
          </button>
        )}
      </div>

      {!editing ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-gray-100 rounded-sm p-3">
            <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-1">
              Skin type
            </p>
            <p className="font-body text-sm text-gray-900" data-testid="skin-type-value">
              {skinType ? SKIN_TYPE_LABEL[skinType] : 'Not set'}
            </p>
          </div>
          <div className="border border-gray-100 rounded-sm p-3">
            <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-1">
              Concerns
            </p>
            <p className="font-body text-sm text-gray-900" data-testid="concerns-value">
              {formatConcerns(concerns)}
            </p>
          </div>
        </div>
      ) : (
        <div data-testid="skin-profile-editor">
          {error && (
            <div className="mb-4" data-testid="skin-profile-error">
              <Alert variant="error" message={error} />
            </div>
          )}

          <fieldset className="mb-4">
            <legend className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-2">
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
                      'font-body text-sm px-3 py-1 rounded-sm border transition-colors',
                      'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2',
                      selected
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-gray-200 text-gray-900 hover:border-gray-900',
                    ].join(' ')}
                  >
                    {SKIN_TYPE_LABEL[opt]}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <fieldset className="mb-4">
            <legend className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-2">
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
                      'font-body text-sm px-3 py-1 rounded-sm border transition-colors',
                      'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2',
                      selected
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-gray-200 text-gray-900 hover:border-gray-900',
                    ].join(' ')}
                  >
                    {CONCERN_LABEL[opt]}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              loading={saving}
              disabled={saving}
              onClick={handleSave}
              data-testid="skin-profile-save"
            >
              Save changes
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={saving}
              data-testid="skin-profile-cancel"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
