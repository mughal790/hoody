import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Heart, Share2, ChevronRight, Package, RotateCcw, Shield } from 'lucide-react'
import Layout from '../components/layout/Layout'
import ProductImageGallery from '../components/products/ProductImageGallery'
import ProductCard from '../components/products/ProductCard'
import ProductGrid from '../components/products/ProductGrid'
import RatingStars from '../components/ui/RatingStars'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { useToast } from '../components/ui/Toast'
import { getProductBySlug, PRODUCTS, CATEGORIES, CATEGORY_COLORS } from '../data/products'
import { formatPrice, getDiscountPercent, COLORS_MAP } from '../lib/utils'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const product = slug ? getProductBySlug(slug) : null
  const { addItem, openCart } = useCart()
  const { toggleItem, isWishlisted } = useWishlist()
  const { success, error } = useToast()

  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping'>('details')

  if (!product) {
    return (
      <div className="pt-32 min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-serif text-3xl font-bold mb-4 text-black dark:text-white">Product not found</h1>
        <p className="text-neutral-400 mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
      </div>
    )
  }

  const cat = CATEGORIES.find((c) => c.id === product.category_id)
  const related = PRODUCTS.filter((p) => p.category_id === product.category_id && p.id !== product.id).slice(0, 4)
  const discount = product.original_price ? getDiscountPercent(product.price, product.original_price) : null
  const wished = isWishlisted(product.id)

  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) { error('Please select a size'); return }
    const size = selectedSize || product.sizes[0] || 'One Size'
    const color = selectedColor || product.colors[0] || 'Default'
    addItem(product, size, color, qty)
    success(`${product.name} added to cart`)
    openCart()
  }

  return (
    <div className="pt-16 md:pt-20">
      {/* Breadcrumb */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-black dark:hover:text-white transition-colors">Shop</Link>
          {cat && (
            <>
              <ChevronRight size={12} />
              <Link to={`/shop/${cat.slug}`} className="hover:text-black dark:hover:text-white transition-colors">{cat.name}</Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-black dark:text-white">{product.name}</span>
        </nav>
      </div>

      {/* Main */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <ProductImageGallery images={product.images} name={product.name} />
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="lg:py-4">
            {/* Badges */}
            <div className="flex gap-2 mb-4">
              {product.is_new && <Badge variant="new">New</Badge>}
              {product.is_sale && discount && <Badge variant="sale">-{discount}% Off</Badge>}
              {product.is_featured && <Badge variant="featured">Featured</Badge>}
            </div>

            {cat && <p className="text-xs text-neutral-400 uppercase tracking-widest mb-2">{cat.name}</p>}
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-black dark:text-white mb-3 leading-snug">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-5">
              <RatingStars rating={product.rating} showCount count={product.review_count} />
              <span className="text-xs text-neutral-400">|</span>
              <span className="text-xs text-neutral-400">SKU: {product.sku}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-black dark:text-white">{formatPrice(product.price)}</span>
              {product.original_price && (
                <>
                  <span className="text-lg text-neutral-400 line-through">{formatPrice(product.original_price)}</span>
                  <span className="text-sm text-red-500 font-semibold">Save {formatPrice(product.original_price - product.price)}</span>
                </>
              )}
            </div>

            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-sm mb-8">
              {product.description}
            </p>

            {/* Color */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-black dark:text-white uppercase tracking-wide">
                    Color: <span className="text-brand-gold font-normal normal-case">{selectedColor || product.colors[0]}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => {
                    const hex = COLORS_MAP[color] || '#888'
                    const isSelected = (selectedColor || product.colors[0]) === color
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        className={`w-9 h-9 rounded-full border-2 transition-all relative ${isSelected ? 'border-black dark:border-white scale-110' : 'border-neutral-200 dark:border-dark-border hover:scale-105'}`}
                        style={{ backgroundColor: hex }}
                      >
                        {isSelected && (
                          <span className="absolute inset-0 rounded-full ring-2 ring-white dark:ring-dark-bg" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size */}
            {product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-black dark:text-white uppercase tracking-wide">Size</span>
                  <button className="text-xs text-neutral-400 hover:text-brand-gold transition-colors underline underline-offset-2">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-11 min-w-[2.75rem] px-3 text-sm font-medium border rounded transition-all ${selectedSize === size ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'border-neutral-200 dark:border-dark-border text-neutral-600 dark:text-neutral-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-sm font-semibold text-black dark:text-white uppercase tracking-wide">Qty</span>
              <div className="flex items-center border border-neutral-200 dark:border-dark-border rounded h-11">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-11 h-full text-xl text-neutral-400 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors">−</button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-11 h-full text-xl text-neutral-400 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors">+</button>
              </div>
              {product.stock_quantity < 20 && (
                <span className="text-xs text-amber-500 font-medium">Only {product.stock_quantity} left</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <Button onClick={handleAddToCart} size="lg" fullWidth className="gap-2">
                <ShoppingBag size={18} /> Add to Bag
              </Button>
              <button
                onClick={() => { toggleItem(product); success(wished ? 'Removed from wishlist' : 'Added to wishlist') }}
                className={`h-12 w-12 border rounded flex items-center justify-center shrink-0 transition-all ${wished ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'border-neutral-200 dark:border-dark-border text-black dark:text-white hover:border-black dark:hover:border-white'}`}
              >
                <Heart size={18} fill={wished ? 'currentColor' : 'none'} />
              </button>
              <button className="h-12 w-12 border border-neutral-200 dark:border-dark-border rounded flex items-center justify-center shrink-0 text-black dark:text-white hover:border-black dark:hover:border-white transition-colors">
                <Share2 size={18} />
              </button>
            </div>

            {/* Trust signals */}
            <div className="border border-neutral-100 dark:border-dark-border rounded-lg p-4 space-y-3">
              {[
                { icon: Package, text: 'Free shipping on orders over $200' },
                { icon: RotateCcw, text: 'Free returns within 30 days' },
                { icon: Shield, text: '2-year quality guarantee' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon size={16} className="text-brand-gold shrink-0" />
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{text}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="mt-8">
              <div className="flex border-b border-neutral-100 dark:border-dark-border">
                {(['details', 'care', 'shipping'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-neutral-400 hover:text-black dark:hover:text-white'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="py-5 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {activeTab === 'details' && (
                  <div>
                    <p>{product.description}</p>
                    <ul className="mt-4 space-y-1">
                      <li>• Material: 100% Premium Cotton</li>
                      <li>• Fit: Slim / Regular fit</li>
                      <li>• Crafted with precision in Portugal</li>
                      <li>• Machine washable at 30°C</li>
                    </ul>
                  </div>
                )}
                {activeTab === 'care' && (
                  <ul className="space-y-1">
                    <li>• Machine wash cold, gentle cycle</li>
                    <li>• Do not bleach</li>
                    <li>• Tumble dry on low or hang dry</li>
                    <li>• Iron on low heat if needed</li>
                    <li>• Dry clean for best results</li>
                  </ul>
                )}
                {activeTab === 'shipping' && (
                  <div className="space-y-3">
                    <p><strong className="text-black dark:text-white">Standard Delivery (3-5 days)</strong> — Free on orders over $200</p>
                    <p><strong className="text-black dark:text-white">Express Delivery (1-2 days)</strong> — $15</p>
                    <p><strong className="text-black dark:text-white">International (5-12 days)</strong> — From $20</p>
                    <p>Orders placed before 2pm ship the same day.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="bg-neutral-50 dark:bg-dark-muted py-16 md:py-24">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-black dark:text-white mb-10">You May Also Like</h2>
            <ProductGrid products={related} />
          </div>
        </div>
      )}
    </div>
  )
}
