import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'new' | 'sale' | 'featured' | 'gold' | 'outline'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-neutral-100 text-neutral-700 dark:bg-dark-card dark:text-neutral-300',
    new: 'bg-black text-white dark:bg-white dark:text-black',
    sale: 'bg-red-600 text-white',
    featured: 'bg-brand-gold text-white',
    gold: 'border border-brand-gold text-brand-gold bg-transparent',
    outline: 'border border-current bg-transparent',
  }

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 text-xs font-semibold tracking-wider uppercase', variants[variant], className)}>
      {children}
    </span>
  )
}
