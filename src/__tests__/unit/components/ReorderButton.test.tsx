import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReorderButton } from '@/components/account/ReorderButton'
import { useCartStore, type CartItem } from '@/lib/store/cart'

const item: CartItem = {
  variantId:   'v1',
  productId:   'p1',
  sku:         'BS-30',
  productName: 'Brightening Serum',
  slug:        'brightening-serum',
  size_ml:     30,
  price:       129900,
  quantity:    2,
  imageUrl:    null,
}

beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false })
  localStorage.clear()
})

describe('ReorderButton', () => {
  it('adds the items to the cart and opens the drawer', async () => {
    const user = userEvent.setup()
    render(<ReorderButton items={[item]} />)
    await user.click(screen.getByTestId('reorder-button'))

    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0]).toMatchObject({ variantId: 'v1', quantity: 2 })
    expect(state.isOpen).toBe(true)
  })

  it('merges quantity when the variant is already in the cart', async () => {
    useCartStore.setState({
      items: [{ ...item, quantity: 1 }],
      isOpen: false,
    })

    const user = userEvent.setup()
    render(<ReorderButton items={[{ ...item, quantity: 3 }]} />)
    await user.click(screen.getByTestId('reorder-button'))

    expect(useCartStore.getState().items[0]!.quantity).toBe(4)
  })

  it('is disabled when the items list is empty', () => {
    render(<ReorderButton items={[]} />)
    expect(screen.getByTestId('reorder-button')).toBeDisabled()
  })
})
