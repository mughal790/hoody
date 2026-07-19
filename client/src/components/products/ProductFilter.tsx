import { useState } from 'react'
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../ui/Button'
import { CATEGORIES } from '../../data/products'
import { COLORS_MAP, SIZES } from '../../lib/utils'
import { cn } from '../../lib/utils'
import type { FilterState } from '../../types'

interface ProductFilterProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  totalCount: number
}

const PRICE_RANGES = [
  { label: 'Under $100', min: 0, max: 100 },
  { label: '$100 – $200', min: 100, max: 200 },
  { label: '$200 – $350', min: 200, max: 350 },
  { label: 'Over $350', min: 350, max: 9999 },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-neutral-100 dark:border-dark-border py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-semibold text-black dark:text-white uppercase tracking-wide"
      >
        {title}
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ProductFilter({ filters, onChange, totalCount }: ProductFilterProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch })

  const toggleSize = (size: string) => {
    const current = filters.sizes || []
    update({ sizes: current.includes(size) ? current.filter((s) => s !== size) : [...current, size] })
  }

  const toggleColor = (color: string) => {
    const current = filters.colors || []
    update({ colors: current.includes(color) ? current.filter((c) => c !== color) : [...current, color] })
  }

  const hasActiveFilters = !!(
    filters.category || filters.minPrice || filters.maxPrice ||
    (filters.sizes && filters.sizes.length > 0) ||
    (filters.colors && filters.colors.length > 0) ||
    filters.onSale || filters.isNew
  )

  const clearAll = () => onChange({ sort: filters.sort, search: filters.search })

  const FilterContent = () => (
    <div className="space-y-0">
      {/* Sort */}
      <FilterSection title="Sort By">
        <div className="space-y-2">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="sort"
                value={opt.value}
                checked={filters.sort === opt.value}
                onChange={() => update({ sort: opt.value as FilterState['sort'] })}
                className="w-4 h-4 accent-black dark:accent-white"
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Category */}
      <FilterSection title="Category">
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={filters.category === cat.slug}
                onChange={() => update({ category: filters.category === cat.slug ? undefined : cat.slug })}
                className="w-4 h-4 accent-black dark:accent-white"
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price Range">
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => (
            <label key={range.label} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="price"
                checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                onChange={() => update({ minPrice: range.min, maxPrice: range.max })}
                className="w-4 h-4 accent-black dark:accent-white"
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.clothing.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={cn(
                'w-10 h-10 text-xs font-medium border rounded transition-all',
                filters.sizes?.includes(size)
                  ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                  : 'border-neutral-200 dark:border-dark-border text-neutral-600 dark:text-neutral-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Colors */}
      <FilterSection title="Color">
        <div className="flex flex-wrap gap-2">
          {Object.entries(COLORS_MAP).slice(0, 12).map(([name, hex]) => (
            <button
              key={name}
              onClick={() => toggleColor(name)}
              title={name}
              className={cn(
                'w-8 h-8 rounded-full border-2 transition-all',
                filters.colors?.includes(name)
                  ? 'border-black dark:border-white scale-110'
                  : 'border-neutral-200 dark:border-dark-border hover:scale-105'
              )}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </FilterSection>

      {/* Specials */}
      <FilterSection title="Special" defaultOpen={false}>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={!!filters.isNew} onChange={() => update({ isNew: !filters.isNew })} className="w-4 h-4 accent-black dark:accent-white" />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">New Arrivals</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={!!filters.onSale} onChange={() => update({ onSale: !filters.onSale })} className="w-4 h-4 accent-black dark:accent-white" />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">On Sale</span>
          </label>
        </div>
      </FilterSection>

      {hasActiveFilters && (
        <div className="pt-4">
          <button onClick={clearAll} className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1.5">
            <X size={14} /> Clear all filters
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Filters</h2>
            <span className="text-xs text-neutral-400">{totalCount} items</span>
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile filter button */}
      <div className="lg:hidden">
        <Button variant="outline" size="sm" onClick={() => setMobileOpen(true)} className="gap-2">
          <SlidersHorizontal size={15} /> Filter {hasActiveFilters && '•'}
        </Button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-dark-bg z-50 overflow-y-auto p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-black dark:text-white">Filters</h2>
                  <button onClick={() => setMobileOpen(false)}><X size={20} /></button>
                </div>
                <FilterContent />
                <div className="mt-6">
                  <Button fullWidth onClick={() => setMobileOpen(false)}>
                    Show {totalCount} results
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
