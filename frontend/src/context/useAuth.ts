import { useContext } from 'react'
import { AuthContext } from './authContextInstance.ts'
import type { AuthContextValue } from '../types/auth.ts'

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
