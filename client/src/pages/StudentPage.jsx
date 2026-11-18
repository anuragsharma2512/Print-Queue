import { useState, useMemo, useEffect } from 'react'
import { useQueue } from '../hooks/useQueue'
import { formatSeconds, formatTime, getShopStatus } from '../lib/utils'
import JobTypeTag from '../components/JobTypeTag'
import MethodTag from '../components/MethodTag'
import StudentOrderModal from '../components/StudentOrderModal'
import TrackOrderModal from '../components/TrackOrderModal'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select, Input, Label } from '../components/ui/Form'
import {
  RefreshCw, Clock, Printer, Users, CheckCircle2,
  Sparkles, Calculator, ShieldCheck, MapPin, Moon, Sun, AlertTriangle,
  UploadCloud, Search, FileText, IndianRupee
} from 'lucide-react'

// Baseline service duration constants derived from 20 NIT Jamshedpur fieldwork records
const AVG_TIMES = {
  'B&W Print': 69,
  'Black & White Printout': 69,
  'Colour Print': 85,
  'Colour Printout': 85,
  'B&W Photocopy': 76,
  'Xerox': 76,
  'Colour Xerox': 90,
}

export default function StudentPage() {
  const { queue, loading, isLive, lastUpdated, refetch } = useQueue(20000)
  const [shopStatus, setShopStatus] = useState(getShopStatus())
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false)

  // Keep shop status updated in real-time
  useEffect(() => {
    const timer = setInterval(() => {
      setShopStatus(getShopStatus())
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  // Interactive Student Calculator state
  const [calcType, setCalcType] = useState('Black & White Printout')
  const [calcPages, setCalcPages] = useState('5')

  const processingJob = queue.find((j) => j.status === 'Processing')
  const pendingJobs = queue.filter((j) => j.status === 'Pending')

  // Total current backlog seconds
  const totalQueueWaitSeconds = useMemo(() => {
    let seconds = 0
    if (processingJob) {
      const avg = AVG_TIMES[processingJob.jobType || processingJob.printingType] ?? 70
      seconds += Math.max(15, Math.floor(avg * 0.5))
    }
    for (const job of pendingJobs) {
      seconds += AVG_TIMES[job.jobType || job.printingType] ?? 70
    }
    return seconds
  }, [processingJob, pendingJobs])

  // Calculation for student's custom simulated order
  const calculatedStudentWait = useMemo(() => {
    const jobAvg = AVG_TIMES[calcType] ?? 70
    const totalWait = totalQueueWaitSeconds + jobAvg
    const completionDate = new Date(Date.now() + totalWait * 1000)
    return {
      waitSec: totalQueueWaitSeconds,
      totalSec: totalWait,
      completionTime: completionDate,
    }
  }, [totalQueueWaitSeconds, calcType])

  const handleOrderSubmitted = (newOrder) => {
    refetch()
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

      {/* Top Location & Operational Notice Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <MapPin className="h-3.5 w-3.5 text-indigo-600" />
          <span>Campus Photocopy & Print Center · Near Library</span>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Shop Hours Pill */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
            shopStatus.isOpen
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
              : 'bg-amber-50 text-amber-800 border-amber-200/80'
          }`}>
            {shopStatus.isOpen ? (
              <>
                <Sun className="h-3 w-3 text-emerald-600" />
                <span>Open Now (8 AM – 8 PM)</span>
              </>
            ) : (
              <>
                <Moon className="h-3 w-3 text-amber-600" />
                <span>Closed (Opens 8:00 AM)</span>
              </>
            )}
          </span>

          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
            isLive
              ? 'bg-slate-50 text-slate-700 border-slate-200'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
            {isLive ? 'Live Sync' : 'Fieldwork Preview'}
          </span>

          <Button variant="outline" size="sm" onClick={refetch} className="h-7 text-xs gap-1.5">
            <RefreshCw className="h-3 w-3" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Primary Action Buttons Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-blue-50 p-4 border border-indigo-100 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Need Documents Printed?</h3>
            <p className="text-xs text-slate-500">Upload your PDF directly to the shop queue or track an existing job.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setIsTrackModalOpen(true)}
            className="h-10 text-xs gap-2"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Track Order</span>
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsOrderModalOpen(true)}
            className="h-10 text-xs gap-2 shadow-sm"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Submit Printing Order</span>
          </Button>
        </div>
      </div>

      {/* Hero Waiting Time Summary */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {/* Big Wait Card */}
        <div className={`md:col-span-2 relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-lg ${
          shopStatus.isOpen
            ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 shadow-indigo-950/20'
            : 'bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 shadow-slate-950/20'
        }`}>
          <div className="absolute -right-8 -bottom-8 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col justify-between h-full gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold backdrop-blur-xs ${
                  shopStatus.isOpen ? 'bg-white/10 text-indigo-200' : 'bg-amber-500/20 text-amber-200'
                }`}>
                  {shopStatus.isOpen ? (
                    <>
                      <Clock className="h-3 w-3 text-indigo-400" /> Real-time Queue Estimation
                    </>
                  ) : (
                    <>
                      <Moon className="h-3 w-3 text-amber-300" /> Outside Operating Hours (8 AM – 8 PM)
                    </>
                  )}
                </span>
              </div>

              {shopStatus.isOpen ? (
                <>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {totalQueueWaitSeconds === 0
                      ? 'Printers are idle · Ready for your order!'
                      : `Approx. ${formatSeconds(totalQueueWaitSeconds)} wait time`}
                  </h1>
                  <p className="mt-1.5 text-sm text-slate-300 max-w-lg leading-relaxed">
                    Calculated dynamically using queue depth ({queue.length} active orders) calibrated against NIT Jamshedpur fieldwork duration records.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-100">
                    Shop is currently closed
                  </h1>
                  <p className="mt-1.5 text-sm text-slate-300 max-w-lg leading-relaxed">
                    The photocopy shop operates from <strong>8:00 AM to 8:00 PM</strong>. Orders submitted via this portal or WhatsApp overnight will be printed first when the shop opens at 8:00 AM.
                  </p>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Queue Backlog</p>
                <p className="text-xl font-bold text-white mt-0.5">{queue.length} <span className="text-xs font-normal text-slate-400">jobs</span></p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Operating Hours</p>
                <p className="text-sm font-bold text-emerald-400 mt-1">8:00 AM – 8:00 PM</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Rush Hours</p>
                <p className="text-xs font-bold text-indigo-300 mt-1">8:30-9:30 AM & 6 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Simulator / Order Time Estimator */}
        <Card className="flex flex-col justify-between border-slate-200 bg-white p-5 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Calculator className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Print Calculator</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Calculate My Turnaround</h3>
            <p className="text-xs text-slate-500 mt-0.5">Simulate wait duration before queueing:</p>

            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="calcType">Job Type</Label>
                <Select
                  id="calcType"
                  value={calcType}
                  onChange={(e) => setCalcType(e.target.value)}
                  className="h-9 text-xs"
                >
                  <option value="Black & White Printout">B&W Printout (₹3/pg)</option>
                  <option value="Colour Printout">Colour Printout (₹8/pg)</option>
                  <option value="Xerox">Xerox (₹2/pg)</option>
                  <option value="Colour Xerox">Colour Xerox (₹5/pg)</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="calcPages">Pages approx.</Label>
                <Input
                  id="calcPages"
                  type="number"
                  min="1"
                  max="200"
                  value={calcPages}
                  onChange={(e) => setCalcPages(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 p-4 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Estimated ready by:</span>
              <span className="text-sm font-extrabold text-indigo-600">
                {formatTime(calculatedStudentWait.completionTime)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Est. handling: ~{formatSeconds(calculatedStudentWait.totalSec)} {shopStatus.isOpen ? '' : '(from 8:00 AM)'}
            </p>
          </div>
        </Card>
      </div>

      {/* Main Queue Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left: Queue Timeline (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-700" />
              Active Queue ({queue.length} Orders)
            </h2>
            <span className="text-xs text-slate-400">Oldest arrival first</span>
          </div>

          {/* Currently Processing Job Banner */}
          {processingJob && (
            <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-r from-indigo-50/90 to-blue-50/60 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                  <Printer className="h-3 w-3 animate-bounce" /> Currently Printing
                </span>
                <span className="font-mono text-xs font-bold text-indigo-900 bg-white/80 px-2 py-0.5 rounded-md border border-indigo-200">
                  {processingJob.jobId}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {processingJob.studentName && (
                    <span className="text-xs font-bold text-slate-800 bg-white/90 px-2 py-0.5 rounded border border-indigo-200">
                      👤 {processingJob.studentName}
                    </span>
                  )}
                  <JobTypeTag jobType={processingJob.jobType || processingJob.printingType} />
                  <span className="text-xs font-bold text-slate-700">
                    {processingJob.totalPages || processingJob.pages} pages
                    {processingJob.items && processingJob.items.length > 1 ? ` (${processingJob.items.length} files)` : (processingJob.copies && processingJob.copies > 1 ? ` (${processingJob.copies} copies)` : '')}
                  </span>
                  <MethodTag method={processingJob.submissionMethod} />
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-indigo-700">Printing in Progress</span>
                  <p className="text-[11px] text-slate-500">Finishing shortly</p>
                </div>
              </div>
              {(processingJob.items && processingJob.items.length > 1) ? (
                <div className="mt-2 text-[11px] text-slate-600 font-medium truncate max-w-md">
                  📁 {processingJob.items.length} documents: {processingJob.items.map(i => i.fileName).join(', ')}
                </div>
              ) : processingJob.fileName ? (
                <div className="mt-2 text-[11px] text-slate-600 font-medium truncate max-w-md">
                  📄 {processingJob.fileName}
                </div>
              ) : null}
            </div>
          )}

          {/* Pending Queue List */}
          {pendingJobs.length === 0 && !processingJob ? (
            <Card className="py-12 text-center border-dashed border-2 border-slate-200 bg-white">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Queue is completely empty</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No orders are currently waiting. Walk in between 8:00 AM – 8:00 PM or upload a PDF above for fast turnaround!
              </p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {pendingJobs.map((job, index) => {
                let waitBeforeThis = 0
                if (processingJob) {
                  waitBeforeThis += 35
                }
                for (let i = 0; i < index; i++) {
                  waitBeforeThis += AVG_TIMES[pendingJobs[i].jobType || pendingJobs[i].printingType] ?? 70
                }

                return (
                  <div
                    key={job._id || job.jobId}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-extrabold text-xs text-slate-700">
                        #{index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-900">{job.jobId}</span>
                          {job.studentName && (
                            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                              👤 {job.studentName}
                            </span>
                          )}
                          <JobTypeTag jobType={job.jobType || job.printingType} />
                          <span className="text-xs text-slate-600 font-medium">
                            {job.totalPages || job.pages} pages
                            {job.items && job.items.length > 1 ? ` (${job.items.length} files)` : (job.copies && job.copies > 1 ? ` (${job.copies} copies)` : '')}
                          </span>
                          <MethodTag method={job.submissionMethod} />
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          {job.items && job.items.length > 1 ? (
                            <span className="truncate max-w-[240px] font-medium text-slate-600" title={job.items.map(i => i.fileName).join(', ')}>
                              📁 {job.items.length} documents: {job.items.map(i => i.fileName).join(', ')}
                            </span>
                          ) : job.fileName ? (
                            <span className="truncate max-w-[180px] font-medium text-slate-600" title={job.fileName}>
                              📄 {job.fileName}
                            </span>
                          ) : null}
                          <span>Arrived at {formatTime(job.arrivalTime)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-900">
                        ~{formatSeconds(waitBeforeThis)}
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Est. wait</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: Operational Schedule & Fieldwork Findings */}
        <div className="space-y-4">
          {/* Shop Hours Card */}
          <Card className="p-4 bg-white border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2.5">
              <Clock className="h-4 w-4 text-indigo-600" />
              Shop Schedule & Operating Hours
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                <span className="text-slate-600 font-medium">Daily Counter Hours</span>
                <span className="font-bold text-slate-900">8:00 AM – 8:00 PM</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-emerald-50/70 p-2 text-emerald-800">
                <span className="font-medium">Current Status</span>
                <span className="font-extrabold">{shopStatus.label} ({shopStatus.subtext})</span>
              </div>
            </div>
          </Card>

          {/* Official Rates Card */}
          <Card className="p-4 bg-white border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2.5">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
              Campus Printing Rates
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Xerox:</span>
                <span className="font-bold text-slate-900">₹2 / page</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Colour Xerox:</span>
                <span className="font-bold text-slate-900">₹5 / page</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>B&W Printout:</span>
                <span className="font-bold text-slate-900">₹3 / page</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Colour Printout:</span>
                <span className="font-bold text-slate-900">₹8 / page</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-50/70 border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              How are wait times predicted?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Based on empirical fieldwork conducted at the campus shop on <strong>17 Nov 2026</strong>:
            </p>
            <ul className="mt-2.5 space-y-1.5 text-xs text-slate-600 border-t border-slate-200/80 pt-2.5">
              <li className="flex justify-between">
                <span>• B&W Printout:</span>
                <span className="font-semibold text-slate-800">~69s per order</span>
              </li>
              <li className="flex justify-between">
                <span>• Colour Printout:</span>
                <span className="font-semibold text-slate-800">~85s per order</span>
              </li>
              <li className="flex justify-between">
                <span>• Xerox / Photocopy:</span>
                <span className="font-semibold text-slate-800">~76s per order</span>
              </li>
            </ul>
          </Card>

          <Card className="p-4 bg-amber-50/50 border-amber-200/70">
            <h4 className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              Peak Rush Advice
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              Highest traffic occurs at <strong>8:30 AM – 9:30 AM</strong> and <strong>6:00 PM</strong>. Submit your document using the online button above to queue early.
            </p>
          </Card>
        </div>

      </div>

      {/* Student Order Modal */}
      <StudentOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onOrderSubmitted={handleOrderSubmitted}
      />

      {/* Student Tracking Modal */}
      <TrackOrderModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
      />

    </div>
  )
}
