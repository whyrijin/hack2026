import React, { useState } from 'react'
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Building,
  Check,
  ShieldCheck,
} from 'lucide-react'

interface StaffIntervention {
  id: string
  customerName: string
  company: string
  email: string
  phone: string
  issue: string
  plan: string
  mrr: number
  priority: 'high' | 'medium' | 'low'
  assignedTo: string
  status: 'pending' | 'in_progress' | 'resolved'
  date: string
}

const INITIAL_STAFF_QUEUE: StaffIntervention[] = [
  {
    id: 'int_01',
    customerName: 'Sarah Connor',
    company: 'Cyberdyne Systems',
    email: 'sarah.connor@cyberdyne.io',
    phone: '+1 (415) 890-2341',
    issue: 'Payment Retry: Corporate Card Expired',
    plan: 'Enterprise Cloud',
    mrr: 4500,
    priority: 'high',
    assignedTo: 'Rijin Reji',
    status: 'pending',
    date: 'Today, 10:14 AM',
  },
  {
    id: 'int_02',
    customerName: 'Marcus Vance',
    company: 'Nexora AI',
    email: 'marcus@nexora.ai',
    phone: '+1 (512) 441-9820',
    issue: 'Plan Upgrade: Custom Quota Override Needed',
    plan: 'Growth Plan',
    mrr: 750,
    priority: 'medium',
    assignedTo: 'Aby John',
    status: 'in_progress',
    date: 'Today, 09:30 AM',
  },
  {
    id: 'int_03',
    customerName: 'Elena Rostova',
    company: 'Nova Finance UK',
    email: 'elena@novafinance.eu',
    phone: '+44 20 7946 0912',
    issue: 'Dual-Signature Invoice PDF Generation',
    plan: 'Enterprise Cloud',
    mrr: 6800,
    priority: 'high',
    assignedTo: 'Adithyan',
    status: 'pending',
    date: 'Yesterday, 16:45 PM',
  },
  {
    id: 'int_04',
    customerName: 'Chloe Dubois',
    company: 'Atelier Digital',
    email: 'chloe@atelierdigital.fr',
    phone: '+33 1 42 68 55 00',
    issue: 'Customer Request: Pause Subscription 30 Days',
    plan: 'Starter Plan',
    mrr: 290,
    priority: 'low',
    assignedTo: 'Abin Oliver',
    status: 'in_progress',
    date: 'Yesterday, 14:20 PM',
  },
  {
    id: 'int_05',
    customerName: 'Liam O’Connor',
    company: 'Emerald Metrics',
    email: 'liam@emeraldmetrics.ie',
    phone: '+353 1 496 0122',
    issue: 'Offboarding Archive & Data Export Review',
    plan: 'Starter Plan',
    mrr: 0,
    priority: 'low',
    assignedTo: 'Rijin Reji',
    status: 'resolved',
    date: 'Oct 28, 11:00 AM',
  },
  {
    id: 'int_06',
    customerName: 'Benjamin Rivera',
    company: 'OmniSync Global',
    email: 'b.rivera@omnisync.io',
    phone: '+1 (786) 304-9912',
    issue: 'Trial Extension: Enterprise Proof-of-Concept',
    plan: 'Pro Tier',
    mrr: 1200,
    priority: 'medium',
    assignedTo: 'Aby John',
    status: 'pending',
    date: 'Oct 29, 15:10 PM',
  },
]

export const StaffOperations: React.FC = () => {
  const [queue, setQueue] = useState<StaffIntervention[]>(INITIAL_STAFF_QUEUE)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleResolve = (id: string, name: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'resolved' } : item)),
    )
    showToast(`Intervention for ${name} marked as resolved.`)
  }

  const handleProgress = (id: string, name: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'in_progress' } : item)),
    )
    showToast(`Intervention for ${name} set to In Progress.`)
  }

  // Filtered queue
  const filtered = queue.filter((item) => {
    const matchSearch =
      item.customerName.toLowerCase().includes(search.toLowerCase()) ||
      item.company.toLowerCase().includes(search.toLowerCase()) ||
      item.issue.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase())

    const matchPriority = priorityFilter === 'all' || item.priority === priorityFilter
    const matchStatus = statusFilter === 'all' || item.status === statusFilter

    return matchSearch && matchPriority && matchStatus
  })

  const pendingCount = queue.filter((i) => i.status === 'pending').length
  const inProgressCount = queue.filter((i) => i.status === 'in_progress').length
  const resolvedCount = queue.filter((i) => i.status === 'resolved').length

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          role="status"
          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#4965F5] uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Staff Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
            Customer Operations &amp; Billing Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage customer subscription exceptions, manual billing retries, and plan overrides.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-[#4965F5] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Staff Authorized</span>
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Pending Actions
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5 block">
              {pendingCount}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              In Progress
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#4965F5] mt-0.5 block">
              {inProgressCount}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#4965F5] flex items-center justify-center">
            <RefreshCw className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Resolved
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5 block">
              {resolvedCount}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              At-Risk MRR
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#172033] mt-0.5 block">
              $12,050
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, issue or company..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-[#E5E7EB] bg-slate-50/50 text-[#172033] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 w-1/2 md:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full md:w-auto px-2.5 py-2 text-xs rounded-xl border border-[#E5E7EB] bg-slate-50/50 text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="w-1/2 md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-[#E5E7EB] bg-slate-50/50 text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Queue Data Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-[#E5E7EB] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th scope="col" className="py-3.5 px-4 sm:px-6">
                  Customer
                </th>
                <th scope="col" className="py-3.5 px-4">
                  Intervention / Operational Task
                </th>
                <th scope="col" className="py-3.5 px-4">
                  Priority
                </th>
                <th scope="col" className="py-3.5 px-4">
                  Status
                </th>
                <th scope="col" className="py-3.5 px-4 hidden lg:table-cell">
                  Assigned
                </th>
                <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    <p className="font-semibold">No operational queue items match your filter.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Customer */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div>
                        <span className="font-bold text-[#172033] block">{item.customerName}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{item.company}</span>
                        </span>
                      </div>
                    </td>

                    {/* Operational Task */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-slate-800 block text-xs sm:text-sm">
                          {item.issue}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {item.plan} • ${item.mrr.toLocaleString()}/mo • {item.date}
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      {item.priority === 'high' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                          High
                        </span>
                      )}
                      {item.priority === 'medium' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Medium
                        </span>
                      )}
                      {item.priority === 'low' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          Low
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {item.status === 'pending' && (
                        <span className="text-amber-700 font-semibold text-xs flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      )}
                      {item.status === 'in_progress' && (
                        <span className="text-[#4965F5] font-semibold text-xs flex items-center gap-1">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                          In Progress
                        </span>
                      )}
                      {item.status === 'resolved' && (
                        <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Resolved
                        </span>
                      )}
                    </td>

                    {/* Assigned */}
                    <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-slate-600 font-medium">
                      {item.assignedTo}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        {item.status !== 'resolved' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleProgress(item.id, item.customerName)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              Work
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolve(item.id, item.customerName)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                            >
                              Resolve
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">Complete</span>
                        )}
                      </div>
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
