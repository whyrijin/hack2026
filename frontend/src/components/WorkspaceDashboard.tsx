import React, { useState } from 'react'
import { useAuth } from '../context/useAuth.ts'
import { BrandLogo } from './BrandLogo.tsx'
import { RoleProtectedRoute } from './ProtectedRoute.tsx'
import { AdminDashboard } from './admin/AdminDashboard.tsx'
import { CustomerDirectory } from './customers/CustomerDirectory.tsx'
import { StaffOperations } from './customers/StaffOperations.tsx'
import { AdminGovernance } from './customers/AdminGovernance.tsx'
import { ReportsView } from './reports/ReportsView.tsx'
import { SubscriptionWorkspace } from './SubscriptionWorkspace.tsx'
import { CustomerPortal } from './portal/CustomerPortal.tsx'
import type { UserRole } from '../types/auth.ts'
import {
  LogOut,
  LayoutDashboard,
  Users,
  Layers,
  BarChart3,
  ShieldCheck,
  Headphones,
  Eye,
  Loader2,
} from 'lucide-react'

type WorkspaceTab =
  | 'dashboard'
  | 'customers'
  | 'subscriptions'
  | 'staff'
  | 'reports'
  | 'governance'
  | 'portal'

export const WorkspaceDashboard: React.FC = () => {
  const { user, role, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const currentRole = (role || 'admin') as UserRole

  // Default to Customer Portal for customer role, or Admin Dashboard for staff/admin
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(() => {
    return currentRole === 'customer' ? 'portal' : 'dashboard'
  })

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  // If customer is logged in and on portal tab, render pure Customer Portal
  if (currentRole === 'customer' && activeTab === 'portal') {
    return <CustomerPortal />
  }

  const displayName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'Administrator'
  const userInitials = (displayName.charAt(0) || 'A').toUpperCase()

  const roleBadgeStyles: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    staff: 'bg-blue-100 text-[#4965F5] border-blue-200',
    customer: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }

  return (
    <div className="min-h-screen w-full bg-[#F7F9FC] text-[#172033] flex flex-col">
      {/* ========================================================= */}
      {/* TOP HEADER NAVIGATION BAR                                 */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB] shadow-xs px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BrandLogo variant="light" size="md" showBadge />
          <span className="hidden md:inline-block h-5 w-[1px] bg-slate-200" />
          <span className="hidden md:inline-block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Enterprise Console
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Role badge */}
          <span
            className={`capitalize text-xs font-bold px-2.5 py-1 rounded-full border ${
              roleBadgeStyles[currentRole]
            }`}
          >
            {currentRole} Access
          </span>

          {/* User profile capsule */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-[#4965F5] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {userInitials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#172033] leading-none">{displayName}</span>
              <span className="text-[11px] text-slate-500 leading-none mt-0.5">
                {user?.email || 'admin@brightloop.io'}
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-semibold text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
            title="Log out of BrightLoop"
          >
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN CONTAINER & ROLE-BASED TABS                          */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 border-b border-[#E5E7EB] pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'customers'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customer Directory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'subscriptions'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Subscriptions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Reports &amp; Metrics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'staff'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Staff Queue</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('governance')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'governance'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Governance</span>
          </button>

          {/* Customer Portal Preview Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('portal')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ml-auto ${
              activeTab === 'portal'
                ? 'bg-[#4965F5] text-white shadow-xs'
                : 'text-[#4965F5] bg-[#4965F5]/10 hover:bg-[#4965F5]/20'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Customer Portal View</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB CONTENTS                                              */}
        {/* ========================================================= */}
        {/* 1. Admin Dashboard */}
        {activeTab === 'dashboard' && (
          <RoleProtectedRoute
            roles={['staff', 'admin']}
            onAccessDenied={() => setActiveTab('customers')}
          >
            <AdminDashboard />
          </RoleProtectedRoute>
        )}

        {/* 2. Customer Management Directory */}
        {activeTab === 'customers' && (
          <RoleProtectedRoute
            roles={['customer', 'staff', 'admin']}
            onAccessDenied={() => setActiveTab('dashboard')}
          >
            <CustomerDirectory />
          </RoleProtectedRoute>
        )}

        {/* 3. Subscriptions Workspace */}
        {activeTab === 'subscriptions' && (
          <RoleProtectedRoute
            roles={['staff', 'admin']}
            onAccessDenied={() => setActiveTab('customers')}
          >
            <SubscriptionWorkspace />
          </RoleProtectedRoute>
        )}

        {/* 4. Reports & Metrics */}
        {activeTab === 'reports' && (
          <RoleProtectedRoute
            roles={['staff', 'admin']}
            onAccessDenied={() => setActiveTab('customers')}
          >
            <ReportsView />
          </RoleProtectedRoute>
        )}

        {/* 5. Staff Operations Queue */}
        {activeTab === 'staff' && (
          <RoleProtectedRoute
            roles={['staff', 'admin']}
            onAccessDenied={() => setActiveTab('customers')}
          >
            <StaffOperations />
          </RoleProtectedRoute>
        )}

        {/* 6. Admin Governance Audit Trail */}
        {activeTab === 'governance' && (
          <RoleProtectedRoute
            roles={['admin']}
            onAccessDenied={() => setActiveTab('dashboard')}
          >
            <AdminGovernance />
          </RoleProtectedRoute>
        )}

        {/* 7. Customer Portal View */}
        {activeTab === 'portal' && (
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <CustomerPortal />
          </div>
        )}
      </main>
    </div>
  )
}
