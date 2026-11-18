import { useState, useEffect, useCallback } from 'react'
import { queueApi } from '../services/api'
import { INITIAL_FIELDWORK_DATA } from '../data/fieldworkSample'

/**
 * Hook to fetch and auto-refresh the active print queue.
 * Gracefully provides real fieldwork sample data if server is offline.
 */
export const useQueue = (refreshMs = 20000) => {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchQueue = useCallback(async () => {
    try {
      const { data } = await queueApi.getQueue()
      setQueue(data)
      setIsLive(true)
      setLastUpdated(new Date())
    } catch {
      // Backend not running -> use authentic fieldwork queue sample
      const activeSample = INITIAL_FIELDWORK_DATA.filter((j) => j.status !== 'Completed')
      setQueue(activeSample)
      setIsLive(false)
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQueue()
    const interval = setInterval(fetchQueue, refreshMs)
    return () => clearInterval(interval)
  }, [fetchQueue, refreshMs])

  return { queue, loading, isLive, lastUpdated, refetch: fetchQueue }
}
