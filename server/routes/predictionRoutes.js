import express from 'express';
import { getEstimate } from '../controllers/predictionController.js';

const router = express.Router();

router.post('/estimate', getEstimate);

export default router;
