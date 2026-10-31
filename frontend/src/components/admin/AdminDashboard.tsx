import React, { useState, useMemo } from 'react'
import {
  Users,
  CreditCard,
  DollarSign,
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  Send,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

type DatePreset = '7d' | '30d' | 'quarter' | 'ytd' | 'all'

interface OverdueInvoice {
  id: string
  invoiceNumber: string
  customerName: string
  company: string
  dueDate: string
  daysOverdue: number
  amount: number
  currency: string
  status: 'overdue' | 'in_retry'
}

const INITIAL_OVERDUE_INVOICES: OverdueInvoice[] = [
  {
    id: 'inv_ov_1',
    invoiceNumber: 'INV-2026-0982',
    customerName: 'Marcus Vance',
    company: 'Apex Horizon Ltd',
    dueDate: 'Oct 14, 2026',
    daysOverdue: 17,
    amount: 1450,
    currency: 'USD',
    status: 'overdue',
  },
  {
    id: 'inv_ov_2',
    invoiceNumber: 'INV-2026-0945',
    customerName: 'David Kim',
    company: 'Synergy Labs',
    dueDate: 'Oct 19, 2026',
    daysOverdue: 12,
    amount: 890,
    currency: 'USD',
    status: 'in_retry',
  },
  {
    id: 'inv_ov_3',
    invoiceNumber: 'INV-2026-0912',
    customerName: 'Claire Laurent',
    company: 'Vanguard Media',
    dueDate: 'Oct 08, 2026',
    daysOverdue: 23,
    amount: 1080,
    currency: 'USD',
    status: 'overdue',
  },
  {
    id: 'inv_ov_4',
    invoiceNumber: 'INV-2026-0889',
    customerName: 'Arthur Dent',
    company: 'Megadodo Publications',
    dueDate: 'Sep 29, 2026',
    daysOverdue: 32,
    amount: 500,
    currency: 'USD',
    status: 'overdue',
  },
]

// Monthly Revenue Dataset
const MONTHLY_REVENUE_DATA = [
  { month: 'May', billed: 95000, collected: 91000, mrr: 88000 },
  { month: 'Jun', billed: 108000, collected: 102000, mrr: 99000 },
  { month: 'Jul', billed: 116000, collected: 111000, mrr: 107000 },
  { month: 'Aug', billed: 124000, collected: 119000, mrr: 118000 },
  { month: 'Sep', billed: 136000, collected: 129000, mrr: 129000 },
  { month: 'Oct', billed: 148250, collected: 139400, mrr: 142000 },
]

// Daily Inflow (Last 14 days)
const DAILY_REVENUE_DATA = [
  { day: 'Oct 18', billed: 4800, collected: 4500 },
  { day: 'Oct 19', billed: 3200, collected: 3200 },
  { day: 'Oct 20', billed: 6100, collected: 5900 },
  { day: 'Oct 21', billed: 5400, collected: 5100 },
  { day: 'Oct 22', billed: 7800, collected: 7200 },
  { day: 'Oct 23', billed: 6300, collected: 6000 },
  { day: 'Oct 24', billed: 8200, collected: 7900 },
  { day: 'Oct 25', billed: 4100, collected: 3900 },
  { day: 'Oct 26', billed: 5900, collected: 5400 },
  { day: 'Oct 27', billed: 9200, collected: 8800 },
  { day: 'Oct 28', billed: 8500, collected: 8100 },
  { day: 'Oct 29', billed: 6700, collected: 6200 },
  { day: 'Oct 30', billed: 7400, collected: 7000 },
  { day: 'Oct 31', billed: 5300, collected: 4900 },
]

export const AdminDashboard: React.FC = () => {
  const [datePreset, setDatePreset] = useState<DatePreset>('30d')
  const [chartView, setChartView] = useState<'monthly' | 'daily'>('monthly')
  const [overdueList] = useState<OverdueInvoice[]>(INITIAL_OVERDUE_INVOICES)
  const [searchOverdue, setSearchOverdue] = useState('')
  const [agingFilter, setAgingFilter] = useState<'all' | '1-15' | '16-30' | '30+'>('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleSendReminder = (invoice: OverdueInvoice) => {
    showToast(`Payment reminder dispatched to ${invoice.customerName} (${invoice.company}).`)
  }

  // Filter overdue invoices
  const filteredOverdue = useMemo(() => {
    return overdueList.filter((inv) => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(searchOverdue.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchOverdue.toLowerCase()) ||
        inv.company.toLowerCase().includes(searchOverdue.toLowerCase())

      let matchAging = true
      if (agingFilter === '1-15') {
        matchAging = inv.daysOverdue <= 15
      } else if (agingFilter === '16-30') {
        matchAging = inv.daysOverdue >= 16 && inv.daysOverdue <= 30
      } else if (agingFilter === '30+') {
        matchAging = inv.daysOverdue > 30
      }

      return matchSearch && matchAging
    })
  }, [overdueList, searchOverdue, agingFilter])

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#101828] text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Date Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#172033]">Subscription &amp; Revenue Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time financial performance, billing telemetry, and collection health.
          </p>
        </div>

        {/* Date Filter Presets */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl self-start sm:self-auto overflow-x-auto">
          {(
            [
              { key: '7d', label: '7D' },
              { key: '30d', label: '30D' },
              { key: 'quarter', label: 'Quarter' },
              { key: 'ytd', label: 'YTD' },
              { key: 'all', label: 'All Time' },
            ] as const
          ).map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => {
                setDatePreset(preset.key)
                showToast(`Filter applied: ${preset.label}`)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                datePreset === preset.key
                  ? 'bg-white text-[#101828] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5 SUMMARY KPI CARDS                                       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Active Subscriptions */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Active Subscriptions</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#4965F5] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#172033]">1,428</div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-3">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+8.4% vs last mo</span>
          </div>
        </div>

        {/* Card 2: Total Billed */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total Billed</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#172033]">$148,250</div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-3">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.1% growth</span>
          </div>
        </div>

        {/* Card 3: Payments Collected */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Payments Collected</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#172033]">$139,400</div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>94.0% Collection Rate</span>
          </div>
        </div>

        {/* Card 4: Outstanding Balance */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Outstanding Balance</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#172033]">$8,850</div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-3">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-3.2% vs last cycle</span>
          </div>
        </div>

        {/* Card 5: Overdue Invoices */}
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs flex flex-col justify-between bg-gradient-to-b from-white to-red-50/20">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-red-700">
                Overdue Invoices
              </span>
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-red-700">14 invoices</div>
          </div>
          <div className="text-xs text-red-600 font-semibold mt-3">
            $3,420.00 at risk
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* REVENUE CHARTS (MONTHLY MRR TREND & DAILY INFLOWS)        */}
      {/* ========================================================= */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-[#172033]">
              {chartView === 'monthly' ? 'Monthly Billing & Collections' : 'Daily Cash Inflow Trajectory'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison between invoice amounts billed and cash collected.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setChartView('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                chartView === 'monthly'
                  ? 'bg-[#101828] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Monthly View
            </button>
            <button
              type="button"
              onClick={() => setChartView('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                chartView === 'daily'
                  ? 'bg-[#101828] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Daily View (14D)
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'monthly' ? (
              <AreaChart data={MONTHLY_REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4965F5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4965F5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [
                    `$${Number(val || 0).toLocaleString()}`,
                    '',
                  ]}
                  contentStyle={{
                    backgroundColor: '#101828',
                    color: '#fff',
                    borderRadius: '0.75rem',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="billed"
                  name="Total Billed"
                  stroke="#4965F5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorBilled)"
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  name="Collected Cash"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCollected)"
                />
              </AreaChart>
            ) : (
              <BarChart data={DAILY_REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [
                    `$${Number(val || 0).toLocaleString()}`,
                    '',
                  ]}
                  contentStyle={{
                    backgroundColor: '#101828',
                    color: '#fff',
                    borderRadius: '0.75rem',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="billed" name="Billed" fill="#4965F5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" name="Collected" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================= */}
      {/* OVERDUE INVOICES TABLE & INTERVENTIONS                    */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-base font-bold text-[#172033]">Overdue Invoices Action Queue</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Invoices exceeding due dates requiring dunning follow-up or payment interventions.
            </p>
          </div>

          {/* Search & Aging Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoice or customer..."
                value={searchOverdue}
                onChange={(e) => setSearchOverdue(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#4965F5]"
              />
            </div>

            <select
              value={agingFilter}
              onChange={(e) => setAgingFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#4965F5]"
            >
              <option value="all">All Aging Buckets</option>
              <option value="1-15">1 - 15 Days</option>
              <option value="16-30">16 - 30 Days</option>
              <option value="30+">30+ Days (Severe)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-[#E5E7EB] text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer &amp; Company</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Aging Period</th>
                <th className="py-3.5 px-4">Amount Due</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredOverdue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    No overdue invoices match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredOverdue.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#172033]">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-500">{inv.company}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{inv.dueDate}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.daysOverdue > 30
                            ? 'bg-red-100 text-red-800'
                            : inv.daysOverdue > 15
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {inv.daysOverdue} days past due
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-red-600">
                      ${inv.amount.toLocaleString()} {inv.currency}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {inv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleSendReminder(inv)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#4965F5] hover:bg-[#3D54D4] text-white text-[11px] font-semibold transition-colors shadow-2xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Reminder</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
