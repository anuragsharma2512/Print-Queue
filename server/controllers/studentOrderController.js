import path from 'path';
import fs from 'fs';
import Job from '../models/Job.js';
import { calculateOrderPrice, PRINTING_RATES } from '../services/pricingService.js';
import { getPdfPageCount } from '../services/pdfService.js';
import { UPLOADS_DIR } from '../middleware/uploadMiddleware.js';

/**
 * @desc  Analyze one or more PDFs to detect page counts prior to submission
 * @route POST /api/student-orders/analyze-pdf
 */
export const analyzePdf = async (req, res, next) => {
  const files = req.files || (req.file ? [req.file] : []);

  try {
    if (!files.length) {
      return res.status(400).json({ message: 'Please upload at least one valid PDF document.' });
    }

    const results = [];
    for (const file of files) {
      const pageCount = await getPdfPageCount(file.path);
      results.push({
        fileName: file.originalname,
        tempFileName: file.filename,
        pageCount,
      });
    }

    res.json({
      success: true,
      files: results,
      // Convenience properties for single-file backwards compatibility
      fileName: results[0]?.fileName,
      tempFileName: results[0]?.tempFileName,
      pageCount: results[0]?.pageCount,
    });
  } catch (error) {
    for (const file of files) {
      if (file?.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch {}
      }
    }
    next(error);
  }
};

/**
 * @desc  Submit student printing order with multiple documents, student details, and price calculation
 * @route POST /api/student-orders
 */
export const submitStudentOrder = async (req, res, next) => {
  const files = req.files || (req.file ? [req.file] : []);

  const cleanupFiles = () => {
    for (const file of files) {
      if (file?.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch {}
      }
    }
  };

  try {
    if (!files.length) {
      return res.status(400).json({ message: 'Document upload is required. Please attach at least one PDF.' });
    }

    const {
      studentName,
      studentPhone,
      printingType,
      copies = 1,
      paymentAcknowledged,
      itemsConfig,
      metadata,
    } = req.body;

    // 1. Student Identification Validation & Defaulting
    const cleanStudentName = studentName && String(studentName).trim().length > 0
      ? String(studentName).trim()
      : 'Student';
    
    let cleanStudentPhone = 'Not provided';
    if (studentPhone && String(studentPhone).trim().length > 0) {
      const trimmedPhone = String(studentPhone).trim();
      if (trimmedPhone.length < 7) {
        cleanupFiles();
        return res.status(400).json({
          message: 'A valid Contact/WhatsApp Number (at least 7 digits) is required.',
        });
      }
      cleanStudentPhone = trimmedPhone;
    }

    // 2. Mandatory Payment Acknowledgement Validation
    const isAcknowledged =
      paymentAcknowledged === true ||
      paymentAcknowledged === 'true' ||
      paymentAcknowledged === 1 ||
      paymentAcknowledged === '1';

    if (!isAcknowledged) {
      cleanupFiles();
      return res.status(400).json({
        message: 'You must acknowledge and agree to pay the estimated amount to submit the order.',
      });
    }

    // Parse items configuration if submitted as JSON array (support itemsConfig or metadata)
    let parsedConfigs = [];
    const configRaw = itemsConfig || metadata;
    if (configRaw) {
      try {
        parsedConfigs = typeof configRaw === 'string' ? JSON.parse(configRaw) : configRaw;
      } catch {
        parsedConfigs = [];
      }
    }

    // 3. Process Each Uploaded Document
    const items = [];
    let aggregateTotalPages = 0;
    let aggregateGrandTotal = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const cfg = parsedConfigs[i] || {};

      const itemType = cfg.printingType || printingType || 'Black & White Printout';
      const itemCopies = Math.max(1, parseInt(cfg.copies || copies, 10) || 1);

      if (!itemType || !PRINTING_RATES[itemType]) {
        cleanupFiles();
        return res.status(400).json({
          message: `Invalid printing type "${itemType}" for file "${file.originalname}". Allowed types: ${Object.keys(PRINTING_RATES).join(', ')}`,
        });
      }

      // Server-side PDF Page Count Detection
      const pageCount = await getPdfPageCount(file.path);
      const pricing = calculateOrderPrice(itemType, pageCount, itemCopies);

      aggregateTotalPages += pricing.totalPages;
      aggregateGrandTotal += pricing.estimatedAmount;

      items.push({
        fileName: file.originalname,
        storedFileReference: file.filename,
        pageCount,
        copies: itemCopies,
        totalPages: pricing.totalPages,
        printingType: itemType,
        pricePerPage: pricing.pricePerPage,
        itemTotal: pricing.estimatedAmount,
      });
    }

    // 4. Generate Sequential Job ID
    const totalJobs = await Job.countDocuments();
    const jobId = `PQ-${String(totalJobs + 21).padStart(3, '0')}`;

    const primaryType = items.length === 1 ? items[0].printingType : 'Multiple Documents';

    // 5. Create Job in MongoDB
    const job = await Job.create({
      jobId,
      studentName: cleanStudentName,
      studentPhone: cleanStudentPhone,
      items,
      jobType: primaryType,
      printingType: primaryType,
      pages: aggregateTotalPages,
      totalPages: aggregateTotalPages,
      fileName: items[0].fileName,
      storedFileReference: items[0].storedFileReference,
      pageCount: items[0].pageCount,
      copies: items[0].copies,
      pricePerPage: items.length === 1 ? items[0].pricePerPage : null,
      estimatedAmount: aggregateGrandTotal,
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
        studentName: job.studentName,
        studentPhone: job.studentPhone,
        totalDocuments: items.length,
        items: job.items,
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
    cleanupFiles();
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

    // Mask phone for privacy on public lookup
    const maskedPhone = job.studentPhone
      ? job.studentPhone.replace(/.(?=.{4})/g, '*')
      : null;

    res.json({
      jobId: job.jobId,
      studentName: job.studentName,
      studentPhone: maskedPhone,
      totalDocuments: job.items && job.items.length ? job.items.length : 1,
      items: (job.items || []).map((it) => ({
        fileName: it.fileName,
        pageCount: it.pageCount,
        copies: it.copies,
        totalPages: it.totalPages,
        printingType: it.printingType,
        itemTotal: it.itemTotal,
      })),
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
 * @route GET /api/student-orders/:jobId/document/:fileIndex
 */
export const getStudentDocument = async (req, res, next) => {
  try {
    const { jobId, fileIndex } = req.params;
    const queryIndex = req.query.fileIndex ?? req.query.index ?? fileIndex;

    const job = await Job.findOne({
      $or: [{ jobId }, { _id: jobId.match(/^[0-9a-fA-F]{24}$/) ? jobId : null }],
    });

    if (!job) {
      return res.status(404).json({ message: 'Printing job not found.' });
    }

    let targetFileReference = job.storedFileReference;
    let targetFileName = job.fileName || `document-${job.jobId}.pdf`;

    // If multi-item order and specific document index requested
    if (job.items && job.items.length > 0) {
      if (queryIndex !== undefined && queryIndex !== null && queryIndex !== '') {
        const idx = parseInt(queryIndex, 10);
        if (isNaN(idx) || idx < 0 || idx >= job.items.length) {
          return res.status(404).json({ message: `Document index ${queryIndex} out of bounds.` });
        }
        const item = job.items[idx];
        targetFileReference = item.storedFileReference;
        targetFileName = item.fileName;
      } else {
        targetFileReference = job.items[0].storedFileReference;
        targetFileName = job.items[0].fileName;
      }
    }

    if (!targetFileReference) {
      return res.status(404).json({ message: 'Document reference missing for this printing job.' });
    }

    const filePath = path.join(UPLOADS_DIR, targetFileReference);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Document file missing from server storage.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(targetFileName)}"`);
    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};
