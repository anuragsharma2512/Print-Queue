import { useState, useCallback } from 'react'
import { jobsApi } from '../services/api'
import { INITIAL_FIELDWORK_DATA } from '../data/fieldworkSample'

export const useJobs = () => {
  const [jobs, setJobs] = useState(INITIAL_FIELDWORK_DATA)
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await jobsApi.getAllJobs()
      setJobs(data)
      setIsLive(true)
    } catch {
      // Backend offline -> keep local state initialized from fieldwork records
      setIsLive(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateStatus = async (id, newStatus) => {
    try {
      if (isLive) {
        await jobsApi.updateStatus(id, newStatus)
        await fetchJobs()
        return
      }
    } catch {
      // Fallback to optimistic local update if offline
    }

    setJobs((prev) =>
      prev.map((j) => {
        if (j._id === id || j.jobId === id) {
          const now = new Date().toISOString()
          const isProcessing = newStatus === 'Processing'
          const isCompleted = newStatus === 'Completed'
          return {
            ...j,
            status: newStatus,
            serviceStartTime: isProcessing ? now : j.serviceStartTime,
            serviceEndTime: isCompleted ? now : j.serviceEndTime,
            serviceTimeSeconds: isCompleted ? (j.serviceTimeSeconds || 65) : null,
          }
        }
        return j
      })
    )
  }

  const createJob = async (jobData) => {
    try {
      if (isLive) {
        const { data } = await jobsApi.createJob(jobData)
        await fetchJobs()
        return data
      }
    } catch {
      // Offline fallback
    }

    const newJob = {
      _id: `local-${Date.now()}`,
      jobId: `PQ-${String(jobs.length + 1).padStart(3, '0')}`,
      jobType: jobData.jobType,
      pages: Number(jobData.pages),
      submissionMethod: jobData.submissionMethod,
      arrivalTime: new Date().toISOString(),
      serviceStartTime: null,
      serviceEndTime: null,
      waitingTimeSeconds: null,
      serviceTimeSeconds: null,
      status: 'Pending',
    }

    setJobs((prev) => [...prev, newJob])
    return newJob
  }

  return { jobs, loading, isLive, fetchJobs, updateStatus, createJob }
}
