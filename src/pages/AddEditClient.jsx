import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Check, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const steps = [
  { id: 1, title: 'Personal Details' },
  { id: 2, title: 'KYC & Registration' },
  { id: 3, title: 'Bank Account' },
  { id: 4, title: 'Nominee' },
]

const emptyClient = {
  name: '', father_name: '', mother_name: '', marital_status: '', spouse_name: '',
  dob: '', birth_place: '', mobile: '', email: '', aadhaar: '', pan: '', address: '',
  income_range: '', occupation: '', education: '', date_of_registration: '',
  kyc_cams: false, kyc_kfintech: false, bank_registered: false,
  nominee_registered: false, mandate_registered: false,
}

const emptyBank = {
  bank_name: '', account_number: '', ifsc_code: '', micr_number: '',
  branch_address: '', account_type: 'saving', holding_type: 'single',
  upi_id: '', upi_provider: '', is_primary: true,
}

const emptyNominee = {
  name: '', father_name: '', mother_name: '', marital_status: '', spouse_name: '',
  dob: '', birth_place: '', mobile: '', email: '', aadhaar: '', pan: '',
  relation: '', address: '', income_range: '', occupation: '', education: '',
}

function Field({ label, children, required }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white transition-all'
const selectCls = inputCls

export default function AddEditClient() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyClient)
  const [bank, setBank] = useState(emptyBank)
  const [nominee, setNominee] = useState(emptyNominee)
  const [skipBank, setSkipBank] = useState(false)
  const [skipNominee, setSkipNominee] = useState(false)

  useEffect(() => { if (isEdit) loadClient() }, [id])

  async function loadClient() {
    const { data, error } = await supabase.from('clients').select('*').eq('id', id).single()
    if (error) { toast.error('Client not found'); navigate('/clients'); return }
    setForm({ ...data, dob: data.dob || '', date_of_registration: data.date_of_registration || '' })
  }

  function updateForm(field, value) { setForm(prev => ({ ...prev, [field]: value })) }
  function updateBank(field, value) { setBank(prev => ({ ...prev, [field]: value })) }
  function updateNominee(field, value) { setNominee(prev => ({ ...prev, [field]: value })) }

  async function handleSubmit() {
    const required = [
      { field: 'name', label: 'Full Name' },
      { field: 'pan', label: 'PAN Number' },
      { field: 'mobile', label: 'Mobile' },
      { field: 'dob', label: 'Date of Birth' },
      { field: 'email', label: 'Email' },
      { field: 'address', label: 'Address' },
    ]
    const missing = required.find(r => !form[r.field]?.trim())
    if (missing) {
      toast.error(`${missing.label} is required`)
      if (!isEdit) setStep(1)
      return
    }
    setSaving(true)
    try {
      const clientData = { ...form }
      delete clientData.id
      delete clientData.created_at
      delete clientData.updated_at
      Object.keys(clientData).forEach(k => { if (clientData[k] === '') clientData[k] = null })
      clientData.updated_at = new Date().toISOString()

      let clientId = id
      if (isEdit) {
        const { error } = await supabase.from('clients').update(clientData).eq('id', id)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('clients').insert(clientData).select().single()
        if (error) throw error
        clientId = data.id
      }

      if (!isEdit && !skipBank && bank.bank_name.trim()) {
        const bankData = { ...bank, client_id: clientId }
        Object.keys(bankData).forEach(k => { if (bankData[k] === '') bankData[k] = null })
        await supabase.from('bank_accounts').insert(bankData)
      }
      if (!isEdit && !skipNominee && nominee.name.trim()) {
        const nomData = { ...nominee, client_id: clientId }
        Object.keys(nomData).forEach(k => { if (nomData[k] === '') nomData[k] = null })
        await supabase.from('nominees').insert(nomData)
      }

      toast.success(isEdit ? 'Client updated!' : 'Client created!')
      navigate(`/clients/${clientId}`)
    } catch (err) {
      toast.error(err.message || 'Save failed')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const progress = isEdit ? 100 : ((step - 1) / (steps.length - 1)) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={isEdit ? `/clients/${id}` : '/clients'} className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{isEdit ? 'Edit Client' : 'New Client'}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{isEdit ? 'Update client information' : 'Fill in details to register a new client'}</p>
        </div>
      </div>

      {!isEdit && (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <button
                  onClick={() => setStep(s.id)}
                  className="flex items-center gap-2.5 group"
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step === s.id
                      ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110'
                      : step > s.id
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                  </span>
                  <span className={`text-sm font-medium hidden sm:block transition-colors ${
                    step === s.id ? 'text-primary-700' : step > s.id ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {s.title}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 rounded-full overflow-hidden bg-slate-100">
                    <div className={`h-full rounded-full transition-all duration-500 ${step > s.id ? 'bg-emerald-500 w-full' : 'bg-transparent w-0'}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        {(step === 1 || isEdit) && (
          <div className={isEdit ? '' : step !== 1 ? 'hidden' : ''}>
            <h2 className="text-base font-bold text-slate-900 mb-5">Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name" required>
                <input className={inputCls} value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="Enter full name" />
              </Field>
              <Field label="PAN Number" required>
                <input className={inputCls} value={form.pan} onChange={e => updateForm('pan', e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} />
              </Field>
              <Field label="Mobile" required>
                <input className={inputCls} value={form.mobile} onChange={e => updateForm('mobile', e.target.value)} placeholder="10-digit mobile" />
              </Field>
              <Field label="Date of Birth" required>
                <input type="date" className={inputCls} value={form.dob} onChange={e => updateForm('dob', e.target.value)} />
              </Field>
              <Field label="Email" required>
                <input type="email" className={inputCls} value={form.email} onChange={e => updateForm('email', e.target.value)} />
              </Field>
              <Field label="Date of Registration">
                <input type="date" className={inputCls} value={form.date_of_registration} onChange={e => updateForm('date_of_registration', e.target.value)} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Address" required>
                  <textarea className={inputCls} rows={2} value={form.address} onChange={e => updateForm('address', e.target.value)} />
                </Field>
              </div>

              <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Additional Information</p>
              </div>

              <Field label="Father's Name">
                <input className={inputCls} value={form.father_name} onChange={e => updateForm('father_name', e.target.value)} />
              </Field>
              <Field label="Mother's Name">
                <input className={inputCls} value={form.mother_name} onChange={e => updateForm('mother_name', e.target.value)} />
              </Field>
              <Field label="Birth Place">
                <input className={inputCls} value={form.birth_place} onChange={e => updateForm('birth_place', e.target.value)} />
              </Field>
              <Field label="Marital Status">
                <select className={selectCls} value={form.marital_status} onChange={e => updateForm('marital_status', e.target.value)}>
                  <option value="">Select</option>
                  <option value="Married">Married</option>
                  <option value="Unmarried">Unmarried</option>
                </select>
              </Field>
              <Field label="Spouse Name">
                <input className={inputCls} value={form.spouse_name} onChange={e => updateForm('spouse_name', e.target.value)} />
              </Field>
              <Field label="Aadhaar Number">
                <input className={inputCls} value={form.aadhaar} onChange={e => updateForm('aadhaar', e.target.value)} placeholder="XXXX-XXXX-XXXX" />
              </Field>
              <Field label="Income Range">
                <select className={selectCls} value={form.income_range} onChange={e => updateForm('income_range', e.target.value)}>
                  <option value="">Select</option>
                  <option value="Below 1 Lakh">Below 1 Lakh</option>
                  <option value="1 to 5 Lakhs">1 to 5 Lakhs</option>
                  <option value="5 to 10 Lakhs">5 to 10 Lakhs</option>
                  <option value="10 to 25 Lakhs">10 to 25 Lakhs</option>
                  <option value="Above 25 Lakhs">Above 25 Lakhs</option>
                </select>
              </Field>
              <Field label="Occupation">
                <input className={inputCls} value={form.occupation} onChange={e => updateForm('occupation', e.target.value)} />
              </Field>
              <Field label="Education">
                <select className={selectCls} value={form.education} onChange={e => updateForm('education', e.target.value)}>
                  <option value="">Select</option>
                  <option value="Under Graduate">Under Graduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Post Graduate">Post Graduate</option>
                  <option value="Professional">Professional</option>
                  <option value="Others">Others</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        {(step === 2 || isEdit) && (
          <div className={isEdit ? 'mt-6 pt-6 border-t border-slate-100' : step !== 2 ? 'hidden' : ''}>
            <h2 className="text-base font-bold text-slate-900 mb-5">KYC & Registration Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { field: 'kyc_cams', label: 'KYC Registered (CAMS)' },
                { field: 'kyc_kfintech', label: 'KYC Registered (KFintech)' },
                { field: 'bank_registered', label: 'Bank Registered' },
                { field: 'nominee_registered', label: 'Nominee Registered' },
                { field: 'mandate_registered', label: 'Mandate Registered' },
              ].map(({ field, label }) => (
                <label key={field} className="flex items-center gap-3.5 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/70 transition-colors cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form[field] || false}
                    onChange={e => updateForm(field, e.target.checked)}
                    className="w-4.5 h-4.5 rounded-md border-slate-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900 transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && !isEdit && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900">Bank Account <span className="text-xs font-normal text-slate-400 ml-1">(Optional)</span></h2>
              <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer hover:text-slate-700 transition-colors">
                <input type="checkbox" checked={skipBank} onChange={e => setSkipBank(e.target.checked)} className="rounded-md border-slate-300 text-primary-600" />
                Skip for now
              </label>
            </div>
            {!skipBank && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Bank Name"><input className={inputCls} value={bank.bank_name} onChange={e => updateBank('bank_name', e.target.value)} /></Field>
                <Field label="Account Number"><input className={inputCls} value={bank.account_number} onChange={e => updateBank('account_number', e.target.value)} /></Field>
                <Field label="IFSC Code"><input className={inputCls} value={bank.ifsc_code} onChange={e => updateBank('ifsc_code', e.target.value.toUpperCase())} /></Field>
                <Field label="MICR Number"><input className={inputCls} value={bank.micr_number} onChange={e => updateBank('micr_number', e.target.value)} /></Field>
                <Field label="Branch Address"><input className={inputCls} value={bank.branch_address} onChange={e => updateBank('branch_address', e.target.value)} /></Field>
                <Field label="Account Type">
                  <select className={selectCls} value={bank.account_type} onChange={e => updateBank('account_type', e.target.value)}>
                    <option value="saving">Saving</option><option value="current">Current</option>
                  </select>
                </Field>
                <Field label="Holding Type">
                  <select className={selectCls} value={bank.holding_type} onChange={e => updateBank('holding_type', e.target.value)}>
                    <option value="single">Single</option><option value="joint">Joint</option>
                  </select>
                </Field>
                <Field label="UPI ID"><input className={inputCls} value={bank.upi_id} onChange={e => updateBank('upi_id', e.target.value)} /></Field>
                <Field label="UPI Provider"><input className={inputCls} value={bank.upi_provider} onChange={e => updateBank('upi_provider', e.target.value)} placeholder="e.g. G-PAY, PhonePe" /></Field>
              </div>
            )}
          </div>
        )}

        {step === 4 && !isEdit && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900">Nominee Details <span className="text-xs font-normal text-slate-400 ml-1">(Optional)</span></h2>
              <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer hover:text-slate-700 transition-colors">
                <input type="checkbox" checked={skipNominee} onChange={e => setSkipNominee(e.target.checked)} className="rounded-md border-slate-300 text-primary-600" />
                Skip for now
              </label>
            </div>
            {!skipNominee && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nominee Name"><input className={inputCls} value={nominee.name} onChange={e => updateNominee('name', e.target.value)} /></Field>
                <Field label="Relation">
                  <select className={selectCls} value={nominee.relation} onChange={e => updateNominee('relation', e.target.value)}>
                    <option value="">Select</option><option value="Wife">Wife</option><option value="Husband">Husband</option><option value="Father">Father</option><option value="Mother">Mother</option><option value="Son">Son</option><option value="Daughter">Daughter</option><option value="Brother">Brother</option><option value="Sister">Sister</option><option value="Other">Other</option>
                  </select>
                </Field>
                <Field label="Father's Name"><input className={inputCls} value={nominee.father_name} onChange={e => updateNominee('father_name', e.target.value)} /></Field>
                <Field label="Mother's Name"><input className={inputCls} value={nominee.mother_name} onChange={e => updateNominee('mother_name', e.target.value)} /></Field>
                <Field label="Date of Birth"><input type="date" className={inputCls} value={nominee.dob} onChange={e => updateNominee('dob', e.target.value)} /></Field>
                <Field label="Birth Place"><input className={inputCls} value={nominee.birth_place} onChange={e => updateNominee('birth_place', e.target.value)} /></Field>
                <Field label="Mobile"><input className={inputCls} value={nominee.mobile} onChange={e => updateNominee('mobile', e.target.value)} /></Field>
                <Field label="Email"><input type="email" className={inputCls} value={nominee.email} onChange={e => updateNominee('email', e.target.value)} /></Field>
                <Field label="Aadhaar Number"><input className={inputCls} value={nominee.aadhaar} onChange={e => updateNominee('aadhaar', e.target.value)} /></Field>
                <Field label="PAN Number"><input className={inputCls} value={nominee.pan} onChange={e => updateNominee('pan', e.target.value.toUpperCase())} maxLength={10} /></Field>
                <div className="md:col-span-2">
                  <Field label="Address"><textarea className={inputCls} rows={2} value={nominee.address} onChange={e => updateNominee('address', e.target.value)} /></Field>
                </div>
                <Field label="Income Range">
                  <select className={selectCls} value={nominee.income_range} onChange={e => updateNominee('income_range', e.target.value)}>
                    <option value="">Select</option><option value="Below 1 Lakh">Below 1 Lakh</option><option value="1 to 5 Lakhs">1 to 5 Lakhs</option><option value="5 to 10 Lakhs">5 to 10 Lakhs</option><option value="10 to 25 Lakhs">10 to 25 Lakhs</option><option value="Above 25 Lakhs">Above 25 Lakhs</option>
                  </select>
                </Field>
                <Field label="Occupation"><input className={inputCls} value={nominee.occupation} onChange={e => updateNominee('occupation', e.target.value)} /></Field>
                <Field label="Education">
                  <select className={selectCls} value={nominee.education} onChange={e => updateNominee('education', e.target.value)}>
                    <option value="">Select</option><option value="Under Graduate">Under Graduate</option><option value="Graduate">Graduate</option><option value="Post Graduate">Post Graduate</option><option value="Professional">Professional</option><option value="Others">Others</option>
                  </select>
                </Field>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        {!isEdit && step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
            Previous
          </button>
        ) : <div />}
        {!isEdit && step < 4 ? (
          <button onClick={() => setStep(step + 1)} className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-semibold hover:from-primary-700 hover:to-primary-600 transition-all shadow-md shadow-primary-500/20 active:scale-[0.98]">
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-7 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-semibold hover:from-primary-700 hover:to-primary-600 transition-all shadow-md shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {saving ? 'Saving...' : isEdit ? 'Update Client' : 'Create Client'}
          </button>
        )}
      </div>
    </div>
  )
}
