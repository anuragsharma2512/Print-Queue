import { useState } from 'react'
import { Button } from './ui/Button'
import StatusBadge from './StatusBadge'
import JobTypeTag from './JobTypeTag'
import MethodTag from './MethodTag'
import { formatTime, formatSeconds } from '../lib/utils'
import { FileText, Play, CheckCircle2, Loader2, Download, User, Phone } from 'lucide-react'

export default function QueueTable({ jobs, onStatusUpdate, showHistory = false }) {
  const [updatingId, setUpdatingId] = useState(null)
  const [downloadingRef, setDownloadingRef] = useState(null)

  const handleUpdate = async (job, newStatus) => {
    setUpdatingId(job._id || job.jobId)
    try {
      await onStatusUpdate(job._id || job.jobId, newStatus)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDownloadFile = async (jobId, fileIndex, fileName) => {
    const downloadKey = `${jobId}-${fileIndex}`
    setDownloadingRef(downloadKey)
    try {
      const res = await fetch(`http://localhost:5000/api/student-orders/${jobId}/document?fileIndex=${fileIndex}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error('Unauthorized or file missing')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName || `document-${jobId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Could not download document. Ensure you are logged in as shopkeeper.')
    } finally {
      setDownloadingRef(null)
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
        <table className="w-full text-left text-xs table-auto">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/90 font-bold uppercase tracking-wider text-slate-500 text-[10px]">
              <th className="px-2.5 py-3 w-9 text-center">#</th>
              <th className="px-2.5 py-3 whitespace-nowrap">Job ID</th>
              <th className="px-2.5 py-3 whitespace-nowrap">Student</th>
              <th className="px-2.5 py-3">Documents & Type</th>
              <th className="px-2 py-3 text-center whitespace-nowrap">Pages</th>
              <th className="px-2.5 py-3 whitespace-nowrap">Payment</th>
              <th className="px-2 py-3 whitespace-nowrap">Channel</th>
              <th className="px-2 py-3 whitespace-nowrap">Arrival</th>
              {showHistory && (
                <th className="px-2.5 py-3 whitespace-nowrap">Duration</th>
              )}
              <th className="px-2.5 py-3 whitespace-nowrap">Status</th>
              {!showHistory && (
                <th className="px-3 py-3 text-right whitespace-nowrap">Action</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job, index) => {
              const isProcessing = job.status === 'Processing'
              const isCurrentUpdating = updatingId === (job._id || job.jobId)
              const hasItems = job.items && job.items.length > 0
              const itemsList = hasItems
                ? job.items
                : (job.fileName ? [{ fileName: job.fileName, storedFileReference: job.storedFileReference, printingType: job.printingType || job.jobType, pageCount: job.pageCount || job.pages, copies: job.copies || 1, totalPages: job.totalPages || job.pages }] : [])

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
                  <td className="px-2.5 py-2.5 text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 font-extrabold text-[11px] text-slate-600">
                      {index + 1}
                    </span>
                  </td>

                  {/* Job ID */}
                  <td className="px-2.5 py-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {job.jobId}
                  </td>

                  {/* Student Name & Phone */}
                  <td className="px-2.5 py-2.5 whitespace-nowrap">
                    {job.studentName ? (
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 font-bold text-slate-900">
                          <User className="h-3 w-3 text-indigo-600 shrink-0" />
                          <span className="truncate max-w-[130px]" title={job.studentName}>{job.studentName}</span>
                        </div>
                        {job.studentPhone && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 font-mono">
                            <Phone className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                            <span>{job.studentPhone}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Walk-in Customer</span>
                    )}
                  </td>

                  {/* Documents & Printing Type */}
                  <td className="px-2.5 py-2.5">
                    {itemsList.length > 0 ? (
                      <div className="space-y-1 max-w-[210px]">
                        {itemsList.map((doc, docIdx) => {
                          const downloadKey = `${job.jobId}-${docIdx}`
                          const isDownloading = downloadingRef === downloadKey

                          return (
                            <div key={docIdx} className="flex items-center justify-between gap-1.5 bg-slate-50/90 hover:bg-slate-100/90 px-2 py-1 rounded-md border border-slate-200/80 transition-colors">
                              <div className="min-w-0 pr-1">
                                <p className="font-semibold text-slate-800 truncate text-[11px] leading-tight max-w-[150px]" title={doc.fileName}>
                                  📄 {doc.fileName}
                                </p>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5 leading-none">
                                  <span className="font-medium text-slate-700">{doc.printingType}</span>
                                  <span>•</span>
                                  <span>{doc.pageCount}p × {doc.copies}c</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDownloadFile(job.jobId, docIdx, doc.fileName)}
                                disabled={isDownloading}
                                className="inline-flex items-center justify-center h-6 w-6 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 transition-colors shrink-0 cursor-pointer"
                                title="Download PDF"
                              >
                                {isDownloading ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Download className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <JobTypeTag jobType={job.jobType || job.printingType} />
                        <span className="block text-[10px] text-slate-400 italic">Physical Document</span>
                      </div>
                    )}
                  </td>

                  {/* Total Pages */}
                  <td className="px-2 py-2.5 text-center font-bold text-slate-800 whitespace-nowrap">
                    <span>{job.totalPages || job.pages}</span>
                    {hasItems && (
                      <span className="block text-[10px] font-normal text-slate-400">
                        ({job.items.length} {job.items.length === 1 ? 'file' : 'files'})
                      </span>
                    )}
                  </td>

                  {/* Payment */}
                  <td className="px-2.5 py-2.5 whitespace-nowrap">
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
                  <td className="px-2 py-2.5 whitespace-nowrap">
                    <MethodTag method={job.submissionMethod} />
                  </td>

                  {/* Arrival */}
                  <td className="px-2 py-2.5 text-slate-500 tabular-nums whitespace-nowrap text-[11px]">
                    {formatTime(job.arrivalTime)}
                  </td>

                  {/* Historical Duration */}
                  {showHistory && (
                    <td className="px-2.5 py-2.5 text-slate-700 font-semibold tabular-nums whitespace-nowrap">
                      {job.serviceTimeSeconds ? formatSeconds(job.serviceTimeSeconds) : '—'}
                    </td>
                  )}

                  {/* Status Badge */}
                  <td className="px-2.5 py-2.5 whitespace-nowrap">
                    <StatusBadge status={job.status} />
                  </td>

                  {/* Actions (Forward-only transitions) */}
                  {!showHistory && (
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      {job.status === 'Pending' && (
                        <Button
                          size="sm"
                          variant="blue"
                          disabled={isCurrentUpdating}
                          onClick={() => handleUpdate(job, 'Processing')}
                          className="h-7.5 px-3 text-xs gap-1.5 font-semibold shadow-2xs"
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
                          className="h-7.5 px-3 text-xs gap-1.5 font-semibold shadow-2xs"
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
