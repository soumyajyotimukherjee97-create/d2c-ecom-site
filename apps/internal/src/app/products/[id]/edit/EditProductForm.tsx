'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  UpdateProductSchema,
  type UpdateProductInput,
  CategoryEnum,
  SkinTypeEnum,
  ConcernEnum,
} from '@/lib/api/schemas/products'
import { updateProductAction } from '../../actions'

type FormValues = z.input<typeof UpdateProductSchema>

export interface ProductForEdit {
  id:          string
  name:        string
  slug:        string
  description: string | null
  category:    string
  skin_types:  string[]
  concerns:    string[] | null
  image_url:   string | null
  is_active:   boolean
}

const CATEGORIES = CategoryEnum.options
const SKIN_TYPES = SkinTypeEnum.options
const CONCERNS   = ConcernEnum.options

export function EditProductForm({ product }: { product: ProductForEdit }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(UpdateProductSchema),
    defaultValues: {
      name:        product.name,
      description: product.description ?? '',
      category:    product.category as FormValues['category'],
      skin_types:  product.skin_types as FormValues['skin_types'],
      concerns:    (product.concerns ?? []) as FormValues['concerns'],
      image_url:   product.image_url ?? '',
      is_active:   product.is_active,
    },
  })

  function onSubmit(raw: FormValues) {
    setApiError(null)
    setSuccess(false)

    const payload: UpdateProductInput = {
      ...raw,
      description: raw.description?.trim() ? raw.description : null,
      image_url:   raw.image_url?.trim()   ? raw.image_url   : null,
    }

    startTransition(async () => {
      const result = await updateProductAction(product.id, payload)
      if (!result.ok) {
        setApiError(result.message)
        return
      }
      setSuccess(true)
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      data-testid="edit-product-form"
      className="flex flex-col gap-6"
    >
      {apiError && (
        <p role="alert" data-testid="edit-product-error" className="border border-error rounded-sm px-3 py-2 font-body text-sm text-error">
          {apiError}
        </p>
      )}
      {success && !apiError && (
        <p role="status" data-testid="edit-product-success" className="border border-mist-border bg-mist text-mist-text rounded-sm px-3 py-2 font-body text-sm">
          Saved.
        </p>
      )}

      <Field label="Name *" error={errors.name?.message}>
        <input type="text" data-testid="product-name" className={inputCls(errors.name)} {...register('name')} />
      </Field>

      <Field label="Description" error={errors.description?.message}>
        <textarea rows={4} data-testid="product-description" className={inputCls(errors.description) + ' resize-y'} {...register('description')} />
      </Field>

      <Field label="Category *" error={errors.category?.message}>
        <select data-testid="product-category" className={inputCls(errors.category)} {...register('category')}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="capitalize">{c}</option>
          ))}
        </select>
      </Field>

      <Field label="Skin types *" error={errors.skin_types?.message as string | undefined}>
        <div className="flex flex-wrap gap-2" data-testid="product-skin-types">
          {SKIN_TYPES.map((s) => (
            <label key={s} className="border border-gray-200 rounded-sm px-3 py-1.5 flex items-center gap-2 cursor-pointer">
              <input type="checkbox" value={s} {...register('skin_types')} />
              <span className="font-body text-sm capitalize">{s}</span>
            </label>
          ))}
        </div>
      </Field>

      <Field label="Concerns" error={errors.concerns?.message as string | undefined}>
        <div className="flex flex-wrap gap-2" data-testid="product-concerns">
          {CONCERNS.map((c) => (
            <label key={c} className="border border-gray-200 rounded-sm px-3 py-1.5 flex items-center gap-2 cursor-pointer">
              <input type="checkbox" value={c} {...register('concerns')} />
              <span className="font-body text-sm capitalize">{c}</span>
            </label>
          ))}
        </div>
      </Field>

      <Field label="Image URL" error={errors.image_url?.message}>
        <input type="url" data-testid="product-image-url" className={inputCls(errors.image_url)} {...register('image_url')} />
      </Field>

      <label className="flex items-center gap-2">
        <input type="checkbox" data-testid="product-is-active" {...register('is_active')} />
        <span className="font-body text-sm text-gray-900">Active (visible on storefront)</span>
      </label>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isPending || !isDirty}
          data-testid="edit-product-submit"
          className="bg-gray-900 text-white font-mono text-2xs uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-body text-sm font-medium text-gray-900">{label}</span>
      {children}
      {error && <span role="alert" className="font-body text-sm text-error">{error}</span>}
    </label>
  )
}

function inputCls(error: unknown) {
  return [
    'w-full border rounded-sm px-3 py-2 font-body text-base text-gray-900 bg-white',
    'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-1',
    error ? 'border-error' : 'border-gray-200 hover:border-gray-400',
  ].join(' ')
}
