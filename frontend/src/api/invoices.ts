import { apiClient } from './client.ts'
import { AUTH_CONFIG } from '../config/auth.ts'

export interface Invoice {
  id: string
  invoice_number: string
  subscription_id: string
  customer_name: string
  status: 'Draft' | 'Confirmed' | 'Paid' | 'Cancelled'
  currency: string
  subtotal: string
  discount_total: string
  tax_total: string
  total: string
  amount_paid: string
  balance: string
  period_start: string
  period_end: string
  due_date: string | null
  cancellation_reason?: string
  allowed_actions: string[]
  lines: Array<{ id: string; description: string; quantity: string | number; unit_price: string; total_amount: string }>
  payments: Array<{ id: string; amount: string; method: string; payment_date: string; reference: string }>
}
export interface Page<T> { count: number; next: string | null; previous: string | null; results: T[] }
export const invoiceEndpoint = (portal = false) => `${AUTH_CONFIG.apiPrefix}/${portal ? 'portal/' : ''}invoices/`

/** A 202 response contains a job, never a downloadable PDF. */
export async function fetchInvoicePdf(id: string, portal = false, options: { attempts?: number; wait?: () => Promise<void> } = {}): Promise<Blob> {
  const endpoint = `${invoiceEndpoint(portal)}${id}/pdf/`
  if (!portal) await apiClient.post(endpoint, {})
  const wait = options.wait || (() => new Promise<void>(resolve => window.setTimeout(resolve, 1500)))
  for (let attempt = 0; attempt < (options.attempts ?? 30); attempt++) {
    const response = await apiClient.get<Blob>(endpoint, { responseType: 'blob' })
    if (response.status === 200 && response.data.type.includes('pdf')) return response.data
    const job = JSON.parse(await response.data.text()) as { status?: string; error?: string; message?: string }
    if (job.status?.toLowerCase() === 'failed') throw new Error(job.error || job.message || 'The PDF could not be generated. Please try again.')
    await wait()
  }
  throw new Error('The PDF is still being prepared. Try downloading again shortly.')
}
