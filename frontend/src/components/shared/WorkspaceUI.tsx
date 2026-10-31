import type { ReactNode } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight, LoaderCircle, X } from 'lucide-react'

export const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50'
export const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
export const primaryClass = 'inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'

export function PageTitle({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></div>{action}</div>
}
export function ErrorNotice({ message, retry }: { message: string; retry?: () => void }) {
  if (!message) return null
  return <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle size={18} className="mt-0.5 shrink-0"/><div className="flex-1">{message}</div>{retry && <button className="shrink-0 font-semibold underline" onClick={retry}>Retry</button>}</div>
}
export function SuccessNotice({ message }: { message: string }) {
  return message ? <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div> : null
}
export function Loading({ label = 'Loading…' }: { label?: string }) {
  return <div role="status" className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin"/>{label}</div>
}
export function Empty({ title, description }: { title: string; description: string }) {
  return <div className="px-6 py-16 text-center"><p className="font-medium text-slate-800">{title}</p><p className="mt-2 text-sm text-slate-500">{description}</p></div>
}
export function Pagination({ page, total, pageSize = 20, onChange }: { page: number; total: number; pageSize?: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500"><span>{total} record{total === 1 ? '' : 's'} · Page {page} of {pages}</span><div className="flex gap-2"><button aria-label="Previous page" className={buttonClass} disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={16}/></button><button aria-label="Next page" className={buttonClass} disabled={page >= pages} onClick={() => onChange(page + 1)}><ChevronRight size={16}/></button></div></div>
}
export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = { Paid: 'bg-emerald-50 text-emerald-700', Confirmed: 'bg-blue-50 text-blue-700', Cancelled: 'bg-red-50 text-red-700', Draft: 'bg-slate-100 text-slate-600' }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-1.5 text-sm font-medium text-slate-700"><span>{label}</span>{children}</label>
}
export function Modal({ title, children, onClose, busy = false }: { title: string; children: ReactNode; onClose: () => void; busy?: boolean }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/35 p-4" onKeyDown={event => { if (event.key === 'Escape' && !busy) onClose() }}><section role="dialog" aria-modal="true" aria-label={title} className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-xl"><header className="flex items-center justify-between border-b border-slate-200 px-6 py-4"><h2 className="text-lg font-semibold">{title}</h2><button aria-label="Close dialog" disabled={busy} onClick={onClose} className="rounded p-1 text-slate-500 hover:bg-slate-100"><X size={20}/></button></header><div className="p-6">{children}</div></section></div>
}
export function money(value: string | number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(value))
}
export function dateLabel(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value.length === 10 ? `${value}T00:00:00` : value))
}
export function today() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
