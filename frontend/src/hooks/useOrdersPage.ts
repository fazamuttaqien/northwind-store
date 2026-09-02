import { useAuth } from '@clerk/react'
import { apiFetch } from '../lib/api'
import { useQuery } from '@tanstack/react-query'
import type { OrdersResponse, MeResponse } from '../types'

function useOrdersPage() {
  const { getToken, isSignedIn } = useAuth()

  const { data, isLoading, error } = useQuery<OrdersResponse>({
    queryKey: ['orders'],
    queryFn: () => apiFetch<OrdersResponse>('/api/orders', { getToken }),
    enabled: isSignedIn,
  })

  const { data: meData } = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: () => apiFetch<MeResponse>('/api/me', { getToken }),
    enabled: isSignedIn,
  })

  const staff =
    meData?.user?.role === 'support' || meData?.user?.role === 'admin'

  const orders = data?.orders ?? []

  return {
    isLoading,
    error,
    orders,
    staff,
  }
}

export default useOrdersPage
