import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Printer, LayoutDashboard, Users, Moon, LogOut, ShieldAlert } from 'lucide-react'
import { cn, getShopStatus } from '../lib/utils'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const [shopStatus, setShopStatus] = useState(getShopStatus())
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setShopStatus(getShopStatus())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleStudentNavClick = (e) => {
    // If shopkeeper is logged in, do not silently leave active session
    if (isAuthenticated && pathname === '/dashboard') {
      e.preventDefault()
      setShowExitConfirm(true)
    }
  }

  const handleConfirmExit = async () => {
    setShowExitConfirm(false)
    await logout()
    navigate('/')
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Brand Logo */}
            <Link to="/" onClick={handleStudentNavClick} className="flex items-center gap-3 group transition-transform active:scale-98">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 shadow-sm shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all">
                <Printer className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-slate-900 tracking-tight">PrintQueue</span>

                  {shopStatus.isOpen ? (
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                      shopStatus.isClosingSoon
                        ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${shopStatus.isClosingSoon ? 'bg-amber-500' : 'bg-emerald-500'} animate-ping`}></span>
                      <span>{shopStatus.label}</span>
                      <span className="hidden sm:inline text-slate-400 font-normal">·</span>
                      <span className="hidden sm:inline font-semibold">{shopStatus.subtext}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                      <Moon className="h-3 w-3 text-slate-500" />
                      <span>{shopStatus.label}</span>
                      <span className="hidden sm:inline text-slate-400 font-normal">·</span>
                      <span className="hidden sm:inline font-semibold text-slate-500">{shopStatus.subtext}</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 font-medium tracking-tight">
                  NIT Jamshedpur · Campus Copy Center (8 AM – 8 PM)
                </span>
              </div>
            </Link>

            {/* Navigation & Active Session Status */}
            <div className="flex items-center gap-2">
              <nav className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                <Link
                  to="/"
                  onClick={handleStudentNavClick}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150',
                    pathname === '/'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  )}
                >
                  <Users className={cn('h-3.5 w-3.5', pathname === '/' ? 'text-indigo-600' : 'text-slate-400')} />
                  <span>Live Queue</span>
                </Link>

                <Link
                  to="/dashboard"
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150',
                    pathname === '/dashboard'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  )}
                >
                  <LayoutDashboard className={cn('h-3.5 w-3.5', pathname === '/dashboard' ? 'text-indigo-600' : 'text-slate-400')} />
                  <span>Shopkeeper Portal</span>
                  {isAuthenticated && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  )}
                </Link>
              </nav>

              {/* Quick Lock if authenticated on dashboard */}
              {isAuthenticated && pathname === '/dashboard' && (
                <button
                  onClick={handleConfirmExit}
                  title="Lock Console & Switch to Student View"
                  className="hidden md:flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Lock & Exit</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Confirmation Modal when leaving active shopkeeper console */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mb-4">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Lock Shopkeeper Console?</h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              You are currently authenticated as the shopkeeper. To prevent unauthorized queue tampering, leaving this portal will securely end your session.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={handleConfirmExit}
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Lock Console & Switch to Student View
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Stay in Shopkeeper Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
