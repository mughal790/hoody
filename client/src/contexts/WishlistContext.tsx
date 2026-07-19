import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import type { Product } from '../types'

interface WishlistState {
  items: Product[]
}

type WishlistAction =
  | { type: 'ADD'; product: Product }
  | { type: 'REMOVE'; id: string }
  | { type: 'TOGGLE'; product: Product }
  | { type: 'LOAD'; items: Product[] }

interface WishlistContextType extends WishlistState {
  addItem: (product: Product) => void
  removeItem: (id: string) => void
  toggleItem: (product: Product) => void
  isWishlisted: (id: string) => boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

function reducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'ADD':
      if (state.items.find((i) => i.id === action.product.id)) return state
      return { items: [...state.items, action.product] }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.id !== action.id) }
    case 'TOGGLE':
      return state.items.find((i) => i.id === action.product.id)
        ? { items: state.items.filter((i) => i.id !== action.product.id) }
        : { items: [...state.items, action.product] }
    case 'LOAD':
      return { items: action.items }
    default:
      return state
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] })

  useEffect(() => {
    const saved = localStorage.getItem('hoody-wishlist')
    if (saved) {
      try { dispatch({ type: 'LOAD', items: JSON.parse(saved) }) } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('hoody-wishlist', JSON.stringify(state.items))
  }, [state.items])

  return (
    <WishlistContext.Provider
      value={{
        ...state,
        addItem: (p) => dispatch({ type: 'ADD', product: p }),
        removeItem: (id) => dispatch({ type: 'REMOVE', id }),
        toggleItem: (p) => dispatch({ type: 'TOGGLE', product: p }),
        isWishlisted: (id) => !!state.items.find((i) => i.id === id),
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider')
  return ctx
}
