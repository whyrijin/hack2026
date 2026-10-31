import React from 'react'
import type { Customer } from '../../types/customer.ts'
import { CustomerStatusBadge } from './CustomerStatusBadge.tsx'
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  CreditCard,
  TrendingUp,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'

interface CustomerDetailsProps {
  customer: Customer
  onBack: () => void
  onEdit: (customer: Customer) => void
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customer,
  onBack,
  onEdit,
}) => {
  const initials = customer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const formattedDate = new Date(customer.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation Bar with Back & Edit Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#4965F5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4965F5] rounded-lg px-2 py-1 -ml-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Directory</span>
        </button>

        <div className="flex items-center gap-3">
          <CustomerStatusBadge status={customer.status} size="md" />
          <button
            type="button"
            onClick={() => onEdit(customer)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#4965F5] hover:bg-[#3852de] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Customer</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#4965F5]/10 text-[#4965F5] border border-[#4965F5]/20 flex items-center justify-center text-xl font-bold">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
                {customer.name}
              </h1>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-0.5 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{customer.company}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono text-slate-400">{customer.id}</span>
            </p>
          </div>
        </div>

        {/* Quick KPI badges */}
        <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 min-w-[120px]">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Monthly Value
            </span>
            <span className="text-lg font-bold text-[#172033] mt-0.5 block">
              ${customer.mrr.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 min-w-[130px]">
            <span className="text-[11px] font-semibold text-[#4965F5] uppercase tracking-wider block">
              Subscription
            </span>
            <span className="text-sm font-bold text-blue-900 mt-0.5 block truncate">
              {customer.plan}
            </span>
          </div>
        </div>
      </div>

      {/* Content Grid: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Contact Information */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Mail className="w-4 h-4 text-[#4965F5]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#172033]">
              Contact Details
            </h2>
          </div>

          <div className="space-y-3.5 text-sm">
            <div>
              <span className="text-xs text-slate-500 block font-medium">Work Email</span>
              <a
                href={`mailto:${customer.email}`}
                className="text-[#4965F5] font-semibold hover:underline mt-0.5 inline-block"
              >
                {customer.email}
              </a>
            </div>

            <div>
              <span className="text-xs text-slate-500 block font-medium">Direct Phone</span>
              <div className="flex items-center gap-2 mt-0.5 text-slate-700 font-semibold">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{customer.phone}</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 block font-medium">Customer Since</span>
              <div className="flex items-center gap-2 mt-0.5 text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Billing & Address Details */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-[#38BDF8]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#172033]">
              Billing Address
            </h2>
          </div>

          <div className="space-y-3.5 text-sm">
            <div>
              <span className="text-xs text-slate-500 block font-medium">Street Address</span>
              <p className="text-slate-800 font-semibold mt-0.5">
                {customer.billing_address.line1 || 'No street address on file'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-500 block font-medium">City / State</span>
                <p className="text-slate-700 font-medium mt-0.5">
                  {customer.billing_address.city
                    ? `${customer.billing_address.city}, ${customer.billing_address.state || ''}`
                    : 'N/A'}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-500 block font-medium">Postal / Country</span>
                <p className="text-slate-700 font-medium mt-0.5">
                  {customer.billing_address.postal_code || ''}{' '}
                  {customer.billing_address.country ? `(${customer.billing_address.country})` : ''}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tax &amp; Currency Validated ({customer.currency})</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Subscription & Operational Profile */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#4965F5]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#172033]">
              Subscription Lifecycle
            </h2>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Recurring Automated</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 block font-medium">Assigned Plan Tier</span>
            <span className="text-base font-bold text-[#172033] mt-1 block">{customer.plan}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 block font-medium">Billed MRR</span>
            <span className="text-base font-bold text-[#172033] mt-1 block">
              ${customer.mrr.toLocaleString()} {customer.currency}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 block font-medium">Compliance &amp; Security</span>
            <span className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>PCI-DSS Level 1 Encrypted</span>
            </span>
          </div>
        </div>

        {/* Administrative Notes */}
        {customer.notes && (
          <div className="mt-4 p-4 rounded-xl bg-blue-50/40 border border-blue-100/70">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
              <FileText className="w-3.5 h-3.5 text-[#4965F5]" />
              <span>Account Notes</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{customer.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

