# 🎯 PICKPOINT DASHBOARD - QUICK START

**Status:** ✅ Ready for Production  
**Stack:** React 18 + Node.js 20 + PostgreSQL 15 + Socket.io + PWA

---

## 📖 DOCUMENTATION

| Document | Purpose |
|----------|---------|
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | What's been built |
| [COOLIFY_DEPLOYMENT_STEPS.md](./COOLIFY_DEPLOYMENT_STEPS.md) | Step-by-step deployment guide |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | Pre-launch validation & monitoring |
| [AUDIT_REPORT.md](./AUDIT_REPORT.md) | Architecture audit & recommendations |
| [COOLIFY_MIGRATION_GUIDE.md](./COOLIFY_MIGRATION_GUIDE.md) | Local dev + Docker setup |

---

## 🚀 QUICK START (DEVELOPMENT)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (untuk testing)
- Git

### Setup Frontend
```bash
npm install socket.io-client
npm run dev
# Open http://localhost:5173
```

### Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan database credentials
npm run dev
# Runs at http://localhost:3000
```

### Setup Database
```bash
# Create database
createdb pickpoint

# Apply schema
psql -U postgres -d pickpoint < supabase-reset.sql

# Verify
psql -U postgres -d pickpoint -c "\dt"
```

---

## 🎯 KEY FEATURES

✅ **Staff App (Mobile PWA)**
- QR code scanning untuk pickup
- Realtime sync via Socket.io
- Offline support (service worker)
- Installable di Android/iOS

✅ **Customer Portal (`paket.pickpoint.my.id`)**
- Phone-based registration (OTP via WhatsApp)
- PIN authentication
- View packages by status
- Push notifications

✅ **Admin Dashboard (`admin.pickpoint.my.id`)**
- Package management
- User management
- Realtime monitoring
- Activity logging

✅ **Backend APIs**
- JWT authentication
- bcrypt password hashing
- Socket.io realtime events
- REST API (packages, customers, locations)

---

## 📁 PROJECT STRUCTURE

```
pickpoint-dashboard/
├── backend/                  # Express.js backend
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth, validation
│   │   └── socket/          # Socket.io handlers
│   ├── package.json
│   └── Dockerfile
├── src/                      # React frontend
│   ├── components/          # UI components
│   │   ├── CustomerLogin.tsx
│   │   ├── CustomerPortal.tsx
│   │   ├── AdminApp.tsx
│   │   └── MobileStaffApp.tsx
│   ├── services/            # API & Socket.io
│   │   └── socket.ts        # Socket.io client
│   ├── config/
│   └── App.tsx              # Routing
├── public/
│   ├── manifest.webmanifest # PWA manifest
│   └── sw.js                # Service worker
├── package.json
├── Dockerfile               # Frontend container
└── supabase-reset.sql       # Database schema
```

---

## 🔐 AUTHENTICATION FLOW

### Staff/Admin Login
```
Login (username + password)
  ↓
Backend: Check bcrypt hash
  ↓
JWT token generated (15m expiry)
  ↓
Refresh token generated (7d expiry)
  ↓
Access dashboard
```

### Customer Registration
```
Phone + Name + Unit
  ↓
OTP generated & sent via WhatsApp
  ↓
Customer verifies OTP
  ↓
Customer sets PIN (4-6 digits)
  ↓
Login with phone + PIN
```

---

## 🔗 REALTIME ARCHITECTURE

### Socket.io Namespaces
- `/staff` - QR_SCANNED, PACKAGE_ADDED, PACKAGE_PICKED
- `/customer` - PACKAGE_STATUS_UPDATED, notifications

### Event Flow
```
Mobile (QR Scan)
  ↓ Socket.emit('QR_SCANNED')
  ↓
Backend receives event
  ↓
Broadcast to /staff namespace
  ↓
Desktop receives & triggers pickup modal
  ↓
All devices sync in real-time
```

---

## 📦 DEPLOYMENT OPTIONS

### Option 1: Coolify (Recommended - All-in-one)
```bash
1. Setup PostgreSQL service
2. Run database migration
3. Deploy backend service
4. Deploy frontend service
5. Configure SSL & domains
```
See: [COOLIFY_DEPLOYMENT_STEPS.md](./COOLIFY_DEPLOYMENT_STEPS.md)

### Option 2: Docker Compose (Local)
```bash
docker-compose up
# Access: localhost:5173 (frontend), localhost:3000 (backend)
```

### Option 3: Manual Servers
- Frontend: Nginx (static files)
- Backend: Node.js (PM2/systemd)
- Database: PostgreSQL

---

## 🧪 TESTING

### API Testing (Postman)
```bash
# Staff login
POST http://localhost:3000/api/auth/staff-login
{
  "username": "admin",
  "password": "admin123"
}

# Customer register
POST http://localhost:3000/api/auth/customer-register
{
  "phoneNumber": "6285212345678",
  "name": "John Doe",
  "unitNumber": "A-101"
}
```

### End-to-End Testing
1. Staff login → View dashboard
2. Mobile scan QR → Event on desktop
3. Customer register → Receive OTP
4. Customer login → View packages
5. Add package → Realtime sync

See: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for validation tests

---

## 🔧 ENVIRONMENT VARIABLES

### Backend (.env)
```env
PORT=3000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pickpoint
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3000
```

---

## 📊 API ENDPOINTS

### Authentication
- `POST /api/auth/staff-login` - Staff login
- `POST /api/auth/customer-register` - Customer registration
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/set-pin` - Set customer PIN
- `POST /api/auth/customer-login` - Customer login
- `POST /api/auth/refresh` - Refresh token

### Packages
- `GET /api/packages` - List packages
- `GET /api/packages/:id` - Get package
- `POST /api/packages` - Create package
- `PATCH /api/packages/:id` - Update package

### Locations
- `GET /api/locations` - List locations
- `POST /api/locations` - Create location

---

## 🚨 TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Backend won't start | Check Node.js version, .env file, database connectivity |
| Socket.io not connecting | Check CORS_ORIGIN, browser console for errors |
| Database error | Run migration, verify credentials |
| OTP not sending | Check WA_API_KEY in settings, verify endpoint |
| PWA not installing | Check manifest.json syntax, requires HTTPS |

---

## 📞 SUPPORT

- **Docs:** Read the documentation files listed above
- **Issues:** Create GitHub issue or contact dev team
- **Logs:** Check backend logs for error details
- **Database:** Use `psql` to query database directly

---

## 📄 LICENSE

Proprietary - PickPoint System

---

## 👥 TEAM

- **Project:** Pickpoint Dashboard (All-in Coolify Migration)
- **Status:** Production Ready ✅
- **Last Updated:** December 15, 2025

---

**Ready to deploy? Start with [COOLIFY_DEPLOYMENT_STEPS.md](./COOLIFY_DEPLOYMENT_STEPS.md) 🚀**
