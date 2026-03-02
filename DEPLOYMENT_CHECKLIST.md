# Deployment Checklist for Render

## Before Deployment

### GitHub Setup
- [ ] Initialize git repository: `git init`
- [ ] Add all files: `git add .`
- [ ] Commit: `git commit -m "Initial commit"`
- [ ] Create GitHub repository
- [ ] Push code: `git push -u origin main`

### Database Setup
- [ ] Create MongoDB Atlas account
- [ ] Create free cluster
- [ ] Create database user (save username & password)
- [ ] Whitelist IP address (0.0.0.0/0)
- [ ] Copy MongoDB connection string
- [ ] Replace username and password in connection string

### Render Preparation
- [ ] Create Render account (sign up with GitHub)
- [ ] Have your repository URL ready
- [ ] Have MongoDB connection string ready
- [ ] Generate a strong JWT_SECRET (you can use: openssl rand -base64 32)

---

## Deployment Steps

### Step 1: Deploy Backend
- [ ] Go to render.com dashboard
- [ ] Click "New" → "Web Service"
- [ ] Select your GitHub repository
- [ ] Fill in:
  - Name: `smartinfra-backend`
  - Build Command: `cd server && npm install`
  - Start Command: `cd server && npm start`
- [ ] Add environment variables:
  - `NODE_ENV`: production
  - `PORT`: 4000
  - `MONGODB_URI`: your-mongodb-uri
  - `JWT_SECRET`: your-random-secret
- [ ] Deploy
- [ ] Save backend URL (shows after ~5 minutes)

### Step 2: Deploy Frontend
- [ ] Click "New" → "Static Site"
- [ ] Select your GitHub repository
- [ ] Fill in:
  - Name: `smartinfra-frontend`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`
- [ ] Add environment variables:
  - `VITE_API_URL`: your-backend-url
- [ ] Deploy
- [ ] Save frontend URL (shows after ~5 minutes)

### Step 3: Update Backend CORS
- [ ] Go back to backend service
- [ ] Click "Environment"
- [ ] Add/update `CORS_ORIGIN` variable with frontend URL
- [ ] Save (service will redeploy)

---

## Testing
- [ ] Open frontend URL in browser
- [ ] Test login functionality
- [ ] Check browser console for errors (F12)
- [ ] Try to create/view assets
- [ ] Verify all API calls are working

---

## Troubleshooting Commands

If you need to test locally first:
```bash
# Terminal 1: Start backend
cd server
npm install
npm start

# Terminal 2: Start frontend
npm install
npm run dev
```

Visit: http://localhost:5173

---

## Useful Links

- Render Dashboard: https://dashboard.render.com
- MongoDB Atlas: https://account.mongodb.com
- Project Repository: https://github.com/YOUR_USERNAME/smartinfra
