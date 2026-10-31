import React, { useState, useMemo } from 'react'
import {
  Download,
  Search,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

type ReportSection = 'revenue' | 'billed_collected' | 'overdue'

// Revenue By Plan Breakdown
const PLAN_REVENUE_DATA = [
  { name: 'Enterprise Cloud', value: 88500, count: 18, color: '#4965F5' },
  { name: 'Pro Tier', value: 34800, count: 29, color: '#38BDF8' },
  { name: 'Growth Tier', value: 16400, count: 32, color: '#818CF8' },
  { name: 'Starter Plan', value: 8550, count: 45, color: '#C7D2FE' },
]

// Billed vs Collected Monthly Data
const BILLED_VS_COLLECTED_DATA = [
  { month: 'May 2026', billed: 95000, collected: 91000, uncollected: 4000, rate: 95.8 },
  { month: 'Jun 2026', billed: 108000, collected: 102000, uncollected: 6000, rate: 94.4 },
  { month: 'Jul 2026', billed: 116000, collected: 111000, uncollected: 5000, rate: 95.7 },
  { month: 'Aug 2026', billed: 124000, collected: 119000, uncollected: 5000, rate: 96.0 },
  { month: 'Sep 2026', billed: 136000, collected: 129000, uncollected: 7000, rate: 94.8 },
  { month: 'Oct 2026', billed: 148250, collected: 139400, uncollected: 8850, rate: 94.0 },
]

// Overdue Invoices Dataset
const OVERDUE_RECORDS = [
  {
    id: 'rep_ov_1',
    number: 'INV-2026-0982',
    customer: 'Marcus Vance',
    company: 'Apex Horizon Ltd',
    amount: 1450,
    dueDate: 'Oct 14, 2026',
    bucket: '16-30 days',
    daysOverdue: 17,
  },
  {
    id: 'rep_ov_2',
    number: 'INV-2026-0945',
    customer: 'David Kim',
    company: 'Synergy Labs',
    amount: 890,
    dueDate: 'Oct 19, 2026',
    bucket: '1-15 days',
    daysOverdue: 12,
  },
  {
    id: 'rep_ov_3',
    number: 'INV-2026-0912',
    customer: 'Claire Laurent',
    company: 'Vanguard Media',
    amount: 1080,
    dueDate: 'Oct 08, 2026',
    bucket: '16-30 days',
    daysOverdue: 23,
  },
  {
    id: 'rep_ov_4',
    number: 'INV-2026-0889',
    customer: 'Arthur Dent',
    company: 'Megadodo Publications',
    amount: 500,
    dueDate: 'Sep 29, 2026',
    bucket: '31-60 days',
    daysOverdue: 32,
  },
  {
    id: 'rep_ov_5',
    number: 'INV-2026-0850',
    customer: 'Natasha Romanoff',
    company: 'Red Room Security',
    amount: 350,
    dueDate: 'Sep 18, 2026',
    bucket: '31-60 days',
    daysOverdue: 43,
  },
]

export const ReportsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ReportSection>('revenue')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Filters for Overdue Report
  const [overdueSearch, setOverdueSearch] = useState('')
  const [selectedBucket, setSelectedBucket] = useState('all')
  const [page, setPage] = useState(1)
  const itemsPerPage = 4

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleExportCSV = (reportName: string) => {
    showToast(`Exported "${reportName}" to CSV successfully.`)
  }

  // Filtered Overdue Data
  const filteredOverdue = useMemo(() => {
    return OVERDUE_RECORDS.filter((item) => {
      const matchSearch =
        item.number.toLowerCase().includes(overdueSearch.toLowerCase()) ||
        item.customer.toLowerCase().includes(overdueSearch.toLowerCase()) ||
        item.company.toLowerCase().includes(overdueSearch.toLowerCase())

      const matchBucket = selectedBucket === 'all' || item.bucket === selectedBucket

      return matchSearch && matchBucket
    })
  }, [overdueSearch, selectedBucket])

  const totalPages = Math.max(1, Math.ceil(filteredOverdue.length / itemsPerPage))
  const pagedOverdue = filteredOverdue.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#101828] text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Report Navigation */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#172033]">Financial &amp; Revenue Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit recurring billings, track cash conversion velocity, and monitor aging balances.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSection('revenue')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSection === 'revenue'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Revenue by Plan
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('billed_collected')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSection === 'billed_collected'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Billed vs. Collected
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('overdue')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSection === 'overdue'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overdue Aging Report
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: REVENUE REPORT WITH CHARTS                     */}
      {/* ========================================================= */}
      {activeSection === 'revenue' && (
        <div className="space-y-6">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Annual Run Rate (ARR)
              </span>
              <div className="text-2xl font-black text-[#172033] mt-1">$1.78M</div>
              <span className="text-xs text-emerald-600 font-semibold mt-1 block">+14.2% YoY</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Monthly Recurring (MRR)
              </span>
              <div className="text-2xl font-black text-[#172033] mt-1">$148,250</div>
              <span className="text-xs text-emerald-600 font-semibold mt-1 block">98 active orgs</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Avg Revenue Per Account (ARPU)
              </span>
              <div className="text-2xl font-black text-[#172033] mt-1">$1,512</div>
              <span className="text-xs text-slate-500 font-medium mt-1 block">Normalized monthly</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Net Revenue Retention (NRR)
              </span>
              <div className="text-2xl font-black text-[#172033] mt-1">118.4%</div>
              <span className="text-xs text-emerald-600 font-semibold mt-1 block">Best-in-class tier</span>
            </div>
          </div>

          {/* Revenue By Plan Charts & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">MRR Distribution by Subscription Tier</h3>
                <button
                  type="button"
                  onClick={() => handleExportCSV('Revenue by Plan')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PLAN_REVENUE_DATA} layout="vertical" margin={{ left: 30, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="#94A3B8"
                      fontSize={11}
                      tickFormatter={(val) => `$${val / 1000}k`}
                    />
                    <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => [
                        `$${Number(val || 0).toLocaleString()}`,
                        'MRR',
                      ]}
                      contentStyle={{
                        backgroundColor: '#101828',
                        color: '#fff',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="value" fill="#4965F5" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Plan Breakdown List */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                Tier Breakdown
              </h3>
              <div className="space-y-3.5">
                {PLAN_REVENUE_DATA.map((plan) => {
                  const percent = Math.round((plan.value / 148250) * 100)
                  return (
                    <div key={plan.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-800">{plan.name}</span>
                        <span className="text-[#172033]">${plan.value.toLocaleString()} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${percent}%`, backgroundColor: plan.color }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-400">{plan.count} active accounts</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: BILLED VS COLLECTED COMPARISON                 */}
      {/* ========================================================= */}
      {activeSection === 'billed_collected' && (
        <div className="space-y-6">
          {/* KPI Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Billed (L6M)
              </span>
              <div className="text-2xl font-black text-[#172033] mt-1">$727,250</div>
              <span className="text-xs text-slate-500 font-medium mt-1 block">Cumulative invoices issued</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Cash Collected
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-1">$691,400</div>
              <span className="text-xs text-emerald-700 font-semibold mt-1 block">95.07% Net Realization</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Outstanding
              </span>
              <div className="text-2xl font-black text-amber-600 mt-1">$35,850</div>
              <span className="text-xs text-amber-700 font-medium mt-1 block">Under active dunning</span>
            </div>
          </div>

          {/* Comparative Chart */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Monthly Invoiced Volume vs. Cash Realized
              </h3>
              <button
                type="button"
                onClick={() => handleExportCSV('Billed vs Collected')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BILLED_VS_COLLECTED_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="billed" name="Invoiced Billed" fill="#4965F5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="collected" name="Cash Collected" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Audit Table */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-[#E5E7EB] text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Billing Month</th>
                    <th className="py-3 px-4">Total Billed</th>
                    <th className="py-3 px-4">Cash Collected</th>
                    <th className="py-3 px-4">Uncollected Balance</th>
                    <th className="py-3 px-4 text-right">Collection Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {BILLED_VS_COLLECTED_DATA.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{row.month}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        ${row.billed.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-600">
                        ${row.collected.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-amber-600">
                        ${row.uncollected.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          {row.rate}%
                        </span>
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
      {/* SECTION 3: OVERDUE INVOICE REPORT                         */}
      {/* ========================================================= */}
      {activeSection === 'overdue' && (
        <div className="space-y-6">
          {/* Aging Buckets Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-xs">
              <span className="text-[11px] font-semibold text-orange-700 uppercase tracking-wider block">
                1 - 15 Days Past Due
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">$890.00</div>
              <span className="text-xs text-slate-500 mt-0.5 block">1 invoice</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                16 - 30 Days Past Due
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">$2,530.00</div>
              <span className="text-xs text-slate-500 mt-0.5 block">2 invoices</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs">
              <span className="text-[11px] font-semibold text-red-700 uppercase tracking-wider block">
                31 - 60 Days Past Due
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">$850.00</div>
              <span className="text-xs text-slate-500 mt-0.5 block">2 invoices</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                60+ Days (Severe)
              </span>
              <div className="text-xl font-bold text-slate-400 mt-1">$0.00</div>
              <span className="text-xs text-slate-400 mt-0.5 block">No critical write-offs</span>
            </div>
          </div>

          {/* Overdue Audit Table with Filter & Search */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Overdue Invoices Aging Ledger</h3>
                <p className="text-xs text-slate-500 mt-0.5">Filter by customer or aging schedule bracket.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={overdueSearch}
                    onChange={(e) => {
                      setOverdueSearch(e.target.value)
                      setPage(1)
                    }}
                    placeholder="Search invoice, customer..."
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#4965F5]"
                  />
                </div>

                <select
                  value={selectedBucket}
                  onChange={(e) => {
                    setSelectedBucket(e.target.value)
                    setPage(1)
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#4965F5]"
                >
                  <option value="all">All Aging Buckets</option>
                  <option value="1-15 days">1 - 15 Days</option>
                  <option value="16-30 days">16 - 30 Days</option>
                  <option value="31-60 days">31 - 60 Days</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleExportCSV('Overdue Invoices Ledger')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-[#E5E7EB] text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Aging Bracket</th>
                    <th className="py-3 px-4 text-right">Amount Past Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {pagedOverdue.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No overdue records matching filter.
                      </td>
                    </tr>
                  ) : (
                    pagedOverdue.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{item.number}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{item.customer}</td>
                        <td className="py-3 px-4 text-slate-600">{item.company}</td>
                        <td className="py-3 px-4 text-slate-600">{item.dueDate}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.daysOverdue > 30
                                ? 'bg-red-100 text-red-800'
                                : item.daysOverdue > 15
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {item.daysOverdue} days ({item.bucket})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-red-600">
                          ${item.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Showing Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
