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

// Public: Fast client-side page detection before submission (accepts single or multi)
router.post('/analyze-pdf', uploadPdf.any(), analyzePdf);

// Public: Student submit printing order (supports single and multiple documents)
router.post('/', orderSubmissionLimiter, uploadPdf.any(), submitStudentOrder);

// Public: Track order by Job ID
router.get('/track/:orderId', trackStudentOrder);

// Protected: Only authenticated shopkeeper can view or download the uploaded PDF
// Supports both /:jobId/document and /:jobId/document/:fileIndex or query ?fileIndex=0
router.get('/:jobId/document', requireShopkeeperAuth, getStudentDocument);
router.get('/:jobId/document/:fileIndex', requireShopkeeperAuth, getStudentDocument);

export default router;
