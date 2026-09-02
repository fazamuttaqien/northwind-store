import * as Sentry from '@sentry/react'
import type { ApiFetchOptions } from '../types'

const raw = import.meta.env.VITE_API_URL
const base = typeof raw === 'string' ? raw.replace(/\/+$/, '') : ''

export async function apiFetch<TResponse, TBody = unknown>(
  path: string,
  opts: ApiFetchOptions<TBody> = {},
): Promise<TResponse> {
  const { getToken, method = 'GET', body, signal } = opts
  const headers: HeadersInit = { 'Content-Type': 'application/json' }

  if (getToken) {
    const token = await getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error: unknown) {
    Sentry.addBreadcrumb({
      category: 'api',
      message: `${method} ${path}`,
      level: 'error',
      data: { network: true },
    })
    Sentry.captureException(error, {
      tags: { 'api.fetch': 'network' },
      extra: { path, method },
    })
    throw error
  }

  const data: unknown = await res.json()
  Sentry.addBreadcrumb({
    category: 'api',
    message: `${method} ${path}`,
    level: res.ok ? 'info' : 'warning',
    data: { status: res.status },
  })

  if (!res.ok) {
    const record =
      typeof data === 'object' && data !== null
        ? (data as Record<string, unknown>)
        : {}
    const msg =
      typeof record.error === 'string'
        ? record.error
        : res.statusText || 'Request failed'
    const error = new Error(msg)
    if (res.status >= 500)
      Sentry.captureException(error, {
        tags: { 'api.fetch': 'http', 'http.status': String(res.status) },
        extra: { path, method, status: res.status },
      })
    throw error
  }

  return data as TResponse
}
