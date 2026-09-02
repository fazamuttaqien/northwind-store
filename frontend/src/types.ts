export interface Product {
  id: string
  name: string
  slug: string
  description?: string | null
  priceCents: number
  currency: string
  category?: string | null
  imageUrl?: string | null
  imageKitFileId?: string | null
  stock?: number
  active: boolean
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface ProductListResponse {
  products: Product[]
}
export interface ProductResponse {
  product: Product
}
export interface ProductCategoriesResponse {
  categories: string[]
}
export interface CheckoutResponse {
  checkoutUrl?: string
}

export interface User {
  id: string
  role?: string | null
  email?: string | null
  name?: string | null
}

export interface MeResponse {
  user: User
}

export interface ProductInput {
  slug: string
  name: string
  category: string
  description: string
  priceCents: number
  currency: string
  imageUrl: string | null
  imageKitFileId: string | null
  active: boolean
}

export type ProductPatch = Partial<Omit<ProductInput, 'slug'>>

export interface SaveProductVariables {
  id?: string
  body: ProductInput | ProductPatch
}

export interface ApiFetchOptions<TBody = unknown> {
  getToken?: () => Promise<string | null>
  method?: string
  body?: TBody
  signal?: AbortSignal
}

export interface PageErrorAction {
  to: string
  label: string
}

export interface OrderPreviewItem {
  slug: string
  imageUrl?: string | null
  quantity: number
}

export interface Order {
  id: string
  status: 'paid' | 'pending' | 'failed'
  createdAt: string
  totalCents: number
  previewItems: OrderPreviewItem[] | null
}

export interface OrdersResponse {
  orders: Order[]
}

export interface OrderItem {
  id: string
  product: {
    slug: string
    name: string
    imageUrl?: string | null
    category?: string | null
    currency: string
  }
  quantity: number
  unitPriceCents: number
}

export interface OrderDetailContext {
  order: Order
  items: OrderItem[]
  paid: boolean
}

export interface OrderDetailResponse {
  order: Order
  items: OrderItem[]
}
