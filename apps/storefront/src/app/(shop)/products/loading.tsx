import { SkeletonCard } from '@/components/ui'

export default function PLPLoading() {
  return (
    <>
      {/* Filter bar skeleton */}
      <div className="bg-paper border-b border-hairline">
        <div className="max-w-container mx-auto px-8 py-5 animate-pulse">
          <div className="flex flex-wrap items-center gap-6">
            <div className="h-3 w-20 bg-hairline/40" />
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 w-20 bg-hairline/40" />
              ))}
            </div>
            <div className="flex-1" />
            <div className="h-8 w-36 bg-hairline/40" />
          </div>
        </div>
      </div>

      {/* Grid on paper-2 */}
      <section className="bg-paper-2 border-b border-hairline">
        <div className="max-w-container mx-auto px-8 pt-14 pb-24">
          <div className="flex items-baseline gap-3 mb-8 animate-pulse">
            <div className="h-10 w-52 bg-hairline/40" />
            <div className="h-4 w-10 bg-hairline/40" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
