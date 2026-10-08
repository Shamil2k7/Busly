# 🚀 Busly - Vercel Deployment Guide

This guide explains how to deploy **Busly** to **Vercel** with zero friction.

---

## 🏗️ Architecture Overview

- **Frontend (`/frontend`)**: Next.js 14 (App Router) — **Deploy on Vercel**
- **Backend (`/backend`)**: Express.js + Prisma ORM + Socket.IO (WebSockets) — **Deploy on Render / Railway / Fly.io / VPS** (persistent server needed for live WebSocket telemetry)

---

## ⚡ Option 1: Quick Deployment on Vercel (Recommended)

### Step 1: Import Repository to Vercel
1. Log in to [vercel.com](https://vercel.com) and click **"Add New" ➔ "Project"**.
2. Select your GitHub repository: `https://github.com/Shamil2k7/Busly.git`.

### Step 2: Configure Project Settings
- **Framework Preset**: `Next.js`
- **Root Directory**:
  - Click **Edit** next to **Root Directory** and select `frontend` (or leave as root `/` — root `vercel.json` will automatically build the frontend).
- **Build Command**: `next build` (default)
- **Output Directory**: `.next` (default)

### Step 3: Add Environment Variables in Vercel
In the Vercel dashboard under **Environment Variables**, add:

| Variable Name | Example Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://your-busly-backend.onrender.com` | URL of your deployed Express backend |
| `NEXT_PUBLIC_SOCKET_URL` | `https://your-busly-backend.onrender.com` | URL of your deployed Socket.IO server |
| `BACKEND_URL` | `https://your-busly-backend.onrender.com` | Optional proxy URL for Next.js rewrites |

> [!NOTE]
> If testing locally or before your backend is deployed, Vercel will build cleanly with default fallbacks.

### Step 4: Click Deploy
Click **Deploy**. Your Busly SaaS frontend will be live on `https://busly-xxxx.vercel.app`!

---

## 🌐 Automatic CORS for Vercel Deployments

The backend has already been configured with **dynamic CORS support**:
- Automatically authorizes `http://localhost:3000`
- Automatically authorizes your custom domain or `FRONTEND_URL`
- Automatically authorizes **any preview or production Vercel domain** (`*.vercel.app`)

You do not need to manually edit CORS rules every time Vercel generates a new preview deployment branch.

---

## 🔌 Deploying the Backend (Render / Railway)

Because Busly utilizes **Socket.IO** for real-time bus tracking and live telemetry, the backend needs a persistent Node.js environment:

### On Render (render.com):
1. Create a **New Web Service** pointing to this repo.
2. Set **Root Directory**: `backend`
3. Set **Build Command**: `npm install && npm run prisma:generate`
4. Set **Start Command**: `npm start`
5. Add Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string (e.g. Neon PostgreSQL)
   - `JWT_SECRET`: Random secure string
   - `OTP_SECRET`: Random secure string
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g. `https://your-busly.vercel.app`)
   - `NODE_ENV`: `production`

---

## 📁 Files Configured for Vercel in this Repository

1. **`frontend/vercel.json`**: Security headers, clean URLs, and Next.js optimization.
2. **`vercel.json` (root)**: Monorepo configuration directing Vercel to install and build `/frontend` when imported from the repository root.
3. **`package.json` (root)**: Build scripts delegating to `frontend`.
4. **`frontend/next.config.js`**: Security headers, environment variable bindings, and proxy rewrites.
5. **`backend/src/app.js` & `backend/src/server.js`**: Dynamic CORS support for all `*.vercel.app` origins.
6. **`frontend/.env.example`**: Complete template for Vercel environment variables.
