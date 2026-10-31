import { useCallback, useEffect, useState } from 'react'
import { Plus, RefreshCw, Search, Pencil, ArrowLeft } from 'lucide-react'
import type { Customer, PaginatedCustomers } from '../../types/customer.ts'
import { getCustomerByIdApi, getCustomersApi } from '../../api/customers.ts'
import { formatApiError } from '../../api/auth.ts'
import { CustomerFormModal } from './CustomerFormModal.tsx'
import { buttonClass, dateLabel, Empty, ErrorNotice, inputClass, Loading, PageTitle, Pagination, primaryClass, SuccessNotice } from '../shared/WorkspaceUI.tsx'

export function CustomerDirectory() {
  const [data, setData] = useState<PaginatedCustomers | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [selected, setSelected] = useState<Customer | null>(null)
  const [editing, setEditing] = useState<Customer | null | undefined>(undefined)
  const refresh = useCallback(() => setRevision(value => value + 1), [])
  useEffect(() => {
    let active = true
    setLoading(true); setError('')
    const timer = window.setTimeout(() => {
      getCustomersApi({ search, page, limit: 20 }).then(result => { if (active) setData(result) }).catch(cause => { if (active) { setData(null); setError(formatApiError(cause).message) } }).finally(() => { if (active) setLoading(false) })
    }, search ? 200 : 0)
    return () => { active = false; window.clearTimeout(timer) }
  }, [search, page, revision])
  async function open(customer: Customer) {
    setError('')
    try { setSelected(await getCustomerByIdApi(customer.id)) }
    catch (cause) { setError(formatApiError(cause).message) }
  }
  const address = selected ? (typeof selected.billing_address === 'string' ? selected.billing_address : Object.values(selected.billing_address || {}).filter(Boolean).join(', ')) : ''
  return <div className="space-y-6"><PageTitle title={selected ? selected.name : 'Customers'} description={selected ? 'Contact details and billing information.' : 'The people and businesses you bill.'} action={<button className={primaryClass} onClick={() => setEditing(selected)}>{selected ? <Pencil size={17}/> : <Plus size={17}/>} {selected ? 'Edit customer' : 'New customer'}</button>}/><ErrorNotice message={error} retry={refresh}/><SuccessNotice message={notice}/>{selected ? <><button className={buttonClass} onClick={() => setSelected(null)}><ArrowLeft size={16}/>All customers</button><section className="rounded-xl border border-slate-200 bg-white p-6"><dl className="grid gap-6 sm:grid-cols-2">{[['Email', selected.email], ['Company', selected.company], ['Phone', selected.phone], ['Added', dateLabel(selected.created_at)], ['Billing address', address], ['Internal notes', selected.notes]].map(([label, value]) => <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-2 whitespace-pre-wrap break-words text-sm font-medium text-slate-900">{value || '—'}</dd></div>)}</dl></section></> : <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4"><label className="relative w-full max-w-sm"><span className="sr-only">Search customers</span><Search className="absolute left-3 top-3 text-slate-400" size={18}/><input className={`${inputClass} pl-10`} placeholder="Search name, email, or company" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}/></label><button aria-label="Refresh customers" className={buttonClass} onClick={refresh}><RefreshCw size={17}/></button></div>{loading ? <Loading label="Loading customers…"/> : data && data.customers.length > 0 ? <div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Phone</th><th>Added</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{data.customers.map(customer => <tr key={customer.id}><td><button className="font-semibold text-blue-700 hover:underline" onClick={() => void open(customer)}>{customer.name}</button></td><td>{customer.email}</td><td>{customer.company || '—'}</td><td>{customer.phone || '—'}</td><td>{dateLabel(customer.created_at)}</td><td><button aria-label={`Edit ${customer.name}`} className="rounded p-1 text-slate-500 hover:text-blue-600" onClick={() => setEditing(customer)}><Pencil size={16}/></button></td></tr>)}</tbody></table></div> : !error ? <Empty title={search ? 'No matching customers' : 'No customers yet'} description={search ? 'Try a different name or email.' : 'Add a customer to create their first subscription.'}/> : null}{data && !loading && <Pagination page={page} total={data.total} onChange={setPage}/>}</section>}{editing !== undefined && <CustomerFormModal initialData={editing} onClose={() => setEditing(undefined)} onSuccess={customer => { setNotice(`${customer.name} saved.`); if (selected?.id === customer.id) setSelected(customer); setEditing(undefined); refresh() }}/>}</div>
}
