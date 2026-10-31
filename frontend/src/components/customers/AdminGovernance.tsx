import React, { useState } from 'react'
import {
  Settings,
  Search,
  Filter,
  ShieldCheck,
  AlertCircle,
  Key,
  UserCheck,
  History,
  Lock,
  Building,
} from 'lucide-react'

interface AuditEvent {
  id: string
  timestamp: string
  actor: string
  actorEmail: string
  action: string
  targetEntity: string
  ipAddress: string
  status: 'verified' | 'flagged' | '2fa_approved'
}

const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'aud_101',
    timestamp: 'Today, 11:24:05 AM',
    actor: 'Rijin Reji (Admin)',
    actorEmail: 'rijin@brightloop.io',
    action: 'catalog.pricing_rule.update',
    targetEntity: 'Enterprise Cloud Tier',
    ipAddress: '192.168.1.45 (US-East)',
    status: 'verified',
  },
  {
    id: 'aud_102',
    timestamp: 'Today, 10:45:12 AM',
    actor: 'Adithyan (Staff)',
    actorEmail: 'adithyan@brightloop.io',
    action: 'customer.billing_override',
    targetEntity: 'Cyberdyne Systems (cust_01J8A9K1)',
    ipAddress: '10.0.4.120 (US-West)',
    status: '2fa_approved',
  },
  {
    id: 'aud_103',
    timestamp: 'Today, 09:12:30 AM',
    actor: 'System Automation',
    actorEmail: 'celery.worker@brightloop.internal',
    action: 'billing.invoice.batch_generate',
    targetEntity: 'Cycle Oct-31 (124 Invoices)',
    ipAddress: '127.0.0.1 (Docker Host)',
    status: 'verified',
  },
  {
    id: 'aud_104',
    timestamp: 'Yesterday, 17:30:19 PM',
    actor: 'Aby John (Admin)',
    actorEmail: 'aby@brightloop.io',
    action: 'security.api_key.created',
    targetEntity: 'Webhook Endpoint /api/v1/stripe',
    ipAddress: '172.16.0.88 (EU-Central)',
    status: '2fa_approved',
  },
  {
    id: 'aud_105',
    timestamp: 'Yesterday, 14:15:40 PM',
    actor: 'Abin Oliver (Staff)',
    actorEmail: 'abin@brightloop.io',
    action: 'customer.plan.pause',
    targetEntity: 'Atelier Digital (cust_07R2G3R7)',
    ipAddress: '192.168.2.14 (US-Central)',
    status: 'verified',
  },
  {
    id: 'aud_106',
    timestamp: 'Oct 29, 08:00:22 AM',
    actor: 'Security Guardrail',
    actorEmail: 'waf.guard@brightloop.internal',
    action: 'auth.rate_limit.triggered',
    targetEntity: 'IP 203.0.113.44 (401 Exceeded)',
    ipAddress: '203.0.113.44 (AP-South)',
    status: 'flagged',
  },
]

export const AdminGovernance: React.FC = () => {
  const [logs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.targetEntity.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(search.toLowerCase())

    const matchStatus = statusFilter === 'all' || log.status === statusFilter

    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Admin Governance Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
            Security Audit Trail &amp; Access Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Immutable log of all administrative actions, customer overrides, and privileged security events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 flex items-center gap-1.5">
            <Lock className="w-4 h-4" />
            <span>Root Admin Permissions</span>
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Audit Events Logged
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#172033] mt-0.5 block">
              1,482
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Compliance Posture
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5 block">
              100%
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Elevated Admins
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#4965F5] mt-0.5 block">
              3 Active
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#4965F5] flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Active API Keys
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5 block">
              8 Keys
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Key className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail, actor, or entity..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-[#E5E7EB] bg-slate-50/50 text-[#172033] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-xl border border-[#E5E7EB] bg-slate-50/50 text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
            >
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified</option>
              <option value="2fa_approved">2FA Approved</option>
              <option value="flagged">Security Flagged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-[#E5E7EB] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th scope="col" className="py-3.5 px-4 sm:px-6">
                  Timestamp
                </th>
                <th scope="col" className="py-3.5 px-4">
                  Actor &amp; Credentials
                </th>
                <th scope="col" className="py-3.5 px-4">
                  Security Event / Operation
                </th>
                <th scope="col" className="py-3.5 px-4 hidden md:table-cell">
                  Target Entity
                </th>
                <th scope="col" className="py-3.5 px-4 hidden lg:table-cell">
                  Network Origin
                </th>
                <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-mono text-xs text-slate-600">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="font-bold text-[#172033] block">{log.actor}</span>
                      <span className="text-[11px] text-slate-500">{log.actorEmail}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs text-[#4965F5] bg-blue-50/80 px-2 py-0.5 rounded border border-blue-100">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 hidden md:table-cell text-xs text-slate-700">
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span>{log.targetEntity}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 hidden lg:table-cell font-mono text-[11px] text-slate-500">
                    {log.ipAddress}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    {log.status === 'verified' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {log.status === '2fa_approved' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#4965F5] border border-blue-200">
                        <Key className="w-3 h-3" />
                        2FA Passed
                      </span>
                    )}
                    {log.status === 'flagged' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertCircle className="w-3 h-3" />
                        Flagged
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
