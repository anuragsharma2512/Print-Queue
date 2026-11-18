import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui/Button'
import { Input, Label } from './ui/Form'
import { Lock, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'

export default function ShopkeeperLogin() {
  const { login, authError } = useAuth()
  const [pin, setPin] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)

    if (!pin.trim()) {
      setLocalError('Please enter your shopkeeper PIN.')
      return
    }

    setSubmitting(true)
    const result = await login(pin)
    setSubmitting(false)

    if (!result.success) {
      setLocalError(result.message)
      setPin('')
    }
  }

  const displayError = localError || authError

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-7 shadow-lg shadow-slate-200/50">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-md shadow-indigo-600/20 text-white">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Shopkeeper Portal</h1>
          <p className="mt-1 text-xs text-slate-500">
            Secure backend authentication required for printer management and queue dispatch.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="pin">Operator PIN</Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="Enter PIN"
              value={pin}
              autoFocus
              disabled={submitting}
              onChange={(e) => {
                setPin(e.target.value)
                setLocalError(null)
              }}
              className={displayError ? 'border-rose-400 ring-rose-400' : ''}
            />
            {displayError && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{displayError}</span>
              </div>
            )}
          </div>

          <Button type="submit" variant="primary" disabled={submitting || !pin} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying PIN…</span>
              </>
            ) : (
              <span>Unlock Console</span>
            )}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 pt-4">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Protected with bcrypt hashing & HttpOnly JWT</span>
        </div>
      </div>
    </div>
  )
}
