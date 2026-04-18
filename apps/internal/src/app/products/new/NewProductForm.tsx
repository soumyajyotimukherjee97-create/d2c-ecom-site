'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CreateProductSchema,
  type CreateProductInput,
  CategoryEnum,
  SkinTypeEnum,
  ConcernEnum,
} from '@/lib/api/schemas/products'
import { createProductAction } from '../actions'

type FormValues = z.input<typeof CreateProductSchema>

const CATEGORIES  = CategoryEnum.options
const SKIN_TYPES  = SkinTypeEnum.options
const CONCERNS    = ConcernEnum.options

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100)
}

export function NewProductForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      name:        '',
      slug:        '',
      description: '',
      category:    'serum',
      skin_types:  [],
      concerns:    [],
      image_url:   '',
      variants:    [{ size_ml: 30, price: 0, sku: '', stock: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' })

  // Auto-suggest slug from name on blur. Guards to avoid racing users who
  // tab straight from name into slug: (1) skip when the user is focusing
  // INTO the slug input (`relatedTarget`), (2) skip when the slug is non-
  // empty so we never clobber a typed/pasted value.
  const name      = watch('name')
  const slugDraft = watch('slug')
  function onNameBlur(e: React.FocusEvent<HTMLInputElement>) {
    const next = e.relatedTarget as HTMLElement | null
    if (next?.getAttribute('data-testid') === 'product-slug') return
    if (!slugDraft && name) setValue('slug', slugify(name), { shouldValidate: true })
  }

  function onSubmit(raw: FormValues) {
    setApiError(null)
    const payload: CreateProductInput = {
      name:        raw.name,
      slug:        raw.slug,
      category:    raw.category,
      skin_types:  raw.skin_types,
      concerns:    raw.concerns ?? [],
      variants:    raw.variants.map((v) => ({ ...v, stock: v.stock ?? 0 })),
      description: raw.description?.trim() ? raw.description : null,
      image_url:   raw.image_url?.trim()   ? raw.image_url   : null,
    }

    startTransition(async () => {
      const result = await createProductAction(payload)
      if (!result.ok) {
        setApiError(result.message)
        return
      }
      router.push(`/products/${result.data.id}/edit?created=1`)
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      data-testid="new-product-form"
      className="flex flex-col gap-6"
    >
      {apiError && (
        <p role="alert" data-testid="new-product-error" className="border border-error rounded-sm px-3 py-2 font-body text-sm text-error">
          {apiError}
        </p>
      )}

      <Field label="Name *" error={errors.name?.message}>
        <input
          type="text"
          data-testid="product-name"
          className={inputCls(errors.name)}
          {...register('name', { onBlur: onNameBlur })}
        />
      </Field>

      <Field label="Slug *" hint="Lowercase letters, numbers, hyphens" error={errors.slug?.message}>
        <input
          type="text"
          data-testid="product-slug"
          className={inputCls(errors.slug)}
          {...register('slug')}
        />
      </Field>

      <Field label="Description" error={errors.description?.message}>
        <textarea
          rows={4}
          data-testid="product-description"
          className={inputCls(errors.description) + ' resize-y'}
          {...register('description')}
        />
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

      <Field label="Image URL" hint="Full https:// URL from Supabase Storage" error={errors.image_url?.message}>
        <input
          type="url"
          data-testid="product-image-url"
          className={inputCls(errors.image_url)}
          {...register('image_url')}
        />
      </Field>

      {/* Variants */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-heading text-xl text-gray-900">Variants</h2>
            <p className="font-mono text-2xs uppercase tracking-wider text-gray-400">
              At least one required · price in paise (₹1 = 100 paise)
            </p>
          </div>
          <button
            type="button"
            onClick={() => append({ size_ml: 30, price: 0, sku: '', stock: 0 })}
            data-testid="add-variant"
            className="border border-gray-200 rounded-sm px-3 py-2 font-mono text-2xs uppercase tracking-wider text-gray-900 hover:border-gray-900 transition-colors"
          >
            Add variant
          </button>
        </div>

        {errors.variants && 'message' in errors.variants && (
          <p role="alert" className="font-body text-sm text-error mb-2">
            {errors.variants.message as string}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="grid grid-cols-12 gap-3 items-end border border-gray-200 rounded-sm p-3 bg-white"
              data-testid={`variant-row-${idx}`}
            >
              <Sub label={`Size (ml)`} error={errors.variants?.[idx]?.size_ml?.message} className="col-span-2">
                <input
                  type="number"
                  min={1}
                  step={1}
                  className={inputCls(errors.variants?.[idx]?.size_ml)}
                  {...register(`variants.${idx}.size_ml`, { valueAsNumber: true })}
                />
              </Sub>
              <Sub label={`Price (paise)`} error={errors.variants?.[idx]?.price?.message} className="col-span-3">
                <input
                  type="number"
                  min={1}
                  step={1}
                  className={inputCls(errors.variants?.[idx]?.price)}
                  {...register(`variants.${idx}.price`, { valueAsNumber: true })}
                />
              </Sub>
              <Sub label={`SKU`} error={errors.variants?.[idx]?.sku?.message} className="col-span-4">
                <input
                  type="text"
                  className={inputCls(errors.variants?.[idx]?.sku)}
                  {...register(`variants.${idx}.sku`)}
                />
              </Sub>
              <Sub label={`Stock`} error={errors.variants?.[idx]?.stock?.message} className="col-span-2">
                <input
                  type="number"
                  min={0}
                  step={1}
                  className={inputCls(errors.variants?.[idx]?.stock)}
                  {...register(`variants.${idx}.stock`, { valueAsNumber: true })}
                />
              </Sub>
              <div className="col-span-1 flex justify-end">
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    aria-label={`Remove variant ${idx + 1}`}
                    className="font-mono text-2xs uppercase tracking-wider text-error hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isPending}
          data-testid="new-product-submit"
          className="bg-gray-900 text-white font-mono text-2xs uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
        >
          {isPending ? 'Creating…' : 'Create product'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, hint, error, children }: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-body text-sm font-medium text-gray-900">{label}</span>
      {hint && <span className="font-mono text-2xs uppercase tracking-wider text-gray-400">{hint}</span>}
      {children}
      {error && <span role="alert" className="font-body text-sm text-error">{error}</span>}
    </label>
  )
}

function Sub({ label, error, className = '', children }: {
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="font-mono text-2xs uppercase tracking-wider text-gray-600">{label}</span>
      {children}
      {error && <span role="alert" className="font-body text-sm text-error">{error}</span>}
    </label>
  )
}

function inputCls(error: unknown) {
  return [
    'w-full border rounded-sm px-3 py-2 font-body text-base text-gray-900 bg-white',
    'placeholder:text-gray-400 transition-colors',
    'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-1',
    error ? 'border-error' : 'border-gray-200 hover:border-gray-400',
  ].join(' ')
}
