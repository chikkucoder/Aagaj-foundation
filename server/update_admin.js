require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/AdminRegisterSchema');

async function update() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI not found in env configuration");
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASS;
  const fullName = 'Vivek Kumar';

  if (!email || !password) {
    console.error("❌ TEST_ADMIN_EMAIL or TEST_ADMIN_PASS is missing in .env configuration");
    process.exit(1);
  }

  let admin = await Admin.findOne({ email });

  if (admin) {
    console.log(`Found existing admin with email: ${email}. Updating password...`);
    admin.password = password; // The pre-save hook in AdminRegisterSchema will hash this automatically
    admin.fullName = fullName;
    await admin.save();
    console.log('✅ Admin password updated successfully.');
  } else {
    console.log(`No admin found with email: ${email}. Creating a new one...`);
    admin = new Admin({
      fullName,
      email,
      password // The pre-save hook in AdminRegisterSchema will hash this automatically
    });
    await admin.save();
    console.log('✅ Admin user created successfully.');
  }

  await mongoose.disconnect();
}

update().catch(console.error);
