import path from 'path';
import fs from 'fs';
import Job from '../models/Job.js';
import { calculateOrderPrice, PRINTING_RATES } from '../services/pricingService.js';
import { getPdfPageCount } from '../services/pdfService.js';
import { UPLOADS_DIR } from '../middleware/uploadMiddleware.js';

/**
 * @desc  Analyze a PDF to detect page count prior to submission
 * @route POST /api/student-orders/analyze-pdf
 */
export const analyzePdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a valid PDF document.' });
    }

    const pageCount = await getPdfPageCount(req.file.path);

    // Keep temporary file for submission or remove on error
    res.json({
      success: true,
      fileName: req.file.originalname,
      tempFileName: req.file.filename,
      pageCount,
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * @desc  Submit student printing order with document upload and price calculation
 * @route POST /api/student-orders
 */
export const submitStudentOrder = async (req, res, next) => {
  let uploadedFilePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Document upload is required. Please attach a PDF.' });
    }

    const { printingType, copies = 1, paymentAcknowledged } = req.body;

    // 1. Mandatory Payment Acknowledgement Validation
    const isAcknowledged =
      paymentAcknowledged === true ||
      paymentAcknowledged === 'true' ||
      paymentAcknowledged === 1 ||
      paymentAcknowledged === '1';

    if (!isAcknowledged) {
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }
      return res.status(400).json({
        message: 'You must acknowledge and agree to pay the estimated amount to submit the order.',
      });
    }

    // 2. Validate Printing Type
    if (!printingType || !PRINTING_RATES[printingType]) {
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }
      return res.status(400).json({
        message: `Invalid printing type. Must be one of: ${Object.keys(PRINTING_RATES).join(', ')}`,
      });
    }

    // 3. Detect PDF Page Count Server-side (Never trust frontend page count)
    const pageCount = await getPdfPageCount(uploadedFilePath);

    // 4. Validate Copies
    const numCopies = Math.max(1, parseInt(copies, 10) || 1);

    // 5. Calculate Price Server-side
    const pricing = calculateOrderPrice(printingType, pageCount, numCopies);

    // 6. Generate Sequential Job ID
    const totalJobs = await Job.countDocuments();
    const jobId = `PQ-${String(totalJobs + 21).padStart(3, '0')}`;

    // 7. Create Job in MongoDB
    const job = await Job.create({
      jobId,
      jobType: printingType,
      printingType,
      pages: pricing.totalPages,
      fileName: req.file.originalname,
      storedFileReference: req.file.filename,
      pageCount,
      copies: numCopies,
      totalPages: pricing.totalPages,
      pricePerPage: pricing.pricePerPage,
      estimatedAmount: pricing.estimatedAmount,
      paymentStatus: 'PENDING',
      paymentAcknowledged: true,
      paymentAcknowledgedAt: new Date(),
      submissionMethod: 'Student Upload',
      arrivalTime: new Date(),
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Printing order submitted successfully! Keep your Order ID for reference.',
      order: {
        jobId: job.jobId,
        printingType: job.printingType,
        fileName: job.fileName,
        pageCount: job.pageCount,
        copies: job.copies,
        totalPages: job.totalPages,
        pricePerPage: job.pricePerPage,
        estimatedAmount: job.estimatedAmount,
        paymentStatus: job.paymentStatus,
        status: job.status,
        arrivalTime: job.arrivalTime,
      },
    });
  } catch (error) {
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch {}
    }
    next(error);
  }
};

/**
 * @desc  Publicly track a student order status by Job ID (returns safe non-sensitive data)
 * @route GET /api/student-orders/track/:orderId
 */
export const trackStudentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required.' });
    }

    const job = await Job.findOne({
      jobId: { $regex: new RegExp(`^${orderId.trim()}$`, 'i') },
    }).select('-storedFileReference');

    if (!job) {
      return res.status(404).json({ message: `No order found matching ID: ${orderId}` });
    }

    res.json({
      jobId: job.jobId,
      printingType: job.printingType || job.jobType,
      fileName: job.fileName,
      pageCount: job.pageCount,
      copies: job.copies,
      totalPages: job.totalPages || job.pages,
      pricePerPage: job.pricePerPage,
      estimatedAmount: job.estimatedAmount,
      paymentStatus: job.paymentStatus,
      status: job.status,
      arrivalTime: job.arrivalTime,
      serviceStartTime: job.serviceStartTime,
      serviceEndTime: job.serviceEndTime,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Securely download or view uploaded student document (Shopkeeper Only)
 * @route GET /api/student-orders/:jobId/document
 */
export const getStudentDocument = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({
      $or: [{ jobId }, { _id: jobId.match(/^[0-9a-fA-F]{24}$/) ? jobId : null }],
    });

    if (!job || !job.storedFileReference) {
      return res.status(404).json({ message: 'Document not found for this printing job.' });
    }

    const filePath = path.join(UPLOADS_DIR, job.storedFileReference);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Document file missing from server storage.' });
    }

    // Set download header with original student filename
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${job.fileName || 'document.pdf'}"`);
    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};
