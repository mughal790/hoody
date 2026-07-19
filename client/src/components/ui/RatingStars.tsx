import { Star } from 'lucide-react'
import { cn } from '../../lib/utils'

interface RatingStarsProps {
  rating: number
  max?: number
  size?: number
  showCount?: boolean
  count?: number
  className?: string
}

export default function RatingStars({ rating, max = 5, size = 14, showCount, count, className }: RatingStarsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(rating)
          const half = !filled && i < rating
          return (
            <Star
              key={i}
              size={size}
              className={cn(
                half ? 'text-brand-gold fill-brand-gold opacity-60' : '',
                filled ? 'text-brand-gold fill-brand-gold' : 'text-neutral-200 dark:text-neutral-700 fill-current'
              )}
            />
          )
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-neutral-500 dark:text-neutral-400">({count})</span>
      )}
    </div>
  )
}
