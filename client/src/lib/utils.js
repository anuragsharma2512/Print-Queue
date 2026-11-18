import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatSeconds = (totalSeconds) => {
  if (!totalSeconds || totalSeconds <= 0) return 'Ready now'
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  if (mins === 0) return `${secs}s`
  if (secs === 0) return `${mins} min`
  return `${mins} min ${secs}s`
}

export const formatTime = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export const formatDateTime = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Checks whether the print shop is currently open based on operating hours:
 * 8:00 AM to 8:00 PM (08:00 - 20:00).
 */
export const getShopStatus = (now = new Date()) => {
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const currentMinute = hours * 60 + minutes

  const openMinute = 8 * 60   // 08:00 AM (480 mins)
  const closeMinute = 20 * 60 // 08:00 PM (1200 mins)

  const isOpen = currentMinute >= openMinute && currentMinute < closeMinute

  if (isOpen) {
    const minutesLeft = closeMinute - currentMinute
    const isClosingSoon = minutesLeft <= 45

    return {
      isOpen: true,
      status: 'Open',
      label: 'Shop Open',
      subtext: isClosingSoon ? `Closes in ${minutesLeft}m` : 'Closes at 8:00 PM',
      isClosingSoon,
      operatingHours: '8:00 AM – 8:00 PM',
    }
  } else {
    // If before 8 AM, opens today at 8 AM. If after 8 PM, opens tomorrow at 8 AM.
    const opensText = currentMinute < openMinute ? 'Opens today at 8:00 AM' : 'Opens tomorrow at 8:00 AM'

    return {
      isOpen: false,
      status: 'Closed',
      label: 'Shop Closed',
      subtext: opensText,
      isClosingSoon: false,
      operatingHours: '8:00 AM – 8:00 PM',
    }
  }
}

export const JOB_TYPE_META = {
  'B&W Print': { label: 'B&W Print', color: 'text-slate-700 bg-slate-100 border-slate-200' },
  'Black & White Printout': { label: 'B&W Printout', color: 'text-slate-700 bg-slate-100 border-slate-200' },
  'Colour Print': { label: 'Colour Print', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  'Colour Printout': { label: 'Colour Printout', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  'B&W Photocopy': { label: 'Photocopy', color: 'text-teal-700 bg-teal-50 border-teal-200' },
  'Xerox': { label: 'Xerox', color: 'text-teal-700 bg-teal-50 border-teal-200' },
  'Colour Xerox': { label: 'Colour Xerox', color: 'text-purple-700 bg-purple-50 border-purple-200' },
}

export const METHOD_META = {
  'Walk-in': { color: 'text-amber-800 bg-amber-50 border-amber-200' },
  'WhatsApp': { color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
  'Student Upload': { color: 'text-blue-800 bg-blue-50 border-blue-200' },
}
