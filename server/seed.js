import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from './models/Job.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const parseDate = (str) => {
  if (!str) return null;
  // Format in data.csv is "17-11-2026 08:31"
  const [datePart, timePart] = str.split(' ');
  const [day, month, year] = datePart.split('-');
  return new Date(`${year}-${month}-${day}T${timePart}:00.000Z`);
};

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/printqueue';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for seeding');

    const csvPath = path.resolve(__dirname, '../data.csv');
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.trim().split('\n').slice(1); // skip header

    const jobs = lines.map((line) => {
      const parts = line.split(',');
      const [
        jobId,
        arrivalTime,
        serviceStartTime,
        serviceEndTime,
        jobType,
        pages,
        submissionMethod,
        queueAhead,
        waitingTimeSeconds,
        serviceTimeSeconds,
      ] = parts;

      return {
        jobId: jobId.trim(),
        arrivalTime: parseDate(arrivalTime.trim()),
        serviceStartTime: parseDate(serviceStartTime.trim()),
        serviceEndTime: parseDate(serviceEndTime.trim()),
        jobType: jobType.trim(),
        pages: Number(pages.trim()),
        submissionMethod: submissionMethod.trim(),
        waitingTimeSeconds: Number(waitingTimeSeconds.trim()),
        serviceTimeSeconds: Number(serviceTimeSeconds.trim()),
        status: 'Completed',
      };
    });

    // Make the last 2 jobs Pending/Processing to simulate a live active queue for demo purposes
    if (jobs.length >= 3) {
      jobs[jobs.length - 1].status = 'Pending';
      jobs[jobs.length - 1].serviceStartTime = null;
      jobs[jobs.length - 1].serviceEndTime = null;
      jobs[jobs.length - 1].waitingTimeSeconds = null;
      jobs[jobs.length - 1].serviceTimeSeconds = null;

      jobs[jobs.length - 2].status = 'Processing';
      jobs[jobs.length - 2].serviceEndTime = null;
      jobs[jobs.length - 2].serviceTimeSeconds = null;
    }

    await Job.deleteMany({});
    console.log('🧹 Cleared existing jobs');

    await Job.insertMany(jobs);
    console.log(`🎉 Successfully seeded ${jobs.length} jobs from data.csv!`);

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
