import React, { useState } from 'react'
import { useAuth } from '../context/useAuth.ts'
import { BrandLogo } from './BrandLogo.tsx'
import { RoleProtectedRoute } from './ProtectedRoute.tsx'
import { SubscriptionWorkspace } from './SubscriptionWorkspace.tsx'
import type { UserRole } from '../types/auth.ts'
import {
  LogOut,
  User,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Layers,
  CheckCircle2,
  Lock,
  Loader2,
  Settings,
} from 'lucide-react'

export const WorkspaceDashboard: React.FC = () => {
  const { user, role, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'customer' | 'staff' | 'admin'>('overview')

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  const displayName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'Subscriber'
  const userInitials = (displayName.charAt(0) || 'U').toUpperCase()

  const roleBadgeStyles: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    staff: 'bg-blue-100 text-[#4965F5] border-blue-200',
    customer: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }

  const currentRole = (role || 'customer') as UserRole

  return (
    <div className="min-h-screen w-full bg-[#F7F9FC] text-[#172033] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB] shadow-xs px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BrandLogo variant="light" size="md" showBadge />
          <span className="hidden md:inline-block h-5 w-[1px] bg-slate-200" />
          <span className="hidden md:inline-block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Workspace Portal
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
              <span className="text-[11px] text-slate-500 leading-none mt-0.5">{user?.email}</span>
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
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Navigation Tabs for Role-Protected Views */}
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customer')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'customer'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Customer Subscriptions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'staff'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Staff Operations
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'admin'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Admin Governance
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Welcome Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-[#101828] to-[#1E2D4A] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#4965F5]/20 blur-3xl pointer-events-none"
                aria-hidden="true"
              />
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4965F5]/20 border border-[#4965F5]/30 text-xs font-semibold text-[#38BDF8] mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authenticated Session Active</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome to BrightLoop, {displayName}!
                </h1>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Your subscription workspace is fully connected with in-memory JWT authentication, HttpOnly
                  refresh token handling, and role-based route protection.
                </p>
              </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                    Monthly Recurring
                  </span>
                  <span className="text-2xl font-black text-[#172033] mt-1 block">$128,450</span>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +24.8% vs last month
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#4965F5] flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                    Active Subscriptions
                  </span>
                  <span className="text-2xl font-black text-[#172033] mt-1 block">4,820</span>
                  <span className="text-xs font-medium text-slate-500 mt-1 block">99.4% renewal rate</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#38BDF8] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                    Billing Engine
                  </span>
                  <span className="text-2xl font-black text-[#172033] mt-1 block">Auto-Pilot</span>
                  <span className="text-xs font-medium text-emerald-600 mt-1 block">Smart Dunning Active</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                    Security Posture
                  </span>
                  <span className="text-2xl font-black text-[#172033] mt-1 block">Protected</span>
                  <span className="text-xs font-medium text-slate-500 mt-1 block">In-Memory + HttpOnly</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Account Metadata Card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-[#4965F5]" />
                <h2 className="text-lg font-bold text-[#172033]">Authenticated Session Credentials</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500 block font-medium">User ID</span>
                  <span className="text-[#172033] font-semibold mt-0.5 block break-all">
                    {String(user?.id ?? 'N/A')}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500 block font-medium">Active Role</span>
                  <span className="capitalize font-semibold text-[#4965F5] mt-0.5 block">
                    {currentRole}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500 block font-medium">Security Strategy</span>
                  <span className="text-emerald-700 font-semibold mt-0.5 block">
                    In-Memory Access Token + HttpOnly Refresh
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Customer Portal (Allowed for customer, staff, admin) */}
        {activeTab === 'customer' && (
          <RoleProtectedRoute
            roles={['customer', 'staff', 'admin']}
            onAccessDenied={() => setActiveTab('overview')}
          >
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 animate-in fade-in space-y-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <CreditCard className="w-5 h-5" />
                <h3 className="text-lg font-bold text-[#172033]">Customer Subscription Portal</h3>
              </div>
              <p className="text-sm text-slate-600">
                Accessible to all authenticated customers, staff, and administrators. View active subscription
                tiers, payment methods, and invoices.
              </p>
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-800">
                Authorized for roles: <strong>Customer, Staff, Admin</strong>. Currently authenticated as:{' '}
                <strong className="capitalize">{currentRole}</strong>.
              </div>
            </div>
          </RoleProtectedRoute>
        )}

        {/* Tab 3: Staff Operations (Allowed for staff and admin only) */}
        {activeTab === 'staff' && (
          <RoleProtectedRoute
            roles={['staff', 'admin']}
            onAccessDenied={() => setActiveTab('overview')}
          >
            <SubscriptionWorkspace />
          </RoleProtectedRoute>
        )}

        {/* Tab 4: Admin Governance (Allowed for admin only) */}
        {activeTab === 'admin' && (
          <RoleProtectedRoute
            roles={['admin']}
            onAccessDenied={() => setActiveTab('overview')}
          >
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 animate-in fade-in space-y-4">
              <div className="flex items-center gap-2 text-purple-600">
                <Settings className="w-5 h-5" />
                <h3 className="text-lg font-bold text-[#172033]">Admin Governance &amp; Security Audits</h3>
              </div>
              <p className="text-sm text-slate-600">
                Administrator console for configuring global pricing catalogs, viewing audit trails, managing API
                keys, and setting organization permissions.
              </p>
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-900">
                Authorized for role: <strong>Admin only</strong>. Currently authenticated as:{' '}
                <strong className="capitalize">{currentRole}</strong>.
              </div>
            </div>
          </RoleProtectedRoute>
        )}
      </main>
    </div>
  )
}
