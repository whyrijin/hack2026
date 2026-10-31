import React, { useState, useEffect, useCallback } from 'react'
import type { Customer, CustomerFilters, PaginatedCustomers } from '../../types/customer.ts'
import { getCustomersApi } from '../../api/customers.ts'
import { CustomerStatusBadge } from './CustomerStatusBadge.tsx'
import { CustomerDetails } from './CustomerDetails.tsx'
import { CustomerFormModal } from './CustomerFormModal.tsx'
import {
  Search,
  Filter,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Building,
  Users,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit,
  ExternalLink,
  RotateCw,
} from 'lucide-react'

export const CustomerDirectory: React.FC = () => {
  // Navigation / view states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  // Data & Filter states
  const [data, setData] = useState<PaginatedCustomers>({
    customers: [],
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 6,
  })
  const [isLoading, setIsLoading] = useState(true)

  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
    limit: 6,
  })

  // Toast / Action notification
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Fetch customers on filters change
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getCustomersApi(filters)
      setData(res)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setIsLoading(true)
      try {
        const res = await getCustomersApi(filters)
        if (isMounted) {
          setData(res)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      isMounted = false
    }
  }, [filters])

  // Handle Search Input Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
      page: 1, // Reset to first page on search
    }))
  }

  // Handle Status Filter Change
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      status: e.target.value,
      page: 1,
    }))
  }

  // Handle Sort Change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val === 'name') {
      setFilters((prev) => ({ ...prev, sortBy: 'name', sortOrder: 'asc', page: 1 }))
    } else if (val === 'mrr') {
      setFilters((prev) => ({ ...prev, sortBy: 'mrr', sortOrder: 'desc', page: 1 }))
    } else {
      setFilters((prev) => ({ ...prev, sortBy: 'created_at', sortOrder: 'desc', page: 1 }))
    }
  }

  // Handlers for modal
  const handleOpenAddModal = () => {
    setEditingCustomer(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (customer: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setEditingCustomer(customer)
    setIsModalOpen(true)
  }

  const handleModalSuccess = (savedCustomer: Customer) => {
    fetchCustomers()
    if (selectedCustomer && selectedCustomer.id === savedCustomer.id) {
      setSelectedCustomer(savedCustomer)
    }
    showToast(
      editingCustomer
        ? `Customer "${savedCustomer.name}" updated successfully.`
        : `Customer "${savedCustomer.name}" registered successfully.`,
    )
  }

  // If a customer is selected, show Customer Details view
  if (selectedCustomer) {
    return (
      <div className="space-y-4">
        {toastMessage && (
          <div
            role="status"
            className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 animate-in fade-in"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}
        <CustomerDetails
          customer={selectedCustomer}
          onBack={() => setSelectedCustomer(null)}
          onEdit={(cust) => handleOpenEditModal(cust)}
        />
        <CustomerFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingCustomer}
          onSuccess={handleModalSuccess}
        />
      </div>
    )
  }

  // Calculate quick KPI metrics
  const activeCount = data.customers.filter((c) => c.status === 'active').length
  const totalMrr = data.customers.reduce((acc, c) => acc + (c.mrr || 0), 0)

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          role="status"
          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 animate-in fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your client accounts, contact details, and subscription health.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4965F5] hover:bg-[#3852de] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4965F5] shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Total Clients
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#172033] mt-0.5 block">
              {data.total}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#4965F5] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Active on Page
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5 block">
              {activeCount}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Page MRR
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#172033] mt-0.5 block">
              ${totalMrr.toLocaleString()}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              API Integration
            </span>
            <span className="text-xs font-bold text-slate-700 mt-1 block">Ready</span>
            <span className="text-[10px] text-slate-400">/api/v1/customers</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-cyan-50 text-[#38BDF8] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input: customer name, email, company */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search by customer name or email..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-[#E5E7EB] bg-slate-50/50 text-[#172033] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
          />
        </div>

        {/* Right filters: Status and Sort */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 w-1/2 md:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.status}
              onChange={handleStatusChange}
              className="w-full md:w-auto px-2.5 py-2 text-xs rounded-xl border border-[#E5E7EB] bg-slate-50/50 text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="churned">Churned</option>
            </select>
          </div>

          {/* Sort order */}
          <div className="w-1/2 md:w-auto">
            <select
              onChange={handleSortChange}
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-[#E5E7EB] bg-slate-50/50 text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
            >
              <option value="created_at">Sort: Newest First</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="mrr">Sort: Highest MRR</option>
            </select>
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={fetchCustomers}
            title="Refresh list"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#4965F5]"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-[#E5E7EB] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th scope="col" className="py-3.5 px-4 sm:px-6">
                  Customer
                </th>
                <th scope="col" className="py-3.5 px-4">
                  Contact
                </th>
                <th scope="col" className="py-3.5 px-4">
                  Status
                </th>
                <th scope="col" className="py-3.5 px-4">
                  Plan &amp; MRR
                </th>
                <th scope="col" className="py-3.5 px-4 hidden lg:table-cell">
                  Joined
                </th>
                <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-[#4965F5] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Loading customer directory...</span>
                    </div>
                  </td>
                </tr>
              ) : data.customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Users className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700">No customers found</p>
                      <p className="text-xs text-slate-400">
                        {filters.search
                          ? `No matches for "${filters.search}". Try refining your search query.`
                          : 'No customer accounts available in this view.'}
                      </p>
                      {filters.search && (
                        <button
                          type="button"
                          onClick={() => setFilters((prev) => ({ ...prev, search: '', page: 1 }))}
                          className="mt-2 text-xs font-semibold text-[#4965F5] hover:underline"
                        >
                          Clear search filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                data.customers.map((customer) => {
                  const initials = customer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()

                  return (
                    <tr
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Customer Name & Company */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#4965F5] border border-blue-100 flex items-center justify-center text-xs font-bold shrink-0">
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-[#172033] block group-hover:text-[#4965F5] transition-colors">
                              {customer.name}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-slate-400" />
                              <span>{customer.company}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <CustomerStatusBadge status={customer.status} size="sm" />
                      </td>

                      {/* Plan & MRR */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#172033] block text-xs">
                          {customer.plan}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          ${customer.mrr.toLocaleString()} / mo
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-slate-500">
                        {new Date(customer.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(customer)}
                            className="p-1.5 text-slate-400 hover:text-[#4965F5] hover:bg-blue-50 rounded-lg transition-colors"
                            title="View customer details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditModal(customer, e)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit customer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-[#E5E7EB] bg-slate-50/50 text-xs text-slate-500">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-700">
              {data.total > 0 ? (data.page - 1) * data.limit + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(data.page * data.limit, data.total)}
            </span>{' '}
            of <span className="font-semibold text-slate-700">{data.total}</span> customers
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              disabled={data.page <= 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
              className={`p-1.5 rounded-lg border border-slate-200 transition-colors ${
                data.page <= 1
                  ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400'
                  : 'hover:bg-white text-slate-600'
              }`}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number indicators */}
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, page: pageNum }))}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                  pageNum === data.page
                    ? 'bg-[#4965F5] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={data.page >= data.totalPages}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              className={`p-1.5 rounded-lg border border-slate-200 transition-colors ${
                data.page >= data.totalPages
                  ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400'
                  : 'hover:bg-white text-slate-600'
              }`}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingCustomer}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
