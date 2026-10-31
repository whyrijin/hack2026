/** Same-origin API paths by default; an optional backend origin can be set at build time. */

const configuredBaseURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || ''
const endpoint = (value: string) => `${value.replace(/\/+$/, '')}/`

export const AUTH_CONFIG = {
  // Accept either the backend origin or an origin ending in /api/v1.
  baseURL: configuredBaseURL.replace(/\/api\/v1\/?$/, '').replace(/\/$/, ''),
  apiPrefix: '/api/v1',
  endpoints: {
    login: endpoint(import.meta.env.VITE_AUTH_LOGIN_ENDPOINT || '/api/v1/auth/login/'),
    register: endpoint(import.meta.env.VITE_AUTH_REGISTER_ENDPOINT || '/api/v1/auth/register/'),
    refresh: endpoint(import.meta.env.VITE_AUTH_REFRESH_ENDPOINT || '/api/v1/auth/refresh/'),
    logout: endpoint(import.meta.env.VITE_AUTH_LOGOUT_ENDPOINT || '/api/v1/auth/logout/'),
    me: endpoint(import.meta.env.VITE_AUTH_ME_ENDPOINT || '/api/v1/me/'),
  },
  cookieName: {
    csrf: 'csrftoken',
    refresh: 'refresh_token',
  },
} as const

