# CodeX — Hackathon Management Platform

University hackathon portal built with **Next.js** + **Express.js** + **MySQL** + **Clerk**.

---

## 🚀 Quick Start

### 1. Setup MySQL Database
```bash
mysql -u root -p
CREATE DATABASE codex_db;
USE codex_db;
source c:/Users/apurv/OneDrive/Desktop/X/backend/schema.sql
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=codex_db

CLERK_SECRET_KEY=sk_test_...       # From dashboard.clerk.com
CLERK_WEBHOOK_SECRET=whsec_...     # From Clerk > Webhooks

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM="CodeX <your_email@gmail.com>"

FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Configure Clerk
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) and create a project
2. Set **Allowed redirect URLs**: `http://localhost:3000/dashboard`
3. Set **Webhooks**: `http://your-ngrok-url/webhooks/clerk` → events: `user.created`, `user.deleted`
4. Copy your keys into the `.env` files above

### 4. Run the App

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Starts on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Starts on http://localhost:3000
```

---

## 🔑 User Roles & Flows

| Role | After Login | Key Actions |
|------|-------------|-------------|
| **Student** | `/student` | Browse hackathons, enroll (solo/duo/group), set email reminders |
| **Faculty** | `/faculty` | Create/edit/delete hackathons, view participants |
| **Admin** | `/admin` | Approve hackathons, manage all users, full dashboard stats |

### First-time Registration
After Clerk sign-up → redirected to `/complete-profile` → pick role + fill role-specific fields → redirected to dashboard.

---

## 📁 Project Structure
```
X/
├── backend/           Express.js API (port 5000)
│   ├── src/
│   │   ├── app.js     Main app + email cron job
│   │   ├── db.js      MySQL pool
│   │   ├── middleware/  auth.js, role.js
│   │   └── routes/    hackathons, enrollments, reminders, faculty, admin, users, webhooks
│   └── schema.sql     Database schema
└── frontend/          Next.js App Router (port 3000)
    ├── app/
    │   ├── student/   Hackathon list + detail + enrollments
    │   ├── faculty/   Dashboard + create/edit + participants
    │   └── admin/     Dashboard + hackathons + users
    ├── components/    Navbar, HackathonCard, EnrollModal, CountdownTimer, ReminderButton
    └── lib/api.ts     API helper functions
```

---

## 📧 Email Reminders
The backend runs a **cron job every 15 minutes** that checks for pending reminders and sends HTML emails via Nodemailer (Gmail SMTP).

## 🗄️ Database
7 MySQL tables: `users`, `students`, `faculty`, `admins`, `hackathons`, `enrollments`, `enrollment_members`, `reminders`
