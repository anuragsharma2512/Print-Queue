import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateOrderPrice } from './services/pricingService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:5000';

// Helper to create a minimal valid PDF with N pages in memory
const createMinimalPdfBuffer = (pageCount = 1) => {
  let objects = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');

  let pageRefs = [];
  for (let i = 0; i < pageCount; i++) {
    pageRefs.push(`${4 + i} 0 R`);
  }
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [${pageRefs.join(' ')}] /Count ${pageCount} >>\nendobj`);
  objects.push('3 0 obj\n<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>\nendobj');

  for (let i = 0; i < pageCount; i++) {
    const pageNum = 4 + i;
    objects.push(`${pageNum} 0 obj\n<< /Type /Page /Parent 2 0 R /Resources 3 0 R /MediaBox [0 0 612 792] >>\nendobj`);
  }

  let pdf = '%PDF-1.4\n';
  let xref = ['xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n'];

  for (let i = 0; i < objects.length; i++) {
    const offset = Buffer.byteLength(pdf);
    xref.push(String(offset).padStart(10, '0') + ' 00000 n \n');
    pdf += objects[i] + '\n';
  }

  const startxref = Buffer.byteLength(pdf);
  pdf += xref.join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;

  return Buffer.from(pdf, 'utf-8');
};

const sendFormUpload = async (endpoint, fields, fileInfo) => {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    form.append(k, v);
  }
  if (fileInfo) {
    const blob = new Blob([fileInfo.buffer], { type: fileInfo.contentType });
    form.append(fileInfo.name, blob, fileInfo.filename);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    body: form,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {}

  return { status: res.status, headers: res.headers, data };
};

const runComprehensiveTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 PRINTQUEUE - FULL SYSTEM VERIFICATION SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const test = (name, condition, details = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details ? `(${details})` : ''}`);
      failed++;
    }
  };

  try {
    // -----------------------------------------------------------------
    // 1. PRICE CALCULATION TESTS (Required Test Cases Table)
    // -----------------------------------------------------------------
    console.log('--- 1. Official Pricing Calculation Tests ---');
    const priceCases = [
      { type: 'Xerox', pages: 10, copies: 1, expected: 20 },
      { type: 'Colour Xerox', pages: 10, copies: 1, expected: 50 },
      { type: 'Black & White Printout', pages: 10, copies: 1, expected: 30 },
      { type: 'Colour Printout', pages: 10, copies: 1, expected: 80 },
      { type: 'Black & White Printout', pages: 10, copies: 2, expected: 60 },
      { type: 'Colour Printout', pages: 5, copies: 3, expected: 120 },
    ];

    for (const tc of priceCases) {
      const res = calculateOrderPrice(tc.type, tc.pages, tc.copies);
      test(
        `Pricing: ${tc.type} (${tc.pages} pgs × ${tc.copies} copies = ₹${tc.expected})`,
        res.estimatedAmount === tc.expected && res.totalPages === tc.pages * tc.copies
      );
    }

    // -----------------------------------------------------------------
    // 2. AUTHENTICATION & SECURITY TESTS
    // -----------------------------------------------------------------
    console.log('\n--- 2. Backend Authentication & Route Guards ---');

    // 2.1 Reject invalid PIN
    const wrongPinRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '0000' }),
    });
    test('Reject Incorrect PIN (returns 401)', wrongPinRes.status === 401);

    // 2.2 Correct PIN login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '1234' }),
    });
    const cookieHeader = loginRes.headers.get('set-cookie');
    test('Login Success with Correct PIN (returns 200)', loginRes.status === 200);
    test('HttpOnly Cookie Issued on Login', Boolean(cookieHeader && cookieHeader.includes('token=')));

    // 2.3 Verify session via /api/auth/me
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { cookie: cookieHeader },
    });
    const meData = await meRes.json();
    test('Session Verification (/api/auth/me returns authenticated: true)', meData.authenticated === true && meData.role === 'shopkeeper');

    // 2.4 Unauthenticated access to protected endpoint
    const unauthJobs = await fetch(`${BASE_URL}/api/jobs`);
    test('Unauthenticated Access to /api/jobs Blocked (returns 401)', unauthJobs.status === 401);

    // 2.5 Authenticated access to protected endpoint
    const authJobs = await fetch(`${BASE_URL}/api/jobs`, {
      headers: { cookie: cookieHeader },
    });
    test('Authenticated Access to /api/jobs Allowed (returns 200)', authJobs.status === 200);

    // 2.6 Logout clears cookie
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
    });
    test('Logout Endpoint Returns 200', logoutRes.status === 200);

    // -----------------------------------------------------------------
    // 3. STUDENT ORDER SUBMISSION & PDF PROCESSING TESTS
    // -----------------------------------------------------------------
    console.log('\n--- 3. Student Order Submission & PDF Processing ---');

    const samplePdfBuffer = createMinimalPdfBuffer(5); // 5 pages PDF

    // 3.1 Reject missing acknowledgement
    const noAckRes = await sendFormUpload('/api/student-orders', {
      printingType: 'Black & White Printout',
      copies: '1',
      paymentAcknowledged: 'false',
    }, {
      name: 'document',
      filename: 'assignment.pdf',
      contentType: 'application/pdf',
      buffer: samplePdfBuffer,
    });
    test('Reject Order Missing Payment Acknowledgement (returns 400)', noAckRes.status === 400);

    // 3.2 Reject invalid file extension
    const badFileRes = await sendFormUpload('/api/student-orders', {
      printingType: 'Black & White Printout',
      copies: '1',
      paymentAcknowledged: 'true',
    }, {
      name: 'document',
      filename: 'script.exe',
      contentType: 'application/x-msdownload',
      buffer: Buffer.from('not a pdf'),
    });
    test('Reject Non-PDF Upload (returns 400 or 500)', badFileRes.status >= 400);

    // 3.3 Valid Student Order Submission
    // 5 pages PDF, 2 copies, Black & White Printout (₹3/page) -> Total 10 pages -> ₹30
    const validOrderRes = await sendFormUpload('/api/student-orders', {
      printingType: 'Black & White Printout',
      copies: '2',
      paymentAcknowledged: 'true',
    }, {
      name: 'document',
      filename: 'lecture-notes.pdf',
      contentType: 'application/pdf',
      buffer: samplePdfBuffer,
    });

    test('Valid Student Order Submission (returns 201 Created)', validOrderRes.status === 201);
    const submittedOrder = validOrderRes.data?.order;
    test('Order ID Generated (PQ-xxx format)', Boolean(submittedOrder?.jobId && submittedOrder.jobId.startsWith('PQ-')));
    test('Server Detected 5 Pages From PDF', submittedOrder?.pageCount === 5);
    test('Total Pages Calculated (5 pgs × 2 copies = 10)', submittedOrder?.totalPages === 10);
    test('Server Price Calculation Verified (10 × ₹3 = ₹30)', submittedOrder?.estimatedAmount === 30);
    test('Payment Status Initialized as PENDING', submittedOrder?.paymentStatus === 'PENDING');
    test('Job Status Initialized as Pending', submittedOrder?.status === 'Pending');

    const createdJobId = submittedOrder?.jobId;

    // 3.4 Public Order Tracking
    const trackRes = await fetch(`${BASE_URL}/api/student-orders/track/${createdJobId}`);
    const trackData = await trackRes.json();
    test('Public Order Tracking (/api/student-orders/track/:orderId)', trackRes.status === 200 && trackData.jobId === createdJobId);
    test('Public Tracking Does NOT Expose Internal File Path', !('storedFileReference' in trackData));

    // 3.5 Student Order Appears in Active Queue
    const queueRes = await fetch(`${BASE_URL}/api/queue`);
    const queueData = await queueRes.json();
    const inQueue = queueData.some((j) => j.jobId === createdJobId);
    test('Submitted Student Order Visible in Public Queue', inQueue);

    // 3.6 Secure Document Access: Unauthorized download blocked
    const unauthDoc = await fetch(`${BASE_URL}/api/student-orders/${createdJobId}/document`);
    test('Unauthorized PDF Document Download Blocked (returns 401)', unauthDoc.status === 401);

    // 3.7 Secure Document Access: Authenticated Shopkeeper Download Allowed
    const authDoc = await fetch(`${BASE_URL}/api/student-orders/${createdJobId}/document`, {
      headers: { cookie: cookieHeader },
    });
    test('Authenticated Shopkeeper PDF Download Allowed (returns 200)', authDoc.status === 200);
    const contentType = authDoc.headers.get('content-type');
    test('Download Returns PDF Content-Type', Boolean(contentType && contentType.includes('application/pdf')));

    // 3.8 Student Cannot Alter Status (Requires Shopkeeper Auth)
    const illegalStatus = await fetch(`${BASE_URL}/api/jobs/${createdJobId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Processing' }),
    });
    test('Unauthorized Status Alteration Blocked (returns 401)', illegalStatus.status === 401);

    // 3.9 Authenticated Shopkeeper Can Alter Status (Pending -> Processing -> Completed)
    const authMongoJob = await JobFindHelper(createdJobId);
    if (authMongoJob?._id) {
      const processRes = await fetch(`${BASE_URL}/api/jobs/${authMongoJob._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', cookie: cookieHeader },
        body: JSON.stringify({ status: 'Processing' }),
      });
      test('Shopkeeper Advances Order to Processing', processRes.status === 200);

      const completeRes = await fetch(`${BASE_URL}/api/jobs/${authMongoJob._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', cookie: cookieHeader },
        body: JSON.stringify({ status: 'Completed' }),
      });
      test('Shopkeeper Marks Order as Completed', completeRes.status === 200);
    }

  } catch (err) {
    console.error('Fatal Test Runner Exception:', err);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`  FINAL VERIFICATION: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  process.exit(failed > 0 ? 1 : 0);
};

const JobFindHelper = async (jobId) => {
  const track = await fetch(`${BASE_URL}/api/student-orders/track/${jobId}`);
  const data = await track.json();
  const queue = await fetch(`${BASE_URL}/api/queue`);
  const list = await queue.json();
  return list.find(j => j.jobId === jobId) || { _id: data._id || data.id };
};

runComprehensiveTests();
