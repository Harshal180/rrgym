# Cross-Origin Deployment Setup (Netlify + AWS)

## The Problem That Was Fixed

When frontend (Netlify) and backend (AWS) are on **different domains**, the browser
enforces strict cross-origin cookie rules. The original code used `SameSite=Strict`,
which causes the browser to **silently block cookies** on every cross-origin request —
meaning every API call appeared unauthenticated even after login.

## What Was Changed

| File | Change |
|------|--------|
| `backend/controllers/authController.js` | `sameSite: "strict"` → `"none"` in production |
| `backend/controllers/adminController.js` | `sameSite: "strict"` → `"none"` in production |
| `backend/server.js` | Added `exposedHeaders: ["set-cookie"]` to CORS config |
| `frontend/src/services/api.js` | Added response interceptor + clarifying comments |
| `frontend/vite.config.js` | Added comment clarifying proxy is dev-only |

## Required Environment Variables

### Backend (`backend/.env` on your AWS server)

```env
NODE_ENV=production          # ← REQUIRED. Enables secure/sameSite=none cookies.
PORT=5000

# Your Netlify frontend URL (no trailing slash)
FRONTEND_URL=https://your-app.netlify.app
# Optional second origin (e.g. custom domain)
PROD_URL=https://www.yourdomain.com

JWT_SECRET=your_64_char_random_string
# ... rest of your existing env vars
```

> ⚠️ The `PROD_URL` in your current `.env` has `||` in it (`http://rrgyms.in||52.62.38.76`).
> That is treated as a single string and will NOT match any real origin.
> Fix it to one valid URL, e.g. `PROD_URL=http://rrgyms.in`

### Frontend (Netlify Environment Variables)

Set this in **Netlify → Site Settings → Environment Variables**:

```
VITE_API_URL = https://your-aws-backend-url.com
```

> ⚠️ Your backend **must be served over HTTPS** (not plain HTTP).
> `SameSite=None` cookies are rejected by browsers unless `Secure=true`,
> and `Secure` only works over HTTPS.

## AWS Backend Checklist

1. Make sure `NODE_ENV=production` is in your `.env` (or PM2 ecosystem config)
2. Your backend must be behind HTTPS (use nginx + Let's Encrypt, or an AWS ALB with a cert)
3. Restart PM2 after updating `.env`: `pm2 restart all`

## Netlify Checklist

1. Set `VITE_API_URL` in Site Settings → Environment Variables
2. Trigger a new deploy after adding the env var (it gets baked in at build time)
3. Add `_redirects` file in `frontend/public/` if you hit 404 on page refresh:
   ```
   /*  /index.html  200
   ```
