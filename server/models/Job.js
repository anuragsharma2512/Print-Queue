import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: [true, 'Job ID is required'],
      unique: true,
      trim: true,
    },
    // Supports both fieldwork naming and campus price-list naming
    jobType: {
      type: String,
      required: [true, 'Job type is required'],
      enum: {
        values: [
          'B&W Print',
          'Colour Print',
          'B&W Photocopy',
          'Xerox',
          'Colour Xerox',
          'Black & White Printout',
          'Colour Printout',
        ],
        message: '{VALUE} is not a valid printing type',
      },
    },
    printingType: {
      type: String,
      default: function () {
        return this.jobType;
      },
    },
    // Total pages to be printed (accounts for copies)
    pages: {
      type: Number,
      required: [true, 'Number of pages is required'],
      min: [1, 'Pages must be at least 1'],
    },
    // PDF document details (for student online uploads)
    fileName: {
      type: String,
      default: null,
    },
    storedFileReference: {
      type: String,
      default: null,
    },
    pageCount: {
      type: Number,
      default: function () {
        return this.pages;
      },
    },
    copies: {
      type: Number,
      default: 1,
      min: [1, 'Copies must be at least 1'],
    },
    totalPages: {
      type: Number,
      default: function () {
        return (this.pageCount || this.pages) * (this.copies || 1);
      },
    },
    pricePerPage: {
      type: Number,
      default: null,
    },
    estimatedAmount: {
      type: Number,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID'],
      default: 'PENDING',
    },
    paymentAcknowledged: {
      type: Boolean,
      default: false,
    },
    paymentAcknowledgedAt: {
      type: Date,
      default: null,
    },
    submissionMethod: {
      type: String,
      required: [true, 'Submission method is required'],
      enum: {
        values: ['Walk-in', 'WhatsApp', 'Student Upload'],
        message: '{VALUE} is not a valid submission method',
      },
      default: 'Walk-in',
    },
    arrivalTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    serviceStartTime: {
      type: Date,
      default: null,
    },
    serviceEndTime: {
      type: Date,
      default: null,
    },
    waitingTimeSeconds: {
      type: Number,
      default: null,
    },
    serviceTimeSeconds: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true, // auto-adds createdAt and updatedAt
  }
);

// Pre-save hook to ensure totalPages and pages stay in sync
jobSchema.pre('save', function (next) {
  if (this.pageCount && this.copies) {
    this.totalPages = this.pageCount * this.copies;
    this.pages = this.totalPages;
  }
  if (!this.printingType) {
    this.printingType = this.jobType;
  }
  next();
});

const Job = mongoose.model('Job', jobSchema);

export default Job;
