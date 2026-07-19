import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import ProductGrid from '../components/products/ProductGrid'
import Button from '../components/ui/Button'
import { useWishlist } from '../contexts/WishlistContext'
import type { Product } from '../types'

export default function WishlistPage() {
  const { items } = useWishlist()

  if (items.length === 0) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center text-center px-4">
        <Heart size={64} className="text-neutral-200 dark:text-neutral-700 mb-6" />
        <h1 className="font-serif text-3xl font-bold text-black dark:text-white mb-3">Your Wishlist is Empty</h1>
        <p className="text-neutral-400 mb-8 max-w-xs">Save your favourite items here to come back to them later.</p>
        <Link to="/shop"><Button size="lg">Browse the Collection</Button></Link>
      </div>
    )
  }

  return (
    <div className="pt-16 md:pt-20 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-black dark:text-white">Wishlist</h1>
          <p className="text-neutral-400 mt-1 text-sm">{items.length} saved {items.length === 1 ? 'item' : 'items'}</p>
        </div>
        <ProductGrid products={items as unknown as Product[]} />
      </div>
    </div>
  )
}
