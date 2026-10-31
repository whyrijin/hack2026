export interface BillingAddress {
  line1?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

export interface Customer {
  id: string | number
  name: string
  email: string
  phone: string
  company: string
  created_at: string
  billing_address: BillingAddress | string
  notes?: string
}

export type CreateCustomerPayload = Omit<Customer, 'id' | 'created_at'>
export type UpdateCustomerPayload = Partial<CreateCustomerPayload>

export interface CustomerFilters {
  search: string
  sortBy: 'name' | 'created_at'
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
