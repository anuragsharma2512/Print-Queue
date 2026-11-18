import http from 'http';

const BASE_URL = 'http://localhost:5000';

const request = (path, options = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let parsed = body;
        try {
          parsed = JSON.parse(body);
        } catch {}
        resolve({ status: res.statusCode, headers: res.headers, data: parsed });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('\n🧪 --- STARTING PRINTQUEUE AUTOMATED TEST SUITE ---\n');
  let passed = 0;
  let failed = 0;

  const assert = (name, condition, details = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details ? `(${details})` : ''}`);
      failed++;
    }
  };

  try {
    // 1. Health Check (Public)
    const health = await request('/api/health');
    assert('Health Check (/api/health)', health.status === 200 && health.data.status === 'ok');

    // 2. Authenticate as shopkeeper to get session cookie
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { pin: '1234' },
    });
    assert('Shopkeeper Authentication (/api/auth/login)', loginRes.status === 200);
    const authCookie = loginRes.headers['set-cookie'];
    const cookieHeader = Array.isArray(authCookie) ? authCookie[0] : authCookie;

    // 3. Get All Jobs (Protected with shopkeeper cookie)
    const allJobs = await request('/api/jobs', {
      headers: { cookie: cookieHeader },
    });
    assert('Fetch All Jobs (/api/jobs with auth cookie)', allJobs.status === 200 && Array.isArray(allJobs.data) && allJobs.data.length >= 20);

    // 4. Get Active Queue (Public)
    const activeQueue = await request('/api/queue');
    assert('Fetch Active Queue (/api/queue)', activeQueue.status === 200 && Array.isArray(activeQueue.data));
    const onlyActive = activeQueue.data.every((j) => j.status === 'Pending' || j.status === 'Processing');
    assert('Queue Contains Only Pending/Processing', onlyActive);

    // 5. Estimation API (Public)
    const estimate = await request('/api/predictions/estimate', {
      method: 'POST',
      body: { jobType: 'Colour Print' },
    });
    assert(
      'Waiting Time Prediction (/api/predictions/estimate)',
      estimate.status === 200 &&
      typeof estimate.data.estimatedWaitingTimeSeconds === 'number' &&
      typeof estimate.data.estimatedServiceTimeSeconds === 'number' &&
      Boolean(estimate.data.estimatedCompletionTime)
    );

    // 6. Job Creation (Protected)
    const newJob = await request('/api/jobs', {
      method: 'POST',
      headers: { cookie: cookieHeader },
      body: {
        jobType: 'B&W Print',
        pages: 14,
        submissionMethod: 'WhatsApp',
      },
    });
    assert('Create New Job (/api/jobs)', newJob.status === 201 && newJob.data.jobId && newJob.data.status === 'Pending');
    const createdJobId = newJob.data._id;

    // 7. Validation: Missing Fields
    const invalidJob = await request('/api/jobs', {
      method: 'POST',
      headers: { cookie: cookieHeader },
      body: { jobType: 'B&W Print' },
    });
    assert('Reject Job Missing Required Fields', invalidJob.status === 400);

    // 8. Validation: Invalid enum value
    const invalidType = await request('/api/jobs', {
      method: 'POST',
      headers: { cookie: cookieHeader },
      body: { jobType: '3D Laser Print', pages: 5, submissionMethod: 'Walk-in' },
    });
    assert('Reject Job With Invalid JobType Enum', invalidType.status === 400);

    // 9. Single Job Retrieval (Protected)
    const singleJob = await request(`/api/jobs/${createdJobId}`, {
      headers: { cookie: cookieHeader },
    });
    assert('Retrieve Job By ID (/api/jobs/:id)', singleJob.status === 200 && singleJob.data._id === createdJobId);

    // 10. Status Transition: Pending -> Processing (Protected)
    const startJob = await request(`/api/jobs/${createdJobId}/status`, {
      method: 'PATCH',
      headers: { cookie: cookieHeader },
      body: { status: 'Processing' },
    });
    assert(
      'Valid Transition: Pending -> Processing',
      startJob.status === 200 &&
      startJob.data.status === 'Processing' &&
      Boolean(startJob.data.serviceStartTime)
    );

    // 11. Status Transition Guard: Invalid Transition (Processing -> Pending)
    const invalidBackwards = await request(`/api/jobs/${createdJobId}/status`, {
      method: 'PATCH',
      headers: { cookie: cookieHeader },
      body: { status: 'Pending' },
    });
    assert('Reject Invalid Transition (Processing -> Pending)', invalidBackwards.status === 400);

    // 12. Status Transition: Processing -> Completed (Protected)
    const completeJob = await request(`/api/jobs/${createdJobId}/status`, {
      method: 'PATCH',
      headers: { cookie: cookieHeader },
      body: { status: 'Completed' },
    });
    assert(
      'Valid Transition: Processing -> Completed',
      completeJob.status === 200 &&
      completeJob.data.status === 'Completed' &&
      Boolean(completeJob.data.serviceEndTime) &&
      typeof completeJob.data.waitingTimeSeconds === 'number'
    );

    // 13. Status Transition Guard: Invalid Transition from Completed
    const invalidCompleted = await request(`/api/jobs/${createdJobId}/status`, {
      method: 'PATCH',
      headers: { cookie: cookieHeader },
      body: { status: 'Processing' },
    });
    assert('Reject Illegal Transition From Completed State', invalidCompleted.status === 400);

    // 14. Verify Completed Job Left Active Queue
    const updatedQueue = await request('/api/queue');
    const isExcluded = !updatedQueue.data.some((j) => j._id === createdJobId);
    assert('Completed Job Excluded From Active Queue', isExcluded);

  } catch (err) {
    console.error('Fatal Test Exception:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`  SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log(`========================================\n`);

  process.exit(failed > 0 ? 1 : 0);
};

runTests();
