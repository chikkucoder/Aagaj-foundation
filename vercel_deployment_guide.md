# Vercel Production Deployment Guide

This guide describes how to deploy the **Agaz Foundation** MERN application (React Vite Frontend + Express Node.js Backend) on Vercel.

---

## 📁 Repository Structure

```text
├── client/          # React Vite Frontend
└── server/          # Express Node.js Backend
```

Since the frontend and backend reside in separate directories, the most stable, standard, and high-performance way to deploy them is as **two separate Vercel projects**.

---

## 🚀 Step 1: Deploy Backend (Express Server)

The backend is built as serverless functions. All configurations are pre-defined in `server/vercel.json` and `server/package.json`.

1. Go to your **Vercel Dashboard** and click **Add New** > **Project**.
2. Select your git repository.
3. In the project setup page, change the **Root Directory** to `server`.
4. Click **Environment Variables** and add the following keys from your `.env` configuration:

| Environment Variable | Value/Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key used for signing JWT tokens |
| `FRONTEND_URL` | The URL of your deployed frontend (e.g., `https://agaz-foundation.vercel.app`) |
| `RAZORPAY_KEY_ID` | Your Razorpay API Key ID |
| `RAZORPAY_KEY_SECRET` | Your Razorpay API Secret Key |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API Secret |
| `EMAIL_USER` | Your nodemailer sender Gmail address |
| `EMAIL_PASS` | Your Gmail App Password (not your account password) |
| `TEST_HOSPITAL_EMAIL` | (Optional) Test hospital user email |
| `TEST_HOSPITAL_PASS` | (Optional) Test hospital password |
| `PRODUCTION_FALLBACK_URL` | `https://aagajfoundation.com` (Used to load historical uploaded images from old server) |

5. Click **Deploy**. Vercel will build your serverless functions and output a backend URL (e.g., `https://agaz-backend.vercel.app`). Note this URL!

---

## 💻 Step 2: Deploy Frontend (React Vite Client)

The client is a Vite application. The rewrite configurations for Single Page App (SPA) routing are pre-defined in `client/vercel.json`.

1. In your **Vercel Dashboard**, click **Add New** > **Project**.
2. Select your git repository.
3. In the project setup page, change the **Root Directory** to `client`.
4. In the **Build and Development Settings**, verify the settings:
   - **Framework Preset**: `Vite` (Vercel auto-detects this)
   - **Build Command**: `npm run build` or `vite build`
   - **Output Directory**: `dist`
5. Click **Environment Variables** and add the following:

| Environment Variable | Value/Description |
| :--- | :--- |
| `VITE_API_URL` | The production URL of your backend deployed in Step 1 (e.g., `https://agaz-backend.vercel.app`) |

6. Click **Deploy**. Vercel will build and deploy your React app.

---

## ⚡ Step 3: Link Client & Server (CORS Setup)

For secure cookieless/cross-origin requests:
1. Go to your **Backend Project** settings on Vercel.
2. Under **Environment Variables**, update `FRONTEND_URL` to point to the production domain URL of the client project deployed in Step 2.
3. Redeploy your backend project on Vercel to apply the updated environment variable.

---

## 🛠️ Verification & Troubleshooting

- **Check health check**: Go to `https://<your-backend-url>/api/donation/health` and verify you see `{"status":"healthy","message":"Backend is running perfectly"}`.
- **Image Uploads**: Uploading images from any form automatically uploads them directly to Cloudinary. Verify Cloudinary dashboard to see folders being created under `agaz`.
- **Form PDF Generation**: Submitting applications generates PDFs on-the-fly and streams them to the browser dynamically via `/api/application/pdf/<applicant_id>`, completely bypassing local disk writes.
