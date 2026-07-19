import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { Toast as ToastType, ToastType as ToastKind } from '../../types'

interface ToastContextType {
  toast: (message: string, type?: ToastKind, duration?: number) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([])

  const addToast = useCallback((message: string, type: ToastKind = 'info', duration = 3500) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, type, message, duration }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration)
  }, [])

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const icons = {
    success: <CheckCircle size={18} className="text-green-500" />,
    error: <XCircle size={18} className="text-red-500" />,
    info: <Info size={18} className="text-blue-500" />,
    warning: <AlertTriangle size={18} className="text-amber-500" />,
  }

  const borders = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    info: 'border-l-blue-500',
    warning: 'border-l-amber-500',
  }

  return (
    <ToastContext.Provider value={{
      toast: addToast,
      success: (m) => addToast(m, 'success'),
      error: (m) => addToast(m, 'error'),
      info: (m) => addToast(m, 'info'),
      warning: (m) => addToast(m, 'warning'),
    }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              className={cn(
                'flex items-start gap-3 bg-white dark:bg-dark-card shadow-luxury rounded p-4 border-l-4',
                borders[t.type]
              )}
            >
              <span className="mt-0.5 shrink-0">{icons[t.type]}</span>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 flex-1">{t.message}</p>
              <button onClick={() => removeToast(t.id)} className="text-neutral-300 hover:text-neutral-600 dark:hover:text-neutral-100">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
