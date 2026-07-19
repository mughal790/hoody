import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import Button from '../ui/Button'
import { formatPrice } from '../../lib/utils'

export default function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQty, subtotal, itemCount } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-dark-bg z-[61] flex flex-col shadow-luxury-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-dark-border">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} />
                <h2 className="font-serif text-lg font-semibold">Your Bag ({itemCount})</h2>
              </div>
              <button onClick={closeCart} className="p-2 hover:bg-neutral-100 dark:hover:bg-dark-card rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag size={48} className="text-neutral-200 dark:text-neutral-700" />
                  <div>
                    <p className="font-semibold text-black dark:text-white mb-1">Your bag is empty</p>
                    <p className="text-sm text-neutral-400">Start adding some items to your cart.</p>
                  </div>
                  <Button onClick={closeCart} variant="outline" size="sm">
                    <Link to="/shop">Browse Products</Link>
                  </Button>
                </div>
              ) : (
                <ul className="space-y-5">
                  {items.map((item) => (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4"
                    >
                      <Link to={`/product/${item.product.slug}`} onClick={closeCart} className="shrink-0">
                        <img
                          src={`${item.product.images[0]}?auto=format&fit=crop&w=120&q=80`}
                          alt={item.product.name}
                          className="w-20 h-24 object-cover rounded bg-neutral-50 dark:bg-dark-card"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.product.slug}`} onClick={closeCart}>
                          <h4 className="text-sm font-medium text-black dark:text-white leading-snug hover:text-brand-gold transition-colors line-clamp-2">
                            {item.product.name}
                          </h4>
                        </Link>
                        <p className="text-xs text-neutral-400 mt-1">
                          {item.size} · {item.color}
                        </p>
                        <div className="flex items-center justify-between mt-2.5">
                          <div className="flex items-center border border-neutral-200 dark:border-dark-border rounded">
                            <button
                              onClick={() => updateQty(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white text-lg leading-none transition-colors"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white text-lg leading-none transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-neutral-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-neutral-100 dark:border-dark-border px-6 py-5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
                  <span className="font-semibold text-black dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-neutral-400 -mt-2">Shipping and taxes calculated at checkout</p>
                <Link to="/checkout" onClick={closeCart}>
                  <Button fullWidth size="lg" className="gap-2">
                    Checkout <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link to="/cart" onClick={closeCart}>
                  <Button fullWidth variant="outline" size="sm">
                    View full cart
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
