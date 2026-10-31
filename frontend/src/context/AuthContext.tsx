import React, { useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { loginApi, registerApi, logoutApi, refreshApi, getCurrentUserApi } from '../api/auth.ts'
import { getAccessToken, setAccessToken } from '../api/client.ts'
import { AuthContext } from './authContextInstance.ts'
import type { User, UserRole, LoginPayload, RegisterPayload, AuthContextValue } from '../types/auth.ts'

/**
 * Resolves role from Django user attributes (role string, is_superuser, is_staff, or customer default)
 */
function resolveUserRole(user: User | null): UserRole | null {
  if (!user) return null

  if (typeof user.role === 'string') {
    const normalized = user.role.toLowerCase()
    if (normalized === 'admin' || normalized === 'administrator') return 'admin'
    if (normalized === 'staff' || normalized === 'employee' || normalized === 'support') return 'staff'
    if (normalized === 'customer' || normalized === 'client' || normalized === 'user') return 'customer'
  }

  if (user.is_superuser) return 'admin'
  if (user.is_staff) return 'staff'

  return 'customer'
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Silent session restore on application load
  const restoreSession = useCallback(async (): Promise<boolean> => {
    try {
      const refreshData = await refreshApi()
      const token = refreshData.access_token || refreshData.access || getAccessToken()
      if (token) {
        setTokenState(token)
        const me = await getCurrentUserApi()
        setUser(me)
        return true
      }
    } catch {
      setAccessToken(null)
      setTokenState(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
    return false
  }, [])

  useEffect(() => {
    let isMounted = true

    const initializeSession = async () => {
      try {
        const refreshData = await refreshApi()
        const token = refreshData.access_token || refreshData.access || getAccessToken()
        if (token && isMounted) {
          setTokenState(token)
          const me = await getCurrentUserApi()
          if (isMounted) {
            setUser(me)
          }
        }
      } catch {
        if (isMounted) {
          setAccessToken(null)
          setTokenState(null)
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void initializeSession()

    return () => {
      isMounted = false
    }
  }, [])

  const login = async (payload: LoginPayload): Promise<void> => {
    const data = await loginApi(payload)
    const token = data.access_token || data.access || getAccessToken()
    setTokenState(token)

    if (data.user) {
      setUser(data.user)
    } else {
      try {
        const me = await getCurrentUserApi()
        setUser(me)
      } catch {
        setUser({ id: 'user', email: payload.email })
      }
    }
  }

  const register = async (payload: RegisterPayload): Promise<void> => {
    const data = await registerApi(payload)
    const token = data.access_token || data.access || getAccessToken()

    if (token) {
      setTokenState(token)
      if (data.user) {
        setUser(data.user)
      } else {
        try {
          const me = await getCurrentUserApi()
          setUser(me)
        } catch {
          setUser({ id: 'new-user', email: payload.email, full_name: payload.full_name })
        }
      }
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await logoutApi()
    } catch {
      // Ignore network errors during logout
    } finally {
      setAccessToken(null)
      setTokenState(null)
      setUser(null)
    }
  }

  const role = resolveUserRole(user)

  const hasRole = useCallback(
    (requiredRoles: UserRole | UserRole[]): boolean => {
      if (!user || !role) return false
      const list = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
      return list.includes(role)
    },
    [user, role],
  )

  const value: AuthContextValue = {
    user,
    accessToken,
    role,
    isAuthenticated: Boolean(user && accessToken),
    isLoading,
    login,
    register,
    logout,
    refreshSession: restoreSession,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
