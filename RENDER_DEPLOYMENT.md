# SmartInfra Render Deployment Guide

## Step-by-Step Deployment Instructions

### Step 1: Prepare Your GitHub Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub**:
   - Create a new repository on GitHub (don't initialize with README, .gitignore, etc.)
   - Run these commands:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/smartinfra.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Create MongoDB Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and sign in
3. Create a new project
4. Click "Create a Cluster" → Choose "FREE" tier
5. Wait for cluster to be created
6. Go to "Database Access" → Add a new user (save credentials)
7. Go to "Network Access" → Add IP Address → Allow access from anywhere (0.0.0.0/0)
8. Go to "Datasets" → Click your cluster → Click "Connect"
9. Choose "Drivers" → Select "Node.js" → Copy the connection string
10. Replace `<password>` and `<username>` with your database user credentials

**Save this URI** - you'll need it for Render!

---

### Step 3: Deploy to Render

#### Option A: Deploy Backend (Node.js Server)

1. Go to [render.com](https://render.com)
2. Sign up with GitHub account
3. Click **"New"** → **"Web Service"**
4. Connect your GitHub repository
5. Fill in the details:
   - **Name**: `smartinfra-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Instance Type**: Free (for now)

6. Click **"Advanced"** and add Environment Variables:
   ```
   NODE_ENV = production
   PORT = 4000
   MONGODB_URI = your-mongodb-connection-string
   JWT_SECRET = your-secret-key-here
   CORS_ORIGIN = https://your-frontend-url.onrender.com (add this after frontend is deployed)
   ```

7. Click **"Create Web Service"**
8. Wait for deployment (3-5 minutes)
9. **Save the URL** you see (looks like `https://smartinfra-backend.onrender.com`)

---

#### Option B: Deploy Frontend (React App)

1. Go back to Render dashboard
2. Click **"New"** → **"Static Site"**
3. Connect your GitHub repository
4. Fill in the details:
   - **Name**: `smartinfra-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

5. Click **"Advanced"** and add Environment Variables:
   ```
   VITE_API_URL = https://smartinfra-backend.onrender.com
   ```

6. Click **"Create Static Site"**
7. Wait for deployment (3-5 minutes)
8. **Save the URL** you see (looks like `https://smartinfra-frontend.onrender.com`)

---

### Step 4: Update Backend CORS Settings

1. Go back to your backend service on Render
2. Click **"Environment"** (in the left sidebar)
3. Edit `CORS_ORIGIN` and set it to: `https://smartinfra-frontend.onrender.com`
4. Click **"Save Changes"** - service will redeploy

---

### Step 5: Verify Deployment

1. Open your frontend URL in a browser
2. Test the login/registration functionality
3. Check console for any API errors (F12 → Console tab)

---

## Common Issues & Solutions

### ❌ "Cannot connect to MongoDB"
- Check MongoDB connection string has correct username and password
- Verify IP address is whitelisted in MongoDB Atlas (0.0.0.0/0)
- Connection string format should be: `mongodb+srv://username:password@cluster.mongodb.net/smartinfra`

### ❌ "CORS errors"
- Make sure `CORS_ORIGIN` in backend matches your frontend URL exactly
- Clear browser cache (Ctrl+Shift+Delete)
- Both services must be fully deployed before testing

### ❌ "Static site not loading"
- Check that `Build Command` is: `npm install && npm run build`
- Ensure `Publish Directory` is: `dist`
- Verify `VITE_API_URL` is set correctly

### ❌ "500 Internal Server Error"
- Check backend logs in Render dashboard
- Verify all environment variables are set
- Check MongoDB connection

---

## Environment Variables Checklist

**Backend (.env in server/ folder):**
- ✅ MONGODB_URI
- ✅ JWT_SECRET (create a strong random string)
- ✅ NODE_ENV = "production"
- ✅ CORS_ORIGIN = your frontend URL

**Frontend (.env in root folder):**
- ✅ VITE_API_URL = your backend URL

---

## Optional: Upgrade Plan

If you need more power:
- Free tier apps spin down after 15 minutes of inactivity
- Upgrade to **Pro** ($7/month) or **Pay-as-you-go** for production apps

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Create MongoDB Atlas cluster
3. ✅ Deploy backend service
4. ✅ Deploy frontend service
5. ✅ Set environment variables
6. ✅ Test your application

**You're done! 🎉**

For support, visit [Render Docs](https://render.com/docs)
