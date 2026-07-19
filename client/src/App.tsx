import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from './components/layout/Layout'
import ScrollToTop from './components/layout/ScrollToTop'

const HomePage = lazy(() => import('./pages/HomePage'))
const ShopPage = lazy(() => import('./pages/ShopPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neutral-200 border-t-black dark:border-dark-border dark:border-t-white rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const isCheckout = location.pathname === '/checkout'
  const isAuth = location.pathname === '/auth'

  if (isAuth) {
    return (
      <>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <PageWrapper key={location.pathname}>
              <AuthPage />
            </PageWrapper>
          </AnimatePresence>
        </Suspense>
      </>
    )
  }

  return (
    <Layout hideFooter={isCheckout}>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
            <Route path="/shop" element={<PageWrapper><ShopPage /></PageWrapper>} />
            <Route path="/shop/:category" element={<PageWrapper><ShopPage /></PageWrapper>} />
            <Route path="/product/:slug" element={<PageWrapper><ProductDetailPage /></PageWrapper>} />
            <Route path="/cart" element={<PageWrapper><CartPage /></PageWrapper>} />
            <Route path="/checkout" element={<PageWrapper><CheckoutPage /></PageWrapper>} />
            <Route path="/account" element={<PageWrapper><AccountPage /></PageWrapper>} />
            <Route path="/wishlist" element={<PageWrapper><WishlistPage /></PageWrapper>} />
            <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </Layout>
  )
}
