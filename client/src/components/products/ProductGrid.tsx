import ProductCard from './ProductCard'
import { ProductGridSkeleton } from '../ui/Skeleton'
import type { Product } from '../../types'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  emptyMessage?: string
}

export default function ProductGrid({ products, loading, emptyMessage = 'No products found.' }: ProductGridProps) {
  if (loading) return <ProductGridSkeleton count={8} />

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-400 dark:text-neutral-500 text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  )
}
