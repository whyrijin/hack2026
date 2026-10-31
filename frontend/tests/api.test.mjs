import { registerHooks } from 'node:module'
import assert from 'node:assert/strict'
import { test } from 'node:test'

registerHooks({ load(url, context, nextLoad) {
  const result = nextLoad(url, context)
  if (url.endsWith('/config/auth.ts')) result.source = String(result.source).replaceAll('import.meta.env.', '({}).')
  return result
} })
const { apiClient, setAccessToken } = await import('../src/api/client.ts')
const { getCustomersApi, createCustomerApi } = await import('../src/api/customers.ts')
const { formatApiError } = await import('../src/api/auth.ts')
const { AxiosError } = await import('axios')
const customer = { id: 18, name: 'Real Customer', email: 'real@example.test', company: '', phone: '', billing_address: {}, notes: '', created_at: '2026-10-31' }

test('customer list adapts server pagination and sends authenticated filtering', async () => {
  setAccessToken('test-token')
  apiClient.defaults.adapter = async config => {
    assert.equal(config.headers.Authorization, 'Bearer test-token')
    assert.equal(config.params.page_size, 20)
    assert.equal(config.params.search, 'Real')
    return { data: { count: 22, next: '/customers/?page=2', previous: null, results: [customer] }, status: 200, statusText: 'OK', headers: {}, config }
  }
  const result = await getCustomersApi({ search: 'Real', page: 1, limit: 20 })
  assert.equal(result.total, 22)
  assert.equal(result.totalPages, 2)
  assert.equal(result.customers[0].name, 'Real Customer')
})

test('failed customer creation rejects and never fabricates a saved record', async () => {
  apiClient.defaults.adapter = async () => { throw new Error('Backend unavailable') }
  await assert.rejects(createCustomerApi({ name: 'New', email: 'new@example.test', company: '', phone: '' }), /Backend unavailable/)
})

test('validation field details survive the stable API error envelope', () => {
  const error = new AxiosError('Bad request', 'ERR_BAD_REQUEST', undefined, undefined, { status: 400, data: { code: 'validation_error', message: 'Please correct the fields.', fields: { email: ['Already exists.'] } } })
  assert.deepEqual(formatApiError(error).fieldErrors, { email: ['Already exists.'] })
  assert.match(formatApiError(error).message, /Already exists/)
})

test('PDF download waits for a finished document rather than saving job JSON', async () => {
  const { fetchInvoicePdf } = await import('../src/api/invoices.ts')
  let reads = 0
  apiClient.defaults.adapter = async config => {
    reads++
    return { data: reads === 1 ? new Blob([JSON.stringify({ status: 'pending' })], { type: 'application/json' }) : new Blob(['%PDF-document'], { type: 'application/pdf' }), status: reads === 1 ? 202 : 200, statusText: 'OK', headers: {}, config }
  }
  const blob = await fetchInvoicePdf('invoice-id', true, { wait: async () => {}, attempts: 3 })
  assert.equal(blob.type, 'application/pdf')
  assert.equal(reads, 2)
})

test('a failed PDF job surfaces its error instead of claiming a download', async () => {
  const { fetchInvoicePdf } = await import('../src/api/invoices.ts')
  apiClient.defaults.adapter = async config => ({ data: new Blob([JSON.stringify({ status: 'failed', error: 'Document generation failed' })], { type: 'application/json' }), status: 202, statusText: 'Accepted', headers: {}, config })
  await assert.rejects(fetchInvoicePdf('invoice-id', true, { wait: async () => {}, attempts: 1 }), /failed/i)
})
