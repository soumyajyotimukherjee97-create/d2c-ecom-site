import { SkeletonCard } from '@/components/ui'

export default function PDPLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="h-3 w-48 bg-gray-100 rounded-sm mb-6" />

      {/* Two-column layout */}
      <div className="flex gap-8">
        {/* Left — image */}
        <div className="flex-1">
          <div className="w-full aspect-square bg-gray-100 rounded-sm mb-2" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-1 aspect-square bg-gray-100 rounded-sm" />
            ))}
          </div>
        </div>

        {/* Right — purchase panel */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="h-3 w-24 bg-gray-100 rounded-sm" />
          <div className="h-8 w-3/4 bg-gray-100 rounded-sm" />
          <div className="h-3 w-32 bg-gray-100 rounded-sm" />
          <div className="h-6 w-20 bg-gray-100 rounded-sm" />
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-gray-100 rounded-sm" />
            <div className="h-8 w-16 bg-gray-100 rounded-sm" />
          </div>
          <div className="h-10 w-full bg-gray-100 rounded-sm" />
        </div>
      </div>

      {/* Related products skeleton */}
      <div className="mt-16 grid grid-cols-3 gap-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
