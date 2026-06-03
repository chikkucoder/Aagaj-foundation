require('dotenv').config();
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

async function check() {
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI not found in env configuration");
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const { Applicant } = require('./src/models/ApplicationSchema');
  const apps = await Applicant.find({}).limit(5);
  console.log('Applicants count:', apps.length);
  apps.forEach(a => {
    console.log(`ID: ${a.uniqueId}, Name: ${a.fullName}, photoPath: ${a.photoPath}, job_category: ${a.job_category}`);
  });

  await mongoose.disconnect();
}

check().catch(console.error);
