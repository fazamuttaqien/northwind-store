import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { ProductResponse } from '../types'

export function useProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading, error } = useQuery<ProductResponse>({
    queryKey: ['product', slug],
    queryFn: () =>
      apiFetch<ProductResponse>(
        `/api/products/${encodeURIComponent(slug ?? '')}`,
      ),
    enabled: Boolean(slug),
  })
  return { slug, product: data?.product ?? null, isLoading, error }
}
