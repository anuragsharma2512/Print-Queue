import Job from '../models/Job.js';

// Forward-only status transitions
const ALLOWED_TRANSITIONS = {
  Pending: 'Processing',
  Processing: 'Completed',
};

/**
 * @desc  Get the current active queue (Pending + Processing jobs)
 * @route GET /api/queue
 */
const getQueue = async (req, res, next) => {
  try {
    const queue = await Job.find({
      status: { $in: ['Pending', 'Processing'] },
    })
      .select('-storedFileReference') // Never leak internal file paths to public queue
      .sort({ createdAt: 1 });

    res.json(queue);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Update a job's status (forward-only transitions enforced)
 * @route PATCH /api/jobs/:id/status
 */
const updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    const allowedNext = ALLOWED_TRANSITIONS[job.status];

    if (!allowedNext || allowedNext !== status) {
      res.status(400);
      throw new Error(
        `Invalid transition: ${job.status} → ${status}. Only allowed: ${job.status} → ${allowedNext}`
      );
    }

    // Auto-timestamp on transition
    if (status === 'Processing') {
      job.serviceStartTime = new Date();
    }

    if (status === 'Completed') {
      job.serviceEndTime = new Date();

      if (job.serviceStartTime) {
        job.serviceTimeSeconds = Math.floor(
          (job.serviceEndTime.getTime() - job.serviceStartTime.getTime()) / 1000
        );
      }

      if (job.arrivalTime) {
        const waitStart = job.serviceStartTime ?? job.serviceEndTime;
        job.waitingTimeSeconds = Math.floor(
          (waitStart.getTime() - new Date(job.arrivalTime).getTime()) / 1000
        );
      }
    }

    job.status = status;
    const updatedJob = await job.save();

    res.json(updatedJob);
  } catch (error) {
    next(error);
  }
};

export { getQueue, updateJobStatus };
