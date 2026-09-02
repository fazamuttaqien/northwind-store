import { useAuth } from '@clerk/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { apiFetch } from '../lib/api'
import type {
  MeResponse,
  Product,
  ProductListResponse,
  ProductPatch,
  ProductInput,
  SaveProductVariables,
} from '../types'

export function useAdminProductsPage() {
  const { getToken, isSignedIn } = useAuth()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const { data: meData } = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: () => apiFetch<MeResponse>('/api/me', { getToken }),
    enabled: isSignedIn,
  })

  const isAdmin = meData?.user?.role === 'admin'

  const { data, isLoading } = useQuery<ProductListResponse>({
    queryKey: ['admin', 'products'],
    queryFn: () =>
      apiFetch<ProductListResponse>('/api/admin/products', { getToken }),
    enabled: isSignedIn && isAdmin,
  })

  const saveMutation = useMutation<unknown, Error, SaveProductVariables>({
    mutationFn: async ({ body, id }: SaveProductVariables) => {
      if (id) {
        return apiFetch<unknown, ProductPatch>(`/api/admin/products/${id}`, {
          getToken,
          method: 'PATCH',
          body: body as ProductPatch,
        })
      }
      return apiFetch<unknown, ProductInput>('/api/admin/products', {
        getToken,
        method: 'POST',
        body: body as ProductInput,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product-categories'] })
      setModalOpen(false)
      setEditing(null)
    },
  })

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: (productId: string) =>
      apiFetch<unknown>(`/api/admin/products/${productId}`, {
        getToken,
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product-categories'] })
    },
    onError: (err: Error) => window.alert(err.message),
  })

  return {
    getToken,
    isSignedIn,
    meData,
    modalOpen,
    setModalOpen,
    editing,
    setEditing,
    products: data?.products ?? [],
    isLoading,
    saveMutation,
    deleteMutation,
  }
}
