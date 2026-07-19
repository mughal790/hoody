import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import Modal from '../ui/Modal'

interface ProductImageGalleryProps {
  images: string[]
  name: string
}

export default function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const prev = () => setActive((a) => (a === 0 ? images.length - 1 : a - 1))
  const next = () => setActive((a) => (a === images.length - 1 ? 0 : a + 1))

  return (
    <>
      <div className="flex gap-3 md:gap-4">
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="hidden sm:flex flex-col gap-2 w-16 shrink-0">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`aspect-square rounded overflow-hidden border-2 transition-all ${i === active ? 'border-black dark:border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={`${img}?auto=format&fit=crop&w=80&q=70`} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="flex-1 relative group">
          <div className="relative aspect-[3/4] bg-neutral-50 dark:bg-dark-card rounded-lg overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                src={`${images[active]}?auto=format&fit=crop&w=800&q=85`}
                alt={`${name} - image ${active + 1}`}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Zoom button */}
            <button
              onClick={() => setLightbox(true)}
              className="absolute top-3 right-3 w-9 h-9 bg-white/90 dark:bg-dark-card/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              <ZoomIn size={16} />
            </button>

            {/* Arrows */}
            {images.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 dark:bg-dark-card/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 dark:bg-dark-card/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* Mobile dots */}
          {images.length > 1 && (
            <div className="flex sm:hidden justify-center gap-1.5 mt-3">
              {images.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`rounded-full transition-all ${i === active ? 'w-5 h-1.5 bg-black dark:bg-white' : 'w-1.5 h-1.5 bg-neutral-300 dark:bg-neutral-600'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <Modal isOpen={lightbox} onClose={() => setLightbox(false)} size="full">
        <div className="relative aspect-[3/4] max-h-[80vh]">
          <img
            src={`${images[active]}?auto=format&fit=crop&w=1200&q=90`}
            alt={name}
            className="w-full h-full object-contain"
          />
          {images.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-dark-card rounded-full flex items-center justify-center shadow"><ChevronLeft size={20} /></button>
              <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-dark-card rounded-full flex items-center justify-center shadow"><ChevronRight size={20} /></button>
            </>
          )}
        </div>
      </Modal>
    </>
  )
}
