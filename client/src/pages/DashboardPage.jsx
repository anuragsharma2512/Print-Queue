import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJobs } from '../hooks/useJobs'
import { useAuth } from '../context/AuthContext'
import QueueTable from '../components/QueueTable'
import AddJobForm from '../components/AddJobForm'
import { Button } from '../components/ui/Button'
import { formatSeconds, getShopStatus } from '../lib/utils'
import {
  Printer, LogOut, Clock, CheckCircle2, Loader2,
  ListOrdered, PlusCircle, History, BarChart2,
  MessageCircle, Sun, Moon
} from 'lucide-react'

// ── Metric Stat Card ──────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-slate-500 font-medium mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Tab Pill ──────────────────────────────────────────────────────────────────
function TabButton({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
        active
          ? 'bg-slate-900 text-white shadow-xs'
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      {count != null && (
        <span className={`ml-1 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
          active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { jobs, loading, isLive, fetchJobs, updateStatus, createJob } = useJobs()
  const [tab, setTab] = useState('queue')

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const activeJobs = jobs.filter((j) => j.status !== 'Completed')
  const completedJobs = jobs.filter((j) => j.status === 'Completed')
  const pendingJobs = jobs.filter((j) => j.status === 'Pending')
  const processingJobs = jobs.filter((j) => j.status === 'Processing')
  const whatsAppJobs = jobs.filter((j) => j.submissionMethod === 'WhatsApp')
  const studentOnlineJobs = jobs.filter((j) => j.submissionMethod === 'Student Upload')

  // Calculate actual avg service time from completed records
  const completedWithTime = completedJobs.filter((j) => j.serviceTimeSeconds > 0)
  const totalServiceTime = completedWithTime.reduce((sum, j) => sum + j.serviceTimeSeconds, 0)
  const avgServiceTime = completedWithTime.length
    ? Math.round(totalServiceTime / completedWithTime.length)
    : 74

  const handleLockAndSwitch = async () => {
    await logout()
    navigate('/')
  }

  const shopStatus = getShopStatus()

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

      {/* Top Controls Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Shopkeeper Console</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            NIT Jamshedpur Photocopy Shop · Queue Dispatch & Empirical History
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Shop Hours Status */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            shopStatus.isOpen
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {shopStatus.isOpen ? (
              <>
                <Sun className="h-3 w-3 text-emerald-600" />
                <span>Shop Open (until 8:00 PM)</span>
              </>
            ) : (
              <>
                <Moon className="h-3 w-3 text-amber-600" />
                <span>After Hours (Opens 8:00 AM)</span>
              </>
            )}
          </span>

          

          {/* Explicit Lock & Switch action */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLockAndSwitch}
            className="h-8 gap-1.5 text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Lock Dashboard & Switch to Student View</span>
          </Button>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Pending Queue"
          value={pendingJobs.length}
          sub="waiting in order"
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
        />
        <StatCard
          label="Active Job"
          value={processingJobs.length ? 'Printing' : 'Idle'}
          sub={processingJobs.length ? processingJobs[0].jobId : 'no job running'}
          icon={Printer}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-700"
        />
        <StatCard
          label="Online / WhatsApp"
          value={whatsAppJobs.length + studentOnlineJobs.length}
          sub="remote student orders"
          icon={MessageCircle}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />
        <StatCard
          label="Avg Handling Time"
          value={formatSeconds(avgServiceTime)}
          sub="per printed order"
          icon={BarChart2}
          iconBg="bg-slate-100"
          iconColor="text-slate-700"
        />
      </div>

      {/* Tab Navigation */}
      <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-200/80 pb-3">
        <TabButton
          active={tab === 'queue'}
          onClick={() => setTab('queue')}
          icon={ListOrdered}
          label="Active Printing Queue"
          count={activeJobs.length}
        />
        <TabButton
          active={tab === 'add'}
          onClick={() => setTab('add')}
          icon={PlusCircle}
          label="New Job Entry"
        />
        <TabButton
          active={tab === 'history'}
          onClick={() => setTab('history')}
          icon={History}
          label="Completed Records"
          count={completedJobs.length}
        />
      </div>

      {/* Tab View Contents */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-xs font-semibold">Updating records…</span>
        </div>
      ) : (
        <>
          {tab === 'queue' && (
            <QueueTable
              jobs={activeJobs}
              onStatusUpdate={updateStatus}
            />
          )}

          {tab === 'add' && (
            <AddJobForm
              onJobAdded={async (data) => {
                await createJob(data)
                setTab('queue')
              }}
            />
          )}

          {tab === 'history' && (
            <QueueTable
              jobs={completedJobs}
              onStatusUpdate={updateStatus}
              showHistory
            />
          )}
        </>
      )}

    </div>
  )
}
