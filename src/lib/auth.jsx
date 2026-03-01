import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const SESSION_KEY = 'mf_admin_session'
const HASH_KEY = 'mf_admin_hash'

async function sha256(text) {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// Default password: admin123
const DEFAULT_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'

function getSavedHash() {
  return localStorage.getItem(HASH_KEY) || DEFAULT_HASH
}

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true'
  })

  async function login(password) {
    const hash = await sha256(password)
    if (hash === getSavedHash()) {
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
    if (currentHash !== getSavedHash()) {
      return { success: false, error: 'Current password is incorrect' }
    }
    if (newPassword.length < 4) {
      return { success: false, error: 'New password must be at least 4 characters' }
    }
    const newHash = await sha256(newPassword)
    localStorage.setItem(HASH_KEY, newHash)
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
