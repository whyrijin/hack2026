import React, { useState, useEffect } from 'react'
import type { Customer, CustomerStatus, CreateCustomerPayload } from '../../types/customer.ts'
import { createCustomerApi, updateCustomerApi } from '../../api/customers.ts'
import { X, Loader2, AlertCircle, Building, Mail, Phone, User, DollarSign, MapPin } from 'lucide-react'

interface CustomerFormModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: Customer | null
  onSuccess: (customer: Customer) => void
}

interface FormInnerProps {
  initialData?: Customer | null
  onClose: () => void
  onSuccess: (customer: Customer) => void
}

const CustomerFormInner: React.FC<FormInnerProps> = ({ initialData, onClose, onSuccess }) => {
  const isEditing = Boolean(initialData)

  const [name, setName] = useState(initialData?.name || '')
  const [company, setCompany] = useState(initialData?.company || '')
  const [email, setEmail] = useState(initialData?.email || '')
  const [phone, setPhone] = useState(initialData?.phone || '')
  const [status, setStatus] = useState<CustomerStatus>(initialData?.status || 'active')
  const [plan, setPlan] = useState(initialData?.plan || 'Pro Tier')
  const [mrr, setMrr] = useState<number>(initialData?.mrr ?? 1200)
  const [line1, setLine1] = useState(initialData?.billing_address?.line1 || '')
  const [city, setCity] = useState(initialData?.billing_address?.city || '')
  const [state, setState] = useState(initialData?.billing_address?.state || '')
  const [postalCode, setPostalCode] = useState(initialData?.billing_address?.postal_code || '')
  const [country, setCountry] = useState(initialData?.billing_address?.country || 'United States')
  const [notes, setNotes] = useState(initialData?.notes || '')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Contact name is required.'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Contact name must be at least 2 characters.'
    }

    if (!company.trim()) {
      newErrors.company = 'Company name is required.'
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsLoading(true)
    setSubmitError(null)

    const payload: CreateCustomerPayload = {
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      status,
      plan,
      mrr: Number(mrr) || 0,
      currency: 'USD',
      billing_address: {
        line1: line1.trim(),
        city: city.trim(),
        state: state.trim(),
        postal_code: postalCode.trim(),
        country: country.trim(),
      },
      notes: notes.trim(),
    }

    try {
      let saved: Customer
      if (isEditing && initialData) {
        saved = await updateCustomerApi(initialData.id, payload)
      } else {
        saved = await createCustomerApi(payload)
      }
      onSuccess(saved)
      onClose()
    } catch (err: unknown) {
      setSubmitError((err as Error)?.message || 'Failed to save customer. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
      {submitError && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Section 1: Basic Information */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Account Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label htmlFor="customer-name" className="block text-xs font-semibold text-[#172033] mb-1">
              Contact Person <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="customer-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Connor"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-slate-50/50 text-[#172033] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5] ${
                  errors.name ? 'border-red-400 ring-1 ring-red-200' : 'border-[#E5E7EB]'
                }`}
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Company Name */}
          <div>
            <label
              htmlFor="customer-company"
              className="block text-xs font-semibold text-[#172033] mb-1"
            >
              Company Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building className="w-4 h-4" />
              </div>
              <input
                id="customer-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Cyberdyne Systems"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-slate-50/50 text-[#172033] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5] ${
                  errors.company ? 'border-red-400 ring-1 ring-red-200' : 'border-[#E5E7EB]'
                }`}
              />
            </div>
            {errors.company && <p className="mt-1 text-xs text-red-600">{errors.company}</p>}
          </div>

          {/* Work Email */}
          <div>
            <label
              htmlFor="customer-email"
              className="block text-xs font-semibold text-[#172033] mb-1"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="customer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@company.com"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-slate-50/50 text-[#172033] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5] ${
                  errors.email ? 'border-red-400 ring-1 ring-red-200' : 'border-[#E5E7EB]'
                }`}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="customer-phone"
              className="block text-xs font-semibold text-[#172033] mb-1"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="customer-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (415) 890-2341"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-slate-50/50 text-[#172033] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5] ${
                  errors.phone ? 'border-red-400 ring-1 ring-red-200' : 'border-[#E5E7EB]'
                }`}
              />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>
        </div>
      </div>

      {/* Section 2: Subscription & Status */}
      <div className="pt-3 border-t border-[#E5E7EB]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Subscription &amp; Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Status */}
          <div>
            <label
              htmlFor="customer-status"
              className="block text-xs font-semibold text-[#172033] mb-1"
            >
              Account Status
            </label>
            <select
              id="customer-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as CustomerStatus)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E7EB] bg-slate-50/50 text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
            >
              <option value="active">Active</option>
              <option value="pending">Pending Setup</option>
              <option value="inactive">Inactive / Paused</option>
              <option value="churned">Churned</option>
            </select>
          </div>

          {/* Plan Tier */}
          <div>
            <label htmlFor="customer-plan" className="block text-xs font-semibold text-[#172033] mb-1">
              Subscription Plan
            </label>
            <select
              id="customer-plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E7EB] bg-slate-50/50 text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
            >
              <option value="Starter Plan">Starter Plan ($290/mo)</option>
              <option value="Growth Plan">Growth Plan ($750/mo)</option>
              <option value="Pro Tier">Pro Tier ($1,200/mo)</option>
              <option value="Enterprise Cloud">Enterprise Cloud ($4,500/mo)</option>
            </select>
          </div>

          {/* Monthly Recurring Revenue */}
          <div>
            <label htmlFor="customer-mrr" className="block text-xs font-semibold text-[#172033] mb-1">
              Monthly MRR (USD)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                id="customer-mrr"
                type="number"
                min="0"
                step="10"
                value={mrr}
                onChange={(e) => setMrr(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E5E7EB] bg-slate-50/50 text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Billing Address */}
      <div className="pt-3 border-t border-[#E5E7EB]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>Billing Address</span>
        </h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="address-line1" className="block text-xs font-semibold text-[#172033] mb-1">
              Address Line
            </label>
            <input
              id="address-line1"
              type="text"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder="Street address or P.O. Box"
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E7EB] bg-slate-50/50 text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label htmlFor="address-city" className="block text-xs font-semibold text-[#172033] mb-1">
                City
              </label>
              <input
                id="address-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E7EB] bg-slate-50/50 text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
              />
            </div>
            <div>
              <label htmlFor="address-state" className="block text-xs font-semibold text-[#172033] mb-1">
                State / Region
              </label>
              <input
                id="address-state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E7EB] bg-slate-50/50 text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
              />
            </div>
            <div>
              <label htmlFor="address-zip" className="block text-xs font-semibold text-[#172033] mb-1">
                Postal Code
              </label>
              <input
                id="address-zip"
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Postal code"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E7EB] bg-slate-50/50 text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
              />
            </div>
            <div>
              <label htmlFor="address-country" className="block text-xs font-semibold text-[#172033] mb-1">
                Country
              </label>
              <input
                id="address-country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E7EB] bg-slate-50/50 text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Notes */}
      <div className="pt-3 border-t border-[#E5E7EB]">
        <label htmlFor="customer-notes" className="block text-xs font-semibold text-[#172033] mb-1">
          Internal Account Notes
        </label>
        <textarea
          id="customer-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add key account instructions, SLA specifics, or context..."
          className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E7EB] bg-slate-50/50 text-[#172033] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
        />
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#4965F5] hover:bg-[#3852de] text-white shadow-xs transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4965F5]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{isEditing ? 'Save Changes' : 'Create Customer'}</span>
          )}
        </button>
      </div>
    </form>
  )
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}) => {
  const isEditing = Boolean(initialData)

  // ESC key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-[#172033]">
              {isEditing ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? 'Update client details and billing preferences.'
                : 'Register a new customer account in the BrightLoop workspace.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body using Key to naturally reset state on prop changes */}
        <CustomerFormInner
          key={initialData?.id || 'new_customer'}
          initialData={initialData}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  )
}
