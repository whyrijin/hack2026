export type CustomerStatus = 'active' | 'pending' | 'inactive' | 'churned'

export interface BillingAddress {
  line1?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: CustomerStatus
  plan: string
  mrr: number
  currency: string
  created_at: string
  billing_address: BillingAddress
  notes?: string
}

export interface CreateCustomerPayload {
  name: string
  email: string
  phone: string
  company: string
  status?: CustomerStatus
  plan?: string
  mrr?: number
  currency?: string
  billing_address?: BillingAddress
  notes?: string
}

export interface UpdateCustomerPayload extends Partial<CreateCustomerPayload> {}

export interface CustomerFilters {
  search: string
  status: string
  sortBy: 'name' | 'created_at' | 'mrr'
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

export interface PaginatedCustomers {
  customers: Customer[]
  total: number
  page: number
  totalPages: number
  limit: number
}

