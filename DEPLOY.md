# 🚀 Deployment Guide — RR Gym Management System

## Requirements
- Node.js 18+
- MySQL 8.0+
- A Linux VPS (Ubuntu 22.04 recommended) or shared hosting with Node.js support

---

## 1. Server Setup

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation
```

---

## 2. Clone & Install

```bash
git clone <your-repo-url> rrgym
cd rrgym
npm run install:all   # installs both backend and frontend dependencies
```

---

## 3. Environment Variables

```bash
cp backend/.env.example backend/.env
nano backend/.env     # fill in all values
```

**Critical values to fill:**
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` — run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `FRONTEND_URL` — your frontend URL (e.g. `https://yourdomain.com`)
- `EMAIL`, `EMAIL_PASSWORD` — Gmail + App Password for notifications

---

## 4. Frontend: Set API URL

Create `frontend/.env`:
```
VITE_API_URL=https://api.yourdomain.com
```
Or if backend and frontend are on same domain:
```
VITE_API_URL=https://yourdomain.com
```

---

## 5. Build Frontend

```bash
npm run build   # outputs to frontend/dist/
```

---

## 6. Database

The database and all tables are created **automatically** when the backend starts for the first time.

Default admin credentials:
- **Username:** `admin`
- **Password:** `Admin@123`
- ⚠️ Change this immediately after first login!

---

## 7. Run with PM2 (Recommended for production)

```bash
npm install -g pm2

# Start backend
pm2 start backend/ecosystem.config.js

# Serve frontend dist with a static server or Nginx
```

---

## 8. Nginx Configuration (Recommended)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    root /path/to/rrgym/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # Required for React Router
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded images
    location /uploads/ {
        proxy_pass http://localhost:5000/uploads/;
    }
}
```

> After adding Nginx config: `sudo nginx -t && sudo systemctl reload nginx`

---

## 9. HTTPS with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 10. Hosting Platform Alternatives

| Platform | Backend | Frontend |
|----------|---------|----------|
| Railway  | ✅ Deploy backend directly | ✅ Deploy frontend separately |
| Render   | ✅ Web Service (Node) | ✅ Static Site |
| Vercel   | ❌ (not ideal for Express) | ✅ Best for frontend |
| VPS      | ✅ Full control with PM2 + Nginx | ✅ Serve via Nginx |

---

## Troubleshooting

**CORS errors:** Make sure `FRONTEND_URL` in backend `.env` exactly matches your frontend URL (no trailing slash).

**Cookies not working:** Backend must be on HTTPS in production. Set `NODE_ENV=production` in `.env`.

**Images not loading:** Make sure Nginx proxies `/uploads/` to the backend, or serve `backend/uploads/` as a static directory.
