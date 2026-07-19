import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-black text-white hover:bg-neutral-800 focus:ring-black dark:bg-white dark:text-black dark:hover:bg-neutral-100 dark:focus:ring-white',
      secondary: 'bg-neutral-100 text-black hover:bg-neutral-200 focus:ring-neutral-300 dark:bg-dark-card dark:text-white dark:hover:bg-dark-border dark:focus:ring-dark-border',
      outline: 'border border-black text-black bg-transparent hover:bg-black hover:text-white focus:ring-black dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black dark:focus:ring-white',
      ghost: 'text-black bg-transparent hover:bg-neutral-100 focus:ring-neutral-200 dark:text-white dark:hover:bg-dark-card dark:focus:ring-dark-border',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      gold: 'bg-brand-gold text-white hover:bg-brand-gold-dark focus:ring-brand-gold',
    }

    const sizes = {
      xs: 'h-7 px-3 text-xs rounded',
      sm: 'h-9 px-4 text-sm rounded',
      md: 'h-11 px-6 text-sm rounded',
      lg: 'h-12 px-8 text-base rounded',
      xl: 'h-14 px-10 text-base rounded',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {children}
          </span>
        ) : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
