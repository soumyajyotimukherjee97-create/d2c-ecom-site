'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleProductActiveAction } from './actions'

interface Props {
  productId: string
  isActive:  boolean
  slug:      string
}

export function ToggleActiveButton({ productId, isActive, slug }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function onClick() {
    const confirmMsg = isActive
      ? 'Deactivate this product? It will be hidden from the storefront.'
      : 'Reactivate this product?'
    if (!window.confirm(confirmMsg)) return

    startTransition(async () => {
      const result = await toggleProductActiveAction(productId, !isActive)
      if (!result.ok) {
        window.alert(result.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      data-testid={`product-toggle-${slug}`}
      className="font-mono text-2xs uppercase tracking-wider text-gray-900 underline hover:no-underline disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isPending ? '…' : isActive ? 'Deactivate' : 'Activate'}
    </button>
  )
}
