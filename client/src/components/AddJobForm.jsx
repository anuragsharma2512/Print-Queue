import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card'
import { Button } from './ui/Button'
import { Input, Label, Select } from './ui/Form'
import { formatSeconds } from '../lib/utils'
import { Clock, FileText, PlusCircle, CheckCircle2, IndianRupee } from 'lucide-react'

const JOB_OPTIONS = [
  { value: 'Black & White Printout', label: 'B&W Printout (₹3/pg)', rate: 3, duration: 69 },
  { value: 'Colour Printout', label: 'Colour Printout (₹8/pg)', rate: 8, duration: 85 },
  { value: 'Xerox', label: 'Xerox (₹2/pg)', rate: 2, duration: 76 },
  { value: 'Colour Xerox', label: 'Colour Xerox (₹5/pg)', rate: 5, duration: 90 },
]

const METHODS = ['Walk-in', 'WhatsApp']

export default function AddJobForm({ onJobAdded }) {
  const [form, setForm] = useState({
    jobType: 'Black & White Printout',
    pages: '5',
    copies: '1',
    submissionMethod: 'Walk-in',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const selectedOpt = JOB_OPTIONS.find((o) => o.value === form.jobType) || JOB_OPTIONS[0]
  const totalPages = (Number(form.pages) || 1) * Math.max(1, Number(form.copies) || 1)
  const estimatedAmount = totalPages * selectedOpt.rate
  const estimatedSeconds = selectedOpt.duration

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!form.jobType || !form.pages || !form.submissionMethod) {
      setError('Please fill in all fields.')
      return
    }

    if (Number(form.pages) < 1) {
      setError('Page count must be 1 or more.')
      return
    }

    setSubmitting(true)
    try {
      await onJobAdded({
        jobType: form.jobType,
        printingType: form.jobType,
        pages: totalPages,
        pageCount: Number(form.pages),
        copies: Number(form.copies),
        totalPages,
        pricePerPage: selectedOpt.rate,
        estimatedAmount,
        paymentStatus: 'PENDING',
        submissionMethod: form.submissionMethod,
      })
      setSuccess(`Job successfully registered into queue.`)
      setForm({
        jobType: 'Black & White Printout',
        pages: '5',
        copies: '1',
        submissionMethod: 'Walk-in',
      })
      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to register job.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-5">
      {/* Form Card */}
      <Card className="md:col-span-3 border-slate-200">
        <CardHeader>
          <CardTitle>Queue Counter Job</CardTitle>
          <CardDescription>
            Record student orders submitted at the counter or received via WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Job Type */}
            <div>
              <Label htmlFor="jobType">Print / Copy Type</Label>
              <Select
                id="jobType"
                value={form.jobType}
                onChange={(e) => setForm({ ...form, jobType: e.target.value })}
              >
                {JOB_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </div>

            {/* Pages & Copies & Method */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="pages">Document Pages</Label>
                <Input
                  id="pages"
                  type="number"
                  min="1"
                  placeholder="e.g. 10"
                  value={form.pages}
                  onChange={(e) => setForm({ ...form, pages: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="copies">Copies</Label>
                <Input
                  id="copies"
                  type="number"
                  min="1"
                  max="50"
                  value={form.copies}
                  onChange={(e) => setForm({ ...form, copies: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="method">Channel</Label>
                <Select
                  id="method"
                  value={form.submissionMethod}
                  onChange={(e) => setForm({ ...form, submissionMethod: e.target.value })}
                >
                  {METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Error / Success Feedback */}
            {error && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}
            {success && (
              <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </p>
            )}

            <Button type="submit" disabled={submitting} variant="primary" className="mt-2 w-full">
              {submitting ? 'Registering…' : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Job to Active Queue (₹{estimatedAmount})</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Estimation Info Card */}
      <Card className="md:col-span-2 border-slate-200/80 bg-slate-50/60 p-5 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Job Calculation Benchmark
          </span>
          <h4 className="text-sm font-bold text-slate-800 mt-1">Official Price & Duration</h4>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Historical completion metrics and official campus rate for <strong>{form.jobType}</strong>:
          </p>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <IndianRupee className="h-4 w-4" />
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900">
                  ₹{estimatedAmount}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  {totalPages} total pages @ ₹{selectedOpt.rate}/page
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900">
                  ~{formatSeconds(estimatedSeconds)}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">average printer handling time</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 border-t border-slate-200/60 pt-3 mt-4">
          Status is created as <strong>Pending</strong>. Payment status is set to <strong>PENDING</strong> until collected.
        </p>
      </Card>
    </div>
  )
}
