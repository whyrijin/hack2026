import React, { useState } from 'react'
import { useAuth } from '../../context/useAuth.ts'
import { BrandLogo } from '../BrandLogo.tsx'
import {
  LayoutDashboard,
  Layers,
  FileText,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  Calendar,
  CreditCard,
  Download,
  MapPin,
  Save,
  ShieldCheck,
  Bell,
  ChevronRight,
  Menu,
  X,
  Loader2,
} from 'lucide-react'

type PortalTab = 'dashboard' | 'subscriptions' | 'invoices' | 'profile' | 'settings'

interface CustomerInvoice {
  id: string
  number: string
  issueDate: string
  dueDate: string
  amount: number
  currency: string
  status: 'paid' | 'open' | 'overdue'
  period: string
}

interface CustomerSubscriptionItem {
  id: string
  number: string
  planName: string
  cadence: 'monthly' | 'yearly'
  amount: number
  currency: string
  startDate: string
  nextBillingDate: string
  status: 'active' | 'trialing' | 'paused'
  features: string[]
}

const MOCK_PORTAL_SUBSCRIPTIONS: CustomerSubscriptionItem[] = [
  {
    id: 'sub_01',
    number: 'SUB-2026-0042',
    planName: 'Enterprise Cloud Tier',
    cadence: 'monthly',
    amount: 4500,
    currency: 'USD',
    startDate: 'Jan 15, 2026',
    nextBillingDate: 'Nov 15, 2026',
    status: 'active',
    features: [
      'Unlimited subscription lifecycle audits',
      'Dedicated API integration throughput',
      'Automated daily dunning & retry rules',
      '24/7 Priority SLA phone support',
    ],
  },
  {
    id: 'sub_02',
    number: 'SUB-2026-0089',
    planName: 'Developer Add-On Pack',
    cadence: 'monthly',
    amount: 250,
    currency: 'USD',
    startDate: 'Mar 01, 2026',
    nextBillingDate: 'Nov 15, 2026',
    status: 'active',
    features: ['5 Additional Sandbox seats', 'Custom webhook signing keys'],
  },
]

const MOCK_PORTAL_INVOICES: CustomerInvoice[] = [
  {
    id: 'inv_1042',
    number: 'INV-2026-1042',
    issueDate: 'Oct 15, 2026',
    dueDate: 'Oct 29, 2026',
    amount: 4750,
    currency: 'USD',
    status: 'paid',
    period: 'Oct 15 - Nov 14, 2026',
  },
  {
    id: 'inv_1031',
    number: 'INV-2026-1031',
    issueDate: 'Sep 15, 2026',
    dueDate: 'Sep 29, 2026',
    amount: 4750,
    currency: 'USD',
    status: 'paid',
    period: 'Sep 15 - Oct 14, 2026',
  },
  {
    id: 'inv_1020',
    number: 'INV-2026-1020',
    issueDate: 'Aug 15, 2026',
    dueDate: 'Aug 29, 2026',
    amount: 4500,
    currency: 'USD',
    status: 'paid',
    period: 'Aug 15 - Sep 14, 2026',
  },
  {
    id: 'inv_1055',
    number: 'INV-2026-1055',
    issueDate: 'Oct 28, 2026',
    dueDate: 'Nov 11, 2026',
    amount: 250,
    currency: 'USD',
    status: 'open',
    period: 'Oct 28 - Nov 27, 2026',
  },
]

export const CustomerPortal: React.FC = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<PortalTab>('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Profile Form state
  const [profileData, setProfileData] = useState({
    fullName: user?.full_name || user?.name || 'Sarah Connor',
    email: user?.email || 'sarah.connor@cyberdyne.io',
    phone: '+1 (415) 890-2341',
    company: 'Cyberdyne Systems Inc.',
    addressLine: '100 Industrial Pkwy, Suite 500',
    city: 'Sunnyvale',
    state: 'CA',
    postalCode: '94085',
    country: 'United States',
    taxId: 'US-EIN-94-3829102',
  })

  // Settings State
  const [settings, setSettings] = useState({
    emailInvoices: true,
    renewalReminders: true,
    securityAlerts: true,
    marketingUpdates: false,
    twoFactorEnabled: true,
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    setTimeout(() => {
      setIsSavingProfile(false)
      showToast('Profile and billing contact information updated successfully.')
    }, 600)
  }

  const handleDownloadInvoice = (invNum: string) => {
    showToast(`Downloading receipt for ${invNum} (PDF generated)...`)
  }

  const handleTabClick = (tab: PortalTab) => {
    setActiveTab(tab)
    setIsMobileMenuOpen(false)
  }

  const displayName = profileData.fullName || user?.email?.split('@')[0] || 'Subscriber'
  const initials = displayName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] flex flex-col lg:flex-row">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#101828] text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* SIDEBAR NAVIGATION (DESKTOP & MOBILE DRAWER)              */}
      {/* ========================================================= */}
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <BrandLogo variant="light" size="sm" showBadge />
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-[#101828] text-white flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10">
          <BrandLogo variant="dark" size="md" showBadge />
          <div className="mt-4 px-2 py-1 rounded-md bg-[#4965F5]/20 border border-[#4965F5]/30 text-[11px] font-semibold text-[#38BDF8] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Customer Subscriber Portal</span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <button
            type="button"
            onClick={() => handleTabClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-[#4965F5] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview &amp; Welcome</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('subscriptions')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'subscriptions'
                ? 'bg-[#4965F5] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>My Subscriptions</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('invoices')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'invoices'
                ? 'bg-[#4965F5] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Invoices</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'bg-[#4965F5] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Profile</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'settings'
                ? 'bg-[#4965F5] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Account Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer User Info & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#4965F5] text-white flex items-center justify-center font-bold text-xs">
              {initials}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{displayName}</div>
              <div className="text-[11px] text-slate-400 truncate">{profileData.email}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-300 text-xs font-medium transition-colors border border-white/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close mobile navigation"
          onClick={() => setIsMobileMenuOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
        />
      )}

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA                                         */}
      {/* ========================================================= */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-6xl w-full mx-auto space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW & WELCOME DASHBOARD                       */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Welcome Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-[#101828] via-[#172544] to-[#1E3A8A] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#38BDF8]/15 blur-3xl pointer-events-none"
                aria-hidden="true"
              />
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4965F5]/30 border border-[#4965F5]/40 text-xs font-semibold text-[#38BDF8] mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Enterprise Active Subscription</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {displayName}!
                </h1>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Manage your subscription plans, view upcoming invoice schedules, and update your corporate
                  billing profile.
                </p>

                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab('subscriptions')}
                    className="px-4 py-2 rounded-xl bg-[#4965F5] hover:bg-[#3D54D4] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Manage Subscriptions</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('invoices')}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Invoices</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick KPI Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Plan</span>
                  <Layers className="w-4 h-4 text-[#4965F5]" />
                </div>
                <div className="text-xl font-bold text-[#172033]">Enterprise Cloud</div>
                <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Renews Monthly</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Next Billing Date</span>
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-xl font-bold text-[#172033]">Nov 15, 2026</div>
                <div className="text-xs text-slate-500 mt-1">Automatic card charge</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Next Amount Due</span>
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-bold text-[#172033]">$4,750.00</div>
                <div className="text-xs text-slate-500 mt-1">USD • Incl. Add-Ons</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Payment Method</span>
                  <CreditCard className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-xl font-bold text-[#172033]">Visa •••• 4242</div>
                <div className="text-xs text-slate-500 mt-1">Expires 12/28</div>
              </div>
            </div>

            {/* Recent Subscriptions & Invoices Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Plan Card */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#172033]">Active Subscriptions</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('subscriptions')}
                    className="text-xs font-semibold text-[#4965F5] hover:underline flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {MOCK_PORTAL_SUBSCRIPTIONS.map((sub) => (
                    <div key={sub.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{sub.planName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {sub.number} • Next renewal: {sub.nextBillingDate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-[#172033]">
                          ${sub.amount.toLocaleString()} /mo
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase mt-0.5">
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Invoices Card */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#172033]">Recent Invoices</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('invoices')}
                    className="text-xs font-semibold text-[#4965F5] hover:underline flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {MOCK_PORTAL_INVOICES.slice(0, 3).map((inv) => (
                    <div key={inv.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{inv.number}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Issued: {inv.issueDate}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-bold text-[#172033]">${inv.amount.toLocaleString()}</div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-0.5 ${
                              inv.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(inv.number)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                          title="Download Invoice"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MY SUBSCRIPTIONS                                   */}
        {/* ========================================================= */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#172033]">My Subscriptions</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage plan licenses, view included features, and inspect active renewal periods.
                </p>
              </div>
              <span className="self-start px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                2 Active Plans
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {MOCK_PORTAL_SUBSCRIPTIONS.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 space-y-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-[#172033]">{sub.planName}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                          {sub.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Subscription Reference: <span className="font-mono text-slate-700">{sub.number}</span> •
                        Started: {sub.startDate}
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <div className="text-2xl font-black text-[#172033]">
                        ${sub.amount.toLocaleString()}{' '}
                        <span className="text-xs font-medium text-slate-500">/ {sub.cadence}</span>
                      </div>
                      <div className="text-xs text-purple-700 font-medium mt-0.5">
                        Next Auto-Renewal: {sub.nextBillingDate}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                      Included Plan Features &amp; Entitlements
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      {sub.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#4965F5] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      Payment auto-debited via Visa ending in 4242
                    </span>
                    <button
                      type="button"
                      onClick={() => showToast(`Support requested for ${sub.number}. An advisor will reach out.`)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Request Plan Adjustment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: MY INVOICES                                        */}
        {/* ========================================================= */}
        {activeTab === 'invoices' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#172033]">Billing &amp; Invoices</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review invoice receipts, payment confirmations, and download statements.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-[#E5E7EB] text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4">Invoice #</th>
                      <th className="py-3.5 px-4">Service Period</th>
                      <th className="py-3.5 px-4">Issue Date</th>
                      <th className="py-3.5 px-4">Due Date</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {MOCK_PORTAL_INVOICES.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#172033]">{inv.number}</td>
                        <td className="py-3.5 px-4 text-slate-600">{inv.period}</td>
                        <td className="py-3.5 px-4 text-slate-600">{inv.issueDate}</td>
                        <td className="py-3.5 px-4 text-slate-600">{inv.dueDate}</td>
                        <td className="py-3.5 px-4 font-extrabold text-[#172033]">
                          ${inv.amount.toLocaleString()} {inv.currency}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              inv.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                inv.status === 'paid' ? 'bg-emerald-600' : 'bg-blue-600'
                              }`}
                            />
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDownloadInvoice(inv.number)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors text-[11px] font-semibold"
                          >
                            <Download className="w-3 h-3" />
                            <span>PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: MY PROFILE (WITH EDIT FUNCTIONALITY)               */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold text-[#172033]">My Profile &amp; Contact Information</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your primary billing contact, corporate address, and tax information.
              </p>
            </div>

            <form
              onSubmit={handleProfileSave}
              className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 space-y-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#4965F5]" />
                  <span>Primary Account Holder</span>
                </h3>
                <p className="text-xs text-slate-500">Contact details used for subscription communication.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#4965F5] focus:ring-1 focus:ring-[#4965F5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#4965F5] focus:ring-1 focus:ring-[#4965F5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#4965F5] focus:ring-1 focus:ring-[#4965F5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Company Name</label>
                  <input
                    type="text"
                    required
                    value={profileData.company}
                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#4965F5] focus:ring-1 focus:ring-[#4965F5]"
                  />
                </div>
              </div>

              <div className="border-b border-slate-100 pt-4 pb-2">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#4965F5]" />
                  <span>Billing Address</span>
                </h3>
                <p className="text-xs text-slate-500">Legal address printed on generated tax invoices.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1.5">Street Address</label>
                  <input
                    type="text"
                    required
                    value={profileData.addressLine}
                    onChange={(e) => setProfileData({ ...profileData, addressLine: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#4965F5] focus:ring-1 focus:ring-[#4965F5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">City</label>
                  <input
                    type="text"
                    required
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#4965F5] focus:ring-1 focus:ring-[#4965F5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">State / Province</label>
                  <input
                    type="text"
                    required
                    value={profileData.state}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#4965F5] focus:ring-1 focus:ring-[#4965F5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={profileData.postalCode}
                    onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#4965F5] focus:ring-1 focus:ring-[#4965F5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Country</label>
                  <input
                    type="text"
                    required
                    value={profileData.country}
                    onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#4965F5] focus:ring-1 focus:ring-[#4965F5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Tax / VAT ID</label>
                  <input
                    type="text"
                    value={profileData.taxId}
                    onChange={(e) => setProfileData({ ...profileData, taxId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#4965F5] focus:ring-1 focus:ring-[#4965F5]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 rounded-xl bg-[#4965F5] hover:bg-[#3D54D4] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  {isSavingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ACCOUNT SETTINGS                                   */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold text-[#172033]">Account &amp; Security Settings</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure notifications, password, and multi-factor authentication.
              </p>
            </div>

            {/* Notification preferences */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Bell className="w-4 h-4 text-[#4965F5]" />
                <h3 className="text-sm font-bold text-slate-900">Notification Preferences</h3>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">Email invoice receipts</div>
                    <div className="text-slate-500 mt-0.5">Receive PDF copy when invoices are generated.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailInvoices}
                    onChange={(e) => setSettings({ ...settings, emailInvoices: e.target.checked })}
                    className="w-4 h-4 text-[#4965F5] rounded border-slate-300 focus:ring-[#4965F5]"
                  />
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">Renewal reminders</div>
                    <div className="text-slate-500 mt-0.5">Notify 7 days prior to automatic plan renewal.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.renewalReminders}
                    onChange={(e) => setSettings({ ...settings, renewalReminders: e.target.checked })}
                    className="w-4 h-4 text-[#4965F5] rounded border-slate-300 focus:ring-[#4965F5]"
                  />
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">Security &amp; login alerts</div>
                    <div className="text-slate-500 mt-0.5">Alerts when new logins occur from unusual IPs.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.securityAlerts}
                    onChange={(e) => setSettings({ ...settings, securityAlerts: e.target.checked })}
                    className="w-4 h-4 text-[#4965F5] rounded border-slate-300 focus:ring-[#4965F5]"
                  />
                </div>
              </div>
            </div>

            {/* Security & 2FA */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Security Controls</h3>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">Two-Factor Authentication (2FA)</div>
                    <div className="text-slate-500 mt-0.5">
                      Enforce verification codes for elevated operations.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSettings({ ...settings, twoFactorEnabled: !settings.twoFactorEnabled })
                      showToast(
                        settings.twoFactorEnabled
                          ? '2FA disabled (not recommended).'
                          : 'Two-factor authentication enabled.',
                      )
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      settings.twoFactorEnabled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {settings.twoFactorEnabled ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">Password</div>
                    <div className="text-slate-500 mt-0.5">Last updated 45 days ago.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Password reset link sent to your registered email.')}
                    className="px-3 py-1 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
