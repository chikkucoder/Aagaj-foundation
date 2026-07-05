# Aagaj Foundation Web Portal.

A production-grade, full-stack digital web portal built for **Aagaj Foundation**, a registered non-profit trust dedicated to empowering women, providing healthcare accessibility, and creating self-employment opportunities across communities.

---

## 🚀 Key Features

### 1. Swasthya Suraksha Network & Booking
* **Beneficiary Verification**: Automatic verification of custom Health IDs (`MC-XXXXXX`).
* **Doctor Booking**: Interactive form supporting clinic partners selection, specialization department routing, attachments, and symptoms logs.
* **Appointment Types**: Selection between **Physical Visit** and **Teleconsultation**.
* **SMS & WhatsApp Alerts**: Automated notifications using Twilio API on successful bookings.
* **Receipt Generation**: Premium print-friendly success receipt overlay with full booking details.

### 2. Health ID Card Generator & Downloader
* **Dynamic Generation**: Computes cardholder details, barcode mapping, issue date, and validation periods.
* **PNG Exporters**: Custom high-resolution front-and-back image downloading using `html2canvas`.

### 3. Career & Job Applications Portal
* **Multiple Job Roles**: Supports NGO Coordinator roles (Panchayat, Block, District) and General Staff applications.
* **Razorpay Payment Gateway**: Seamless integration for handling registration fees with webhook verification logs.

### 4. Admin & Partner Management Consoles
* **Super Admin Dashboard**: Full control over partners status, global transactions logs, audit files, carousel managers, and billing statistics.
* **Hospital Dashboard**: Manage check-ins, treatment records, and patient billing entries.
* **Employee Dashboard**: Manage beneficiaries, registration forms, and health card applications.

---

## 🛠 Tech Stack

* **Frontend**: React (Vite), React Router, React Hook Form, Tailwind CSS, Lucide Icons, HTML2Canvas.
* **Backend**: Node.js, Express, Multer (Memory buffers for database file storage).
* **Database**: MongoDB Atlas via Mongoose ODM.
* **Integrations**: Razorpay (Payments), Twilio (SMS/WhatsApp), Cloudinary (Media assets).

---

## 📁 Repository Structure

```text
Aagaz-Conversion/
├── client/                 # React Frontend Application (Vite)
│   ├── public/             # Static Assets (Logos, Icons, Backgrounds)
│   ├── src/
│   │   ├── api/            # API Service Layer (Axios client)
│   │   ├── components/     # Reusable layout UI components (Navbar, Footer, Sidebars)
│   │   ├── pages/          # Page Views (Dashboards, Booking Form, Careers, Schemes)
│   │   └── App.jsx         # Routing Configuration
│   └── package.json
│
├── server/                 # Express Backend Server (REST API)
│   ├── src/
│   │   ├── config/         # DB Connection & Server settings
│   │   ├── middleware/     # Joi Request Validation & JWT Auth Guards
│   │   ├── models/         # MongoDB Mongoose Schemas (Appointments, HealthCards, Payments)
│   │   ├── routes/         # Express API Routers
│   │   ├── services/       # Twilio and Third-Party integration wrappers
│   │   ├── utils/          # Validation Schemas and helper functions
│   │   └── app.js          # App entry and middleware bindings
│   └── package.json
└── README.md
```

---

## ⚙️ Environment Configurations

### Server Environment Setup (`server/.env`)
Create a `.env` file inside the `server/` directory and configure the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_token

# Razorpay credentials
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email setup for alerts
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password

# Twilio setup for SMS/WhatsApp notifications
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_sms_number
TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number

# Cloudinary configurations
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Client Environment Setup (`client/.env`)
Create a `.env` file inside the `client/` directory:
```env
VITE_API_URL=http://localhost:5000
```

---

## 💻 Local Installation & Run Guide

### Prerequisites
* Node.js (v18+ recommended)
* MongoDB database instance (Local or Atlas)

### Step 1: Run the Backend Server
```bash
# Navigate to the server folder
cd server

# Install dependencies
npm install

# Start in development mode
npm run dev
```

### Step 2: Run the Frontend Client
```bash
# Open a new terminal and navigate to the client folder
cd client

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 📦 Production Builds

To compile the React bundle for production hosting:
```bash
cd client
npm run build
```
The optimized production bundle will be generated under the `client/dist` directory.
