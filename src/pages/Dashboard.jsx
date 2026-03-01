import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, TrendingUp, Building2, Heart, Shield, CreditCard,
  ArrowUpRight, ArrowDownRight, ChevronRight, IndianRupee,
  CheckCircle2, XCircle, PauseCircle, Clock, Download
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { exportToCsv } from '../lib/exportCsv'
import Badge from '../components/Badge'
import toast from 'react-hot-toast'

const avatarColors = [
  'from-violet-500 to-purple-600', 'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600', 'from-orange-500 to-amber-600',
  'from-rose-500 to-pink-600', 'from-cyan-500 to-teal-600',
]
function getInitials(name) { return (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }
function getAvatarColor(name) { let h = 0; for (let i = 0; i < (name || '').length; i++) h = name.charCodeAt(i) + ((h << 5) - h); return avatarColors[Math.abs(h) % avatarColors.length] }
function formatCurrency(n) { return '₹' + Number(n || 0).toLocaleString('en-IN') }

function StatCard({ icon: Icon, label, value, sub, gradient, iconBg }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2 sm:p-2.5 rounded-xl ${iconBg}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3 sm:mt-4 tracking-tight">{value}</p>
      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-[11px] sm:text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-20 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-8">{value}</span>
    </div>
  )
}

function DonutSegment({ percentage, color, radius = 40, stroke = 8 }) {
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  return (
    <circle
      cx="50" cy="50" r={radius}
      fill="none" stroke={color} strokeWidth={stroke}
      strokeDasharray={circumference} strokeDashoffset={offset}
      strokeLinecap="round"
      className="transition-all duration-700"
    />
  )
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [rawClients, setRawClients] = useState([])
  const [rawInvestments, setRawInvestments] = useState([])
  const [stats, setStats] = useState({
    totalClients: 0,
    kycCams: 0,
    kycKfin: 0,
    kycBoth: 0,
    kycNone: 0,
    bankRegistered: 0,
    nomineeRegistered: 0,
    mandateRegistered: 0,
    totalInvestments: 0,
    activeInvestments: 0,
    pausedInvestments: 0,
    stoppedInvestments: 0,
    totalSipAmount: 0,
    totalLumpsumAmount: 0,
    camsInvestments: 0,
    kfinInvestments: 0,
    recentClients: [],
    topInvestments: [],
  })

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    setLoading(true)
    const [clientsRes, investmentsRes] = await Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('investments').select('*').order('amount', { ascending: false }),
    ])

    const clients = clientsRes.data || []
    const investments = investmentsRes.data || []
    setRawClients(clients)
    setRawInvestments(investments)

    const kycCams = clients.filter(c => c.kyc_cams).length
    const kycKfin = clients.filter(c => c.kyc_kfintech).length
    const kycBoth = clients.filter(c => c.kyc_cams && c.kyc_kfintech).length
    const kycNone = clients.filter(c => !c.kyc_cams && !c.kyc_kfintech).length

    const activeInv = investments.filter(i => i.status === 'active')
    const pausedInv = investments.filter(i => i.status === 'paused')
    const stoppedInv = investments.filter(i => i.status === 'stopped')
    const sipInv = investments.filter(i => i.investment_type === 'SIP' && i.status === 'active')
    const lumpsumInv = investments.filter(i => i.investment_type === 'Lumpsum')

    setStats({
      totalClients: clients.length,
      kycCams,
      kycKfin,
      kycBoth,
      kycNone,
      bankRegistered: clients.filter(c => c.bank_registered).length,
      nomineeRegistered: clients.filter(c => c.nominee_registered).length,
      mandateRegistered: clients.filter(c => c.mandate_registered).length,
      totalInvestments: investments.length,
      activeInvestments: activeInv.length,
      pausedInvestments: pausedInv.length,
      stoppedInvestments: stoppedInv.length,
      totalSipAmount: sipInv.reduce((s, i) => s + Number(i.amount || 0), 0),
      totalLumpsumAmount: lumpsumInv.reduce((s, i) => s + Number(i.amount || 0), 0),
      camsInvestments: investments.filter(i => i.registrar === 'CAMS').length,
      kfinInvestments: investments.filter(i => i.registrar === 'KFIN').length,
      recentClients: clients.slice(0, 5),
      topInvestments: investments.slice(0, 5),
    })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-primary-100 border-t-primary-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 mt-4">Loading insights...</p>
        </div>
      </div>
    )
  }

  function handleExportClients() {
    if (rawClients.length === 0) { toast.error('No clients to export'); return }
    exportToCsv('all_clients', [
      { label: 'Name', key: 'name' },
      { label: 'PAN', key: 'pan' },
      { label: 'Mobile', key: 'mobile' },
      { label: 'Email', key: 'email' },
      { label: 'DOB', accessor: r => r.dob || '' },
      { label: 'Address', key: 'address' },
      { label: 'Registration Date', accessor: r => r.date_of_registration || '' },
      { label: 'KYC CAMS', accessor: r => r.kyc_cams ? 'Yes' : 'No' },
      { label: 'KYC KFintech', accessor: r => r.kyc_kfintech ? 'Yes' : 'No' },
      { label: 'Bank Registered', accessor: r => r.bank_registered ? 'Yes' : 'No' },
      { label: 'Nominee Registered', accessor: r => r.nominee_registered ? 'Yes' : 'No' },
      { label: 'Mandate Registered', accessor: r => r.mandate_registered ? 'Yes' : 'No' },
    ], rawClients)
    toast.success(`Exported ${rawClients.length} clients`)
  }

  function handleExportInvestments() {
    if (rawInvestments.length === 0) { toast.error('No investments to export'); return }
    exportToCsv('all_investments', [
      { label: 'Scheme Name', key: 'scheme_name' },
      { label: 'Fund House', key: 'fund_house' },
      { label: 'Registrar', key: 'registrar' },
      { label: 'Type', key: 'investment_type' },
      { label: 'Amount', key: 'amount' },
      { label: 'SIP Date', key: 'sip_date' },
      { label: 'Start Date', accessor: r => r.start_date || '' },
      { label: 'Status', key: 'status' },
      { label: 'Notes', key: 'notes' },
    ], rawInvestments)
    toast.success(`Exported ${rawInvestments.length} investments`)
  }

  const kycTotal = stats.totalClients || 1
  const camsPct = Math.round((stats.kycCams / kycTotal) * 100)
  const kfinPct = Math.round((stats.kycKfin / kycTotal) * 100)
  const nonePct = Math.round((stats.kycNone / kycTotal) * 100)

  const invTotal = stats.totalInvestments || 1
  const activePct = Math.round((stats.activeInvestments / invTotal) * 100)
  const pausedPct = Math.round((stats.pausedInvestments / invTotal) * 100)
  const stoppedPct = Math.round((stats.stoppedInvestments / invTotal) * 100)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5 sm:mt-1">Overview of your mutual fund portfolio</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-slate-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button onClick={handleExportClients} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-t-xl transition-colors">All Clients</button>
              <button onClick={handleExportInvestments} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-b-xl transition-colors border-t border-slate-100">All Investments</button>
            </div>
          </div>
          <Link
            to="/clients/new"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all shadow-md shadow-primary-500/20 active:scale-[0.98]"
          >
            <span className="hidden sm:inline">Add Client</span>
            <span className="sm:hidden">Add</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Clients" value={stats.totalClients} sub={`${stats.kycCams} CAMS · ${stats.kycKfin} KFin registered`} iconBg="bg-gradient-to-br from-primary-500 to-primary-600" />
        <StatCard icon={TrendingUp} label="Active SIPs" value={stats.activeInvestments} sub={`${formatCurrency(stats.totalSipAmount)}/month`} iconBg="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <StatCard icon={IndianRupee} label="Monthly SIP Amount" value={formatCurrency(stats.totalSipAmount)} sub={`${stats.totalInvestments} total investments`} iconBg="bg-gradient-to-br from-amber-500 to-orange-600" />
        <StatCard icon={Shield} label="KYC Registered" value={`${stats.totalClients - stats.kycNone}/${stats.totalClients}`} sub={stats.kycNone === 0 ? 'All clients KYC verified' : `${stats.kycNone} pending KYC`} iconBg="bg-gradient-to-br from-rose-500 to-pink-600" />
      </div>

      {/* Middle row: KYC breakdown + Investment status + Registration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* KYC Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-5">KYC Distribution</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-[100px] h-[100px] shrink-0">
              <svg viewBox="0 0 100 100" className="-rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                {stats.kycCams > 0 && <DonutSegment percentage={camsPct} color="#10b981" />}
                {stats.kycKfin > 0 && <DonutSegment percentage={kfinPct} color="#3b82f6" radius={31} stroke={6} />}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-extrabold text-slate-900">{stats.totalClients}</span>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-600 flex-1">CAMS</span>
                <span className="text-xs font-bold text-slate-800">{stats.kycCams}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-xs text-slate-600 flex-1">KFintech</span>
                <span className="text-xs font-bold text-slate-800">{stats.kycKfin}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                <span className="text-xs text-slate-600 flex-1">Both</span>
                <span className="text-xs font-bold text-slate-800">{stats.kycBoth}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-600 flex-1">None</span>
                <span className="text-xs font-bold text-slate-800">{stats.kycNone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Status */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-5">Investment Status</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-800">Active</p>
                <p className="text-xs text-emerald-600">{formatCurrency(stats.totalSipAmount)}/mo</p>
              </div>
              <span className="text-lg font-extrabold text-emerald-700">{stats.activeInvestments}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/70 border border-amber-100">
              <PauseCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">Paused</p>
                <p className="text-xs text-amber-600">Temporarily halted</p>
              </div>
              <span className="text-lg font-extrabold text-amber-700">{stats.pausedInvestments}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/70 border border-rose-100">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-rose-800">Stopped</p>
                <p className="text-xs text-rose-600">Discontinued</p>
              </div>
              <span className="text-lg font-extrabold text-rose-700">{stats.stoppedInvestments}</span>
            </div>
          </div>
        </div>

        {/* Registration Progress */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-5">Registration Progress</h3>
          <div className="space-y-4">
            <MiniBar label="Bank" value={stats.bankRegistered} max={stats.totalClients} color="bg-gradient-to-r from-violet-500 to-purple-500" />
            <MiniBar label="Nominee" value={stats.nomineeRegistered} max={stats.totalClients} color="bg-gradient-to-r from-amber-500 to-orange-500" />
            <MiniBar label="Mandate" value={stats.mandateRegistered} max={stats.totalClients} color="bg-gradient-to-r from-sky-500 to-blue-500" />
            <MiniBar label="KYC CAMS" value={stats.kycCams} max={stats.totalClients} color="bg-gradient-to-r from-emerald-500 to-teal-500" />
            <MiniBar label="KYC KFIN" value={stats.kycKfin} max={stats.totalClients} color="bg-gradient-to-r from-rose-500 to-pink-500" />
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Registrar split</span>
              <span className="font-semibold text-slate-700">{stats.camsInvestments} CAMS · {stats.kfinInvestments} KFIN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Recent clients + Top investments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Clients */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recent Clients</h3>
            <Link to="/clients" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-0.5">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {stats.recentClients.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No clients yet</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {stats.recentClients.map(client => (
                <Link key={client.id} to={`/clients/${client.id}`} className="flex items-center gap-3 sm:gap-3.5 px-4 sm:px-6 py-3.5 hover:bg-primary-50/30 transition-colors">
                  <div className={`w-9 h-9 bg-gradient-to-br ${getAvatarColor(client.name)} rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
                    <span className="text-xs font-bold text-white">{getInitials(client.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{client.name}</p>
                    <p className="text-xs text-slate-400 truncate">{client.pan} · {client.mobile}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {client.kyc_cams && <Badge variant="green">CAMS</Badge>}
                    {client.kyc_kfintech && <Badge variant="blue">KFIN</Badge>}
                    {!client.kyc_cams && !client.kyc_kfintech && <Badge variant="red">No KYC</Badge>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top Investments */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Top Investments</h3>
            <span className="text-xs text-slate-400">By amount</span>
          </div>
          {stats.topInvestments.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No investments yet</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {stats.topInvestments.map((inv, idx) => (
                <div key={inv.id} className="flex items-center gap-3 sm:gap-3.5 px-4 sm:px-6 py-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${
                    inv.registrar === 'CAMS'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                      : 'bg-gradient-to-br from-sky-500 to-blue-600'
                  }`}>
                    <span className="text-xs font-bold text-white">#{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{inv.scheme_name}</p>
                    <p className="text-xs text-slate-400 truncate">{inv.fund_house} · {inv.investment_type}{inv.sip_date ? ` (${inv.sip_date}th)` : ''}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(inv.amount)}</p>
                    <Badge variant={inv.status === 'active' ? 'green' : inv.status === 'paused' ? 'yellow' : 'red'}>{inv.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
