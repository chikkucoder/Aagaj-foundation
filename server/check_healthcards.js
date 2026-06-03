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

  const HealthCard = mongoose.model('HealthCard', new mongoose.Schema({}, { strict: false }), 'healthcards');
  const cards = await HealthCard.find({}).sort({ createdAt: -1 });
  console.log('Total cards in DB:', cards.length);
  cards.forEach(c => {
    console.log(`HealthID: ${c.healthId}, Name: ${c.fullName}, photoPath: ${c.photoPath}, registeredBy: ${c.registeredBy}`);
  });

  await mongoose.disconnect();
}

check().catch(console.error);
