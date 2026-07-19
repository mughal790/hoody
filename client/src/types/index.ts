export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
}

export interface ProductVariant {
  size: string
  color: string
  stock: number
}

export interface Product {
  id: string
  category_id: string
  category?: Category
  name: string
  slug: string
  description: string
  price: number
  original_price?: number
  sku: string
  stock_quantity: number
  images: string[]
  sizes: string[]
  colors: string[]
  tags: string[]
  is_featured: boolean
  is_new: boolean
  is_sale: boolean
  rating: number
  review_count: number
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  size: string
  color: string
}

export interface WishlistItem {
  id: string
  product: Product
  created_at: string
}

export interface OrderItem {
  id: string
  product: Product
  quantity: number
  price: number
  size: string
  color: string
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  shipping_address: ShippingAddress
  payment_method: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  tracking_number?: string
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface ShippingAddress {
  full_name: string
  email: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  user_name: string
  user_avatar?: string
  rating: number
  title: string
  body: string
  is_verified: boolean
  created_at: string
}

export interface UserProfile {
  id: string
  full_name?: string
  avatar_url?: string
  phone?: string
  email: string
}

export interface FilterState {
  category?: string
  minPrice?: number
  maxPrice?: number
  sizes?: string[]
  colors?: string[]
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular'
  search?: string
  onSale?: boolean
  isNew?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}
