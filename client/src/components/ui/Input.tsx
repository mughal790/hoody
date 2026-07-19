import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-11 px-4 bg-white dark:bg-dark-card border rounded text-sm transition-colors duration-150',
              'placeholder:text-neutral-400 dark:placeholder:text-neutral-600',
              'focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-neutral-200 dark:border-dark-border',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              'dark:text-white',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
