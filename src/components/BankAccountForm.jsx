import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const inputCls = 'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white transition-all'
const labelCls = 'block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5'

export default function BankAccountForm({ clientId, data, onSaved, onCancel }) {
  const [form, setForm] = useState({
    bank_name: data?.bank_name || '',
    account_number: data?.account_number || '',
    ifsc_code: data?.ifsc_code || '',
    micr_number: data?.micr_number || '',
    branch_address: data?.branch_address || '',
    account_type: data?.account_type || 'saving',
    holding_type: data?.holding_type || 'single',
    upi_id: data?.upi_id || '',
    upi_provider: data?.upi_provider || '',
    is_primary: data?.is_primary ?? false,
  })
  const [saving, setSaving] = useState(false)

  function update(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.bank_name.trim()) { toast.error('Bank name is required'); return }
    setSaving(true)
    const payload = { ...form, client_id: clientId }
    Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null })
    try {
      if (data?.id) {
        const { error } = await supabase.from('bank_accounts').update(payload).eq('id', data.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('bank_accounts').insert(payload)
        if (error) throw error
      }
      toast.success(data?.id ? 'Account updated' : 'Account added')
      onSaved()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelCls}>Bank Name <span className="text-rose-500">*</span></label><input className={inputCls} value={form.bank_name} onChange={e => update('bank_name', e.target.value)} /></div>
        <div><label className={labelCls}>Account Number</label><input className={inputCls} value={form.account_number} onChange={e => update('account_number', e.target.value)} /></div>
        <div><label className={labelCls}>IFSC Code</label><input className={inputCls} value={form.ifsc_code} onChange={e => update('ifsc_code', e.target.value.toUpperCase())} /></div>
        <div><label className={labelCls}>MICR Number</label><input className={inputCls} value={form.micr_number} onChange={e => update('micr_number', e.target.value)} /></div>
        <div><label className={labelCls}>Branch Address</label><input className={inputCls} value={form.branch_address} onChange={e => update('branch_address', e.target.value)} /></div>
        <div><label className={labelCls}>Account Type</label><select className={inputCls} value={form.account_type} onChange={e => update('account_type', e.target.value)}><option value="saving">Saving</option><option value="current">Current</option></select></div>
        <div><label className={labelCls}>Holding Type</label><select className={inputCls} value={form.holding_type} onChange={e => update('holding_type', e.target.value)}><option value="single">Single</option><option value="joint">Joint</option></select></div>
        <div><label className={labelCls}>UPI ID</label><input className={inputCls} value={form.upi_id} onChange={e => update('upi_id', e.target.value)} /></div>
        <div><label className={labelCls}>UPI Provider</label><input className={inputCls} value={form.upi_provider} onChange={e => update('upi_provider', e.target.value)} placeholder="e.g. G-PAY, PhonePe" /></div>
        <div>
          <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
            <input type="checkbox" checked={form.is_primary} onChange={e => update('is_primary', e.target.checked)} className="rounded-md border-slate-300 text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-slate-700 font-medium">Primary Account</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-3">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-semibold hover:from-primary-700 hover:to-primary-600 transition-all shadow-md shadow-primary-500/20 disabled:opacity-50">
          {saving ? 'Saving...' : data?.id ? 'Update' : 'Add Account'}
        </button>
      </div>
    </form>
  )
}
