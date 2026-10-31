import { useState } from 'react'
import type { Customer, BillingAddress } from '../../types/customer.ts'
import { createCustomerApi, updateCustomerApi } from '../../api/customers.ts'
import { formatApiError } from '../../api/auth.ts'
import { buttonClass, ErrorNotice, Field, inputClass, Modal, primaryClass } from '../shared/WorkspaceUI.tsx'

export function CustomerFormModal({ initialData, onClose, onSuccess }: { initialData: Customer | null; onClose: () => void; onSuccess: (customer: Customer) => void }) {
  const [name, setName] = useState(initialData?.name || '')
  const [email, setEmail] = useState(initialData?.email || '')
  const [company, setCompany] = useState(initialData?.company || '')
  const [phone, setPhone] = useState(initialData?.phone || '')
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [address, setAddress] = useState<BillingAddress>(() => typeof initialData?.billing_address === 'string' ? { line1: initialData.billing_address } : initialData?.billing_address || {})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function save(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true); setError('')
    try {
      const payload = { name: name.trim(), email: email.trim(), company: company.trim(), phone: phone.trim(), notes, billing_address: address }
      const result = initialData ? await updateCustomerApi(initialData.id, payload) : await createCustomerApi(payload)
      onSuccess(result)
    } catch (cause) { setError(formatApiError(cause).message) }
    finally { setBusy(false) }
  }
  return <Modal title={initialData ? 'Edit customer' : 'New customer'} onClose={onClose} busy={busy}><form onSubmit={save} className="space-y-5"><ErrorNotice message={error}/><div className="grid gap-4 sm:grid-cols-2"><Field label="Name"><input autoFocus required maxLength={255} value={name} onChange={e => setName(e.target.value)} className={inputClass}/></Field><Field label="Email"><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass}/></Field><Field label="Company"><input value={company} onChange={e => setCompany(e.target.value)} className={inputClass}/></Field><Field label="Phone"><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass}/></Field></div><fieldset className="space-y-3"><legend className="mb-2 text-sm font-semibold">Billing address</legend><Field label="Address"><input value={address.line1 || ''} onChange={e => setAddress({ ...address, line1: e.target.value })} className={inputClass}/></Field><div className="grid gap-3 sm:grid-cols-2">{(['city', 'state', 'postal_code', 'country'] as const).map(key => <Field key={key} label={key === 'postal_code' ? 'Postal code' : key[0].toUpperCase() + key.slice(1)}><input value={address[key] || ''} onChange={e => setAddress({ ...address, [key]: e.target.value })} className={inputClass}/></Field>)}</div></fieldset><Field label="Internal notes"><textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} className={inputClass}/></Field><div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button type="button" className={buttonClass} disabled={busy} onClick={onClose}>Cancel</button><button type="submit" className={primaryClass} disabled={busy}>{busy ? 'Saving…' : 'Save customer'}</button></div></form></Modal>
}
