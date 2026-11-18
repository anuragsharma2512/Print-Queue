import { useState, useId } from 'react'
import { studentOrdersApi } from '../services/api'
import { Button } from './ui/Button'
import { Select, Input, Label } from './ui/Form'
import {
  UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2,
  X, Copy, Check, Calculator, ShieldCheck, IndianRupee
} from 'lucide-react'

// Official rates from NIT Jamshedpur campus shop price list
const PRINTING_OPTIONS = [
  { value: 'Xerox', label: 'Xerox (₹2 / page)', rate: 2 },
  { value: 'Colour Xerox', label: 'Colour Xerox (₹5 / page)', rate: 5 },
  { value: 'Black & White Printout', label: 'Black & White Printout (₹3 / page)', rate: 3 },
  { value: 'Colour Printout', label: 'Colour Printout (₹8 / page)', rate: 8 },
]

export default function StudentOrderModal({ isOpen, onClose, onOrderSubmitted }) {
  const checkboxId = useId()
  const [file, setFile] = useState(null)
  const [detectingPages, setDetectingPages] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [printingType, setPrintingType] = useState('Black & White Printout')
  const [copies, setCopies] = useState(1)
  const [acknowledged, setAcknowledged] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successOrder, setSuccessOrder] = useState(null)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  // Rate calculation
  const selectedOption = PRINTING_OPTIONS.find((o) => o.value === printingType) || PRINTING_OPTIONS[2]
  const ratePerPage = selectedOption.rate
  const totalPages = (pageCount > 0 ? pageCount : 1) * Math.max(1, copies)
  const estimatedAmount = totalPages * ratePerPage

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0]
    setError(null)

    if (!selected) return

    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Invalid file format. Please upload a standard PDF (.pdf) file.')
      return
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit. Please upload a smaller document.')
      return
    }

    setFile(selected)
    setDetectingPages(true)

    // Call server helper to detect exact PDF page count
    try {
      const formData = new FormData()
      formData.append('document', selected)
      const { data } = await studentOrdersApi.submitOrder(formData) // fallback or analyze
      // If endpoint analyze-pdf is available:
    } catch {
      // In case analyze endpoint is tested, fallback
    }

    // Direct page detection call
    try {
      const formData = new FormData()
      formData.append('document', selected)
      const res = await fetch('http://localhost:5000/api/student-orders/analyze-pdf', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        if (data.pageCount) {
          setPageCount(data.pageCount)
        }
      } else {
        // Fallback default
        setPageCount(1)
      }
    } catch {
      setPageCount(1)
    } finally {
      setDetectingPages(false)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPageCount(0)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!file) {
      setError('Please attach a PDF document.')
      return
    }

    if (!acknowledged) {
      setError('You must acknowledge and agree to pay the estimated amount.')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('document', file)
      formData.append('printingType', printingType)
      formData.append('copies', String(copies))
      formData.append('paymentAcknowledged', 'true')

      const { data } = await studentOrdersApi.submitOrder(formData)

      if (data?.success && data?.order) {
        setSuccessOrder(data.order)
        onOrderSubmitted?.(data.order)
      } else {
        setError('Submission failed. Please try again.')
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit order. Please try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyOrderId = () => {
    if (successOrder?.jobId) {
      navigator.clipboard.writeText(successOrder.jobId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200/90 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-indigo-600" />
              <span>Submit Printing Order</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct upload to NIT Jamshedpur campus photocopy shop queue
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successOrder ? (
            /* Success confirmation card */
            <div className="space-y-5 text-center py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Order Placed Successfully!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Your document has been sent to the shopkeeper's queue. Please save your Order ID to track status and collect your prints at the counter.
                </p>
              </div>

              {/* Order Details Badge Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <span className="text-xs font-semibold text-slate-500">Order Reference</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                      {successOrder.jobId}
                    </span>
                    <button
                      onClick={handleCopyOrderId}
                      className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-2xs cursor-pointer"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Document:</span>
                    <p className="font-semibold text-slate-800 truncate">{successOrder.fileName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Service Type:</span>
                    <p className="font-semibold text-slate-800">{successOrder.printingType}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Printed Pages:</span>
                    <p className="font-semibold text-slate-800">
                      {successOrder.pageCount} pgs × {successOrder.copies} {successOrder.copies === 1 ? 'copy' : 'copies'} = {successOrder.totalPages} pgs
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Estimated Amount:</span>
                    <p className="font-extrabold text-slate-900 text-sm">₹{successOrder.estimatedAmount}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    PENDING (Pay at shop counter)
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={onClose} variant="primary" className="w-full">
                  Done & Return to Queue
                </Button>
              </div>
            </div>
          ) : (
            /* Order Entry Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Document File Uploader */}
              <div>
                <Label htmlFor="pdf-upload">Document (PDF Only, Max 10 MB)</Label>
                {!file ? (
                  <label
                    htmlFor="pdf-upload"
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center cursor-pointer hover:bg-slate-100/70 hover:border-indigo-400 transition-all group"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm border border-slate-200 group-hover:scale-105 transition-transform mb-2">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Click to browse or drop your PDF document here
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Lecture slides, notes, assignments, lab manuals
                    </span>
                    <input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between rounded-2xl border border-indigo-200 bg-indigo-50/50 p-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                          <span>•</span>
                          {detectingPages ? (
                            <span className="inline-flex items-center gap-1 text-indigo-600 font-medium">
                              <Loader2 className="h-3 w-3 animate-spin" /> Detecting pages…
                            </span>
                          ) : (
                            <span className="font-semibold text-indigo-700 bg-white/80 px-1.5 py-0.2 rounded border border-indigo-200">
                              {pageCount} {pageCount === 1 ? 'page' : 'pages'} detected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                      title="Remove document"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Printing Type & Copies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="printingType">Printing Type</Label>
                  <Select
                    id="printingType"
                    value={printingType}
                    onChange={(e) => setPrintingType(e.target.value)}
                  >
                    {PRINTING_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="copies">Number of Copies</Label>
                  <Input
                    id="copies"
                    type="number"
                    min="1"
                    max="50"
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  />
                </div>
              </div>

              {/* Price Calculation Breakdown Box */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Calculator className="h-4 w-4 text-indigo-600" />
                    <span>Price Calculation Breakdown</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">Campus Official Rates</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200/80 pt-2">
                  <div className="text-slate-500">Service:</div>
                  <div className="text-right font-semibold text-slate-800">{printingType} (₹{ratePerPage}/page)</div>

                  <div className="text-slate-500">Page Calculation:</div>
                  <div className="text-right font-semibold text-slate-800">
                    {pageCount || 1} pages × {copies} {copies === 1 ? 'copy' : 'copies'} = {totalPages} pages
                  </div>

                  <div className="text-slate-500 font-bold border-t border-slate-200/60 pt-1">Estimated Total:</div>
                  <div className="text-right font-extrabold text-indigo-700 text-sm border-t border-slate-200/60 pt-1">
                    ₹{estimatedAmount}
                  </div>
                </div>
              </div>

              {/* Mandatory Payment Acknowledgement Checkbox */}
              <div className="rounded-2xl border-2 border-amber-300/80 bg-amber-50/50 p-4">
                <label htmlFor={checkboxId} className="flex items-start gap-3 cursor-pointer">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-amber-400 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="text-xs text-amber-900 leading-relaxed select-none">
                    <span className="font-bold">Mandatory Payment Agreement:</span>
                    <p className="mt-0.5">
                      I understand that the estimated printing amount is <strong>₹{estimatedAmount}</strong>, and I agree to pay this amount to the shopkeeper for my printing order upon collection.
                    </p>
                    <p className="mt-1 text-[11px] text-amber-800/80 font-normal">
                      *Payment is settled offline at the photocopy counter. The final amount may be confirmed by the shopkeeper.
                    </p>
                  </div>
                </label>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex gap-2.5">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || !file || !acknowledged}
                  className="flex-1 h-11"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending Order to Queue…</span>
                    </>
                  ) : (
                    <>
                      <IndianRupee className="h-4 w-4" />
                      <span>Confirm & Submit Order (₹{estimatedAmount})</span>
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
