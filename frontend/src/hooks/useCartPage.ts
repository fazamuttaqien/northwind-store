import { useAuth } from '@clerk/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useCart } from '../store/cart'
import { apiFetch } from '../lib/api'
import type { CheckoutResponse, ProductListResponse } from '../types'

export default function useCartPage() {
  const { getToken } = useAuth()
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false)
  const items = useCart((state) => state.items)
  const setQty = useCart((state) => state.setQty)
  const removeItem = useCart((state) => state.removeItem)
  const {
    data,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery<ProductListResponse>({
    queryKey: ['products'],
    queryFn: () => apiFetch<ProductListResponse>('/api/products'),
    enabled: items.length > 0,
  })
  const products = data?.products ?? []
  const byId = new Map(products.map((product) => [product.id, product]))
  const lines = items.map((line) => ({
    line,
    product: byId.get(line.productId) ?? null,
  }))
  const subtotal = lines.reduce(
    (sum, { line, product }) =>
      product ? sum + product.priceCents * line.quantity : sum,
    0,
  )

  async function checkout(): Promise<void> {
    setCheckoutLoading(true)
    try {
      const res = await apiFetch<CheckoutResponse, { items: typeof items }>(
        '/api/checkout',
        {
          getToken,
          method: 'POST',
          body: { items },
        },
      )
      if (res.checkoutUrl) window.location.assign(res.checkoutUrl)
    } finally {
      setCheckoutLoading(false)
    }
  }
  return {
    items,
    setQty,
    removeItem,
    productsLoading,
    productsError,
    lines,
    subtotal,
    checkout,
    checkoutLoading,
  }
}
