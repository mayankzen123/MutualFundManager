import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, PlusCircle, TrendingUp, LogOut, KeyRound, X } from 'lucide-react'
import { useAuth } from '../lib/auth'
import Modal from './Modal'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/clients/new', icon: PlusCircle, label: 'Add Client' },
]

const inputCls = 'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white transition-all'

export default function Sidebar({ open, onClose }) {
  const { logout, changePassword } = useAuth()
  const navigate = useNavigate()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleNavClick() {
    onClose?.()
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    if (!pwForm.current || !pwForm.newPw) { toast.error('Fill in all fields'); return }
    if (pwForm.newPw !== pwForm.confirm) { toast.error('New passwords do not match'); return }
    setPwSaving(true)
    const result = await changePassword(pwForm.current, pwForm.newPw)
    setPwSaving(false)
    if (result.success) {
      toast.success('Password changed successfully')
      setShowPasswordModal(false)
      setPwForm({ current: '', newPw: '', confirm: '' })
    } else {
      toast.error(result.error)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed left-0 top-0 bottom-0 w-[260px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 pt-7 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-white tracking-tight">MF Manager</h1>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">CAMS &middot; KFINTECH</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors lg:hidden">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="px-3 mb-2">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/clients'}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 text-white shadow-lg shadow-black/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-primary-500/20 text-primary-400' : 'text-slate-500 group-hover:text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-2 space-y-1">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all duration-200"
          >
            <div className="p-1.5 rounded-lg text-slate-500"><KeyRound className="w-4 h-4" /></div>
            Change Password
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200"
          >
            <div className="p-1.5 rounded-lg text-slate-500"><LogOut className="w-4 h-4" /></div>
            Sign Out
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="rounded-xl bg-gradient-to-r from-primary-600/20 to-primary-500/10 border border-primary-500/10 p-3.5">
            <p className="text-xs font-semibold text-primary-300">MF Client Manager</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Mutual Fund Registration Portal</p>
          </div>
        </div>
      </aside>

      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Admin Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Current Password</label>
            <input type="password" className={inputCls} value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} placeholder="Enter current password" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">New Password</label>
            <input type="password" className={inputCls} value={pwForm.newPw} onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))} placeholder="Enter new password" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Confirm New Password</label>
            <input type="password" className={inputCls} value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} placeholder="Re-enter new password" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowPasswordModal(false)} className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
            <button type="submit" disabled={pwSaving} className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-semibold hover:from-primary-700 hover:to-primary-600 transition-all shadow-md shadow-primary-500/20 disabled:opacity-50">
              {pwSaving ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
