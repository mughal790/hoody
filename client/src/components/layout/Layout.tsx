import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from '../cart/CartDrawer'

interface LayoutProps {
  children: ReactNode
  hideFooter?: boolean
}

export default function Layout({ children, hideFooter }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-bg text-black dark:text-white">
      <Header />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
      <CartDrawer />
    </div>
  )
}
