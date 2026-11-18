// Baseline average service times calculated from 20 fieldwork records
// collected at NIT Jamshedpur campus printing shop on 17 November 2026.
//
// Mapped to both fieldwork naming and campus shop service names:
// - B&W Print / Black & White Printout: ~69 sec
// - Colour Print / Colour Printout:       ~85 sec
// - B&W Photocopy / Xerox:               ~76 sec
// - Colour Xerox:                         ~90 sec

const BASELINE_AVG_SERVICE_TIMES = {
  'B&W Print': 69,
  'Black & White Printout': 69,
  'Colour Print': 85,
  'Colour Printout': 85,
  'B&W Photocopy': 76,
  'Xerox': 76,
  'Colour Xerox': 90,
};

const FALLBACK_AVG = 75;

/**
 * Returns the historical average service time (seconds) for a given job type.
 */
export const getAvgServiceTime = (jobType) => {
  return BASELINE_AVG_SERVICE_TIMES[jobType] ?? FALLBACK_AVG;
};

/**
 * Calculates estimated waiting time and completion time for a new incoming job.
 *
 * Formula:
 *   Estimated Waiting Time = Remaining time of current Processing job
 *                            + Sum of avg service times of all Pending jobs ahead
 *
 *   Estimated Completion Time = Now + Waiting Time + Avg Service Time of new job
 *
 * @param {Array}  activeQueue  - Array of Pending and Processing job documents
 * @param {String} newJobType   - Job type of the incoming job
 * @returns {Object} estimate details
 */
export const calculateEstimate = (activeQueue, newJobType) => {
  const processingJob = activeQueue.find((j) => j.status === 'Processing');
  const pendingJobs = activeQueue.filter((j) => j.status === 'Pending');

  let estimatedWaitingSeconds = 0;

  // Add remaining time of the currently processing job
  if (processingJob) {
    const avgTime = getAvgServiceTime(processingJob.jobType || processingJob.printingType);
    const elapsed = processingJob.serviceStartTime
      ? Math.floor((Date.now() - new Date(processingJob.serviceStartTime).getTime()) / 1000)
      : 0;
    const remaining = Math.max(0, avgTime - elapsed);
    estimatedWaitingSeconds += remaining;
  }

  // Add estimated service time for each pending job ahead
  for (const job of pendingJobs) {
    const jobTime = getAvgServiceTime(job.jobType || job.printingType);
    // If multiple copies, scale proportionately with a baseline floor
    const copiesMultiplier = job.copies && job.copies > 1 ? Math.min(2.5, 1 + (job.copies - 1) * 0.4) : 1;
    estimatedWaitingSeconds += Math.round(jobTime * copiesMultiplier);
  }

  const newJobAvgTime = getAvgServiceTime(newJobType);

  const estimatedCompletionTime = new Date(
    Date.now() + (estimatedWaitingSeconds + newJobAvgTime) * 1000
  );

  return {
    estimatedWaitingTimeSeconds: estimatedWaitingSeconds,
    estimatedServiceTimeSeconds: newJobAvgTime,
    estimatedCompletionTime,
    queueLength: activeQueue.length,
    pendingCount: pendingJobs.length,
    processingCount: processingJob ? 1 : 0,
  };
};
