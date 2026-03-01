import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const inputCls = 'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white transition-all'
const labelCls = 'block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5'

export default function NomineeForm({ clientId, data, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: data?.name || '', father_name: data?.father_name || '', mother_name: data?.mother_name || '',
    marital_status: data?.marital_status || '', spouse_name: data?.spouse_name || '',
    dob: data?.dob || '', birth_place: data?.birth_place || '',
    mobile: data?.mobile || '', email: data?.email || '', aadhaar: data?.aadhaar || '', pan: data?.pan || '',
    relation: data?.relation || '', address: data?.address || '',
    income_range: data?.income_range || '', occupation: data?.occupation || '', education: data?.education || '',
  })
  const [saving, setSaving] = useState(false)

  function update(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Nominee name is required'); return }
    setSaving(true)
    const payload = { ...form, client_id: clientId }
    Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null })
    try {
      if (data?.id) {
        const { error } = await supabase.from('nominees').update(payload).eq('id', data.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('nominees').insert(payload)
        if (error) throw error
      }
      toast.success(data?.id ? 'Nominee updated' : 'Nominee added')
      onSaved()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelCls}>Nominee Name <span className="text-rose-500">*</span></label><input className={inputCls} value={form.name} onChange={e => update('name', e.target.value)} /></div>
        <div><label className={labelCls}>Relation</label><select className={inputCls} value={form.relation} onChange={e => update('relation', e.target.value)}><option value="">Select</option><option value="Wife">Wife</option><option value="Husband">Husband</option><option value="Father">Father</option><option value="Mother">Mother</option><option value="Son">Son</option><option value="Daughter">Daughter</option><option value="Brother">Brother</option><option value="Sister">Sister</option><option value="Other">Other</option></select></div>
        <div><label className={labelCls}>Father's Name</label><input className={inputCls} value={form.father_name} onChange={e => update('father_name', e.target.value)} /></div>
        <div><label className={labelCls}>Mother's Name</label><input className={inputCls} value={form.mother_name} onChange={e => update('mother_name', e.target.value)} /></div>
        <div><label className={labelCls}>Date of Birth</label><input type="date" className={inputCls} value={form.dob} onChange={e => update('dob', e.target.value)} /></div>
        <div><label className={labelCls}>Birth Place</label><input className={inputCls} value={form.birth_place} onChange={e => update('birth_place', e.target.value)} /></div>
        <div><label className={labelCls}>Mobile</label><input className={inputCls} value={form.mobile} onChange={e => update('mobile', e.target.value)} /></div>
        <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={form.email} onChange={e => update('email', e.target.value)} /></div>
        <div><label className={labelCls}>Aadhaar Number</label><input className={inputCls} value={form.aadhaar} onChange={e => update('aadhaar', e.target.value)} /></div>
        <div><label className={labelCls}>PAN Number</label><input className={inputCls} value={form.pan} onChange={e => update('pan', e.target.value.toUpperCase())} maxLength={10} /></div>
        <div className="md:col-span-2"><label className={labelCls}>Address</label><textarea className={inputCls} rows={2} value={form.address} onChange={e => update('address', e.target.value)} /></div>
        <div><label className={labelCls}>Income Range</label><select className={inputCls} value={form.income_range} onChange={e => update('income_range', e.target.value)}><option value="">Select</option><option value="Below 1 Lakh">Below 1 Lakh</option><option value="1 to 5 Lakhs">1 to 5 Lakhs</option><option value="5 to 10 Lakhs">5 to 10 Lakhs</option><option value="10 to 25 Lakhs">10 to 25 Lakhs</option><option value="Above 25 Lakhs">Above 25 Lakhs</option></select></div>
        <div><label className={labelCls}>Occupation</label><input className={inputCls} value={form.occupation} onChange={e => update('occupation', e.target.value)} /></div>
        <div><label className={labelCls}>Education</label><select className={inputCls} value={form.education} onChange={e => update('education', e.target.value)}><option value="">Select</option><option value="Under Graduate">Under Graduate</option><option value="Graduate">Graduate</option><option value="Post Graduate">Post Graduate</option><option value="Professional">Professional</option><option value="Others">Others</option></select></div>
        <div><label className={labelCls}>Marital Status</label><select className={inputCls} value={form.marital_status} onChange={e => update('marital_status', e.target.value)}><option value="">Select</option><option value="Married">Married</option><option value="Unmarried">Unmarried</option></select></div>
        <div><label className={labelCls}>Spouse Name</label><input className={inputCls} value={form.spouse_name} onChange={e => update('spouse_name', e.target.value)} /></div>
      </div>
      <div className="flex justify-end gap-3 pt-3">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-semibold hover:from-primary-700 hover:to-primary-600 transition-all shadow-md shadow-primary-500/20 disabled:opacity-50">
          {saving ? 'Saving...' : data?.id ? 'Update' : 'Add Nominee'}
        </button>
      </div>
    </form>
  )
}
