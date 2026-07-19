import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import ProductCard from '../components/products/ProductCard'
import ShinyText from '../components/ui/ShinyText'
import { CATEGORIES, CATEGORY_COLORS, getFeaturedProducts, getNewProducts } from '../data/products'
import { formatPrice } from '../lib/utils'

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80',
    tag: 'New Collection',
    title: 'Dressed for the\nCity You Own',
    subtitle: 'Premium menswear crafted for the modern man.',
    cta: 'Shop Now',
    ctaHref: '/shop',
  },
  {
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80',
    tag: 'Exclusive Drop',
    title: 'Outerwear\nRedefined',
    subtitle: 'Coats and jackets built to make a statement.',
    cta: 'Explore Jackets',
    ctaHref: '/shop/jackets',
  },
  {
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=80',
    tag: 'Heritage Craft',
    title: 'The Art of\nWearing Well',
    subtitle: 'Timeless pieces for every occasion.',
    cta: 'View All',
    ctaHref: '/shop',
  },
]

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0)
  const featuredProducts = getFeaturedProducts()
  const newProducts = getNewProducts()

  useEffect(() => {
    const interval = setInterval(() => setActiveSlide((s) => (s + 1) % HERO_SLIDES.length), 6000)
    return () => clearInterval(interval)
  }, [])

  const slide = HERO_SLIDES[activeSlide]

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {HERO_SLIDES.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: i === activeSlide ? 1 : 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </motion.div>
        ))}

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-xl"
            >
              <span className="inline-flex items-center gap-2 text-brand-gold text-xs font-semibold tracking-widest uppercase mb-4">
                <span className="w-8 h-px bg-brand-gold" />
                {slide.tag}
              </span>
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold leading-none mb-6 whitespace-pre-line">
                <ShinyText
                  text={slide.title}
                  speed={3}
                  delay={1}
                  color="#ffffff"
                  shineColor="#C4A35A"
                  spread={100}
                  direction="left"
                />
              </h1>
              <p className="text-white/70 text-lg mb-10 leading-relaxed">
                {slide.subtitle}
              </p>
              <div className="flex gap-4 flex-wrap items-center">
                {/* ── Primary CTA: gold shimmer ── */}
                <Link to={slide.ctaHref}>
                  <motion.button
                    initial="rest"
                    whileHover="hover"
                    whileTap={{ scale: 0.97 }}
                    variants={{ rest: {}, hover: {} }}
                    className="group relative h-14 px-9 flex items-center gap-3 overflow-hidden"
                    style={{
                      background: 'linear-gradient(110deg, #c9a84c 0%, #e2be72 40%, #b8922f 100%)',
                      boxShadow: '0 0 0 1px rgba(196,163,90,0.4), 0 8px 32px -6px rgba(196,163,90,0.55)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        '0 0 0 1px rgba(226,190,114,0.7), 0 12px 48px -6px rgba(196,163,90,0.85), 0 0 60px -10px rgba(196,163,90,0.4)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        '0 0 0 1px rgba(196,163,90,0.4), 0 8px 32px -6px rgba(196,163,90,0.55)'
                    }}
                  >
                    {/* Shimmer sweep */}
                    <motion.span
                      aria-hidden
                      variants={{
                        rest: { x: '-160%', rotate: -20 },
                        hover: { x: '260%', rotate: -20, transition: { duration: 0.55, ease: 'easeInOut' } },
                      }}
                      className="absolute inset-y-0 w-2/5 pointer-events-none"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.38), transparent)',
                        filter: 'blur(4px)',
                      }}
                    />
                    {/* Top edge highlight */}
                    <span
                      aria-hidden
                      className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)' }}
                    />

                    <span className="relative text-[11px] font-black tracking-[0.22em] uppercase text-black/90 transition-all duration-300 group-hover:tracking-[0.28em]">
                      {slide.cta}
                    </span>

                    <motion.span
                      variants={{
                        rest: { x: 0, opacity: 0.8 },
                        hover: { x: 5, opacity: 1 },
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                      className="relative text-black/90"
                    >
                      <ArrowRight size={15} strokeWidth={2.5} />
                    </motion.span>
                  </motion.button>
                </Link>

                {/* ── Secondary CTA: frosted fill ── */}
                <Link to="/shop?filter=new">
                  <motion.button
                    initial="rest"
                    whileHover="hover"
                    whileTap={{ scale: 0.97 }}
                    variants={{ rest: {}, hover: {} }}
                    className="group relative h-14 px-9 flex items-center gap-3 overflow-hidden"
                    style={{
                      border: '1px solid rgba(255,255,255,0.28)',
                      backdropFilter: 'blur(12px)',
                      background: 'rgba(255,255,255,0.06)',
                    }}
                  >
                    {/* Fill-from-left on hover */}
                    <motion.span
                      aria-hidden
                      variants={{
                        rest: { scaleX: 0, originX: 0 },
                        hover: { scaleX: 1, originX: 0, transition: { duration: 0.38, ease: [0.32, 0, 0.2, 1] } },
                      }}
                      className="absolute inset-0 bg-white pointer-events-none"
                    />

                    {/* Pulsing ring behind play icon */}
                    <span className="relative flex-shrink-0">
                      <motion.span
                        variants={{
                          rest: { scale: 1, opacity: 0.5 },
                          hover: { scale: 2.2, opacity: 0, transition: { duration: 0.5, ease: 'easeOut' } },
                        }}
                        className="absolute inset-0 rounded-full border border-white/60 pointer-events-none"
                        style={{ margin: '-3px' }}
                      />
                      <motion.span
                        variants={{
                          rest: { color: 'rgba(255,255,255,1)' },
                          hover: { color: 'rgba(0,0,0,0.85)', transition: { duration: 0.25 } },
                        }}
                      >
                        <Play size={13} fill="currentColor" strokeWidth={0} />
                      </motion.span>
                    </span>

                    <motion.span
                      variants={{
                        rest: { color: 'rgba(255,255,255,1)' },
                        hover: { color: 'rgba(0,0,0,0.85)', transition: { duration: 0.25 } },
                      }}
                      className="relative text-[11px] font-black tracking-[0.22em] uppercase transition-all duration-300 group-hover:tracking-[0.28em]"
                    >
                      New Arrivals
                    </motion.span>

                    {/* New badge */}
                    <motion.span
                      variants={{
                        rest: { opacity: 0.7, scale: 1 },
                        hover: { opacity: 1, scale: 1.08, transition: { type: 'spring', stiffness: 400, damping: 20 } },
                      }}
                      className="relative ml-1 text-[9px] font-black tracking-widest leading-none px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(196,163,90,0.9)', color: '#000' }}
                    >
                      NEW
                    </motion.span>
                  </motion.button>
                </Link>

                {/* ── Tertiary: scroll count ── */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="hidden lg:flex items-center gap-3 pl-2"
                >
                  <div className="w-px h-8 bg-white/20" />
                  <div>
                    <p className="text-white/90 text-xs font-black tracking-widest uppercase">50+</p>
                    <p className="text-white/40 text-[10px] tracking-widest uppercase">Styles</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`h-0.5 transition-all duration-500 ${i === activeSlide ? 'w-10 bg-white' : 'w-4 bg-white/40'}`}
            />
          ))}
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 right-8 text-white/40 hidden md:flex flex-col items-center gap-2 text-xs tracking-widest uppercase"
        >
          <span>Scroll</span>
          <div className="w-px h-8 bg-white/30" />
        </motion.div>
      </section>

      {/* ── Announcement bar ──────────────────────────────────────────── */}
      <div className="bg-black dark:bg-neutral-950 text-white text-center py-3">
        <p className="text-xs tracking-widest uppercase font-medium">
          Free worldwide shipping on orders over $200 &nbsp;·&nbsp; Easy 30-day returns &nbsp;·&nbsp; Authentic & sustainably sourced
        </p>
      </div>

      {/* ── Category Showcase ─────────────────────────────────────────── */}
      <AnimatedSection>
        <section className="py-16 md:py-24 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-gold">Collections</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-black dark:text-white mt-2">
              Shop by Category
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
            {CATEGORIES.map((cat, i) => {
              const catColor = CATEGORY_COLORS[cat.id]
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 40, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{
                    default: { duration: 0.55, delay: i * 0.09, ease: [0.25, 0.46, 0.45, 0.94] },
                    y: { type: 'spring', stiffness: 260, damping: 22 },
                    scale: { type: 'spring', stiffness: 260, damping: 22 },
                  }}
                  style={{ borderRadius: 8 }}
                >
                  <div
                    className="group relative"
                    style={{
                      filter: `drop-shadow(0 4px 16px rgba(0,0,0,0.18))`,
                      transition: 'filter 0.35s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.filter =
                        `drop-shadow(0 0 20px ${catColor}60) drop-shadow(0 16px 32px rgba(0,0,0,0.3))`
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.filter =
                        `drop-shadow(0 4px 16px rgba(0,0,0,0.18))`
                    }}
                  >
                      <Link to={`/shop/${cat.slug}`} className="block relative overflow-hidden rounded-lg aspect-[3/4]">
                        <img
                          src={`${cat.image_url}?auto=format&fit=crop&w=400&q=80`}
                          alt={cat.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                        {/* Gradient overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                        <div
                          className="absolute inset-0 transition-opacity duration-500"
                          style={{ background: `linear-gradient(to top, ${catColor}30, transparent 60%)`, opacity: 0 }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0' }}
                        />
                        {/* Label */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-0">
                          <h3
                            className="text-white font-serif text-base sm:text-lg font-semibold transition-colors duration-300"
                            style={{}}
                          >
                            {cat.name}
                          </h3>
                          <span className="text-white/60 text-xs flex items-center gap-1 mt-1 group-hover:text-white transition-colors duration-300">
                            Shop now <ArrowRight size={11} />
                          </span>
                        </div>
                        {/* Color accent line at bottom */}
                        <div
                          className="absolute bottom-0 left-0 right-0 h-0.5 transition-transform duration-500 origin-left"
                          style={{ background: catColor, transform: 'scaleX(0)' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scaleX(1)' }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scaleX(0)' }}
                        />
                      </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>
      </AnimatedSection>

      {/* ── Featured Products ─────────────────────────────────────────── */}
      <AnimatedSection>
        <section className="py-16 md:py-24 bg-neutral-50 dark:bg-dark-muted">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-brand-gold">Curated</span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-black dark:text-white mt-2">
                  Featured Picks
                </h2>
              </div>
              <Link to="/shop" className="text-sm font-medium text-black dark:text-white hover:text-brand-gold transition-colors flex items-center gap-1.5 self-start sm:self-auto">
                View all <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
              {featuredProducts.slice(0, 8).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Full Width Banner ─────────────────────────────────────────── */}
      <AnimatedSection>
        <section className="relative h-[500px] md:h-[600px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1920&q=80"
            alt="RIFT brand banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <span className="text-brand-gold text-xs font-semibold tracking-widest uppercase mb-4">Limited Edition</span>
            <h2 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6 max-w-2xl leading-tight">
              The Autumn / Winter Collection
            </h2>
            <p className="text-white/70 mb-10 max-w-md">
              Bold textures, refined silhouettes, and timeless design — crafted for the season ahead.
            </p>
            <Link to="/shop?filter=new">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-13 px-10 py-3.5 bg-brand-gold hover:bg-brand-gold-dark text-white text-sm font-semibold tracking-wider uppercase transition-colors flex items-center gap-2"
              >
                Discover the Collection <ArrowRight size={16} />
              </motion.button>
            </Link>
          </div>
        </section>
      </AnimatedSection>

      {/* ── New Arrivals ──────────────────────────────────────────────── */}
      <AnimatedSection>
        <section className="py-16 md:py-24 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-gold">Fresh</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-black dark:text-white mt-2">
                New Arrivals
              </h2>
            </div>
            <Link to="/shop?filter=new" className="text-sm font-medium text-black dark:text-white hover:text-brand-gold transition-colors flex items-center gap-1.5 self-start sm:self-auto">
              See all new <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
            {newProducts.slice(0, 4).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* ── Brand Promise / USPs ──────────────────────────────────────── */}
      <section className="py-16 border-t border-b border-neutral-100 dark:border-dark-border">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {[
              { label: 'Free Shipping', sub: 'On orders over $200', icon: '✦' },
              { label: 'Easy Returns', sub: '30-day return policy', icon: '↺' },
              { label: 'Premium Quality', sub: 'Ethically sourced materials', icon: '◆' },
              { label: 'Global Delivery', sub: 'Ships to 50+ countries', icon: '◉' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                whileHover={{ y: -4, scale: 1.04 }}
                transition={{
                  default: { duration: 0.45, delay: i * 0.08, ease: 'easeOut' },
                  y: { type: 'spring', stiffness: 320, damping: 24 },
                  scale: { type: 'spring', stiffness: 320, damping: 24 },
                }}
                className="text-center p-5 rounded-xl cursor-default"
                style={{
                  boxShadow: '0 2px 12px -2px rgba(0,0,0,0.06)',
                  transition: 'box-shadow 0.3s ease',
                }}
                onHoverStart={(e) => {
                  (e.target as HTMLElement).style.boxShadow = '0 8px 32px -4px rgba(196,163,90,0.25), 0 2px 8px rgba(0,0,0,0.08)'
                }}
                onHoverEnd={(e) => {
                  (e.target as HTMLElement).style.boxShadow = '0 2px 12px -2px rgba(0,0,0,0.06)'
                }}
              >
                <div className="text-2xl text-brand-gold mb-3">{item.icon}</div>
                <h3 className="text-sm font-semibold text-black dark:text-white uppercase tracking-wide mb-1">{item.label}</h3>
                <p className="text-xs text-neutral-400">{item.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Editorial / Story Section ─────────────────────────────────── */}
      <AnimatedSection>
        <section className="py-16 md:py-24 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1520975916090-2f49ff8b957d?auto=format&fit=crop&w=800&q=80"
                alt="RIFT brand story"
                className="w-full aspect-[4/5] object-cover rounded-lg"
              />
              <div className="absolute -bottom-6 -right-6 bg-brand-gold text-white p-6 rounded-lg hidden md:block">
                <p className="font-serif text-3xl font-bold">10+</p>
                <p className="text-xs mt-1 font-medium uppercase tracking-wide">Years of Craft</p>
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-gold">Our Story</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-black dark:text-white mt-3 mb-6 leading-snug">
                Clothing That Speaks Before You Do
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                At RIFT, we believe that great style is not about trends — it's about confidence. Every piece in our collection is designed to help you move through the world with purpose and poise.
              </p>
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed mb-10">
                We partner with artisans and factories that share our commitment to quality and sustainability. From the cotton fields of Egypt to the workshops of Portugal, every garment tells a story of craft and intention.
              </p>
              <Link to="/shop">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-12 px-8 bg-black dark:bg-white text-white dark:text-black text-sm font-semibold tracking-wider uppercase hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center gap-2"
                >
                  Explore the Collection <ArrowRight size={16} />
                </motion.button>
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <AnimatedSection>
        <section className="py-16 md:py-24 bg-neutral-950 text-white">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-brand-gold text-xs font-semibold tracking-widest uppercase">Reviews</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mt-2">What Our Customers Say</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {[
                { name: 'James O.', location: 'London, UK', rating: 5, text: 'The quality is absolutely unmatched. The Oxford shirt I ordered fits perfectly and the fabric is incredibly soft. RIFT is now my go-to brand.' },
                { name: 'Marco R.', location: 'Milan, Italy', rating: 5, text: 'I\'ve ordered from many premium brands but RIFT delivers something special. The attention to detail in the stitching and the cut is exceptional.' },
                { name: 'Alex K.', location: 'New York, USA', rating: 5, text: 'The leather biker jacket is worth every penny. I get compliments every time I wear it. Fast shipping and beautiful packaging too.' },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-50px' }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{
                    default: { duration: 0.55, delay: i * 0.14, ease: [0.25, 0.46, 0.45, 0.94] },
                    y: { type: 'spring', stiffness: 260, damping: 22 },
                    scale: { type: 'spring', stiffness: 260, damping: 22 },
                  }}
                  style={{ borderRadius: 8 }}
                >
                  <div
                    style={{
                      filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.35))',
                      transition: 'filter 0.35s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.filter =
                        'drop-shadow(0 0 20px rgba(196,163,90,0.45)) drop-shadow(0 16px 36px rgba(0,0,0,0.5))'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.filter =
                        'drop-shadow(0 4px 20px rgba(0,0,0,0.35))'
                    }}
                  >
                      <div className="bg-neutral-900 p-7 sm:p-8 rounded-lg relative overflow-hidden">
                        {/* Subtle gold corner accent */}
                        <div className="absolute top-0 right-0 w-16 h-16 opacity-10"
                          style={{ background: 'radial-gradient(circle at top right, #C4A35A, transparent 70%)' }} />
                        <div className="flex text-brand-gold mb-4 text-base tracking-wide">
                          {'★'.repeat(t.rating)}
                        </div>
                        <p className="text-neutral-300 leading-relaxed text-sm mb-6 italic">"{t.text}"</p>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold text-sm font-bold flex-shrink-0">
                            {t.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{t.name}</p>
                            <p className="text-neutral-500 text-xs">{t.location}</p>
                          </div>
                        </div>
                      </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Instagram / Social Feed ───────────────────────────────────── */}
      <AnimatedSection>
        <section className="py-16 md:py-24 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-gold">Follow Us</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-black dark:text-white mt-2">@rift.official</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[
              'photo-1490481651871-ab68de25d43d',
              'photo-1515886657613-9f3515b0c78f',
              'photo-1542291026-7eec264c27ff',
              'photo-1556821840-3a63f15732ce',
              'photo-1551028719-00167b16eac5',
              'photo-1596755094514-f87e34085b2c',
            ].map((id, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-30px' }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                transition={{
                  default: { duration: 0.45, delay: i * 0.06, ease: 'easeOut' },
                  scale: { type: 'spring', stiffness: 300, damping: 22 },
                }}
                className="group relative overflow-hidden aspect-square rounded-sm cursor-pointer"
                style={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  transition: 'box-shadow 0.3s ease',
                }}
                onHoverStart={(e) => {
                  (e.target as HTMLElement).style.boxShadow = '0 12px 36px rgba(0,0,0,0.35)'
                }}
                onHoverEnd={(e) => {
                  (e.target as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'
                }}
              >
                <img
                  src={`https://images.unsplash.com/${id}?auto=format&fit=crop&w=300&q=80`}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-115"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-semibold uppercase tracking-widest">View</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </AnimatedSection>
    </div>
  )
}
