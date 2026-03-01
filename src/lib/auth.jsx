import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

const SESSION_KEY = 'mf_admin_session'
const DEFAULT_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'

async function sha256(text) {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function getStoredHash() {
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'admin_password_hash')
    .single()
  return data?.value || DEFAULT_HASH
}

async function saveHash(hash) {
  await supabase
    .from('app_settings')
    .upsert({ key: 'admin_password_hash', value: hash, updated_at: new Date().toISOString() })
}

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true'
  })

  async function login(password) {
    const hash = await sha256(password)
    const storedHash = await getStoredHash()
    if (hash === storedHash) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setAuthenticated(true)
      return { success: true }
    }
    return { success: false, error: 'Incorrect password' }
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthenticated(false)
  }

  async function changePassword(currentPassword, newPassword) {
    const currentHash = await sha256(currentPassword)
    const storedHash = await getStoredHash()
    if (currentHash !== storedHash) {
      return { success: false, error: 'Current password is incorrect' }
    }
    if (newPassword.length < 4) {
      return { success: false, error: 'New password must be at least 4 characters' }
    }
    const newHash = await sha256(newPassword)
    await saveHash(newHash)
    return { success: true }
  }

  return (
    <AuthContext.Provider value={{ authenticated, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
