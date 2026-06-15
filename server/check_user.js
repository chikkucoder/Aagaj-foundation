require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const Employee = require('./src/models/AddNewEmployeeSchema');
  const { Applicant, NormalApplicant } = require('./src/models/ApplicationSchema');

  const email = 'trueenamelpvtltd@gmail.com';
  const emailRegex = new RegExp(`^${email}$`, 'i');

  const emp = await Employee.findOne({ email: emailRegex });
  console.log("Employee collection match:", emp);

  const app = await Applicant.findOne({ $or: [{ email: emailRegex }, { emp_username: emailRegex }] });
  console.log("Applicant (NGO) collection match:", app);

  const norm = await NormalApplicant.findOne({ $or: [{ email: emailRegex }, { emp_username: emailRegex }] });
  console.log("NormalApplicant collection match:", norm);

  await mongoose.disconnect();
}
test().catch(console.error);
