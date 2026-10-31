import React from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../context/useAuth.ts'
import { BrandLogo } from './BrandLogo.tsx'
import type { UserRole } from '../types/auth.ts'
import { Loader2, ShieldAlert, ArrowLeft } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  fallback?: ReactNode
  onAccessDenied?: () => void
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallback,
  onAccessDenied,
}) => {
  const { isAuthenticated, isLoading, role, user } = useAuth()

  // 1. Loading state during session verification
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F7F9FC] text-[#172033] p-4">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <BrandLogo variant="light" size="lg" />
          <div className="flex items-center gap-2.5 text-slate-500 text-sm font-medium mt-2">
            <Loader2 className="w-5 h-5 text-[#4965F5] animate-spin" />
            <span>Verifying secure workspace session...</span>
          </div>
        </div>
      </div>
    )
  }

  // 2. Authentication check
  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null
  }

  // 3. Role-based check (Admin, Staff, Customer)
  if (allowedRoles && allowedRoles.length > 0) {
    const isAuthorized = role && allowedRoles.includes(role)
    if (!isAuthorized) {
      if (fallback) {
        return <>{fallback}</>
      }

      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F7F9FC] text-[#172033] p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-[#E5E7EB] shadow-xl p-8 text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold text-[#172033]">Access Restricted</h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              You do not have permission to view this resource.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-left space-y-1">
              <div>
                <span className="text-slate-500">Account: </span>
                <span className="font-semibold text-slate-700">{user?.email}</span>
              </div>
              <div>
                <span className="text-slate-500">Assigned Role: </span>
                <span className="font-semibold capitalize text-amber-700">{role || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-slate-500">Required Role: </span>
                <span className="font-semibold capitalize text-[#4965F5]">
                  {allowedRoles.join(' or ')}
                </span>
              </div>
            </div>

            {onAccessDenied && (
              <button
                type="button"
                onClick={onAccessDenied}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#4965F5] hover:bg-[#3852de] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Workspace</span>
              </button>
            )}
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

/**
 * Convenience wrapper specifically for role-enforced sections
 */
export const RoleProtectedRoute: React.FC<{
  roles: UserRole[]
  children: ReactNode
  fallback?: ReactNode
  onAccessDenied?: () => void
}> = ({ roles, children, fallback, onAccessDenied }) => (
  <ProtectedRoute allowedRoles={roles} fallback={fallback} onAccessDenied={onAccessDenied}>
    {children}
  </ProtectedRoute>
)
