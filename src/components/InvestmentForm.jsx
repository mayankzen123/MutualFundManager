import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const inputCls = 'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white transition-all'
const labelCls = 'block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5'

export default function InvestmentForm({ clientId, data, onSaved, onCancel }) {
  const [form, setForm] = useState({
    registrar: data?.registrar || 'CAMS',
    fund_house: data?.fund_house || '',
    scheme_name: data?.scheme_name || '',
    investment_type: data?.investment_type || 'SIP',
    amount: data?.amount || '',
    sip_date: data?.sip_date || '',
    start_date: data?.start_date || '',
    status: data?.status || 'active',
    notes: data?.notes || '',
  })
  const [saving, setSaving] = useState(false)

  function update(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.fund_house.trim()) { toast.error('Fund house is required'); return }
    if (!form.scheme_name.trim()) { toast.error('Scheme name is required'); return }
    if (!form.amount) { toast.error('Amount is required'); return }
    setSaving(true)
    const payload = {
      ...form, client_id: clientId, amount: Number(form.amount),
      sip_date: form.sip_date ? Number(form.sip_date) : null,
      start_date: form.start_date || null, notes: form.notes || null,
    }
    try {
      if (data?.id) {
        const { error } = await supabase.from('investments').update(payload).eq('id', data.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('investments').insert(payload)
        if (error) throw error
      }
      toast.success(data?.id ? 'Investment updated' : 'Investment added')
      onSaved()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelCls}>Registrar <span className="text-rose-500">*</span></label><select className={inputCls} value={form.registrar} onChange={e => update('registrar', e.target.value)}><option value="CAMS">CAMS</option><option value="KFIN">KFintech</option></select></div>
        <div><label className={labelCls}>Fund House <span className="text-rose-500">*</span></label><input className={inputCls} value={form.fund_house} onChange={e => update('fund_house', e.target.value)} placeholder="e.g. HDFC, UTI, SBI" /></div>
        <div className="md:col-span-2"><label className={labelCls}>Scheme Name <span className="text-rose-500">*</span></label><input className={inputCls} value={form.scheme_name} onChange={e => update('scheme_name', e.target.value)} placeholder="e.g. HDFC Flexi Cap Reg GR" /></div>
        <div><label className={labelCls}>Investment Type</label><select className={inputCls} value={form.investment_type} onChange={e => update('investment_type', e.target.value)}><option value="SIP">SIP</option><option value="Lumpsum">Lumpsum</option></select></div>
        <div><label className={labelCls}>Amount (₹) <span className="text-rose-500">*</span></label><input type="number" className={inputCls} value={form.amount} onChange={e => update('amount', e.target.value)} min="0" /></div>
        <div><label className={labelCls}>SIP Date (Day of month)</label><input type="number" className={inputCls} value={form.sip_date} onChange={e => update('sip_date', e.target.value)} min="1" max="28" placeholder="e.g. 15" /></div>
        <div><label className={labelCls}>Start Date</label><input type="date" className={inputCls} value={form.start_date} onChange={e => update('start_date', e.target.value)} /></div>
        <div><label className={labelCls}>Status</label><select className={inputCls} value={form.status} onChange={e => update('status', e.target.value)}><option value="active">Active</option><option value="paused">Paused</option><option value="stopped">Stopped</option></select></div>
        <div><label className={labelCls}>Notes</label><input className={inputCls} value={form.notes} onChange={e => update('notes', e.target.value)} /></div>
      </div>
      <div className="flex justify-end gap-3 pt-3">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-semibold hover:from-primary-700 hover:to-primary-600 transition-all shadow-md shadow-primary-500/20 disabled:opacity-50">
          {saving ? 'Saving...' : data?.id ? 'Update' : 'Add Investment'}
        </button>
      </div>
    </form>
  )
}
