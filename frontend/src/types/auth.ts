export type UserRole = 'admin' | 'staff' | 'customer'

export interface User {
  id: string | number
  email: string
  full_name?: string
  name?: string
  role?: UserRole | string
  is_staff?: boolean
  is_superuser?: boolean
  is_active?: boolean
  created_at?: string
  [key: string]: unknown
}

export interface LoginPayload {
  email: string
  password: string
  remember_me?: boolean
}

export interface RegisterPayload {
  full_name: string
  email: string
  password: string
}

export interface AuthResponse {
  access_token?: string
  access?: string
  user?: User
  detail?: string
  message?: string
  [key: string]: unknown
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<boolean>
  hasRole: (roles: UserRole | UserRole[]) => boolean
}

export interface ApiErrorDetail {
  message: string
  fieldErrors?: Record<string, string[]>
  statusCode?: number
}
