import Job from '../models/Job.js';
import { calculateEstimate } from '../services/predictionService.js';

/**
 * @desc  Get estimated waiting time and completion time for a new job
 * @route POST /api/predictions/estimate
 * @body  { jobType: String }
 */
const getEstimate = async (req, res, next) => {
  try {
    const { jobType } = req.body;

    if (!jobType) {
      res.status(400);
      throw new Error('Please provide jobType in the request body');
    }

    // Fetch current active queue
    const activeQueue = await Job.find({
      status: { $in: ['Pending', 'Processing'] },
    }).sort({ createdAt: 1 });

    const estimate = calculateEstimate(activeQueue, jobType);

    res.json(estimate);
  } catch (error) {
    next(error);
  }
};

export { getEstimate };
