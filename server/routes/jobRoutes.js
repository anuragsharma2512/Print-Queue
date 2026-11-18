import express from 'express';
import { createJob, getAllJobs, getJobById } from '../controllers/jobController.js';
import { updateJobStatus } from '../controllers/queueController.js';
import { requireShopkeeperAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected shopkeeper endpoints
router.post('/', requireShopkeeperAuth, createJob);
router.get('/', requireShopkeeperAuth, getAllJobs);
router.get('/:id', requireShopkeeperAuth, getJobById);
router.patch('/:id/status', requireShopkeeperAuth, updateJobStatus);

export default router;
