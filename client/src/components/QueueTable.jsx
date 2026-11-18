import { useState } from 'react'
import { Button } from './ui/Button'
import StatusBadge from './StatusBadge'
import JobTypeTag from './JobTypeTag'
import MethodTag from './MethodTag'
import { formatTime, formatSeconds } from '../lib/utils'
import { studentOrdersApi } from '../services/api'
import { FileText, Play, CheckCircle2, Loader2, Download, ExternalLink, IndianRupee } from 'lucide-react'

export default function QueueTable({ jobs, onStatusUpdate, showHistory = false }) {
  const [updatingId, setUpdatingId] = useState(null)
  const [downloadingId, setDownloadingId] = useState(null)

  const handleUpdate = async (job, newStatus) => {
    setUpdatingId(job._id || job.jobId)
    try {
      await onStatusUpdate(job._id || job.jobId, newStatus)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDownloadPdf = async (job) => {
    setDownloadingId(job.jobId)
    try {
      const response = await studentOrdersApi.downloadPdf(job.jobId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      // Open in new tab or trigger download
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', job.fileName || `document-${job.jobId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Could not download document. Ensure you are logged in as shopkeeper.')
    } finally {
      setDownloadingId(null)
    }
  }

  if (!jobs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
          <FileText className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700">No jobs found in this section</p>
        <p className="text-xs text-slate-400 mt-0.5">Orders submitted by students or added at the counter will appear here.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3.5 w-12 text-center">#</th>
              <th className="px-4 py-3.5">Job ID</th>
              <th className="px-4 py-3.5">Service Type</th>
              <th className="px-4 py-3.5">Document / Details</th>
              <th className="px-4 py-3.5 text-center">Pages</th>
              <th className="px-4 py-3.5">Payment</th>
              <th className="px-4 py-3.5">Channel</th>
              <th className="px-4 py-3.5">Arrival</th>
              {showHistory && (
                <th className="px-4 py-3.5">Service Duration</th>
              )}
              <th className="px-4 py-3.5">Status</th>
              {!showHistory && (
                <th className="px-4 py-3.5 text-right">Queue Action</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job, index) => {
              const isProcessing = job.status === 'Processing'
              const isCurrentUpdating = updatingId === (job._id || job.jobId)
              const isCurrentDownloading = downloadingId === job.jobId
              const hasPdf = Boolean(job.fileName || job.storedFileReference)

              return (
                <tr
                  key={job._id || job.jobId}
                  className={`transition-colors ${
                    isProcessing
                      ? 'bg-indigo-50/40 hover:bg-indigo-50/60'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* Sequence Position */}
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 font-extrabold text-[11px] text-slate-600">
                      {index + 1}
                    </span>
                  </td>

                  {/* Job ID */}
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                    {job.jobId}
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3.5">
                    <JobTypeTag jobType={job.jobType || job.printingType} />
                  </td>

                  {/* Document & Details */}
                  <td className="px-4 py-3.5">
                    {hasPdf ? (
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(job)}
                        disabled={isCurrentDownloading}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 font-medium transition-colors cursor-pointer border border-indigo-200/80 max-w-[170px]"
                        title="Download uploaded PDF"
                      >
                        {isCurrentDownloading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3 shrink-0" />
                        )}
                        <span className="truncate">{job.fileName || 'document.pdf'}</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 italic">Counter Physical Document</span>
                    )}
                  </td>

                  {/* Pages & Copies */}
                  <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                    <span>{job.totalPages || job.pages}</span>
                    {job.copies && job.copies > 1 && (
                      <span className="block text-[10px] font-normal text-slate-400">
                        ({job.pageCount || job.pages} pgs × {job.copies})
                      </span>
                    )}
                  </td>

                  {/* Payment */}
                  <td className="px-4 py-3.5">
                    {job.estimatedAmount ? (
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs">
                          ₹{job.estimatedAmount}
                        </span>
                        <span className={`block text-[10px] font-bold ${
                          job.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {job.paymentStatus || 'PENDING'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>

                  {/* Submission Method */}
                  <td className="px-4 py-3.5">
                    <MethodTag method={job.submissionMethod} />
                  </td>

                  {/* Arrival */}
                  <td className="px-4 py-3.5 text-slate-500 tabular-nums">
                    {formatTime(job.arrivalTime)}
                  </td>

                  {/* Historical Duration */}
                  {showHistory && (
                    <td className="px-4 py-3.5 text-slate-700 font-semibold tabular-nums">
                      {job.serviceTimeSeconds ? formatSeconds(job.serviceTimeSeconds) : '—'}
                    </td>
                  )}

                  {/* Status Badge */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={job.status} />
                  </td>

                  {/* Actions (Forward-only transitions) */}
                  {!showHistory && (
                    <td className="px-4 py-3.5 text-right">
                      {job.status === 'Pending' && (
                        <Button
                          size="sm"
                          variant="blue"
                          disabled={isCurrentUpdating}
                          onClick={() => handleUpdate(job, 'Processing')}
                          className="h-8 gap-1.5"
                        >
                          {isCurrentUpdating ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Play className="h-3 w-3 fill-current" />
                              <span>Start Printing</span>
                            </>
                          )}
                        </Button>
                      )}

                      {job.status === 'Processing' && (
                        <Button
                          size="sm"
                          variant="success"
                          disabled={isCurrentUpdating}
                          onClick={() => handleUpdate(job, 'Completed')}
                          className="h-8 gap-1.5"
                        >
                          {isCurrentUpdating ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Complete Job</span>
                            </>
                          )}
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
