'use client'

interface AddToCartButtonProps {
  productId: string
  productName: string
}

/**
 * Stub until Task 3.1 — will connect to useCartStore().addItem()
 * and trigger CartDrawer open on click.
 */
export function AddToCartButton({ productId, productName }: AddToCartButtonProps) {
  function handleClick() {
    // Task 3.1: useCartStore().addItem(variant, product, 1)
    console.log('Add to cart:', productId)
  }

  return (
    <button
      type="button"
      aria-label={`Add ${productName} to cart`}
      data-testid="add-to-cart-button"
      onClick={handleClick}
      className="w-6 h-6 flex items-center justify-center bg-gray-900 text-white hover:bg-gray-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
    >
      <span aria-hidden="true" className="text-sm leading-none select-none">+</span>
    </button>
  )
}
