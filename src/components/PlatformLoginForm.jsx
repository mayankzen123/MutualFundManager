import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const inputCls = 'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white transition-all'
const labelCls = 'block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5'

export default function PlatformLoginForm({ clientId, data, onSaved, onCancel }) {
  const [form, setForm] = useState({
    platform_name: data?.platform_name || '',
    username: data?.username || '',
    password_hint: data?.password_hint || '',
    notes: data?.notes || '',
  })
  const [saving, setSaving] = useState(false)

  function update(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.platform_name.trim()) { toast.error('Platform name is required'); return }
    setSaving(true)
    const payload = { ...form, client_id: clientId }
    Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null })
    try {
      if (data?.id) {
        const { error } = await supabase.from('platform_logins').update(payload).eq('id', data.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('platform_logins').insert(payload)
        if (error) throw error
      }
      toast.success(data?.id ? 'Login updated' : 'Login added')
      onSaved()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className={labelCls}>Platform Name <span className="text-rose-500">*</span></label><input className={inputCls} value={form.platform_name} onChange={e => update('platform_name', e.target.value)} placeholder="e.g. FundsBazar, MFU, Groww" /></div>
      <div><label className={labelCls}>Username / Email</label><input className={inputCls} value={form.username} onChange={e => update('username', e.target.value)} /></div>
      <div><label className={labelCls}>Password Hint</label><input className={inputCls} value={form.password_hint} onChange={e => update('password_hint', e.target.value)} placeholder="A hint to remember the password" /></div>
      <div><label className={labelCls}>Notes</label><textarea className={inputCls} rows={2} value={form.notes} onChange={e => update('notes', e.target.value)} /></div>
      <div className="flex justify-end gap-3 pt-3">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-semibold hover:from-primary-700 hover:to-primary-600 transition-all shadow-md shadow-primary-500/20 disabled:opacity-50">
          {saving ? 'Saving...' : data?.id ? 'Update' : 'Add Login'}
        </button>
      </div>
    </form>
  )
}
