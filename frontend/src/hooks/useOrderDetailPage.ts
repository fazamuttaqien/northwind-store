import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/react'
import { apiFetch } from '../lib/api'
import type { OrderDetailResponse } from '../types'

export function useOrderDetailPage() {
  const { id } = useParams()
  const { getToken } = useAuth()

  const { data, isLoading, error } = useQuery<OrderDetailResponse>({
    queryKey: ['order', id],
    queryFn: () =>
      apiFetch<OrderDetailResponse>(`/api/orders/${id}`, { getToken }),
    enabled: Boolean(id),
  })

  const order = data?.order ?? null
  const items = data?.items ?? []
  const paid = order?.status === 'paid'

  return {
    id,
    order,
    items,
    paid,
    isLoading,
    error,
  }
}
