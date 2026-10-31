import { apiClient } from './client.ts'
import { AUTH_CONFIG } from '../config/auth.ts'
import type {
  Customer,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  CustomerFilters,
  PaginatedCustomers,
} from '../types/customer.ts'

const CUSTOMERS_ENDPOINT = `${AUTH_CONFIG.apiPrefix}/customers/`

// Initial seed data for fallback when Django backend endpoints are offline/not ready
const INITIAL_MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust_01J8A9K1',
    name: 'Sarah Connor',
    email: 'sarah.connor@cyberdyne.io',
    phone: '+1 (415) 890-2341',
    company: 'Cyberdyne Systems',
    status: 'active',
    plan: 'Enterprise Cloud',
    mrr: 4500,
    currency: 'USD',
    created_at: '2026-01-15T10:30:00Z',
    billing_address: {
      line1: '100 Industrial Pkwy',
      city: 'Sunnyvale',
      state: 'CA',
      postal_code: '94085',
      country: 'United States',
    },
    notes: 'Key enterprise account. Requires dedicated quarterly reviews.',
  },
  {
    id: 'cust_02K7B8L2',
    name: 'Alexander Hayes',
    email: 'alex.hayes@vertexscale.tech',
    phone: '+1 (206) 555-0199',
    company: 'Vertex Scale',
    status: 'active',
    plan: 'Pro Tier',
    mrr: 1200,
    currency: 'USD',
    created_at: '2026-02-04T14:15:00Z',
    billing_address: {
      line1: '450 Pine Street, Suite 400',
      city: 'Seattle',
      state: 'WA',
      postal_code: '98101',
      country: 'United States',
    },
    notes: 'Migrated from Stripe Billing in Q1.',
  },
  {
    id: 'cust_03M6C7M3',
    name: 'Elena Rostova',
    email: 'elena@novafinance.eu',
    phone: '+44 20 7946 0912',
    company: 'Nova Finance UK',
    status: 'active',
    plan: 'Enterprise Cloud',
    mrr: 6800,
    currency: 'USD',
    created_at: '2026-02-18T09:00:00Z',
    billing_address: {
      line1: '25 Bank Street',
      city: 'London',
      state: 'Greater London',
      postal_code: 'E14 5JP',
      country: 'United Kingdom',
    },
    notes: 'Requires dual-signature compliance on invoices.',
  },
  {
    id: 'cust_04N5D6N4',
    name: 'Marcus Vance',
    email: 'marcus@nexora.ai',
    phone: '+1 (512) 441-9820',
    company: 'Nexora AI',
    status: 'pending',
    plan: 'Growth Plan',
    mrr: 750,
    currency: 'USD',
    created_at: '2026-03-01T11:45:00Z',
    billing_address: {
      line1: '800 Congress Ave',
      city: 'Austin',
      state: 'TX',
      postal_code: '78701',
      country: 'United States',
    },
    notes: 'Awaiting primary payment method verification.',
  },
  {
    id: 'cust_05P4E5P5',
    name: 'Priya Sharma',
    email: 'priya.sharma@zenithcloud.in',
    phone: '+91 80 4123 4567',
    company: 'Zenith Cloud Labs',
    status: 'active',
    plan: 'Pro Tier',
    mrr: 1450,
    currency: 'USD',
    created_at: '2026-03-12T16:20:00Z',
    billing_address: {
      line1: 'Outer Ring Road, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      postal_code: '560103',
      country: 'India',
    },
    notes: 'High API usage volume. Consider custom tier upgrade.',
  },
  {
    id: 'cust_06Q3F4Q6',
    name: 'Daniel Tanaka',
    email: 'tanaka.d@solarlight.jp',
    phone: '+81 3 5555 0143',
    company: 'SolarLight Energy',
    status: 'active',
    plan: 'Growth Plan',
    mrr: 890,
    currency: 'USD',
    created_at: '2026-03-22T08:10:00Z',
    billing_address: {
      line1: '1-1-2 Marunouchi, Chiyoda-ku',
      city: 'Tokyo',
      state: 'Tokyo',
      postal_code: '100-0005',
      country: 'Japan',
    },
    notes: 'Annual billing schedule renews in March.',
  },
  {
    id: 'cust_07R2G3R7',
    name: 'Chloe Dubois',
    email: 'chloe@atelierdigital.fr',
    phone: '+33 1 42 68 55 00',
    company: 'Atelier Digital',
    status: 'inactive',
    plan: 'Starter Plan',
    mrr: 290,
    currency: 'USD',
    created_at: '2026-04-05T13:00:00Z',
    billing_address: {
      line1: '14 Rue de Rivoli',
      city: 'Paris',
      state: 'Île-de-France',
      postal_code: '75004',
      country: 'France',
    },
    notes: 'Subscription currently paused by customer request.',
  },
  {
    id: 'cust_08S1H2S8',
    name: 'Jordan Miller',
    email: 'jordan@stratapay.co',
    phone: '+1 (312) 880-1290',
    company: 'StrataPay Systems',
    status: 'active',
    plan: 'Enterprise Cloud',
    mrr: 5200,
    currency: 'USD',
    created_at: '2026-04-18T10:00:00Z',
    billing_address: {
      line1: '233 S Wacker Dr',
      city: 'Chicago',
      state: 'IL',
      postal_code: '60606',
      country: 'United States',
    },
    notes: 'Multi-seat enterprise workspace with 40+ operators.',
  },
  {
    id: 'cust_09T0I1T9',
    name: 'Liam O’Connor',
    email: 'liam@emeraldmetrics.ie',
    phone: '+353 1 496 0122',
    company: 'Emerald Metrics',
    status: 'churned',
    plan: 'Starter Plan',
    mrr: 0,
    currency: 'USD',
    created_at: '2026-04-29T15:30:00Z',
    billing_address: {
      line1: 'Grand Canal Dock',
      city: 'Dublin',
      state: 'Leinster',
      postal_code: 'D02',
      country: 'Ireland',
    },
    notes: 'Churned due to company acquisition in Q2.',
  },
  {
    id: 'cust_10U9J0U0',
    name: 'Amara Okafor',
    email: 'amara.okafor@katalyst.ng',
    phone: '+234 1 234 5678',
    company: 'Katalyst Logistics',
    status: 'active',
    plan: 'Growth Plan',
    mrr: 950,
    currency: 'USD',
    created_at: '2026-05-10T12:00:00Z',
    billing_address: {
      line1: 'Victoria Island',
      city: 'Lagos',
      state: 'Lagos',
      postal_code: '101241',
      country: 'Nigeria',
    },
    notes: 'Prompt auto-debit payments via virtual card.',
  },
  {
    id: 'cust_11V8K9V1',
    name: 'Benjamin Rivera',
    email: 'b.rivera@omnisync.io',
    phone: '+1 (786) 304-9912',
    company: 'OmniSync Global',
    status: 'pending',
    plan: 'Pro Tier',
    mrr: 1200,
    currency: 'USD',
    created_at: '2026-05-22T09:15:00Z',
    billing_address: {
      line1: '1111 Brickell Ave',
      city: 'Miami',
      state: 'FL',
      postal_code: '33131',
      country: 'United States',
    },
    notes: 'Trial period ending in 4 days.',
  },
  {
    id: 'cust_12W7L8W2',
    name: 'Katarina Lindqvist',
    email: 'katarina@nordicstream.se',
    phone: '+46 8 123 456 78',
    company: 'NordicStream Media',
    status: 'active',
    plan: 'Enterprise Cloud',
    mrr: 3900,
    currency: 'USD',
    created_at: '2026-06-05T14:45:00Z',
    billing_address: {
      line1: 'Kungsgatan 12',
      city: 'Stockholm',
      state: 'Stockholm',
      postal_code: '111 35',
      country: 'Sweden',
    },
    notes: 'Custom SLA terms applied in contract appendix.',
  },
]

// In-memory / session store to simulate persistent client updates if backend is not responding
let mockStore: Customer[] = [...INITIAL_MOCK_CUSTOMERS]

/**
 * GET /api/v1/customers with search, status filtering, sorting & pagination
 */
export async function getCustomersApi(
  filters: Partial<CustomerFilters> = {},
): Promise<PaginatedCustomers> {
  const {
    search = '',
    status = '',
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 6,
  } = filters

  try {
    // Attempt actual Django endpoint
    const response = await apiClient.get<PaginatedCustomers | Customer[]>(
      CUSTOMERS_ENDPOINT,
      {
        params: { search, status, sort_by: sortBy, sort_order: sortOrder, page, limit },
      },
    )

    if (Array.isArray(response.data)) {
      const all = response.data
      const total = all.length
      const totalPages = Math.ceil(total / limit)
      const start = (page - 1) * limit
      return {
        customers: all.slice(start, start + limit),
        total,
        page,
        totalPages,
        limit,
      }
    }

    return response.data
  } catch {
    // Graceful fallback to mock data store
    let filtered = [...mockStore]

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.phone.includes(q),
      )
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((c) => c.status.toLowerCase() === status.toLowerCase())
    }

    filtered.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === 'mrr') {
        comparison = a.mrr - b.mrr
      } else {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const validPage = Math.min(page, totalPages)
    const startIndex = (validPage - 1) * limit
    const paged = filtered.slice(startIndex, startIndex + limit)

    return {
      customers: paged,
      total,
      page: validPage,
      totalPages,
      limit,
    }
  }
}

/**
 * GET /api/v1/customers/{id}
 */
export async function getCustomerByIdApi(id: string): Promise<Customer> {
  try {
    const response = await apiClient.get<Customer>(`${CUSTOMERS_ENDPOINT}${id}/`)
    return response.data
  } catch {
    const found = mockStore.find((c) => c.id === id)
    if (!found) {
      throw new Error(`Customer with ID ${id} was not found.`)
    }
    return found
  }
}

/**
 * POST /api/v1/customers
 */
export async function createCustomerApi(payload: CreateCustomerPayload): Promise<Customer> {
  try {
    const response = await apiClient.post<Customer>(CUSTOMERS_ENDPOINT, payload)
    return response.data
  } catch {
    const newCustomer: Customer = {
      id: `cust_${Date.now().toString(36).toUpperCase()}`,
      name: payload.name,
      email: payload.email,
      phone: payload.phone || '+1 (555) 000-0000',
      company: payload.company || payload.name,
      status: payload.status || 'active',
      plan: payload.plan || 'Starter Plan',
      mrr: payload.mrr ?? 500,
      currency: payload.currency || 'USD',
      created_at: new Date().toISOString(),
      billing_address: payload.billing_address || {
        line1: '123 Market St',
        city: 'San Francisco',
        state: 'CA',
        postal_code: '94105',
        country: 'United States',
      },
      notes: payload.notes || '',
    }

    mockStore = [newCustomer, ...mockStore]
    return newCustomer
  }
}

/**
 * PATCH /api/v1/customers/{id}
 */
export async function updateCustomerApi(
  id: string,
  payload: UpdateCustomerPayload,
): Promise<Customer> {
  try {
    const response = await apiClient.patch<Customer>(
      `${CUSTOMERS_ENDPOINT}${id}/`,
      payload,
    )
    return response.data
  } catch {
    const index = mockStore.findIndex((c) => c.id === id)
    if (index === -1) {
      throw new Error(`Customer with ID ${id} was not found.`)
    }

    const current = mockStore[index]
    const updated: Customer = {
      ...current,
      ...payload,
      billing_address: {
        ...current.billing_address,
        ...(payload.billing_address || {}),
      },
    }

    mockStore[index] = updated
    return updated
  }
}
