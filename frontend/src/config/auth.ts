/**
 * Centralized Authentication Configuration
 * Endpoints and Base URL are environment-driven and can be configured via .env
 * when backend contracts are confirmed by the Django team.
 */

export const AUTH_CONFIG = {
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:8000',
  endpoints: {
    login: import.meta.env.VITE_AUTH_LOGIN_ENDPOINT || '/api/v1/auth/login',
    register: import.meta.env.VITE_AUTH_REGISTER_ENDPOINT || '/api/v1/auth/register',
    refresh: import.meta.env.VITE_AUTH_REFRESH_ENDPOINT || '/api/v1/auth/refresh',
    logout: import.meta.env.VITE_AUTH_LOGOUT_ENDPOINT || '/api/v1/auth/logout',
    me: import.meta.env.VITE_AUTH_ME_ENDPOINT || '/api/v1/me',
  },
  cookieName: {
    csrf: 'csrftoken',
    refresh: 'refresh_token',
  },
} as const

