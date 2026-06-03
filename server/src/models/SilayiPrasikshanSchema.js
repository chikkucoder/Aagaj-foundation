const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  
  // --- YE HAI SABSE IMPORTANT FIELD (Jo scheme ko identify karegi) ---
  yojanaName: {
    type: String,
    default: 'Mahila Silai Prasikshan Yojana', // ✅ Default set kar diya
    trim: true
  },

  // --- Baaki Form Fields (HTML ke hisaab se) ---

  // 1. क्रमांक संख्या
  serialNumber: {
    type: String,
    trim: true
  },

  // 2. नाम
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },

  // 3. पिता / पति का नाम
  guardianName: {
    type: String,
    required: true,
    trim: true
  },

  // 4. पता
  address: {
    type: String,
    required: true
  },

  // 5. मोबाइल नं
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },

  // 6. लिंग
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Female' // Kyunki zyadatar schemes mahilaon ke liye hain
  },

  // 7. Email ID
  email: {
    type: String,
    lowercase: true,
    trim: true
  },

  // 8. आधार कार्ड नं
  aadharNumber: {
    type: String,
    required: true,
    unique: true, // Duplicate entry rokne ke liye
    trim: true
  },

  // 9. उम्र
  age: {
    type: Number,
    min: 10,
    max: 100
  },

  // 10. जाति
  caste: {
    type: String,
    trim: true
  },

  // 11. प्रशिक्षण का नाम
  trainingName: {
    type: String,
    default: "" 
  },

  // 12. मौजूदा कौशल
  existingSkills: {
    type: String,
    default: "None"
  },

  // 13. प्रशिक्षण अवधि
  trainingDuration: {
    type: String,
    default: "N/A"
  },

  // 14. प्रशिक्षण की तारीख
  trainingDate: {
    type: String, // ✅ Changed to String to accept any format from form
    default: ""
  },

  // 15. फोटो (Path/URL store hoga)
  photoUrl: {
    type: String,
    default: ""
  },

  // Extra: Payment Status track karne ke liye
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending'
  },
  
  registrationFee: {
    type: Number,
    default: 799
  },

  // ✅ Payment ID from Getepay
  paymentId: {
    type: String,
    default: ""
  },

  // ✅ Order ID for tracking payment
  orderId: {
    type: String,
    default: ""
  },

  // ✅ New Field: To track which employee registered this beneficiary
  registeredBy: {
    type: String,
    default: 'Admin/Self' 
  }

}, { timestamps: true });

module.exports = mongoose.model('MahilaSilayi', RegistrationSchema);