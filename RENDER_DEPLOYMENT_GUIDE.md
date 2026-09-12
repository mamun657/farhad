# Render Deployment Guide for Farhad Global Trade

This guide explains how to properly deploy the Farhad Global Trade website to Render with separated frontend and backend services.

## Architecture

The application consists of two separate Render services:

1. **Frontend** (Static Site)
   - URL: `https://farhad-global-trade.onrender.com`
   - Type: Render Static Site
   - Content: Built output from `dist/` directory

2. **Backend** (Node.js Web Service)
   - URL: `https://farhadglobaltrade.onrender.com`
   - Type: Render Web Service (Node.js)
   - Content: Express server with `/api/chat` endpoint

## Critical Environment Variables

### For the Backend Service (farhadglobaltrade.onrender.com)

Set these environment variables in the Render dashboard under **Settings → Environment**:

| Variable | Value | Description |
|----------|-------|-------------|
| `GROQ_API_KEY` | `gsk_...` | Your Groq API key from Groq Console |
| `GROQ_MODEL` | `openai/gpt-oss-20b` | The LLM model to use |
| `FRONTEND_URL` | `https://farhad-global-trade.onrender.com` | Frontend origin for CORS |
| `PORT` | `3000` | Server port (default) |
| `NODE_ENV` | `production` | Node environment |

**IMPORTANT: The backend does NOT include the frontend code. The static files are served separately.**

### For the Frontend (Build-time Variable)

The frontend needs `VITE_API_URL` during the build process. This is a Vite build-time variable.

**If the frontend is built locally or on GitHub:**
- Ensure `.env` has: `VITE_API_URL=https://farhadglobaltrade.onrender.com`
- Run: `npm run build`
- Deploy only the `dist/` folder to Render Static Site

**If using a build hook on Render for the static site:**
- Set `VITE_API_URL=https://farhadglobaltrade.onrender.com` in Render environment
- This requires the build command to use the environment variable

## Current Issue (Fixed)

### Problem
The chatbot was returning "The assistant returned an invalid response." because:

1. **Missing VITE_API_URL**: The frontend had no way to know the backend URL
2. **Wrong URL Construction**: Frontend would call `/api/chat` (same origin), which doesn't exist on the static frontend
3. **CORS Failure**: Requests would fail and return HTML instead of JSON

### Solution Applied
1. ✅ Added `VITE_API_URL=http://localhost:3000` to `.env` for local development
2. ✅ Updated `Chatbot.jsx` to properly construct the API URL:
   - Uses `VITE_API_URL` if available (set during build)
   - Falls back to window origin if not set
   - Validates URL exists before making requests
3. ✅ Verified CORS configuration in `server.js` includes production frontend URL
4. ✅ Ensured `dist/` folder is built with correct asset paths

## Deployment Steps

### Step 1: Configure Backend on Render

1. Go to https://dashboard.render.com/
2. Create a new **Web Service**
3. Connect your GitHub repository (if using GitHub)
4. Configure:
   - **Name**: `farhad-global-trade-backend` (or similar)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Choose based on your needs

5. Set Environment Variables (under **Settings → Environment**):
   ```
   GROQ_API_KEY=gsk_YOUR_KEY_HERE
   GROQ_MODEL=openai/gpt-oss-20b
   FRONTEND_URL=https://farhad-global-trade.onrender.com
   PORT=3000
   NODE_ENV=production
   ```

6. Deploy the service
7. Copy the service URL (e.g., `https://farhadglobaltrade.onrender.com`)

### Step 2: Build and Deploy Frontend

1. Locally or in your CI/CD:
   ```bash
   VITE_API_URL=https://farhadglobaltrade.onrender.com npm run build
   ```

2. In Render, create a new **Static Site**:
   - **Name**: `farhad-global-trade`
   - **Git Repository**: Select your repo
   - **Build Command**: 
     ```bash
     npm install && VITE_API_URL=https://farhadglobaltrade.onrender.com npm run build
     ```
   - **Publish Directory**: `dist`

3. Set environment variable (if needed):
   ```
   VITE_API_URL=https://farhadglobaltrade.onrender.com
   ```

4. Deploy the static site
5. Copy the URL (e.g., `https://farhad-global-trade.onrender.com`)

### Step 3: Update Backend FRONTEND_URL

Go back to the backend service and update:
- **FRONTEND_URL**: Set to the actual frontend URL from Step 2

## Verification Checklist

After deployment, verify:

- [ ] Frontend loads at `https://farhad-global-trade.onrender.com`
- [ ] Hero video displays correctly
- [ ] Hero poster appears immediately
- [ ] Chatbot button is visible and clickable
- [ ] Chatbot can be opened
- [ ] Test chatbot with: "What products do you import?"
- [ ] Chatbot returns a real answer (not "invalid response" error)
- [ ] All images load correctly
- [ ] Certificate section loads images
- [ ] Contact form is accessible
- [ ] No console errors related to API calls

### Testing the API Directly

```bash
# Check if backend is responding
curl -X GET https://farhadglobaltrade.onrender.com/api/health

# Expected response:
# {"ok":true,"service":"farhad-global-trade-api","groqConfigured":true}

# Test the chat endpoint
curl -X POST https://farhadglobaltrade.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What products do you import?","history":[]}'

# Expected response:
# {"success":true,"message":"...response from Groq..."}
```

## Troubleshooting

### Chatbot still shows "invalid response"

**Check:**
1. Is `VITE_API_URL` set during the frontend build?
   ```bash
   # Check the built JS file for the API URL
   grep -r "farhadglobaltrade" dist/assets/index-*.js
   ```

2. Is the backend service running?
   ```bash
   curl https://farhadglobaltrade.onrender.com/api/health
   ```

3. Is CORS configured correctly?
   - Check that `FRONTEND_URL` is set in backend environment
   - Verify the frontend URL matches exactly

4. Check browser console (F12):
   - Look for network errors
   - Check the /api/chat request response

### Hero video not showing

**Check:**
1. Video file exists in dist:
   ```bash
   ls -la dist/media/farhad-global-trade-hero.mp4
   ```

2. Poster SVG exists:
   ```bash
   ls -la dist/media/farhad-global-trade-poster.svg
   ```

3. Check browser console for 404 errors
4. Verify paths in HTML are correct (should be `/media/...`)

### Backend cold start delays

The free Render plan may put services to sleep. This is normal.
- The website loads independently (frontend is static)
- Only chatbot requests may wait for backend to wake
- This should not block page rendering

## Secret Security

**NEVER expose these to the frontend:**
- ❌ `GROQ_API_KEY`
- ❌ Any backend secrets

**These are safe for frontend:**
- ✅ `VITE_API_URL` (publicly visible in built JS)
- ✅ `VITE_API_BASE_URL` (any public API configuration)

## Additional Notes

- Video file size: ~22 MB (consider optimizing if performance becomes an issue)
- Video codec: H.264 (web-compatible)
- Video resolution: 1280x720
- The chatbot uses rate limiting (30 requests per minute per IP)
- Request timeout: 14 seconds (for Groq API calls)
