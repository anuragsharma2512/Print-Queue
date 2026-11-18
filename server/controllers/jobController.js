/**
 * @desc  Create a new printing job
 * @route POST /api/jobs
 */
import Job from '../models/Job.js';

const createJob = async (req, res, next) => {
  try {
    const { jobType, pages, submissionMethod } = req.body;

    if (!jobType || !pages || !submissionMethod) {
      res.status(400);
      throw new Error('Please provide jobType, pages, and submissionMethod');
    }

    // Generate sequential job ID starting after the 20 fieldwork records
    const count = await Job.countDocuments();
    const jobId = `PQ-${String(count + 21).padStart(3, '0')}`;

    const job = await Job.create({
      jobId,
      jobType,
      pages: Number(pages),
      submissionMethod,
      arrivalTime: new Date(),
      status: 'Pending',
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Get all jobs (sorted oldest first)
 * @route GET /api/jobs
 */
const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().sort({ createdAt: 1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Get a single job by MongoDB _id
 * @route GET /api/jobs/:id
 */
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
};

export { createJob, getAllJobs, getJobById };
