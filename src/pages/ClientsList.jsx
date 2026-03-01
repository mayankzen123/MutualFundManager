import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, Filter, ChevronUp, ChevronDown, Eye, Pencil, Trash2, Users, Download } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { exportToCsv } from '../lib/exportCsv'
import Badge from '../components/Badge'
import toast from 'react-hot-toast'

const avatarColors = [
  'from-violet-500 to-purple-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-teal-600',
]

function getInitials(name) {
  return (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export default function ClientsList() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('created_at')
  const [sortDir, setSortDir] = useState(false)
  const [filterKyc, setFilterKyc] = useState('all')
  const navigate = useNavigate()

  useEffect(() => { loadClients() }, [sortField, sortDir, filterKyc])

  async function loadClients() {
    setLoading(true)
    let query = supabase.from('clients').select('*').order(sortField, { ascending: sortDir })
    if (filterKyc === 'cams') query = query.eq('kyc_cams', true)
    else if (filterKyc === 'kfin') query = query.eq('kyc_kfintech', true)
    else if (filterKyc === 'none') query = query.eq('kyc_cams', false).eq('kyc_kfintech', false)
    const { data, error } = await query
    if (error) { toast.error('Failed to load clients'); console.error(error) }
    setClients(data || [])
    setLoading(false)
  }

  async function deleteClient(id, name) {
    if (!confirm(`Delete client "${name}"? This will also delete all related data.`)) return
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    toast.success('Client deleted')
    setClients(prev => prev.filter(c => c.id !== id))
  }

  function handleSort(field) {
    if (sortField === field) setSortDir(!sortDir)
    else { setSortField(field); setSortDir(true) }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null
    return sortDir ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
  }

  function handleExport() {
    if (filtered.length === 0) { toast.error('No data to export'); return }
    exportToCsv('clients', [
      { label: 'Name', key: 'name' },
      { label: 'PAN', key: 'pan' },
      { label: 'Mobile', key: 'mobile' },
      { label: 'Email', key: 'email' },
      { label: 'Date of Birth', accessor: r => r.dob || '' },
      { label: 'Address', key: 'address' },
      { label: 'Father Name', key: 'father_name' },
      { label: 'Mother Name', key: 'mother_name' },
      { label: 'Spouse Name', key: 'spouse_name' },
      { label: 'Marital Status', key: 'marital_status' },
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
    ], filtered)
    toast.success(`Exported ${filtered.length} clients`)
  }

  const filtered = clients.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.name?.toLowerCase().includes(q) || c.pan?.toLowerCase().includes(q) || c.mobile?.includes(q) || c.email?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Clients</h1>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} registered {filtered.length === 1 ? 'client' : 'clients'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={loading || filtered.length === 0}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <Link
            to="/clients/new"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all shadow-md shadow-primary-500/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterKyc}
              onChange={e => setFilterKyc(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all flex-1 sm:flex-none"
            >
              <option value="all">All KYC</option>
              <option value="cams">CAMS Only</option>
              <option value="kfin">KFintech Only</option>
              <option value="none">No KYC</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-primary-100 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No clients found</p>
            <p className="text-sm text-slate-400 mt-1">{search ? 'Try adjusting your search' : 'Add your first client to get started'}</p>
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filtered.map(client => (
                <div
                  key={client.id}
                  className="p-4 hover:bg-primary-50/30 transition-colors active:bg-primary-50/50"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(client.name)} rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
                      <span className="text-xs font-bold text-white">{getInitials(client.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{client.name}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{client.email || '-'}</p>
                        </div>
                        <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                          <Link to={`/clients/${client.id}/edit`} className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-primary-600 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                          <button onClick={() => deleteClient(client.id, client.name)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <span className="font-mono">{client.pan}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{client.mobile}</span>
                      </div>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {client.kyc_cams && <Badge variant="green">CAMS</Badge>}
                        {client.kyc_kfintech && <Badge variant="blue">KFIN</Badge>}
                        {!client.kyc_cams && !client.kyc_kfintech && <Badge variant="red">No KYC</Badge>}
                        {client.bank_registered && <Badge variant="purple">Bank</Badge>}
                        {client.nominee_registered && <Badge variant="yellow">Nominee</Badge>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {[
                      { field: 'name', label: 'Client' },
                      { field: 'pan', label: 'PAN' },
                      { field: 'mobile', label: 'Mobile' },
                      { field: 'date_of_registration', label: 'Registered' },
                    ].map(col => (
                      <th
                        key={col.field}
                        onClick={() => handleSort(col.field)}
                        className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
                      >
                        <span className="inline-flex items-center gap-1">
                          {col.label}
                          <SortIcon field={col.field} />
                        </span>
                      </th>
                    ))}
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">KYC</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(client => (
                    <tr
                      key={client.id}
                      className="group hover:bg-primary-50/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/clients/${client.id}`)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 bg-gradient-to-br ${getAvatarColor(client.name)} rounded-xl flex items-center justify-center shadow-sm`}>
                            <span className="text-xs font-bold text-white">{getInitials(client.name)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{client.name}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[200px]">{client.email || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 font-mono tracking-wide">{client.pan}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{client.mobile}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {client.date_of_registration ? new Date(client.date_of_registration).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1.5">
                          {client.kyc_cams && <Badge variant="green">CAMS</Badge>}
                          {client.kyc_kfintech && <Badge variant="blue">KFIN</Badge>}
                          {!client.kyc_cams && !client.kyc_kfintech && <Badge variant="red">None</Badge>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {client.bank_registered && <Badge variant="purple">Bank</Badge>}
                          {client.nominee_registered && <Badge variant="yellow">Nominee</Badge>}
                          {client.mandate_registered && <Badge variant="gray">Mandate</Badge>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <Link to={`/clients/${client.id}`} className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-primary-600 transition-colors shadow-none hover:shadow-sm">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link to={`/clients/${client.id}/edit`} className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-primary-600 transition-colors shadow-none hover:shadow-sm">
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button onClick={() => deleteClient(client.id, client.name)} className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
