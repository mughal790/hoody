import { Link } from 'react-router-dom'
import { Instagram, Twitter, Youtube, Facebook } from 'lucide-react'
import logo from '../../assets/logo-transparent.png'
import { CATEGORIES } from '../../data/products'

const footerLinks = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'New Arrivals', href: '/shop?filter=new' },
    { label: 'Sale', href: '/shop?filter=sale' },
    ...CATEGORIES.map((c) => ({ label: c.name, href: `/shop/${c.slug}` })),
  ],
  Help: [
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'Shipping & Returns', href: '/shipping' },
    { label: 'Track Your Order', href: '/track' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ],
  Company: [
    { label: 'About Hoody', href: '/about' },
    { label: 'Sustainability', href: '/sustainability' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Stores', href: '/stores' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
}

const socials = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'X (Twitter)' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Facebook, href: '#', label: 'Facebook' },
]

export default function Footer() {
  return (
    <footer className="bg-neutral-950 dark:bg-dark-muted text-neutral-400">
      {/* Newsletter */}
      <div className="border-b border-neutral-800">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-white font-serif text-2xl md:text-3xl font-semibold mb-2">
                Join the Inner Circle
              </h3>
              <p className="text-neutral-400 text-sm">
                Early access to new drops, exclusive offers, and curated style.
              </p>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 md:w-72 h-11 px-4 bg-neutral-900 border border-neutral-700 rounded text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-brand-gold"
              />
              <button
                type="submit"
                className="h-11 px-6 bg-brand-gold hover:bg-brand-gold-dark text-white text-sm font-medium rounded transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-5">{section}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-serif text-2xl font-bold text-white tracking-widest uppercase">
              HOODY
            </Link>
            <span className="text-neutral-600 text-xs">Premium Men's Fashion</span>
          </div>

          <div className="flex items-center gap-4">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 hover:border-brand-gold hover:text-brand-gold transition-colors"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>

          <p className="text-xs text-neutral-600 text-center md:text-right">
            &copy; {new Date().getFullYear()} Hoody. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
