import { useSearchParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { ProductCategoriesResponse, ProductListResponse } from '../types'

export function useHomeCatalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryFilter = searchParams.get('category')?.trim() ?? ''
  const setCategory = (category: string) => {
    const next = new URLSearchParams(searchParams)
    if (!category) next.delete('category')
    else next.set('category', category)
    setSearchParams(next, { replace: true })
  }

  const { data: categoriesData, isLoading: loadingCategories } =
    useQuery<ProductCategoriesResponse>({
      queryKey: ['product-categories'],
      queryFn: () =>
        apiFetch<ProductCategoriesResponse>('/api/products/categories'),
    })
  const {
    data: productsData,
    isLoading: loadingList,
    error,
  } = useQuery<ProductListResponse>({
    queryKey: ['products', categoryFilter],
    queryFn: () =>
      apiFetch<ProductListResponse>(
        categoryFilter
          ? `/api/products?category=${encodeURIComponent(categoryFilter)}`
          : '/api/products',
      ),
  })
  const categories = categoriesData?.categories ?? []
  const products = productsData?.products ?? []
  return {
    categoryFilter,
    setCategory,
    categories,
    products,
    categoryChipsLoading: loadingCategories && categories.length === 0,
    loadingCategories,
    loadingList,
    error,
  }
}
