import { useAuth } from '../context/AuthContext'
import ShopkeeperLogin from './ShopkeeperLogin'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
          <span className="text-xs font-semibold">Checking shopkeeper session…</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <ShopkeeperLogin />
  }

  return children
}
