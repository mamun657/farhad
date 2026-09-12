# 🚀 PRODUCTION DEPLOYMENT - CRITICAL FIX REQUIRED

## ⚠️ URGENT STATUS

Your Render deployment is failing because:
1. ✅ Build script fixed locally and pushed to GitHub
2. ❌ **Render dashboard buildCommand NOT updated yet** (still using old command)
3. ❌ **GROQ_API_KEY NOT set in Render environment** (chatbot can't work)

---

## 🔧 STEP 1: Fix Render Build Command in Dashboard

**Render is NOT reading render.yaml buildCommand.** You must update it in the dashboard.

### Action Required:

1. **Open Render Dashboard**
   - Go to: https://dashboard.render.com

2. **Select Your Service**
   - Click on: `farhad-global-trade`

3. **Go to Settings**
   - Scroll to: "Settings" (in the left menu or near top)
   - Look for: "Build Command"

4. **Update Build Command**
   - **FIND:** Current value (probably: `npm install && npm run build`)
   - **REPLACE WITH:** `npm run build-production`
   - **CLICK:** Save

5. **Trigger Redeploy**
   - Click: "Manual Deploy" button
   - Wait for build to complete (should succeed this time)

### Expected Build Log Output:
```
===> Running build command 'npm run build-production'...
npm install --include=dev
npm notice it worked if it ends with ok
npm info added 324 packages

> farhad-global-trade@1.0.0 build
> vite build

vite v5.4.21 building for production...
✓ 35 modules transformed.
✓ built in 2.39s

===> Build succeeded! 🎉
```

---

## 🔑 STEP 2: Set GROQ_API_KEY in Render Environment

**Without this, the chatbot will always return "The assistant returned an invalid response."**

### Action Required:

1. **Render Service Dashboard**
   - Select: `farhad-global-trade` service
   - Go to: "Settings" → "Environment"

2. **Add Environment Variables**
   
   Check that these are set:
   
   | Key | Value | Required |
   |-----|-------|----------|
   | `NODE_ENV` | `production` | ✅ Yes |
   | `PORT` | `3000` | ✅ Yes |
   | `GROQ_API_KEY` | `gsk_YOUR_API_KEY_HERE` | ✅ **YES - CRITICAL** |
   | `GROQ_MODEL` | `openai/gpt-oss-20b` | ✅ Yes |
   | `FRONTEND_URL` | `https://farhad-global-trade.onrender.com` | ✅ Yes |
   | `VITE_API_URL` | (leave blank or omit) | ❌ No |

3. **Get Your GROQ_API_KEY**
   - Go to: https://console.groq.com/keys
   - Copy your API key (starts with `gsk_`)
   - ⚠️ **DO NOT share this key publicly**

4. **Set GROQ_API_KEY**
   - Key: `GROQ_API_KEY`
   - Value: `gsk_YOUR_KEY_HERE` (paste your actual key)
   - Click: Save

5. **Redeploy**
   - Click: "Manual Deploy"
   - Wait for deployment to complete

---

## ✅ STEP 3: Verify Everything Works

### Check 1: Website Loads
```
https://farhad-global-trade.onrender.com
```
Should show:
- ✅ Hero video displays
- ✅ Page content loads
- ✅ No 500 errors
- ✅ Chatbot button visible (bottom right)

### Check 2: Backend Health
```bash
curl https://farhadglobaltrade.onrender.com/api/health
```

Expected response:
```json
{
  "ok": true,
  "service": "farhad-global-trade-api",
  "groqConfigured": true,
  "environment": "production"
}
```

Key: **`"groqConfigured": true`** means GROQ_API_KEY is set ✅

### Check 3: Test Chatbot
1. Open: https://farhad-global-trade.onrender.com
2. Click chatbot button (bottom right)
3. Ask: **"Do you supply cattle feed?"**
4. Expected: Real answer about Farhad's cattle feed products

❌ **If you see:** "The assistant returned an invalid response."
- GROQ_API_KEY is not set or is invalid
- Go back to Step 2 and verify it's correctly set

### Check 4: Test Another Question
Try asking:
- "What products do you import?"
- "How can I contact you?"
- "What is your address?"

Should get real business answers (not errors).

---

## 📋 TROUBLESHOOTING

### Issue: "vite: not found" error still appears in Render logs

**Solution:**
1. Verify you changed buildCommand to: `npm run build-production`
2. Click "Manual Deploy" again
3. Wait for new build to start (may take 30-60 seconds)

If still failing:
- Check Render logs carefully
- Look for error: "npm ERR!" messages
- Contact Render support

---

### Issue: Chatbot shows "The assistant returned an invalid response"

**Solutions in order:**

1. **Verify GROQ_API_KEY is set:**
   ```bash
   curl https://farhadglobaltrade.onrender.com/api/health
   ```
   Check if `"groqConfigured": true`

2. **If false, GROQ_API_KEY is not set:**
   - Go to Render Settings → Environment
   - Add: `GROQ_API_KEY` with your actual key
   - Redeploy

3. **If key is set but chatbot still fails:**
   - Wait 30 seconds (cold start on free Render)
   - Try again
   - Check Render logs for errors

4. **Verify key is valid:**
   - Go to https://console.groq.com/keys
   - Make sure key hasn't expired
   - Check you have credits/quota

---

### Issue: Website won't load / 502 error

**Solutions:**
1. Wait 60 seconds (Render free tier cold start)
2. Check Render logs for startup errors
3. Verify all environment variables are set
4. Try "Manual Deploy" again

---

## 📞 If Problems Persist

### Check Render Logs
1. Render Dashboard → Your Service → Logs
2. Look for errors like:
   - `EADDRINUSE` (port already in use)
   - `Cannot find module` (missing dependency)
   - `GROQ_API_KEY` error (API key not set)

### Common Issues & Fixes

**"vite: not found"**
- Make sure buildCommand is: `npm run build-production`
- Trigger manual redeploy

**"The assistant returned an invalid response"**
- GROQ_API_KEY not set
- Go to Render Settings → Environment
- Add GROQ_API_KEY with your actual key from console.groq.com

**502 Bad Gateway**
- Backend didn't start properly
- Check Render logs
- Verify all environment variables are set
- Manually redeploy

**Videos/images not loading**
- Website loaded successfully (this is a content issue)
- Check Network tab in browser DevTools (F12)
- Verify paths are correct in dist/

---

## 📝 Summary - What To Do Now

1. ✅ **Code is fixed** - Build script committed and pushed
2. ⚠️ **Update Render Dashboard:**
   - [ ] Change buildCommand to: `npm run build-production`
   - [ ] Click Manual Deploy
   - [ ] Wait for build to succeed

3. ⚠️ **Set GROQ_API_KEY:**
   - [ ] Get key from https://console.groq.com/keys
   - [ ] Add to Render Environment Variables
   - [ ] Manual Deploy

4. ✅ **Verify:**
   - [ ] Website loads at https://farhad-global-trade.onrender.com
   - [ ] `/api/health` shows `"groqConfigured": true`
   - [ ] Chatbot asks and answers real questions
   - [ ] No "invalid response" errors

---

## 🎉 After This Is Fixed

You will have:
- ✅ Working production build on Render
- ✅ Chatbot with real AI responses
- ✅ Full website functionality
- ✅ No console errors
- ✅ Professional deployment

---

**This is production-level. Every step matters. Verify each one!**

If you need help with any step, refer to the troubleshooting section or check Render's documentation at https://render.com/docs
