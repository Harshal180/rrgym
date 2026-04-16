# Gym Management System — Professional Structure Guide

## Project Overview

Full-stack gym management app built with **React + Vite** (frontend) and **Node.js + Express + MySQL** (backend).

---

## Folder Structure

```
gym-pro/
│
├── backend/
│   ├── controllers/          ← Business logic (one file per feature)
│   │   ├── memberController.js
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── attendanceController.js
│   │   ├── planController.js
│   │   └── paymentController.js
│   │
│   ├── routes/               ← Route definitions only (thin, no logic)
│   │   ├── memberRoutes.js
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── planRoutes.js
│   │   └── paymentRoutes.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js  ← authMiddleware, adminOnly, trainerOnly
│   │
│   ├── config/
│   │   ├── db.js              ← MySQL pool connection
│   │   ├── gymConfig.js       ← Gym name, email, phone, address
│   │   ├── initdb.js          ← DB table auto-creation on startup
│   │   ├── membershipCron.js  ← Cron job: auto-expire memberships
│   │   └── upload.js          ← Multer config for image uploads
│   │
│   ├── utils/
│   │   ├── sendEmail.js       ← Nodemailer email sender
│   │   ├── sendOTPEmail.js
│   │   ├── sendSMS.js
│   │   └── generateBillPDF.js ← Server-side PDF bill generation
│   │
│   ├── uploads/               ← Member profile images (gitignored)
│   ├── server.js              ← Express app entry point
│   ├── ecosystem.config.js    ← PM2 process config
│   └── package.json
│
└── frontend/
    └── src/
        │
        ├── App.jsx            ← All routes defined here
        ├── main.jsx           ← React entry point + MUI Theme
        │
        ├── config/
        │   └── gymConfig.js   ← Gym branding (name, logo, contact)
        │                         Edit this to rebrand the app
        │
        ├── services/          ← All API calls (one file per feature)
        │   ├── api.js         ← Base axios instance (withCredentials)
        │   ├── authService.js
        │   ├── adminService.js
        │   ├── memberService.js
        │   ├── attendanceService.js
        │   ├── planService.js
        │   ├── paymentService.js
        │   └── chatbotService.js
        │
        ├── pages/
        │   ├── admin/         ← Admin dashboard pages
        │   │   ├── Dashboard.jsx
        │   │   ├── Members.jsx
        │   │   ├── AddMember.jsx
        │   │   ├── RenewMembership.jsx
        │   │   ├── ExistingMembers.jsx
        │   │   ├── Attendance.jsx
        │   │   ├── AttendanceReport.jsx
        │   │   ├── MembershipPlans.jsx
        │   │   ├── Offers.jsx
        │   │   ├── Reports.jsx
        │   │   ├── Payments.jsx
        │   │   ├── ManageTrainers.jsx
        │   │   ├── AdminLogin.jsx
        │   │   └── AdminProfile.jsx
        │   │
        │   └── user/          ← Public-facing pages
        │       ├── Home.jsx
        │       ├── Aboutus.jsx
        │       ├── Services.jsx
        │       ├── PricingPlans.jsx
        │       ├── Gallery.jsx
        │       ├── ContactUs.jsx
        │       ├── ChatBot.jsx
        │       ├── Login.jsx
        │       ├── Profile.jsx     ← Protected
        │       └── CalculateBMI.jsx ← Protected
        │
        ├── components/
        │   ├── admin/         ← Admin-specific UI components
        │   │   ├── Sidebar.jsx
        │   │   ├── Topbar.jsx
        │   │   └── StatCard.jsx
        │   │
        │   ├── shared/        ← Used in both user and admin areas
        │   │   ├── Navbar.jsx
        │   │   ├── Footer.jsx
        │   │   ├── Hero.jsx
        │   │   ├── Trainer.jsx
        │   │   ├── ServiceCard.jsx
        │   │   ├── SharedCard.jsx
        │   │   ├── HeadingSubheading.jsx
        │   │   ├── ParrallaxTitle.jsx
        │   │   ├── QuoteCarousel.jsx
        │   │   ├── ContentWithLeftImage.jsx
        │   │   └── ContentWithRightImage.jsx
        │   │
        │   ├── user/          ← User-facing feature components
        │   │   ├── FitnessChatbot.jsx
        │   │   └── GalleryItem.jsx
        │   │
        │   └── ui/            ← Generic reusable UI primitives
        │       └── AlertModal.jsx
        │
        ├── layouts/
        │   ├── MainLayout.jsx  ← Navbar + Outlet + Chatbot + Footer
        │   └── AdminLayout.jsx ← Sidebar + Topbar + Outlet
        │
        ├── routes/
        │   ├── ProtectedRoute.jsx  ← Redirects to /login if not a member
        │   └── AdminRoute.jsx      ← Redirects to /admin-login if not admin
        │
        ├── context/
        │   └── MembersContext.jsx  ← Global members map + image helper
        │
        └── hooks/
            ├── useAlert.js         ← { alert, showAlert, closeAlert }
            └── useBillGenerator.js ← { generateBill } — jsPDF bill
```

---

## Architecture Rules (follow these always)

### Backend

**Controllers hold ALL logic. Routes hold ZERO logic.**

```js
// ✅ CORRECT — route is just a thin wire
router.post("/add", authMiddleware, adminOnly, upload.single("image"), addMember);

// ❌ WRONG — never put db queries or business logic in routes
router.post("/add", async (req, res) => {
  const [existing] = await db.query(...); // move this to a controller
});
```

Every controller function follows this pattern:
```js
const doSomething = async (req, res) => {
  try {
    // logic here
    res.json({ message: "Success" });
  } catch (err) {
    console.error("doSomething error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { doSomething };
```

### Frontend

**Service files hold ALL API calls. Components call services, never axios directly.**

```js
// ✅ CORRECT — component calls a service
import memberService from "../../services/memberService";
const res = await memberService.getAll({ status: "Active" });

// ❌ WRONG — never call axios directly inside a component
import axios from "axios";
const res = await axios.get(`${BASE_URL}/api/members`);
```

**Import paths by file type:**
| What you need       | Import from                          |
|---------------------|--------------------------------------|
| API calls           | `../../services/memberService`       |
| Gym name/logo       | `../../config/gymConfig`             |
| Alert modal         | `../../components/ui/AlertModal`     |
| Alert hook          | `../../hooks/useAlert`               |
| Bill generator hook | `../../hooks/useBillGenerator`       |
| Members context     | `../../context/MembersContext`       |
| Image URL helper    | `useMembers()` → `getImageSrc()`     |

---

## API Endpoints Reference

### Member Auth — `/api/auth`
| Method | Path           | Auth     | Description          |
|--------|----------------|----------|----------------------|
| POST   | /send-otp      | Public   | Send OTP to email    |
| POST   | /verify-otp    | Public   | Verify OTP, get cookie |
| POST   | /logout        | Public   | Clear cookie         |
| GET    | /me            | Member   | Lightweight auth check |
| GET    | /profile       | Member   | Full profile data    |

### Admin Auth — `/api/admin`
| Method | Path                    | Auth    | Description          |
|--------|-------------------------|---------|----------------------|
| POST   | /login                  | Public  | Admin/trainer login  |
| POST   | /logout                 | Public  | Clear cookie         |
| GET    | /me                     | Admin   | Current admin info   |
| PUT    | /change-password        | Admin   | Change password      |
| POST   | /trainers               | Owner   | Add trainer account  |
| GET    | /trainers               | Owner   | List all trainers    |
| PUT    | /trainers/:id/toggle    | Owner   | Enable/disable trainer |

### Members — `/api/members`
| Method | Path              | Auth         | Description         |
|--------|-------------------|--------------|---------------------|
| POST   | /add              | Admin        | Add new member      |
| POST   | /renew            | Admin        | Renew membership    |
| POST   | /:id/send-bill    | Admin        | Email bill PDF      |
| GET    | /                 | Admin        | List all members    |
| GET    | /trainers         | Admin        | List all trainers   |
| GET    | /:id              | Auth (own)   | Get single member   |

### Attendance — `/api/attendance`
| Method | Path            | Auth   | Description          |
|--------|-----------------|--------|----------------------|
| POST   | /mark           | Auth   | Mark IN or OUT       |
| GET    | /today          | Admin  | Today's attendance   |
| GET    | /report/:date   | Admin  | Attendance by date   |

### Plans — `/api/plans`
| Method | Path   | Auth   | Description      |
|--------|--------|--------|------------------|
| GET    | /      | Public | All plans        |
| PUT    | /:id   | Admin  | Update plan price |

### Payments — `/api/payments`
| Method | Path                  | Auth  | Description            |
|--------|-----------------------|-------|------------------------|
| POST   | /                     | Admin | Record payment         |
| POST   | /collect-balance      | Admin | Collect pending balance |
| GET    | /                     | Admin | All payments           |
| GET    | /stats                | Admin | Summary stats          |
| GET    | /pending              | Admin | Members with balance   |
| GET    | /member/:memberId     | Admin | Member payment history |

---

## How to Use Services in a Page

```jsx
// pages/admin/Members.jsx — example pattern
import { useEffect, useState } from "react";
import memberService from "../../services/memberService";
import useAlert from "../../hooks/useAlert";
import AlertModal from "../../components/ui/AlertModal";

export default function Members() {
  const [members, setMembers] = useState([]);
  const { alert, showAlert, closeAlert } = useAlert();

  useEffect(() => {
    memberService.getAll()
      .then((res) => setMembers(res.data))
      .catch(() => showAlert("error", "Error", "Failed to load members"));
  }, []);

  const handleSendBill = async (id) => {
    try {
      await memberService.sendBill(id);
      showAlert("success", "Sent!", "Bill emailed successfully");
    } catch {
      showAlert("error", "Failed", "Could not send bill");
    }
  };

  return (
    <>
      {/* your JSX */}
      <AlertModal {...alert} onClose={closeAlert} />
    </>
  );
}
```

---

## Rebrand the App

Edit only **two files** to change all branding:

1. `frontend/src/config/gymConfig.js` — name, tagline, email, phone, address, logo paths
2. `frontend/public/assets/logoBlack.png` and `logoWhite.png` — replace image files

The backend also reads from `backend/config/gymConfig.js` for email templates and PDF bills.

---

## Environment Variables

**backend/.env**
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=gym_db
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:5173
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_app_password
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000
```

---

## Getting Started

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in your values
node server.js

# Frontend
cd frontend
npm install
npm run dev
```
