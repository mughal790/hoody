import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import riftLogo from '../../assets/rift-logo.png'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Heart, Sun, Moon, Menu, X, Search, User, ChevronDown, ArrowLeft } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useCart } from '../../contexts/CartContext'
import { useWishlist } from '../../contexts/WishlistContext'
import { useAuth } from '../../contexts/AuthContext'
import { CATEGORIES } from '../../data/products'
import { cn } from '../../lib/utils'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryHover, setCategoryHover] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const { itemCount, openCart } = useCart()
  const { items: wishlistItems } = useWishlist()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const isTransparent = false

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-black/30 border-b border-white/10"
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Back button + Logo */}
            <div className="flex items-center gap-2">
              {location.pathname !== '/' && (
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-full transition-colors text-white hover:bg-white/10"
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <Link to="/" className="flex-shrink-0">
                <img src={riftLogo} alt="RIFT" className="h-16 md:h-20 w-auto object-contain drop-shadow-[0_0_12px_rgba(78,205,196,0.5)]" />
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <div
                className="relative group"
                onMouseEnter={() => setCategoryHover(true)}
                onMouseLeave={() => setCategoryHover(false)}
              >
                <button className="flex items-center gap-1 text-sm font-medium tracking-wide uppercase transition-colors text-white/90 hover:text-white">
                  Shop <ChevronDown size={14} className={cn('transition-transform', categoryHover && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {categoryHover && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white dark:bg-dark-card rounded shadow-luxury border border-neutral-100 dark:border-dark-border overflow-hidden"
                    >
                      <Link to="/shop" className="block px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-muted hover:text-black dark:hover:text-white transition-colors font-medium border-b border-neutral-100 dark:border-dark-border">
                        All Products
                      </Link>
                      {CATEGORIES.map((cat) => (
                        <Link key={cat.id} to={`/shop/${cat.slug}`}
                          className="block px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-muted hover:text-black dark:hover:text-white transition-colors">
                          {cat.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {['New Arrivals', 'Sale'].map((item) => (
                <Link
                  key={item}
                  to={item === 'New Arrivals' ? '/shop?filter=new' : '/shop?filter=sale'}
                  className="text-sm font-medium tracking-wide uppercase transition-colors text-white/90 hover:text-white"
                >
                  {item}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full transition-colors text-white hover:bg-white/10"
              >
                <Search size={20} />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full transition-colors hidden md:flex text-white hover:bg-white/10"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <Link
                to={user ? '/account' : '/auth'}
                className="p-2 rounded-full transition-colors hidden md:flex text-white hover:bg-white/10"
              >
                <User size={20} />
              </Link>

              <Link
                to="/wishlist"
                className="p-2 rounded-full transition-colors relative hidden md:flex text-white hover:bg-white/10"
              >
                <Heart size={20} />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-brand-gold rounded-full" />
                )}
              </Link>

              <button
                onClick={openCart}
                className="p-2 rounded-full transition-colors relative text-white hover:bg-white/10"
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center leading-none px-1"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </button>

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-full transition-colors md:hidden text-white hover:bg-white/10"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-30 bg-white dark:bg-dark-bg pt-20 flex flex-col"
          >
            <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-1">
              <Link to="/shop" className="block py-3 text-lg font-medium text-black dark:text-white border-b border-neutral-100 dark:border-dark-border">
                All Products
              </Link>
              {CATEGORIES.map((cat) => (
                <Link key={cat.id} to={`/shop/${cat.slug}`}
                  className="block py-3 text-lg font-medium text-black dark:text-white border-b border-neutral-100 dark:border-dark-border">
                  {cat.name}
                </Link>
              ))}
              <Link to="/shop?filter=new" className="block py-3 text-lg font-medium text-black dark:text-white border-b border-neutral-100 dark:border-dark-border">
                New Arrivals
              </Link>
              <Link to="/shop?filter=sale" className="block py-3 text-lg font-medium text-red-600 border-b border-neutral-100 dark:border-dark-border">
                Sale
              </Link>
              <Link to="/wishlist" className="block py-3 text-lg font-medium text-black dark:text-white border-b border-neutral-100 dark:border-dark-border">
                Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
              </Link>
              <Link to={user ? '/account' : '/auth'} className="block py-3 text-lg font-medium text-black dark:text-white border-b border-neutral-100 dark:border-dark-border">
                {user ? 'My Account' : 'Sign In'}
              </Link>
            </nav>
            <div className="px-6 py-4 border-t border-neutral-100 dark:border-dark-border flex items-center justify-between">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Theme</span>
              <button onClick={toggleTheme} className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                {isDark ? <><Sun size={16} /> Light</> : <><Moon size={16} /> Dark</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start pt-24 px-4"
            onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl mx-auto"
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full h-16 px-6 pr-16 text-lg bg-white dark:bg-dark-card text-black dark:text-white rounded-lg shadow-luxury-lg focus:outline-none placeholder:text-neutral-400"
                />
                <button type="submit" className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white">
                  <Search size={24} />
                </button>
              </form>
              <button onClick={() => setSearchOpen(false)} className="mt-4 text-white/60 hover:text-white text-sm mx-auto block">
                Press Esc or click outside to close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
