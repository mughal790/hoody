import { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductGrid from '../components/products/ProductGrid'
import ProductFilter from '../components/products/ProductFilter'
import { PRODUCTS, CATEGORIES } from '../data/products'
import type { FilterState, Product } from '../types'

function applyFilters(products: Product[], filters: FilterState): Product[] {
  let result = [...products]

  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    )
  }

  if (filters.category) {
    const cat = CATEGORIES.find((c) => c.slug === filters.category)
    if (cat) result = result.filter((p) => p.category_id === cat.id)
  }

  if (filters.minPrice !== undefined) {
    result = result.filter((p) => p.price >= (filters.minPrice || 0))
  }
  if (filters.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= (filters.maxPrice || 9999))
  }

  if (filters.sizes && filters.sizes.length > 0) {
    result = result.filter((p) => p.sizes.some((s) => filters.sizes!.includes(s)))
  }
  if (filters.colors && filters.colors.length > 0) {
    result = result.filter((p) => p.colors.some((c) => filters.colors!.includes(c)))
  }
  if (filters.isNew) result = result.filter((p) => p.is_new)
  if (filters.onSale) result = result.filter((p) => p.is_sale)

  // Sort
  switch (filters.sort) {
    case 'price-asc': result.sort((a, b) => a.price - b.price); break
    case 'price-desc': result.sort((a, b) => b.price - a.price); break
    case 'rating': result.sort((a, b) => b.rating - a.rating); break
    case 'popular': result.sort((a, b) => b.review_count - a.review_count); break
    case 'newest':
    default: result.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0))
  }

  return result
}

export default function ShopPage() {
  const { category } = useParams<{ category?: string }>()
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<FilterState>({ sort: 'newest' })

  useEffect(() => {
    const newFilters: FilterState = { sort: 'newest' }
    if (category) newFilters.category = category
    const search = searchParams.get('search')
    if (search) newFilters.search = search
    const filter = searchParams.get('filter')
    if (filter === 'new') newFilters.isNew = true
    if (filter === 'sale') newFilters.onSale = true
    setFilters(newFilters)
  }, [category, searchParams])

  const filtered = useMemo(() => applyFilters(PRODUCTS, filters), [filters])

  const catInfo = category ? CATEGORIES.find((c) => c.slug === category) : null
  const pageTitle = catInfo?.name || filters.search ? `Search: "${filters.search}"` : filters.isNew ? 'New Arrivals' : filters.onSale ? 'Sale' : 'All Products'

  return (
    <div className="pt-16 md:pt-20 min-h-screen">
      {/* Header */}
      {catInfo && (
        <div className="relative h-48 md:h-64 overflow-hidden">
          <img
            src={`${catInfo.image_url}?auto=format&fit=crop&w=1920&q=80`}
            alt={catInfo.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-2">{catInfo.name}</h1>
              <p className="text-white/70 text-sm">{catInfo.description}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {!catInfo && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-black dark:text-white">{pageTitle}</h1>
            <p className="text-neutral-400 mt-1 text-sm">{filtered.length} products</p>
          </motion.div>
        )}

        {catInfo && (
          <div className="flex items-center justify-between mb-8">
            <p className="text-neutral-400 text-sm">{filtered.length} products</p>
          </div>
        )}

        <div className="flex gap-8 lg:gap-12">
          {/* Filter sidebar + mobile filter */}
          <ProductFilter filters={filters} onChange={setFilters} totalCount={filtered.length} />

          {/* Products */}
          <div className="flex-1 min-w-0">
            {/* Mobile sort/filter bar */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <p className="text-sm text-neutral-400">{filtered.length} items</p>
              <ProductFilter filters={filters} onChange={setFilters} totalCount={filtered.length} />
            </div>
            <ProductGrid products={filtered} emptyMessage="No products match your filters. Try adjusting your selection." />
          </div>
        </div>
      </div>
    </div>
  )
}
