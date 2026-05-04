# Deployment Guide

Follow these steps to deploy your NutriScan project.

## 1. Backend Deployment (Render)

1.  **Repository**: Push your code to a GitHub repository.
2.  **Render Dashboard**:
    *   Create a new **Web Service**.
    *   Connect your repository.
    *   **Name**: `nutriscan-backend`
    *   **Root Directory**: `backend`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
3.  **Environment Variables**:
    *   `MONGO_URI`: Your MongoDB Atlas connection string.
    *   `JWT_SECRET`: A long random string for token security.
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.
    *   `PORT`: `10000` (Render's default).

## 2. Frontend Deployment (Vercel)

1.  **Vercel Dashboard**:
    *   Import your repository.
    *   **Framework Preset**: `Vite`
    *   **Root Directory**: `frontend`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
2.  **Environment Variables**:
    *   `VITE_API_URL`: Your Render backend URL (e.g., `https://nutriscan-backend.onrender.com/api`).
        *   **Important**: Make sure to include the `/api` suffix!

## 3. Database (MongoDB Atlas)

1.  Ensure your MongoDB Atlas network access allows `0.0.0.0/0` (for Render servers) or use Render's static outbound IPs (if on a paid plan).
2.  Get the connection string and use it for the `MONGO_URI` environment variable on Render.

## Summary of Changes Made for Deployment
- Updated `backend/server.js` CORS to dynamically allow `.vercel.app` domains.
- Created `frontend/vercel.json` to handle client-side routing.
- Created `render.yaml` for easier backend setup on Render.
