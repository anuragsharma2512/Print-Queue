import { useState } from 'react'
import { studentOrdersApi } from '../services/api'
import { Button } from './ui/Button'
import { Input, Label } from './ui/Form'
import StatusBadge from './StatusBadge'
import JobTypeTag from './JobTypeTag'
import { formatTime } from '../lib/utils'
import { Search, X, Loader2, AlertCircle, FileText, CheckCircle2, Clock } from 'lucide-react'

export default function TrackOrderModal({ isOpen, onClose }) {
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleTrack = async (e) => {
    e.preventDefault()
    setError(null)
    setOrderData(null)

    if (!orderId.trim()) {
      setError('Please enter a valid Order ID (e.g. PQ-021).')
      return
    }

    setLoading(true)
    try {
      const { data } = await studentOrdersApi.trackOrder(orderId.trim())
      setOrderData(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found. Please verify the Order ID.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Search className="h-4.5 w-4.5 text-indigo-600" />
              <span>Track Your Print Order</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Check real-time processing status</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form & Results */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleTrack} className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g. PQ-021"
              value={orderId}
              onChange={(e) => {
                setOrderId(e.target.value)
                setError(null)
              }}
              className="flex-1 font-mono uppercase"
              autoFocus
            />
            <Button type="submit" variant="primary" disabled={loading || !orderId.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Track'}
            </Button>
          </form>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {orderData && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-400">ORDER ID</span>
                  <p className="font-mono text-base font-extrabold text-slate-900">{orderData.jobId}</p>
                </div>
                <StatusBadge status={orderData.status} />
              </div>

              <div className="space-y-2 text-xs">
                {orderData.fileName && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">File:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                      {orderData.fileName}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Service:</span>
                  <JobTypeTag jobType={orderData.printingType} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Pages:</span>
                  <span className="font-semibold text-slate-800">
                    {orderData.totalPages} total ({orderData.pageCount || orderData.totalPages} pgs × {orderData.copies || 1} {orderData.copies === 1 ? 'copy' : 'copies'})
                  </span>
                </div>
                {orderData.estimatedAmount && (
                  <div className="flex justify-between items-center border-t border-slate-200/60 pt-2 font-bold">
                    <span className="text-slate-700">Amount to Pay:</span>
                    <span className="text-sm text-indigo-700 font-extrabold">₹{orderData.estimatedAmount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Payment:</span>
                  <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {orderData.paymentStatus || 'PENDING'} (At counter)
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Submitted:</span>
                  <span>{formatTime(orderData.arrivalTime)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
