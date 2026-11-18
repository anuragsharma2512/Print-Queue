import express from 'express';
import {
  submitStudentOrder,
  trackStudentOrder,
  getStudentDocument,
  analyzePdf,
} from '../controllers/studentOrderController.js';
import { uploadPdf } from '../middleware/uploadMiddleware.js';
import { orderSubmissionLimiter } from '../middleware/rateLimitMiddleware.js';
import { requireShopkeeperAuth } from '../middleware/authMiddleware.js';
import { PRINTING_RATES } from '../services/pricingService.js';

const router = express.Router();

// Public: Get official campus printing price list
router.get('/rates', (req, res) => {
  res.json({ rates: PRINTING_RATES });
});

// Public: Fast client-side page detection before submission
router.post('/analyze-pdf', uploadPdf.single('document'), analyzePdf);

// Public: Student submit printing order with PDF
router.post('/', orderSubmissionLimiter, uploadPdf.single('document'), submitStudentOrder);

// Public: Track order by Job ID
router.get('/track/:orderId', trackStudentOrder);

// Protected: Only authenticated shopkeeper can view or download the uploaded PDF
router.get('/:jobId/document', requireShopkeeperAuth, getStudentDocument);

export default router;
