import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    storedFileReference: {
      type: String,
      required: true,
    },
    pageCount: {
      type: Number,
      required: true,
      min: 1,
    },
    copies: {
      type: Number,
      default: 1,
      min: 1,
    },
    totalPages: {
      type: Number,
      required: true,
      min: 1,
    },
    printingType: {
      type: String,
      required: true,
      enum: [
        'B&W Print',
        'Colour Print',
        'B&W Photocopy',
        'Xerox',
        'Colour Xerox',
        'Black & White Printout',
        'Colour Printout',
      ],
    },
    pricePerPage: {
      type: Number,
      required: true,
    },
    itemTotal: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

const jobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: [true, 'Job ID is required'],
      unique: true,
      trim: true,
    },
    // Student identification
    studentName: {
      type: String,
      trim: true,
      default: null,
    },
    studentPhone: {
      type: String,
      trim: true,
      default: null,
    },
    // Multi-item support for batch student uploads
    items: [orderItemSchema],
    // Primary / aggregate printing type
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
          'Multiple Documents',
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
    // Total printed pages across all documents and copies
    pages: {
      type: Number,
      required: [true, 'Number of pages is required'],
      min: [1, 'Pages must be at least 1'],
    },
    // Primary document name (or first document name if multiple)
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

// Pre-save hook to ensure totalPages, pages, and items stay synchronized
jobSchema.pre('save', function (next) {
  if (this.items && this.items.length > 0) {
    this.pages = this.items.reduce((sum, item) => sum + (item.totalPages || item.pageCount * item.copies), 0);
    this.totalPages = this.pages;
    this.estimatedAmount = this.items.reduce((sum, item) => sum + (item.itemTotal || 0), 0);
    if (!this.fileName) {
      this.fileName = this.items[0].fileName;
    }
    if (!this.storedFileReference) {
      this.storedFileReference = this.items[0].storedFileReference;
    }
  } else {
    if (this.pageCount && this.copies) {
      this.totalPages = this.pageCount * this.copies;
      this.pages = this.totalPages;
    }
  }

  if (!this.printingType) {
    this.printingType = this.jobType;
  }
  next();
});

const Job = mongoose.model('Job', jobSchema);

export default Job;
