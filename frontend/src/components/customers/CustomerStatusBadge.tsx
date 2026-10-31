import React from 'react'
import type { CustomerStatus } from '../../types/customer.ts'

interface CustomerStatusBadgeProps {
  status: CustomerStatus
  size?: 'sm' | 'md'
}

export const CustomerStatusBadge: React.FC<CustomerStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'

  switch (status) {
    case 'active':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active</span>
        </span>
      )
    case 'pending':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Pending</span>
        </span>
      )
    case 'inactive':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>Inactive</span>
        </span>
      )
    case 'churned':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>Churned</span>
        </span>
      )
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-slate-50 text-slate-600 border border-slate-200 ${sizeClasses}`}
        >
          <span>{status}</span>
        </span>
      )
  }
}

