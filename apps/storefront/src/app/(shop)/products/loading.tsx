import { SkeletonCard } from '@/components/ui'
import { FilterBar } from '@/components/shop/FilterBar'

export default function ProductsLoading() {
  return (
    <>
      <FilterBar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </>
  )
}
