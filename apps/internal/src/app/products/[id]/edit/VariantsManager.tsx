'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Th, Td } from '@/components/ui/Table'
import { addVariantAction, updateVariantAction } from '../../actions'

export interface VariantRow {
  id:        string
  size_ml:   number
  price:     number
  sku:       string
  stock:     number
  is_active: boolean
}

interface Props {
  productId: string
  variants:  VariantRow[]
}

export function VariantsManager({ productId, variants }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <VariantsList productId={productId} variants={variants} />
      <AddVariantForm productId={productId} />
    </div>
  )
}

function VariantsList({ productId, variants }: Props) {
  if (variants.length === 0) {
    return (
      <div className="border border-gray-200 rounded-sm bg-white p-6 text-center" data-testid="variants-empty">
        <p className="font-body text-sm text-gray-600">No variants yet. Add one below.</p>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-sm bg-white overflow-hidden" data-testid="variants-list">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <Th>Size</Th>
            <Th>SKU</Th>
            <Th>Price (paise)</Th>
            <Th>Stock</Th>
            <Th>Status</Th>
            <Th className="text-right pr-4">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <VariantRowForm key={v.id} productId={productId} variant={v} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function VariantRowForm({ productId, variant }: { productId: string; variant: VariantRow }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [price, setPrice] = useState(variant.price)
  const [stock, setStock] = useState(variant.stock)

  const dirty = price !== variant.price || stock !== variant.stock

  function save() {
    setError(null)
    startTransition(async () => {
      const result = await updateVariantAction(productId, variant.id, { price, stock })
      if (!result.ok) { setError(result.message); return }
      router.refresh()
    })
  }

  function toggleActive() {
    setError(null)
    startTransition(async () => {
      const result = await updateVariantAction(productId, variant.id, { is_active: !variant.is_active })
      if (!result.ok) { setError(result.message); return }
      router.refresh()
    })
  }

  return (
    <tr className="border-b border-gray-100 last:border-0" data-testid={`variant-row-${variant.sku}`}>
      <Td className="align-middle">{variant.size_ml} ml</Td>
      <Td className="align-middle font-mono text-2xs">{variant.sku}</Td>
      <Td className="align-middle">
        <input
          type="number"
          min={1}
          step={1}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          data-testid={`variant-price-${variant.sku}`}
          className="w-28 border border-gray-200 rounded-sm px-2 py-1 font-body text-sm"
        />
      </Td>
      <Td className="align-middle">
        <input
          type="number"
          min={0}
          step={1}
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          data-testid={`variant-stock-${variant.sku}`}
          className="w-24 border border-gray-200 rounded-sm px-2 py-1 font-body text-sm"
        />
      </Td>
      <Td className="align-middle">
        <span
          className={
            variant.is_active
              ? 'inline-block px-2 py-0.5 rounded-sm bg-mist text-mist-text border border-mist-border font-mono text-2xs uppercase tracking-wider'
              : 'inline-block px-2 py-0.5 rounded-sm bg-gray-100 text-gray-600 border border-gray-200 font-mono text-2xs uppercase tracking-wider'
          }
        >
          {variant.is_active ? 'Active' : 'Inactive'}
        </span>
        {error && <p role="alert" className="font-body text-sm text-error mt-1">{error}</p>}
      </Td>
      <Td className="align-middle text-right pr-4">
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={save}
            disabled={!dirty || isPending}
            data-testid={`variant-save-${variant.sku}`}
            className="font-mono text-2xs uppercase tracking-wider text-gray-900 underline hover:no-underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
          >
            Save
          </button>
          <button
            type="button"
            onClick={toggleActive}
            disabled={isPending}
            data-testid={`variant-toggle-${variant.sku}`}
            className="font-mono text-2xs uppercase tracking-wider text-gray-900 underline hover:no-underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {variant.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </Td>
    </tr>
  )
}

function AddVariantForm({ productId }: { productId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError]   = useState<string | null>(null)

  const [size_ml, setSize] = useState<number>(30)
  const [price,   setPrice] = useState<number>(0)
  const [sku,     setSku]   = useState<string>('')
  const [stock,   setStock] = useState<number>(0)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await addVariantAction(productId, { size_ml, price, sku: sku.trim(), stock })
      if (!result.ok) { setError(result.message); return }
      setSize(30); setPrice(0); setSku(''); setStock(0)
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={onSubmit}
      data-testid="add-variant-form"
      className="border border-gray-200 rounded-sm bg-white p-4"
    >
      <h3 className="font-heading text-lg text-gray-900 mb-3">Add variant</h3>
      {error && <p role="alert" data-testid="add-variant-error" className="border border-error rounded-sm px-3 py-2 font-body text-sm text-error mb-3">{error}</p>}
      <div className="grid grid-cols-12 gap-3 items-end">
        <Sub label="Size (ml)" className="col-span-2">
          <input type="number" min={1} step={1} value={size_ml} onChange={(e) => setSize(Number(e.target.value))} data-testid="add-variant-size" className={inputCls()} />
        </Sub>
        <Sub label="Price (paise)" className="col-span-3">
          <input type="number" min={1} step={1} value={price} onChange={(e) => setPrice(Number(e.target.value))} data-testid="add-variant-price" className={inputCls()} />
        </Sub>
        <Sub label="SKU" className="col-span-4">
          <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} data-testid="add-variant-sku" className={inputCls()} />
        </Sub>
        <Sub label="Stock" className="col-span-2">
          <input type="number" min={0} step={1} value={stock} onChange={(e) => setStock(Number(e.target.value))} data-testid="add-variant-stock" className={inputCls()} />
        </Sub>
        <div className="col-span-1 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            data-testid="add-variant-submit"
            className="bg-gray-900 text-white font-mono text-2xs uppercase tracking-wider px-3 py-2 rounded-sm hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? '…' : 'Add'}
          </button>
        </div>
      </div>
    </form>
  )
}


function Sub({ label, className = '', children }: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="font-mono text-2xs uppercase tracking-wider text-gray-600">{label}</span>
      {children}
    </label>
  )
}

function inputCls() {
  return 'w-full border border-gray-200 rounded-sm px-3 py-2 font-body text-sm bg-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-1'
}
