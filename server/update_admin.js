require('dotenv').config();
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

async function update() {
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI not found in env configuration");
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const Admin = mongoose.model('Admin', new mongoose.Schema({}, { strict: false }), 'admins');
  const result = await Admin.updateOne(
    { email: 'vivekkumargy97@gmail.com' },
    { $set: { fullName: 'Vivek Kumar' } }
  );
  console.log('Update result:', result);

  await mongoose.disconnect();
}

update().catch(console.error);
