import React, { useState, useEffect, useRef, useMemo } from 'react'
import type { Customer } from '../../types/customer.ts'
import { getCustomersApi } from '../../api/customers.ts'
import {
  Search,
  ChevronDown,
  Check,
  X,
  Building,
  User,
  Loader2,
  AlertCircle,
} from 'lucide-react'

export interface CustomerSelectProps {
  value?: string | number | null
  onChange: (customer: Customer | null) => void
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
}

export const CustomerSelect: React.FC<CustomerSelectProps> = ({
  value,
  onChange,
  label = 'Select Customer',
  placeholder = 'Search customer by name, email or company...',
  error,
  disabled = false,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedInternal, setSelectedInternal] = useState<Customer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedCustomer = useMemo(() => {
    if (value !== undefined) {
      if (!value) return null
      return customers.find((c) => String(c.id) === String(value)) || selectedInternal
    }
    return selectedInternal
  }, [value, customers, selectedInternal])

  // Fetch customers on initial mount and when search changes
  useEffect(() => {
    let isMounted = true
    const fetchCustomers = async () => {
      setIsLoading(true)
      try {
        const res = await getCustomersApi({
          search,
          status: 'all',
          sortBy: 'name',
          sortOrder: 'asc',
          page: 1,
          limit: 20,
        })
        if (isMounted) {
          setCustomers(res.customers)
        }
      } catch (err) {
        console.error('Failed to load customers for select dropdown', err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    const timer = setTimeout(fetchCustomers, search ? 200 : 0)
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [search])

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleSelect = (customer: Customer) => {
    setSelectedInternal(customer)
    onChange(customer)
    setIsOpen(false)
    setSearch('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedInternal(null)
    onChange(null)
    setSearch('')
  }

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Selector Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl text-left border flex items-center justify-between gap-2 transition-all ${
          disabled
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : error
              ? 'bg-white border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : isOpen
                ? 'bg-white border-[#4965F5] ring-2 ring-[#4965F5]/10 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
        }`}
      >
        {selectedCustomer ? (
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-7 h-7 rounded-lg bg-[#4965F5]/10 text-[#4965F5] flex items-center justify-center font-bold text-xs shrink-0">
              {selectedCustomer.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate text-left">
              <span className="text-sm font-semibold text-[#172033] block leading-tight truncate">
                {selectedCustomer.name}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1.5 leading-tight truncate mt-0.5">
                <Building className="w-3 h-3 shrink-0 text-slate-400" />
                {selectedCustomer.company} • {selectedCustomer.email}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-sm text-slate-400 flex items-center gap-2 truncate">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            {placeholder}
          </span>
        )}

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {selectedCustomer && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-slate-600 rounded-md transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#4965F5]' : ''}`}
          />
        </div>
      </button>

      {/* Error text */}
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in-50 slide-in-from-top-1 duration-150">
          {/* Search Input Box */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, company, email..."
                autoFocus
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#4965F5] focus:ring-1 focus:ring-[#4965F5]"
              />
            </div>
          </div>

          {/* Customer Items List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 p-1">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#4965F5]" />
                <span>Searching customer accounts...</span>
              </div>
            ) : customers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                <User className="w-6 h-6 mx-auto text-slate-300 mb-1.5" />
                <p className="font-medium text-slate-700">No customers found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different keyword</p>
              </div>
            ) : (
              customers.map((customer) => {
                const isSelected = selectedCustomer?.id === customer.id
                return (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleSelect(customer)}
                    className={`w-full px-3 py-2.5 rounded-lg text-left flex items-center justify-between gap-2.5 transition-colors ${
                      isSelected
                        ? 'bg-[#4965F5]/10 text-[#4965F5]'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-[#4965F5] text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold truncate leading-tight">
                          {customer.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">
                          {customer.company} • {customer.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                        {customer.plan}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#4965F5]" />}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
