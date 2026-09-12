# Render Configuration Verification Checklist

Use this checklist to verify your Render service is properly configured for production.

## Backend Service Configuration

### Environment Variables (Settings → Environment)

Check that these are set:

- [ ] `GROQ_API_KEY` 
  - Value starts with `gsk_`
  - Not empty or placeholder
  - From https://console.groq.com/keys

- [ ] `GROQ_MODEL`
  - Value: `openai/gpt-oss-20b`
  - (Or another valid Groq model)

- [ ] `FRONTEND_URL`
  - Value: `https://farhad-global-trade.onrender.com`
  - (Or your actual frontend URL)
  - No trailing slash

- [ ] `NODE_ENV`
  - Value: `production`

- [ ] `PORT`
  - Value: `3000`
  - (Or your configured port)

### Build & Deploy Configuration

- [ ] Build Command
  - For monolithic: `npm install && npm run build`
  - For backend-only: `npm install`

- [ ] Start Command
  - For monolithic: `npm start`
  - For backend-only: `npm start`

- [ ] Runtime: Node
- [ ] Latest Node version selected
- [ ] Auto-deploy from GitHub: ✓

### Service Health

- [ ] Service is deployed (green status)
- [ ] No deployment errors in logs
- [ ] Service wakes up without errors

## Frontend Configuration (If Separate Static Site)

### Build Settings

- [ ] Build Command
  ```
  npm install && VITE_API_URL=https://farhadglobaltrade.onrender.com npm run build
  ```
  (Replace URL with your actual backend URL)

- [ ] Publish Directory: `dist`

### Environment Variables

- [ ] `VITE_API_URL` set to backend URL
  - Example: `https://farhadglobaltrade.onrender.com`

### Deployment Status

- [ ] Site is deployed (green status)
- [ ] No build errors in logs
- [ ] Site is accessible

## Production URL Verification

### Test Backend Health

```bash
curl -X GET "https://farhadglobaltrade.onrender.com/api/health"
```

Should return:
```json
{
  "ok": true,
  "service": "farhad-global-trade-api",
  "groqConfigured": true,
  "environment": "production"
}
```

- [ ] Returns 200 OK
- [ ] `groqConfigured` is `true`

### Test CORS (Optional)

```bash
curl -X OPTIONS "https://farhadglobaltrade.onrender.com/api/chat" \
  -H "Origin: https://farhad-global-trade.onrender.com" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Should see headers:
```
Access-Control-Allow-Origin: https://farhad-global-trade.onrender.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

- [ ] Receives proper CORS headers
- [ ] Origin matches frontend URL

### Test Chat API

```bash
curl -X POST "https://farhadglobaltrade.onrender.com/api/chat" \
  -H "Content-Type: application/json" \
  -H "Origin: https://farhad-global-trade.onrender.com" \
  -d '{
    "message": "What products do you import?",
    "history": []
  }'
```

Should return:
```json
{
  "success": true,
  "message": "Farhad Global Trade imports a wide range of products..."
}
```

- [ ] Returns 200 OK
- [ ] `success` is `true`
- [ ] `message` contains real content (not empty)

## Frontend Website Verification

### Load Website

Open: https://farhad-global-trade.onrender.com

Check:
- [ ] Page loads without errors
- [ ] Hero video displays
- [ ] Poster image appears immediately
- [ ] Video plays automatically or on interaction
- [ ] All images load (products, certificates, etc.)
- [ ] Navigation works
- [ ] Footer displays

### Test Chatbot

1. [ ] Chatbot button is visible (bottom right)
2. [ ] Chatbot opens when clicked
3. [ ] Close button works (X button)
4. [ ] Welcome message displays
5. [ ] Quick reply buttons appear
6. [ ] Type a test message
7. [ ] Message appears in chat
8. [ ] Loading indicator shows while processing
9. [ ] Bot sends a real response (not error message)
10. [ ] Response is about Farhad Global Trade business
11. [ ] Can send multiple messages
12. [ ] Chat scrolls automatically

### Test Specific Chatbot Questions

Try these questions and verify real answers:

- [ ] "What products do you import?"
  - Should mention: Automotive, Electronics, Fresh Fruits, Cattle Feed, etc.

- [ ] "How can I contact you?"
  - Should show: Phone number and email

- [ ] "What is your address?"
  - Should show: Chittagong address and Google Maps link

- [ ] "Are you open?"
  - Should show: Current business hours or contact info

### Browser Console Check

Press F12 to open Developer Tools → Console

- [ ] No red error messages
- [ ] No CORS errors
- [ ] No 404 errors for assets
- [ ] No undefined references

## Monitor Production Logs

### Check Backend Logs

In Render Dashboard:
1. Click your backend service
2. Go to Logs
3. Look for:
   - [ ] "listening on port 3000" message
   - [ ] No error messages
   - [ ] Incoming requests when testing API

### Check Frontend Logs (if separate static site)

In Render Dashboard:
1. Click your frontend service
2. Go to Logs
3. Look for:
   - [ ] Build completed successfully
   - [ ] No build errors

## Common Issues & Fixes

### Issue: Chatbot shows "invalid response"

**Fixes to try:**
1. [ ] Verify `GROQ_API_KEY` is set and valid
2. [ ] Check `/api/health` endpoint works
3. [ ] Verify `VITE_API_URL` is set in frontend build
4. [ ] Check browser Network tab for /api/chat response
5. [ ] Wait 30 seconds (free Render instance may be cold starting)

### Issue: Video not playing

**Fixes to try:**
1. [ ] Check Network tab - is video loading?
2. [ ] Verify poster image appears
3. [ ] Check video file size is reasonable
4. [ ] Try different browser
5. [ ] Check for browser autoplay policy blocks

### Issue: Images not loading

**Fixes to try:**
1. [ ] Check Network tab for 404 errors
2. [ ] Verify paths in HTML (should be /images/...)
3. [ ] Clear browser cache (Ctrl+Shift+Del)
4. [ ] Check build output contains images

### Issue: CORS errors

**Fixes to try:**
1. [ ] Verify `FRONTEND_URL` matches exactly
2. [ ] Check no trailing slashes in URLs
3. [ ] Verify backend is running
4. [ ] Test /api/health with curl

## Performance Notes

- [ ] Initial page load is fast
- [ ] Hero video starts loading immediately
- [ ] Chatbot responds within 5-15 seconds
- [ ] Images appear without lag
- [ ] No console warnings about performance

## Final Verification

All checks passed? Your production deployment is ready! 

- [ ] All environment variables set correctly
- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] Chatbot works with real responses
- [ ] Video plays correctly
- [ ] All images display
- [ ] No console errors
- [ ] No timeout or connection issues

If any check failed, refer to the "Common Issues & Fixes" section or see `RENDER_DEPLOYMENT_GUIDE.md` for detailed troubleshooting.
