# Authentication Fix Audit Report

Date: 2026-04-27

## 1. Root Cause

Admin login succeeded, but later admin validation could use the wrong frontend token source.

- `frontend/src/services/api.js` previously prioritized `mywebsite_session` before `token`.
- If a member session already existed, admin requests such as `/api/admin/me` could send the member token instead of the admin token.
- `backend/middleware/authMiddleware.js` previously accepted any valid JWT in `adminOnly`, without enforcing `decoded.user_type === "admin"`.
- `backend/controllers/adminController.js` used `SameSite: "strict"` for admin cookies in production, while member auth already used `SameSite: "none"`, making cross-origin admin auth less reliable.

Result:

- Admin login returned success.
- The frontend redirected to `/admin/dashboard`.
- `AdminRoute` called `/api/admin/me`.
- The wrong token could be sent, or the cookie could be unavailable cross-origin.
- The request failed and the app redirected back to `/admin-login`.

## 2. Files Modified

- `frontend/src/services/api.js`
- `frontend/src/pages/admin/AdminLogin.jsx`
- `frontend/src/pages/user/Login.jsx`
- `frontend/src/services/adminService.js`
- `frontend/src/services/authService.js`
- `backend/middleware/authMiddleware.js`
- `backend/controllers/adminController.js`
- `backend/controllers/authController.js`

## 3. Before vs After

### A. Frontend token selection

Before:

```js
const sessionValue =
  localStorage.getItem("mywebsite_session") || localStorage.getItem("token");
```

After:

```js
const isAdminRequest = requestUrl.startsWith("/api/admin");

if (isAdminRequest) {
  return readTokenValue(ADMIN_TOKEN_KEY) || readTokenValue(LEGACY_ADMIN_TOKEN_KEY);
}

return readTokenValue(USER_TOKEN_KEY) || getStoredToken();
```

Impact:

- Admin routes now use `admin_token` first.
- User/member routes now use `user_token` or legacy member session data.
- Admin and member tokens are no longer mixed.

### B. Admin login token storage

Before:

```js
localStorage.setItem("token", res.data.token);
```

After:

```js
localStorage.setItem(ADMIN_TOKEN_KEY, res.data.token);
localStorage.removeItem("token");
```

Impact:

- Admin token is stored separately as `admin_token`.
- Old legacy `token` is cleared to avoid conflicts.

### C. Member login token storage

Before:

```js
res.status(200).json({
  success: true,
  message: "Login successful",
  data: { ... }
});
```

After:

```js
res.status(200).json({
  success: true,
  message: "Login successful",
  token,
  data: { ... }
});
```

And in the frontend:

```js
if (res.data?.token) {
  localStorage.setItem(USER_TOKEN_KEY, res.data.token);
}
```

Impact:

- Member auth remains cookie-based.
- A separate `user_token` is now also available for safe separation and future compatibility.

### D. Admin-only backend enforcement

Before:

```js
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded;
next();
```

After:

```js
const decoded = jwt.verify(token, process.env.JWT_SECRET);
if (decoded.user_type !== "admin") {
  return res.status(403).json({ message: "Admin access required" });
}

req.user = decoded;
next();
```

Impact:

- Member tokens are now rejected on admin-only routes.
- `/api/admin/me` cannot accidentally validate a member JWT anymore.

### E. Admin cookie settings

Before:

```js
sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax"
```

After:

```js
sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
```

Impact:

- Admin cookies now match the member cross-origin strategy.
- This is compatible with frontend on one origin and backend on AWS EC2 on another origin.

## 4. Why the Fix Works

- Admin requests no longer read member session data first.
- Member requests no longer accidentally reuse admin tokens.
- The backend now strictly enforces that admin routes require an admin JWT.
- Cross-origin admin cookie transport now matches the member flow already used in production.
- Existing endpoints and route structure were kept intact.

## 5. New Dependencies Added

None.

## 6. Environment or Config Changes Required

No mandatory new environment variables were added.

Recommended checks:

- Ensure `NODE_ENV=production` on AWS if you want `secure: true` and `SameSite: "none"` to apply.
- Ensure your frontend origin is included in backend CORS allow list through `FRONTEND_URL` or `PROD_URL`.
- Ensure the backend is served over HTTPS in production, because `SameSite: "none"` requires `secure: true`.

## 7. Backend Deployment Changes

Update these backend files on AWS:

- `backend/controllers/adminController.js`
- `backend/controllers/authController.js`
- `backend/middleware/authMiddleware.js`

If you deploy the whole repo, also update these frontend files in the frontend build:

- `frontend/src/services/api.js`
- `frontend/src/pages/admin/AdminLogin.jsx`
- `frontend/src/pages/user/Login.jsx`
- `frontend/src/services/adminService.js`
- `frontend/src/services/authService.js`

Commands:

```bash
cd /path/to/rrgym-main/backend
git pull
npm install
pm2 restart gym-app
pm2 logs gym-app --lines 100
```

If frontend is hosted separately:

```bash
cd /path/to/rrgym-main/frontend
git pull
npm install
npm run build
```

If you upload files manually instead of `git pull`, replace the files listed above and then restart `pm2`.

## 8. Zero or Minimal Downtime Notes

- `npm install` is only needed if package dependencies changed. They did not change for this fix, so it can be skipped if your deploy process does not require it.
- `pm2 restart gym-app` is sufficient for backend reload.
- If you use `pm2 reload gym-app`, that is preferable for lower disruption when supported by your process setup.

## 9. Testing Checklist

### Admin login

1. Open `/admin-login`.
2. Log in with a valid admin account.
3. Confirm redirect goes to `/admin/dashboard`.
4. Refresh the page.
5. Confirm you stay logged in.
6. Open browser devtools and confirm:
   - `localStorage["admin_token"]` exists.
   - `/api/admin/me` returns `200`.

### Member login

1. Open `/login`.
2. Request OTP and complete member login.
3. Confirm normal member navigation still works.
4. Refresh member pages such as `/profile`.
5. Confirm you stay logged in.
6. Confirm:
   - `localStorage["user_token"]` exists after login.
   - `/api/auth/me` still returns `200`.

### Conflict and logout cases

1. Log in as a member, then log in as an admin.
2. Confirm admin pages still work.
3. Log out from admin.
4. Confirm `admin_token` is removed and admin routes redirect to `/admin-login`.
5. Log out from member.
6. Confirm `user_token` is removed and member protected routes redirect to `/login`.

## 10. Risks

- Trainer accounts that depend on member JWTs reaching admin-only routes will now be blocked by design, because admin routes now strictly require `user_type === "admin"`.
- This is aligned with the requested fix and with the intended meaning of `adminOnly`, but it is the main behavior change to verify if trainer access was relying on the old bug.

## 11. Verification Performed

- `node --check backend/controllers/adminController.js`
- `node --check backend/controllers/authController.js`
- `node --check backend/middleware/authMiddleware.js`
- `npm run build` in `frontend`

All of the above completed successfully.
