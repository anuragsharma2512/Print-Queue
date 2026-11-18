import { useState, useId } from 'react'
import { studentOrdersApi } from '../services/api'
import { Button } from './ui/Button'
import { Select, Input, Label } from './ui/Form'
import {
  UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2,
  X, Copy, Check, Calculator, ShieldCheck, IndianRupee,
  Plus, Trash2, User, Phone, Layers
} from 'lucide-react'

// Official rates from NIT Jamshedpur campus shop price list
const PRINTING_OPTIONS = [
  { value: 'Black & White Printout', label: 'B&W Printout (₹3 / page)', rate: 3 },
  { value: 'Colour Printout', label: 'Colour Printout (₹8 / page)', rate: 8 },
  { value: 'Xerox', label: 'Xerox (₹2 / page)', rate: 2 },
  { value: 'Colour Xerox', label: 'Colour Xerox (₹5 / page)', rate: 5 },
]

export default function StudentOrderModal({ isOpen, onClose, onOrderSubmitted }) {
  const checkboxId = useId()

  // Student Details
  const [studentName, setStudentName] = useState('')
  const [studentPhone, setStudentPhone] = useState('')

  // Documents list: [{ id, file, fileName, pageCount, printingType, copies, detecting }]
  const [items, setItems] = useState([])
  const [acknowledged, setAcknowledged] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successOrder, setSuccessOrder] = useState(null)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  // Calculate itemized totals and grand total
  const calculatedItems = items.map((item) => {
    const option = PRINTING_OPTIONS.find((o) => o.value === item.printingType) || PRINTING_OPTIONS[0]
    const pgs = item.pageCount > 0 ? item.pageCount : 1
    const copies = Math.max(1, parseInt(item.copies, 10) || 1)
    const totalPgs = pgs * copies
    const subtotal = totalPgs * option.rate
    return {
      ...item,
      rate: option.rate,
      totalPgs,
      subtotal,
    }
  })

  const grandTotalPages = calculatedItems.reduce((sum, it) => sum + it.totalPgs, 0)
  const grandTotalAmount = calculatedItems.reduce((sum, it) => sum + it.subtotal, 0)

  // Fast page count detector for uploaded file
  const detectPageCount = async (file) => {
    try {
      const formData = new FormData()
      formData.append('document', file)
      const res = await fetch('http://localhost:5000/api/student-orders/analyze-pdf', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        if (data.pageCount) return data.pageCount
      }
    } catch {}
    return 1
  }

  // Handle file addition (single or multiple files)
  const handleFilesSelected = async (e) => {
    const selectedFiles = Array.from(e.target.files || [])
    setError(null)

    if (!selectedFiles.length) return

    const validPdfs = []
    for (const f of selectedFiles) {
      if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
        setError(`"${f.name}" is not a PDF. Only PDF files are supported.`)
        return
      }
      if (f.size > 10 * 1024 * 1024) {
        setError(`"${f.name}" exceeds the 10 MB limit.`)
        return
      }
      validPdfs.push(f)
    }

    // Add items in detecting state
    const newItems = validPdfs.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      fileName: file.name,
      fileSize: file.size,
      pageCount: 1,
      printingType: 'Black & White Printout',
      copies: 1,
      detecting: true,
    }))

    setItems((prev) => [...prev, ...newItems])

    // Detect page counts asynchronously
    for (const item of newItems) {
      const detected = await detectPageCount(item.file)
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, pageCount: detected, detecting: false } : it
        )
      )
    }

    // Reset input value so same files can be re-selected if desired
    e.target.value = ''
  }

  const handleUpdateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    )
  }

  const handleRemoveItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  const handleResetForAnotherOrder = () => {
    setItems([])
    setAcknowledged(false)
    setSuccessOrder(null)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!studentName.trim()) {
      setError('Please enter your Name.')
      return
    }

    if (!studentPhone.trim() || studentPhone.trim().length < 7) {
      setError('Please enter a valid WhatsApp or Mobile Number.')
      return
    }

    if (!items.length) {
      setError('Please attach at least one PDF document.')
      return
    }

    if (!acknowledged) {
      setError('You must acknowledge and agree to pay the estimated amount.')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('studentName', studentName.trim())
      formData.append('studentPhone', studentPhone.trim())
      formData.append('paymentAcknowledged', 'true')

      // Items configuration JSON
      const itemsConfig = calculatedItems.map((it) => ({
        printingType: it.printingType,
        copies: it.copies,
      }))
      formData.append('itemsConfig', JSON.stringify(itemsConfig))

      // Append all document files
      items.forEach((it) => {
        formData.append('documents', it.file)
      })

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
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200/90 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-indigo-600" />
              <span>Submit Printing Order</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload single or multiple documents directly to the shop queue
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {successOrder ? (
            /* Multi-Item Success Confirmation Screen */
            <div className="space-y-5 text-center py-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Order Placed Successfully!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Your printing batch has been queued. Please note your Order ID below to track and collect your prints at the counter.
                </p>
              </div>

              {/* Order Summary Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order Reference</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-base font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                        {successOrder.jobId}
                      </span>
                      <button
                        onClick={handleCopyOrderId}
                        className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-2xs cursor-pointer"
                      >
                        {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        <span>{copied ? 'Copied' : 'Copy ID'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student</span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{successOrder.studentName || studentName}</p>
                    <p className="text-[11px] text-slate-500">{successOrder.studentPhone || studentPhone}</p>
                  </div>
                </div>

                {/* List of Submitted Documents */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Submitted Documents ({successOrder.items?.length || successOrder.totalDocuments || 1})
                  </span>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {(successOrder.items || calculatedItems).map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-200/80 text-xs shadow-2xs"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-900 truncate">📄 {it.fileName}</p>
                          <p className="text-[11px] text-slate-500">
                            {it.printingType} · {it.pageCount} pgs × {it.copies} {it.copies === 1 ? 'copy' : 'copies'}
                          </p>
                        </div>
                        <span className="font-extrabold text-slate-900 shrink-0">
                          ₹{it.itemTotal || it.subtotal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Payment Status */}
                <div className="border-t border-slate-200/80 pt-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Combined Total:</span>
                    <span className="ml-2 font-extrabold text-slate-900 text-sm">
                      ₹{successOrder.estimatedAmount || grandTotalAmount}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1">
                      ({successOrder.totalPages || grandTotalPages} total pages)
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                    PENDING (Pay at counter)
                  </span>
                </div>
              </div>

              {/* Action Buttons: Add Another Batch OR Return */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <Button
                  onClick={handleResetForAnotherOrder}
                  variant="outline"
                  className="flex-1 h-10 gap-1.5 text-xs font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  <span>Submit Another Printing Order</span>
                </Button>

                <Button
                  onClick={onClose}
                  variant="primary"
                  className="flex-1 h-10 gap-1.5 text-xs font-semibold"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Done & View Queue</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Order Entry Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 1. Student Name & Phone Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <Label htmlFor="studentName" className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Your Full Name *</span>
                  </Label>
                  <Input
                    id="studentName"
                    type="text"
                    placeholder="e.g. Anurag Sharma"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="studentPhone" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-indigo-600" />
                    <span>WhatsApp / Mobile Number *</span>
                  </Label>
                  <Input
                    id="studentPhone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* 2. Document Upload Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="flex items-center gap-1.5 mb-0">
                    <Layers className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Upload Printing Documents (PDF only, max 10 MB each)</span>
                  </Label>
                  {items.length > 0 && (
                    <label
                      htmlFor="add-more-pdf"
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Another PDF</span>
                    </label>
                  )}
                </div>

                {items.length === 0 ? (
                  <label
                    htmlFor="pdf-upload"
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center cursor-pointer hover:bg-slate-100/70 hover:border-indigo-400 transition-all group"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm border border-slate-200 group-hover:scale-105 transition-transform mb-2">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Click to browse or drop your PDF document(s) here
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      You can select multiple files at once (Assignments, Notes, Lab Reports)
                    </span>
                    <input
                      id="pdf-upload"
                      type="file"
                      multiple
                      accept=".pdf,application/pdf"
                      onChange={handleFilesSelected}
                      className="hidden"
                    />
                  </label>
                ) : (
                  /* List of Uploaded Documents with per-document settings */
                  <div className="space-y-3">
                    <input
                      id="add-more-pdf"
                      type="file"
                      multiple
                      accept=".pdf,application/pdf"
                      onChange={handleFilesSelected}
                      className="hidden"
                    />

                    {calculatedItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-3"
                      >
                        {/* File header */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs">
                              #{idx + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{item.fileName}</p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                <span>{(item.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                                <span>•</span>
                                {item.detecting ? (
                                  <span className="inline-flex items-center gap-1 text-indigo-600 font-medium">
                                    <Loader2 className="h-3 w-3 animate-spin" /> Counting pages…
                                  </span>
                                ) : (
                                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                                    {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* File configuration (Print Type & Copies) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 border-t border-slate-100">
                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Printing Type
                            </label>
                            <Select
                              value={item.printingType}
                              onChange={(e) => handleUpdateItem(item.id, 'printingType', e.target.value)}
                              className="h-8 text-xs py-1"
                            >
                              {PRINTING_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </Select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Copies
                            </label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                max="50"
                                value={item.copies}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, 'copies', Math.max(1, parseInt(e.target.value, 10) || 1))
                                }
                                className="h-8 text-xs py-1"
                              />
                              <div className="text-right shrink-0">
                                <span className="text-xs font-extrabold text-slate-900">₹{item.subtotal}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Combined Price Calculation Box */}
              {items.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Calculator className="h-4 w-4 text-indigo-600" />
                      <span>Consolidated Order Breakdown</span>
                    </span>
                    <span className="text-[11px] font-normal text-slate-400">
                      {items.length} {items.length === 1 ? 'file' : 'files'} attached
                    </span>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-200/80 pt-2 text-xs">
                    {calculatedItems.map((it, i) => (
                      <div key={i} className="flex justify-between text-slate-600 text-[11px]">
                        <span className="truncate max-w-[280px]">
                          {i + 1}. {it.fileName} ({it.pageCount} pgs × {it.copies} @ ₹{it.rate})
                        </span>
                        <span className="font-semibold text-slate-800">₹{it.subtotal}</span>
                      </div>
                    ))}

                    <div className="flex justify-between items-center border-t border-slate-200/80 pt-2 font-bold text-slate-800">
                      <span>Total Printed Pages:</span>
                      <span>{grandTotalPages} pages</span>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-200/80 pt-2 font-extrabold text-slate-900 text-sm">
                      <span>Grand Total Amount:</span>
                      <span className="text-base text-indigo-700">₹{grandTotalAmount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Mandatory Payment Acknowledgement Checkbox */}
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
                      I, <strong>{studentName || 'Student'}</strong>, understand that the estimated printing amount for these {items.length || 0} document(s) is <strong>₹{grandTotalAmount}</strong>, and I agree to pay this amount to the shopkeeper upon collection.
                    </p>
                    <p className="mt-1 text-[11px] text-amber-800/80 font-normal">
                      *Payment is collected offline at the photocopy counter when you pick up your prints.
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

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-2.5">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || !items.length || !acknowledged || !studentName.trim() || !studentPhone.trim()}
                  className="flex-1 h-11"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending {items.length} Document(s) to Queue…</span>
                    </>
                  ) : (
                    <>
                      <IndianRupee className="h-4 w-4" />
                      <span>
                        Confirm & Submit {items.length > 1 ? `${items.length} Documents` : 'Order'} (₹{grandTotalAmount})
                      </span>
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
