import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SupportForm, type SupportFormOrder } from '@/components/shop/SupportForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:       'Contact support · matter',
  description: 'Queries on formulas, dispatch status, or account — dispatch them here.',
}

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']

function formatToday(): string {
  const d = new Date()
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export default async function SupportNewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let orders: SupportFormOrder[] = []
  if (user) {
    const { data } = await supabase
      .from('orders')
      .select('id, order_number')
      .order('created_at', { ascending: false })
      .limit(50)

    orders = (data ?? []) as SupportFormOrder[]
  }

  return (
    <>
      {/* ── Broadsheet masthead ─────────────────────────────────────────── */}
      <header
        data-testid="support-masthead"
        className="bg-paper border-b-[3px] border-double border-ink"
      >
        <div className="max-w-container mx-auto px-8 md:px-12 pt-7 pb-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 font-mono text-2xs tracking-ultra uppercase">
            <span className="text-graphite justify-self-start">
              Vol. I · No. 01
            </span>
            <span className="text-ink text-xs tracking-[0.3em] whitespace-nowrap">
              Support · File a note
            </span>
            <span className="text-graphite justify-self-end whitespace-nowrap">
              Resp. under 24h · {formatToday()}
            </span>
          </div>
        </div>
      </header>

      {/* ── Editorial hero ──────────────────────────────────────────────── */}
      <section
        aria-labelledby="support-heading"
        data-testid="support-hero"
        className="bg-paper border-b border-hairline"
      >
        <div className="max-w-container mx-auto px-8 py-20 text-center">
          <p
            data-testid="support-eyebrow"
            className="inline-block font-mono text-2xs tracking-ultra uppercase text-graphite"
          >
            § Correspondence — Incoming
          </p>
          <h1
            id="support-heading"
            data-testid="support-title"
            className="font-display font-normal text-[clamp(48px,6vw,96px)] leading-[0.96] tracking-tightest mt-5 max-w-[14ch] mx-auto"
          >
            How can we <em className="italic">help</em>?
          </h1>
          <p className="font-body text-[15px] leading-[1.6] text-ink-2 max-w-[520px] mx-auto mt-6">
            Queries on formulas, dispatch status, or account — dispatch them
            here. We reply within 24 hours, weekdays.
          </p>
        </div>
      </section>

      {/* ── Form ─────────────────────────────────────────────────────────── */}
      <section
        aria-label="Support form"
        className="bg-paper border-b border-hairline"
      >
        <div className="max-w-[640px] mx-auto px-8 py-14">
          <SupportForm userEmail={user?.email ?? null} orders={orders} />
        </div>
      </section>
    </>
  )
}
