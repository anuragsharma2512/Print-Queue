import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Verify active session with backend /api/auth/me on mount/refresh
  const checkSession = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await authApi.checkSession()
      setIsAuthenticated(Boolean(data?.authenticated))
      setAuthError(null)
    } catch {
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const login = async (pin) => {
    setAuthError(null)
    try {
      const { data } = await authApi.login(pin)
      if (data?.success) {
        setIsAuthenticated(true)
        return { success: true }
      }
      return { success: false, message: data?.message || 'Login failed' }
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please verify your PIN.'
      setAuthError(msg)
      return { success: false, message: msg }
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (err) {
      console.warn('Logout error from server:', err)
    } finally {
      setIsAuthenticated(false)
      setAuthError(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        authError,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
