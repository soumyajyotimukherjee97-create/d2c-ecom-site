import { SkeletonCard } from '@/components/ui'

export default function HomeLoading() {
  return (
    <div className="max-w-container mx-auto px-8 py-20">
      {/* Hero skeleton: display headline band + specimen */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-20">
        <div className="md:col-span-8 animate-pulse">
          <div className="h-16 w-4/5 bg-hairline/40 mb-4" />
          <div className="h-16 w-2/3 bg-hairline/40 mb-6" />
          <div className="h-4 w-2/3 bg-hairline/40 mb-2" />
          <div className="h-4 w-1/2 bg-hairline/40" />
          <div className="flex gap-2.5 mt-9">
            <div className="h-12 w-44 bg-hairline/40" />
            <div className="h-12 w-36 bg-hairline/40" />
          </div>
        </div>
        <div className="md:col-span-4">
          <div className="m-ph aspect-[3/4]" aria-hidden="true" />
        </div>
      </div>

      {/* Featured 3-up */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
