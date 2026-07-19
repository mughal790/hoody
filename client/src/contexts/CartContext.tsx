import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import type { CartItem, Product } from '../types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; size: string; color: string; quantity?: number }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_QTY'; id: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD'; items: CartItem[] }

interface CartContextType extends CartState {
  addItem: (product: Product, size: string, color: string, quantity?: number) => void
  removeItem: (id: string) => void
  updateQty: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIdx = state.items.findIndex(
        (i) => i.product.id === action.product.id && i.size === action.size && i.color === action.color
      )
      if (existingIdx >= 0) {
        const items = [...state.items]
        items[existingIdx] = {
          ...items[existingIdx],
          quantity: items[existingIdx].quantity + (action.quantity || 1),
        }
        return { ...state, items }
      }
      const newItem: CartItem = {
        id: `${action.product.id}-${action.size}-${action.color}-${Date.now()}`,
        product: action.product,
        size: action.size,
        color: action.color,
        quantity: action.quantity || 1,
      }
      return { ...state, items: [...state.items, newItem] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) }
    case 'UPDATE_QTY':
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.id !== action.id) }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      }
    case 'CLEAR':
      return { ...state, items: [] }
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }
    case 'OPEN_CART':
      return { ...state, isOpen: true }
    case 'CLOSE_CART':
      return { ...state, isOpen: false }
    case 'LOAD':
      return { ...state, items: action.items }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false })

  useEffect(() => {
    const saved = localStorage.getItem('hoody-cart')
    if (saved) {
      try {
        dispatch({ type: 'LOAD', items: JSON.parse(saved) })
      } catch {
        // ignore
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('hoody-cart', JSON.stringify(state.items))
  }, [state.items])

  useEffect(() => {
    if (state.isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [state.isOpen])

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem: (p, s, c, q) => dispatch({ type: 'ADD_ITEM', product: p, size: s, color: c, quantity: q }),
        removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', id }),
        updateQty: (id, q) => dispatch({ type: 'UPDATE_QTY', id, quantity: q }),
        clearCart: () => dispatch({ type: 'CLEAR' }),
        toggleCart: () => dispatch({ type: 'TOGGLE_CART' }),
        openCart: () => dispatch({ type: 'OPEN_CART' }),
        closeCart: () => dispatch({ type: 'CLOSE_CART' }),
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
