import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SupportForm, type SupportFormOrder } from '@/components/shop/SupportForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contact support',
  description: 'Get help with an order, a product, or your account.',
}

export default async function SupportNewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let orders: SupportFormOrder[] = []
  if (user) {
    // RLS naturally scopes to the logged-in user. Newest first for the dropdown.
    const { data } = await supabase
      .from('orders')
      .select('id, order_number')
      .order('created_at', { ascending: false })
      .limit(50)

    orders = (data ?? []) as SupportFormOrder[]
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h1 className="font-heading text-3xl text-gray-900 mb-2">Contact support</h1>
      <p className="font-body text-sm text-gray-600 mb-8">
        We typically respond within 1 business day.
      </p>

      <SupportForm userEmail={user?.email ?? null} orders={orders} />
    </div>
  )
}
