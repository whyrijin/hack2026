import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AUTH_CONFIG } from '../config/auth.ts'

// Access token held strictly in memory for security against XSS attacks
let inMemoryAccessToken: string | null = null

export const getAccessToken = (): string | null => inMemoryAccessToken

export const setAccessToken = (token: string | null): void => {
  inMemoryAccessToken = token
}

/**
 * Extracts Django CSRF cookie if present
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: AUTH_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for HttpOnly refresh cookie exchange
  timeout: 15000,
})

// Queue mechanism for handling concurrent requests during token refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else if (token) {
      promise.resolve(token)
    }
  })
  failedQueue = []
}

// Request Interceptor: Attach in-memory Access Token & CSRF Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Attach CSRF token on mutating requests if present in cookies
    const csrfToken = getCookie(AUTH_CONFIG.cookieName.csrf)
    if (csrfToken && config.headers) {
      config.headers['X-CSRFToken'] = csrfToken
    }

    return config
  },
  (error: unknown) => Promise.reject(error),
)

// Response Interceptor: Automatic 401 handling via refresh endpoint
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(error)
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status
    const url = originalRequest.url || ''

    // Do not attempt refresh on auth endpoints to avoid infinite loops
    const isAuthEndpoint =
      url.includes(AUTH_CONFIG.endpoints.login) ||
      url.includes(AUTH_CONFIG.endpoints.register) ||
      url.includes(AUTH_CONFIG.endpoints.refresh)

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
            }
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshResponse = await axios.post<{
          access_token?: string
          access?: string
        }>(
          `${AUTH_CONFIG.baseURL}${AUTH_CONFIG.endpoints.refresh}`,
          {},
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              ...(getCookie(AUTH_CONFIG.cookieName.csrf)
                ? { 'X-CSRFToken': getCookie(AUTH_CONFIG.cookieName.csrf) as string }
                : {}),
            },
          },
        )

        const newToken = refreshResponse.data.access_token || refreshResponse.data.access
        if (newToken) {
          setAccessToken(newToken)
          processQueue(null, newToken)
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return apiClient(originalRequest)
        } else {
          throw new Error('Refresh response did not provide an access token')
        }
      } catch (refreshErr) {
        setAccessToken(null)
        processQueue(refreshErr, null)
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
