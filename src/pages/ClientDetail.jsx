import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Pencil, Trash2, User, Building2, Heart, TrendingUp, KeyRound,
  Plus, Phone, Mail, MapPin, CreditCard, Calendar, Shield, Briefcase, GraduationCap, Download
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { exportToCsv } from '../lib/exportCsv'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import BankAccountForm from '../components/BankAccountForm'
import NomineeForm from '../components/NomineeForm'
import InvestmentForm from '../components/InvestmentForm'
import PlatformLoginForm from '../components/PlatformLoginForm'
import toast from 'react-hot-toast'

const tabs = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'bank', label: 'Bank Accounts', icon: Building2 },
  { id: 'nominees', label: 'Nominees', icon: Heart },
  { id: 'investments', label: 'Investments', icon: TrendingUp },
  { id: 'logins', label: 'Logins', icon: KeyRound },
]

const avatarColors = ['from-violet-500 to-purple-600', 'from-sky-500 to-blue-600', 'from-emerald-500 to-teal-600', 'from-orange-500 to-amber-600', 'from-rose-500 to-pink-600']
function getAvatarColor(name) { let h = 0; for (let i = 0; i < (name||'').length; i++) h = name.charCodeAt(i) + ((h << 5) - h); return avatarColors[Math.abs(h) % avatarColors.length] }
function getInitials(name) { return (name||'').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }

function InfoCard({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
      {Icon && (
        <div className="p-2 rounded-lg bg-white border border-slate-100 shadow-sm shrink-0">
          <Icon className="w-3.5 h-3.5 text-slate-500" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm text-slate-800 font-medium mt-0.5 truncate">{value || '-'}</p>
      </div>
    </div>
  )
}

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [bankAccounts, setBankAccounts] = useState([])
  const [nominees, setNominees] = useState([])
  const [investments, setInvestments] = useState([])
  const [platformLogins, setPlatformLogins] = useState([])
  const [activeTab, setActiveTab] = useState('personal')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ type: null, data: null })

  useEffect(() => { loadAll() }, [id])

  async function loadAll() {
    setLoading(true)
    const [cRes, bRes, nRes, iRes, pRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('bank_accounts').select('*').eq('client_id', id).order('created_at'),
      supabase.from('nominees').select('*').eq('client_id', id).order('created_at'),
      supabase.from('investments').select('*').eq('client_id', id).order('created_at'),
      supabase.from('platform_logins').select('*').eq('client_id', id).order('created_at'),
    ])
    if (cRes.error) { toast.error('Client not found'); navigate('/clients'); return }
    setClient(cRes.data)
    setBankAccounts(bRes.data || [])
    setNominees(nRes.data || [])
    setInvestments(iRes.data || [])
    setPlatformLogins(pRes.data || [])
    setLoading(false)
  }

  async function deleteClient() {
    if (!confirm(`Delete "${client.name}"? This removes all related data.`)) return
    await supabase.from('clients').delete().eq('id', id)
    toast.success('Client deleted')
    navigate('/clients')
  }

  async function deleteRelated(table, itemId, setter) {
    const { error } = await supabase.from(table).delete().eq('id', itemId)
    if (error) { toast.error('Delete failed'); return }
    toast.success('Deleted')
    setter(prev => prev.filter(i => i.id !== itemId))
  }

  function closeModal() { setModal({ type: null, data: null }) }
  function handleSaved() { closeModal(); loadAll() }

  const slug = (name) => (name || 'client').replace(/\s+/g, '_').toLowerCase()

  function exportBankAccounts() {
    exportToCsv(`${slug(client?.name)}_bank_accounts`, [
      { label: 'Bank Name', key: 'bank_name' },
      { label: 'Account Number', key: 'account_number' },
      { label: 'IFSC', key: 'ifsc_code' },
      { label: 'MICR', key: 'micr_number' },
      { label: 'Branch', key: 'branch_address' },
      { label: 'Type', key: 'account_type' },
      { label: 'Holding', key: 'holding_type' },
      { label: 'UPI ID', key: 'upi_id' },
      { label: 'UPI Provider', key: 'upi_provider' },
      { label: 'Primary', accessor: r => r.is_primary ? 'Yes' : 'No' },
    ], bankAccounts)
    toast.success(`Exported ${bankAccounts.length} bank accounts`)
  }

  function exportNominees() {
    exportToCsv(`${slug(client?.name)}_nominees`, [
      { label: 'Name', key: 'name' },
      { label: 'Relation', key: 'relation' },
      { label: 'PAN', key: 'pan' },
      { label: 'Mobile', key: 'mobile' },
      { label: 'Email', key: 'email' },
      { label: 'DOB', accessor: r => r.dob || '' },
      { label: 'Address', key: 'address' },
      { label: 'Father Name', key: 'father_name' },
      { label: 'Mother Name', key: 'mother_name' },
    ], nominees)
    toast.success(`Exported ${nominees.length} nominees`)
  }

  function exportInvestments() {
    exportToCsv(`${slug(client?.name)}_investments`, [
      { label: 'Scheme Name', key: 'scheme_name' },
      { label: 'Fund House', key: 'fund_house' },
      { label: 'Registrar', key: 'registrar' },
      { label: 'Type', key: 'investment_type' },
      { label: 'Amount', key: 'amount' },
      { label: 'SIP Date', key: 'sip_date' },
      { label: 'Start Date', accessor: r => r.start_date || '' },
      { label: 'Status', key: 'status' },
      { label: 'Notes', key: 'notes' },
    ], investments)
    toast.success(`Exported ${investments.length} investments`)
  }

  function exportLogins() {
    exportToCsv(`${slug(client?.name)}_platform_logins`, [
      { label: 'Platform', key: 'platform_name' },
      { label: 'Username', key: 'username' },
      { label: 'Password Hint', key: 'password_hint' },
      { label: 'Notes', key: 'notes' },
    ], platformLogins)
    toast.success(`Exported ${platformLogins.length} logins`)
  }

  function exportAllClientData() {
    exportToCsv(`${slug(client?.name)}_full_details`, [
      { label: 'Name', key: 'name' },
      { label: 'PAN', key: 'pan' },
      { label: 'Mobile', key: 'mobile' },
      { label: 'Email', key: 'email' },
      { label: 'DOB', accessor: r => r.dob || '' },
      { label: 'Address', key: 'address' },
      { label: 'Father Name', key: 'father_name' },
      { label: 'Mother Name', key: 'mother_name' },
      { label: 'Spouse Name', key: 'spouse_name' },
      { label: 'Aadhaar', key: 'aadhaar' },
      { label: 'Occupation', key: 'occupation' },
      { label: 'Education', key: 'education' },
      { label: 'Income Range', key: 'income_range' },
      { label: 'Registration Date', accessor: r => r.date_of_registration || '' },
      { label: 'KYC CAMS', accessor: r => r.kyc_cams ? 'Yes' : 'No' },
      { label: 'KYC KFintech', accessor: r => r.kyc_kfintech ? 'Yes' : 'No' },
      { label: 'Bank Registered', accessor: r => r.bank_registered ? 'Yes' : 'No' },
      { label: 'Nominee Registered', accessor: r => r.nominee_registered ? 'Yes' : 'No' },
      { label: 'Mandate Registered', accessor: r => r.mandate_registered ? 'Yes' : 'No' },
    ], [client])
    toast.success('Exported client details')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-primary-100 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  const maskAadhaar = (a) => a ? `XXXX-XXXX-${a.slice(-4)}` : '-'

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <div className="flex items-start gap-5">
          <Link to="/clients" className="p-2 rounded-xl hover:bg-slate-100 transition-colors mt-1 shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div className={`w-14 h-14 bg-gradient-to-br ${getAvatarColor(client.name)} rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/15 shrink-0`}>
            <span className="text-lg font-bold text-white">{getInitials(client.name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{client.name}</h1>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500">
              <span className="font-mono font-medium text-slate-600">{client.pan}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{client.mobile}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{client.date_of_registration ? new Date(client.date_of_registration).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not registered'}</span>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Badge variant={client.kyc_cams ? 'green' : 'red'}>CAMS {client.kyc_cams ? 'Active' : 'Inactive'}</Badge>
              <Badge variant={client.kyc_kfintech ? 'green' : 'red'}>KFIN {client.kyc_kfintech ? 'Active' : 'Inactive'}</Badge>
              {client.bank_registered && <Badge variant="purple">Bank Verified</Badge>}
              {client.nominee_registered && <Badge variant="yellow">Nominee Set</Badge>}
              {client.mandate_registered && <Badge variant="gray">Mandate Active</Badge>}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={exportAllClientData} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl hover:bg-slate-100 transition-colors text-slate-700">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <Link to={`/clients/${id}/edit`} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl hover:bg-slate-100 transition-colors text-slate-700">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Link>
            <button onClick={deleteClient} className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium rounded-xl hover:bg-rose-100 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-slate-200/60 p-1.5 shadow-sm">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/20'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm">
        {activeTab === 'personal' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <InfoCard icon={User} label="Full Name" value={client.name} />
              <InfoCard icon={CreditCard} label="PAN" value={client.pan} />
              <InfoCard icon={Phone} label="Mobile" value={client.mobile} />
              <InfoCard icon={Mail} label="Email" value={client.email} />
              <InfoCard icon={Calendar} label="Date of Birth" value={client.dob ? new Date(client.dob).toLocaleDateString('en-IN') : null} />
              <InfoCard icon={MapPin} label="Birth Place" value={client.birth_place} />
              <InfoCard icon={User} label="Father's Name" value={client.father_name} />
              <InfoCard icon={User} label="Mother's Name" value={client.mother_name} />
              <InfoCard label="Marital Status" value={client.marital_status} />
              <InfoCard label="Spouse Name" value={client.spouse_name} />
              <InfoCard icon={Shield} label="Aadhaar" value={maskAadhaar(client.aadhaar)} />
              <InfoCard icon={Briefcase} label="Occupation" value={client.occupation} />
              <InfoCard label="Income Range" value={client.income_range} />
              <InfoCard icon={GraduationCap} label="Education" value={client.education} />
              <div className="lg:col-span-3 md:col-span-2">
                <InfoCard icon={MapPin} label="Address" value={client.address} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-900">Bank Accounts</h3>
              <div className="flex items-center gap-2">
                {bankAccounts.length > 0 && (
                  <button onClick={exportBankAccounts} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                )}
                <button onClick={() => setModal({ type: 'bank', data: null })} className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-semibold bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">
                  <Plus className="w-4 h-4" /> Add Account
                </button>
              </div>
            </div>
            {bankAccounts.length === 0 ? (
              <div className="py-12 text-center"><div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><Building2 className="w-6 h-6 text-slate-400" /></div><p className="text-slate-500 text-sm">No bank accounts added yet.</p></div>
            ) : (
              <div className="space-y-3">
                {bankAccounts.map(ba => (
                  <div key={ba.id} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 hover:shadow-sm transition-all bg-slate-50/30">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm"><Building2 className="w-4 h-4 text-white" /></div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{ba.bank_name} {ba.is_primary && <Badge variant="green">Primary</Badge>}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">A/C: {ba.account_number}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setModal({ type: 'bank', data: ba })} className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button>
                        <button onClick={() => deleteRelated('bank_accounts', ba.id, setBankAccounts)} className="p-2 rounded-lg hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5 text-rose-400" /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
                      <div><span className="text-slate-400">IFSC:</span> <span className="text-slate-700 font-medium">{ba.ifsc_code || '-'}</span></div>
                      <div><span className="text-slate-400">MICR:</span> <span className="text-slate-700 font-medium">{ba.micr_number || '-'}</span></div>
                      <div><span className="text-slate-400">Type:</span> <span className="text-slate-700 font-medium capitalize">{ba.account_type}</span></div>
                      <div><span className="text-slate-400">UPI:</span> <span className="text-slate-700 font-medium">{ba.upi_id || '-'}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'nominees' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-900">Nominees</h3>
              <div className="flex items-center gap-2">
                {nominees.length > 0 && (
                  <button onClick={exportNominees} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                )}
                <button onClick={() => setModal({ type: 'nominee', data: null })} className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-semibold bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">
                  <Plus className="w-4 h-4" /> Add Nominee
                </button>
              </div>
            </div>
            {nominees.length === 0 ? (
              <div className="py-12 text-center"><div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><Heart className="w-6 h-6 text-slate-400" /></div><p className="text-slate-500 text-sm">No nominees added yet.</p></div>
            ) : (
              <div className="space-y-3">
                {nominees.map(n => (
                  <div key={n.id} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 hover:shadow-sm transition-all bg-slate-50/30">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm"><Heart className="w-4 h-4 text-white" /></div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{n.name} <Badge variant="purple">{n.relation}</Badge></p>
                          <p className="text-xs text-slate-500 mt-0.5">PAN: {n.pan || '-'} &middot; Mobile: {n.mobile || '-'}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setModal({ type: 'nominee', data: n })} className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button>
                        <button onClick={() => deleteRelated('nominees', n.id, setNominees)} className="p-2 rounded-lg hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5 text-rose-400" /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 text-xs">
                      <div><span className="text-slate-400">DOB:</span> <span className="text-slate-700 font-medium">{n.dob ? new Date(n.dob).toLocaleDateString('en-IN') : '-'}</span></div>
                      <div><span className="text-slate-400">Email:</span> <span className="text-slate-700 font-medium">{n.email || '-'}</span></div>
                      <div><span className="text-slate-400">Address:</span> <span className="text-slate-700 font-medium">{n.address || '-'}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'investments' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-900">Investments</h3>
              <div className="flex items-center gap-2">
                {investments.length > 0 && (
                  <button onClick={exportInvestments} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                )}
                <button onClick={() => setModal({ type: 'investment', data: null })} className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-semibold bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">
                  <Plus className="w-4 h-4" /> Add Investment
                </button>
              </div>
            </div>
            {investments.length === 0 ? (
              <div className="py-12 text-center"><div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><TrendingUp className="w-6 h-6 text-slate-400" /></div><p className="text-slate-500 text-sm">No investments added yet.</p></div>
            ) : (
              <div className="space-y-3">
                {investments.map(inv => (
                  <div key={inv.id} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 hover:shadow-sm transition-all bg-slate-50/30">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${inv.registrar === 'CAMS' ? 'from-emerald-500 to-teal-600' : 'from-sky-500 to-blue-600'} rounded-xl flex items-center justify-center shadow-sm`}><TrendingUp className="w-4 h-4 text-white" /></div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{inv.scheme_name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{inv.fund_house} &middot; {inv.investment_type}{inv.sip_date ? ` (${inv.sip_date}th)` : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-slate-900">₹{Number(inv.amount).toLocaleString('en-IN')}</p>
                          <div className="flex gap-1.5 mt-1 justify-end">
                            <Badge variant={inv.registrar === 'CAMS' ? 'green' : 'blue'}>{inv.registrar}</Badge>
                            <Badge variant={inv.status === 'active' ? 'green' : inv.status === 'paused' ? 'yellow' : 'red'}>{inv.status}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button onClick={() => setModal({ type: 'investment', data: inv })} className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button>
                          <button onClick={() => deleteRelated('investments', inv.id, setInvestments)} className="p-2 rounded-lg hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5 text-rose-400" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'logins' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-900">Platform Logins</h3>
              <div className="flex items-center gap-2">
                {platformLogins.length > 0 && (
                  <button onClick={exportLogins} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                )}
                <button onClick={() => setModal({ type: 'login', data: null })} className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-semibold bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">
                  <Plus className="w-4 h-4" /> Add Login
                </button>
              </div>
            </div>
            {platformLogins.length === 0 ? (
              <div className="py-12 text-center"><div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><KeyRound className="w-6 h-6 text-slate-400" /></div><p className="text-slate-500 text-sm">No platform logins added yet.</p></div>
            ) : (
              <div className="space-y-3">
                {platformLogins.map(pl => (
                  <div key={pl.id} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 hover:shadow-sm transition-all bg-slate-50/30">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm"><KeyRound className="w-4 h-4 text-white" /></div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{pl.platform_name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">User: {pl.username || '-'}</p>
                          {pl.password_hint && <p className="text-[11px] text-slate-400 mt-0.5">Hint: {pl.password_hint}</p>}
                          {pl.notes && <p className="text-[11px] text-slate-400 mt-0.5">{pl.notes}</p>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setModal({ type: 'login', data: pl })} className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button>
                        <button onClick={() => deleteRelated('platform_logins', pl.id, setPlatformLogins)} className="p-2 rounded-lg hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5 text-rose-400" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={modal.type === 'bank'} onClose={closeModal} title={modal.data ? 'Edit Bank Account' : 'Add Bank Account'} size="lg">
        <BankAccountForm clientId={id} data={modal.data} onSaved={handleSaved} onCancel={closeModal} />
      </Modal>
      <Modal isOpen={modal.type === 'nominee'} onClose={closeModal} title={modal.data ? 'Edit Nominee' : 'Add Nominee'} size="lg">
        <NomineeForm clientId={id} data={modal.data} onSaved={handleSaved} onCancel={closeModal} />
      </Modal>
      <Modal isOpen={modal.type === 'investment'} onClose={closeModal} title={modal.data ? 'Edit Investment' : 'Add Investment'} size="lg">
        <InvestmentForm clientId={id} data={modal.data} onSaved={handleSaved} onCancel={closeModal} />
      </Modal>
      <Modal isOpen={modal.type === 'login'} onClose={closeModal} title={modal.data ? 'Edit Platform Login' : 'Add Platform Login'}>
        <PlatformLoginForm clientId={id} data={modal.data} onSaved={handleSaved} onCancel={closeModal} />
      </Modal>
    </div>
  )
}
