import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Eye } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { useWishlist } from '../../contexts/WishlistContext'
import { useToast } from '../ui/Toast'
import Badge from '../ui/Badge'
import RatingStars from '../ui/RatingStars'
import { formatPrice, getDiscountPercent } from '../../lib/utils'
import { CATEGORY_COLORS } from '../../data/products'
import type { Product } from '../../types'

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [imgIdx, setImgIdx] = useState(0)
  const [hovered, setHovered] = useState(false)
  const { addItem, openCart } = useCart()
  const { toggleItem, isWishlisted } = useWishlist()
  const { success } = useToast()
  const navigate = useNavigate()
  const wished = isWishlisted(product.id)
  const catColor = CATEGORY_COLORS[product.category_id] ?? '#C4A35A'

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, product.sizes[0], product.colors[0])
    success(`${product.name} added to cart`)
    openCart()
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleItem(product)
    success(wished ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const discount = product.original_price
    ? getDiscountPercent(product.price, product.original_price)
    : null

  return (
    <motion.div
      className="group"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      whileHover={{ y: -10 }}
      transition={{
        y: { type: 'spring', stiffness: 280, damping: 22 },
        opacity: { duration: 0.5, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] },
        default: { duration: 0.5, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] },
      }}
      onMouseEnter={() => { setHovered(true); setImgIdx(1) }}
      onMouseLeave={() => { setHovered(false); setImgIdx(0) }}
    >
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image wrapper — glow ring on hover */}
        <div
          style={{
            filter: hovered
              ? `drop-shadow(0 0 18px ${catColor}55) drop-shadow(0 16px 32px rgba(0,0,0,0.22))`
              : 'drop-shadow(0 4px 12px rgba(0,0,0,0.10))',
            transition: 'filter 0.4s ease',
            borderRadius: 4,
          }}
        >
            <div className="relative overflow-hidden rounded bg-neutral-50 dark:bg-dark-card aspect-[3/4]">
              {/* Image with smooth crossfade */}
              <div className="absolute inset-0">
                <img
                  src={`${product.images[0]}?auto=format&fit=crop&w=600&q=80`}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-700 ease-out ${hovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
                  loading="lazy"
                />
                {product.images[1] && (
                  <img
                    src={`${product.images[1]}?auto=format&fit=crop&w=600&q=80`}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                    loading="lazy"
                  />
                )}
              </div>

              {/* Dark gradient overlay on hover */}
              <div
                className="absolute inset-0 transition-opacity duration-400 bg-gradient-to-t from-black/40 via-transparent to-transparent"
                style={{ opacity: hovered ? 1 : 0 }}
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {product.is_new && <Badge variant="new">New</Badge>}
                {product.is_sale && discount && <Badge variant="sale">-{discount}%</Badge>}
                {product.is_featured && !product.is_new && !product.is_sale && (
                  <Badge variant="featured">Featured</Badge>
                )}
              </div>

              {/* Action buttons — slide in from right */}
              <div
                className="absolute top-3 right-3 flex flex-col gap-2 z-10"
                style={{
                  opacity: hovered ? 1 : 0,
                  transform: hovered ? 'translateX(0)' : 'translateX(16px)',
                  transition: 'opacity 0.25s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              >
                <button
                  onClick={handleWishlist}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shadow-xl ring-1 ring-white/20 backdrop-blur-sm transition-all duration-200 ${wished ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white/90 dark:bg-dark-card/90 text-black dark:text-white hover:bg-black hover:text-white'}`}
                >
                  <Heart size={14} fill={wished ? 'currentColor' : 'none'} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/product/${product.slug}`) }}
                  className="w-9 h-9 rounded-full flex items-center justify-center shadow-xl ring-1 ring-white/20 backdrop-blur-sm bg-white/90 dark:bg-dark-card/90 text-black dark:text-white hover:bg-black hover:text-white transition-all duration-200"
                >
                  <Eye size={14} />
                </button>
              </div>

              {/* Quick add — slides up from bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 z-10"
                style={{
                  opacity: hovered ? 1 : 0,
                  transform: hovered ? 'translateY(0)' : 'translateY(100%)',
                  transition: 'opacity 0.25s ease, transform 0.35s cubic-bezier(0.34,1.2,0.64,1)',
                }}
              >
                <button
                  onClick={handleAddToCart}
                  className="w-full h-11 bg-black/90 dark:bg-white/90 backdrop-blur-sm text-white dark:text-black text-xs font-bold tracking-widest uppercase hover:bg-black dark:hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={13} />
                  Quick Add
                </button>
              </div>
            </div>
        </div>

        {/* Info */}
        <div
          className="mt-3 space-y-1 px-0.5"
          style={{
            transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'transform 0.3s ease',
          }}
        >
          <RatingStars rating={product.rating} showCount count={product.review_count} />
          <h3
            className="text-sm font-medium leading-tight line-clamp-1 transition-colors duration-200"
            style={{ color: hovered ? catColor : undefined }}
          >
            <span className="text-black dark:text-white group-hover:text-inherit">{product.name}</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-black dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.original_price && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
          {product.colors.length > 0 && (
            <div className="flex gap-1.5 pt-0.5">
              {product.colors.slice(0, 5).map((c) => (
                <span key={c} className="text-xs text-neutral-400 dark:text-neutral-500">{c}</span>
              ))}
              {product.colors.length > 5 && (
                <span className="text-xs text-neutral-400">+{product.colors.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
