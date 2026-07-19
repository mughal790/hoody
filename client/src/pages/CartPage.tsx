import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Trash2, ArrowLeft, ArrowRight } from 'lucide-react'
import Button from '../components/ui/Button'
import { useCart } from '../contexts/CartContext'
import { formatPrice } from '../lib/utils'

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, clearCart } = useCart()

  const shipping = subtotal >= 200 ? 0 : 15
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag size={64} className="text-neutral-200 dark:text-neutral-700 mb-6" />
        <h1 className="font-serif text-3xl font-bold text-black dark:text-white mb-3">Your bag is empty</h1>
        <p className="text-neutral-400 mb-8 max-w-xs">Looks like you haven't added anything yet. Let's change that.</p>
        <Link to="/shop"><Button size="lg">Browse the Collection</Button></Link>
      </div>
    )
  }

  return (
    <div className="pt-16 md:pt-20 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-black dark:text-white">Shopping Bag</h1>
          <button onClick={clearCart} className="text-sm text-neutral-400 hover:text-red-500 transition-colors flex items-center gap-1.5">
            <Trash2 size={15} /> Clear all
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ x: 4 }}
                transition={{
                  default: { delay: i * 0.06, duration: 0.45, ease: 'easeOut' },
                  x: { type: 'spring', stiffness: 300, damping: 24 },
                  layout: { duration: 0.3 },
                }}
                className="flex gap-4 sm:gap-5 p-4 rounded-xl bg-white dark:bg-dark-card border border-neutral-100 dark:border-dark-border"
                style={{
                  boxShadow: '0 2px 12px -2px rgba(0,0,0,0.07)',
                  transition: 'box-shadow 0.3s ease',
                }}
                onHoverStart={(e) => {
                  (e.target as HTMLElement).style.boxShadow = '0 8px 32px -4px rgba(196,163,90,0.18), 0 2px 8px rgba(0,0,0,0.08)'
                }}
                onHoverEnd={(e) => {
                  (e.target as HTMLElement).style.boxShadow = '0 2px 12px -2px rgba(0,0,0,0.07)'
                }}
              >
                <Link to={`/product/${item.product.slug}`} className="shrink-0">
                  <img
                    src={`${item.product.images[0]}?auto=format&fit=crop&w=160&q=80`}
                    alt={item.product.name}
                    className="w-24 h-28 md:w-28 md:h-32 object-cover rounded-lg bg-neutral-50 dark:bg-dark-card shadow-md"
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link to={`/product/${item.product.slug}`}>
                        <h3 className="font-medium text-black dark:text-white hover:text-brand-gold transition-colors leading-snug">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-neutral-400 mt-1">{item.size} · {item.color}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-neutral-300 hover:text-red-500 transition-colors shrink-0">
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-neutral-200 dark:border-dark-border rounded h-10">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-10 h-full flex items-center justify-center text-neutral-400 hover:text-black dark:hover:text-white text-lg">−</button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-10 h-full flex items-center justify-center text-neutral-400 hover:text-black dark:hover:text-white text-lg">+</button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-black dark:text-white">{formatPrice(item.product.price * item.quantity)}</p>
                      {item.quantity > 1 && <p className="text-xs text-neutral-400">{formatPrice(item.product.price)} each</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-black dark:hover:text-white transition-colors mt-2">
              <ArrowLeft size={15} /> Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-50 dark:bg-dark-muted rounded-xl p-6" style={{ position: 'sticky', top: '6rem' }}>
              <h2 className="font-semibold text-black dark:text-white mb-6 text-lg">Order Summary</h2>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-500 font-medium' : 'font-medium'}>
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Est. Tax</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                {subtotal < 200 && (
                  <p className="text-xs text-brand-gold bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded">
                    Add {formatPrice(200 - subtotal)} more for free shipping!
                  </p>
                )}
              </div>
              <div className="border-t border-neutral-200 dark:border-dark-border pt-4 flex justify-between mb-6">
                <span className="font-semibold text-black dark:text-white">Total</span>
                <span className="font-bold text-xl text-black dark:text-white">{formatPrice(total)}</span>
              </div>

              {/* Promo code */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Promo code"
                  className="flex-1 h-10 px-3 text-sm border border-neutral-200 dark:border-dark-border rounded bg-white dark:bg-dark-card text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
                <button className="h-10 px-4 text-sm font-medium border border-neutral-200 dark:border-dark-border rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">Apply</button>
              </div>

              <Link to="/checkout">
                <Button fullWidth size="lg" className="gap-2 mb-3">
                  Checkout <ArrowRight size={16} />
                </Button>
              </Link>
              <p className="text-xs text-center text-neutral-400">Secure checkout · SSL encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
