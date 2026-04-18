import { SkeletonCard } from '@/components/ui'

export default function PDPLoading() {
  return (
    <>
      {/* Breadcrumb skeleton */}
      <div className="bg-paper border-b border-hairline">
        <div className="max-w-container mx-auto px-8 py-5 animate-pulse">
          <div className="h-3 w-60 bg-hairline/40" />
        </div>
      </div>

      {/* Main: gallery + panel */}
      <section className="bg-paper border-b border-hairline">
        <div className="max-w-container mx-auto px-8 pt-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
            {/* Gallery */}
            <div>
              <div className="m-ph m-ph--mineral aspect-square" aria-hidden="true" />
              <div className="grid grid-cols-4 gap-3 mt-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="m-ph aspect-square" aria-hidden="true" />
                ))}
              </div>
            </div>

            {/* Purchase panel */}
            <div className="md:border-l md:border-hairline md:pl-12 animate-pulse">
              <div className="h-3 w-20 bg-hairline/40 mb-4" />
              <div className="h-12 w-3/4 bg-hairline/40 mb-6" />
              <div className="h-8 w-32 bg-hairline/40 mb-8" />
              <div className="h-3 w-12 bg-hairline/40 mb-3" />
              <div className="flex gap-2 mb-8">
                <div className="h-10 w-20 bg-hairline/40" />
                <div className="h-10 w-20 bg-hairline/40" />
              </div>
              <div className="h-3 w-20 bg-hairline/40 mb-3" />
              <div className="flex gap-2 mb-8">
                <div className="h-8 w-16 bg-hairline/40" />
                <div className="h-8 w-20 bg-hairline/40" />
                <div className="h-8 w-20 bg-hairline/40" />
              </div>
              <div className="grid grid-cols-[130px_1fr] gap-2.5">
                <div className="h-12 bg-hairline/40" />
                <div className="h-12 bg-hairline/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related 4-up */}
      <section className="bg-paper border-b border-hairline">
        <div className="max-w-container mx-auto px-8 pt-18 pb-24">
          <div className="h-3 w-40 bg-hairline/40 mb-3 animate-pulse" />
          <div className="h-10 w-80 bg-hairline/40 mb-10 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </section>
    </>
  )
}
