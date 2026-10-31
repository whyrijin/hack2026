import { apiClient } from './client.ts'
import { AUTH_CONFIG } from '../config/auth.ts'
import type { Customer, CreateCustomerPayload, UpdateCustomerPayload, CustomerFilters, PaginatedCustomers } from '../types/customer.ts'

const endpoint = `${AUTH_CONFIG.apiPrefix}/customers/`

export async function getCustomersApi(filters: Partial<CustomerFilters> = {}): Promise<PaginatedCustomers> {
  const { search = '', sortBy = 'created_at', sortOrder = 'desc', page = 1, limit = 20 } = filters
  const { data } = await apiClient.get<{ count: number; results: Customer[] }>(endpoint, {
    params: { search, ordering: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`, page, page_size: limit },
  })
  return { customers: data.results, total: data.count, page, totalPages: Math.max(1, Math.ceil(data.count / limit)), limit }
}

export async function getCustomerByIdApi(id: string | number): Promise<Customer> {
  return (await apiClient.get<Customer>(`${endpoint}${id}/`)).data
}

export async function createCustomerApi(payload: CreateCustomerPayload): Promise<Customer> {
  return (await apiClient.post<Customer>(endpoint, payload)).data
}

export async function updateCustomerApi(id: string | number, payload: UpdateCustomerPayload): Promise<Customer> {
  return (await apiClient.patch<Customer>(`${endpoint}${id}/`, payload)).data
}
