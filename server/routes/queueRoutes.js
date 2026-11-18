import express from 'express';
import { getQueue } from '../controllers/queueController.js';

const router = express.Router();

router.get('/', getQueue);

export default router;
