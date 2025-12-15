# 🚀 COOLIFY ALL-IN MIGRATION GUIDE (Option A)

**Status:** Infrastructure & Code Ready  
**Timeline:** ~8.5 days development  
**Deployment Target:** Coolify (PostgreSQL + Backend + Frontend)

---

## 📋 CHECKLIST EKSEKUSI

### Phase 1: Backend Setup (Day 1-3)
- [x] Database schema updated (OTP + customer auth)
- [x] Express.js backend scaffolded
- [x] Services: JWT, bcrypt, WA, Socket.io
- [x] Auth routes: register, verify-OTP, set-PIN, login, refresh
- [x] Package CRUD routes
- [x] Socket.io namespaces (/staff, /customer)
- [x] Config & environment setup
- [ ] Test all routes locally with Postman
- [ ] Rate limiting & validation
- [ ] Error handling refinement

### Phase 2: Frontend Integration (Day 4-5)
- [x] Socket.io client service (`src/services/socket.ts`)
- [x] PWA manifest & service worker
- [x] Customer portal login/register UI
- [x] Customer portal dashboard
- [ ] Migrate StaffMobile to use socket.io (ganti realtimeNet)
- [ ] Migrate Dashboard to listen QR_SCANNED via socket
- [ ] Add install prompt UI untuk PWA
- [ ] Test socket events (QR scan → trigger desktop)
- [ ] Test offline sync (service worker)

### Phase 3: Push Notifications (Day 6)
- [ ] Web Push (VAPID) setup
- [ ] Push subscription endpoint: `/api/push/subscribe`
- [ ] Push sender endpoint: `/api/push/send` (admin only)
- [ ] Service worker push event handler
- [ ] Customer portal subscribe to push
- [ ] Integration dengan WA (dual channel: WA + push)

### Phase 4: Coolify Deployment (Day 7)
- [ ] Create PostgreSQL service in Coolify
- [ ] Create Backend service (Node.js docker)
- [ ] Create Frontend service (Nginx docker)
- [ ] Setup domains: admin.pickpoint.my.id, paket.pickpoint.my.id
- [ ] Configure environment secrets
- [ ] SSL/HTTPS setup
- [ ] Database migration
- [ ] Verify connectivity & health checks

### Phase 5: Testing & Optimization (Day 8)
- [ ] End-to-end testing (all flows)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation update
- [ ] Go-live checklist

---

## 🔧 SETUP LOKAL (Development)

### Prerequisites
```bash
Node.js 18+
PostgreSQL 14+
```

### 1. Install Dependencies

Frontend:
```bash
cd pickpoint-dashboard
npm install socket.io-client
```

Backend:
```bash
cd backend
npm install
```

### 2. Setup Database

Buat database PostgreSQL:
```sql
CREATE DATABASE pickpoint;
```

Jalankan migration:
```bash
psql -U postgres -d pickpoint < ../supabase-reset.sql
```

### 3. Setup Environment Variables

Backend (`.env`):
```bash
cp .env.example .env

# Edit .env dengan:
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pickpoint
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-12345 # Generate: openssl rand -base64 32
JWT_REFRESH_SECRET=your-refresh-12345
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://localhost
```

Frontend (`.env.local`):
```bash
VITE_API_URL=http://localhost:3000
```

### 4. Generate JWT Secrets

```bash
# Generate 2 random secrets untuk JWT
openssl rand -base64 32
openssl rand -base64 32
```

Copy ke `.env` backend.

### 5. Generate VAPID Keys (Web Push)

```bash
cd backend
npm install -g web-push
web-push generate-vapid-keys

# Copy public & private key ke .env
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

### 6. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Akan berjalan di http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd pickpoint-dashboard
npm run dev
# Akan berjalan di http://localhost:5173
```

### 7. Test Login

**Admin/Staff:**
- Username: `admin`
- Password: `admin123` (akan di-hash saat deploy)

**Customer:**
1. Go to `http://localhost:5173/customer`
2. Register dengan nomor HP
3. Akan menerima OTP via WA (jika configured) atau dummy
4. Set PIN (4-6 digit)
5. Login dengan nomor HP + PIN

---

## 🐳 DOCKERFILE & DOCKER-COMPOSE

### Backend Dockerfile

File: `backend/Dockerfile`
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

Build image:
```bash
cd backend
npm run build
docker build -t pickpoint-backend:latest .
```

### Frontend Dockerfile

File: `Dockerfile` (root)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose (Development)

File: `docker-compose.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: pickpoint
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./supabase-reset.sql:/docker-entrypoint-initdb.d/init.sql

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      PORT: 3000
      NODE_ENV: development
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: pickpoint
      DB_USER: postgres
      DB_PASSWORD: postgres
      JWT_SECRET: dev-secret-key-change-in-production
      JWT_REFRESH_SECRET: dev-refresh-key-change-in-production
      CORS_ORIGIN: http://localhost:5173,http://localhost:3000
    depends_on:
      - postgres
    volumes:
      - ./backend/src:/app/src

  frontend:
    build: .
    ports:
      - "5173:80"
    environment:
      VITE_API_URL: http://localhost:3000

volumes:
  postgres_data:
```

Run:
```bash
docker-compose up
```

---

## 🚀 COOLIFY DEPLOYMENT (Production)

### 1. Setup PostgreSQL Service

Di Coolify dashboard:
1. Create new "Database" service
2. Select "PostgreSQL" 15 or 16
3. Set credentials:
   - POSTGRES_DB: pickpoint
   - POSTGRES_USER: pickpoint_user
   - POSTGRES_PASSWORD: [strong-password]
4. Allocate persistent volume: `/var/lib/postgresql/data` (10GB+)
5. Deploy

### 2. Run Database Migration

Setelah PostgreSQL up:
```bash
# Via Coolify terminal atau psql remote
psql -h [postgres-host] -U pickpoint_user -d pickpoint < supabase-reset.sql
```

### 3. Deploy Backend

Di Coolify:
1. Create new "Service" → "Docker"
2. Upload `backend/Dockerfile`
3. Build configuration:
   - Build command: `docker build -t pickpoint-backend:latest .`
   - Run command: `docker run -p 3000:3000 pickpoint-backend:latest`
4. Environment variables (from secrets):
   - `DB_HOST`: [postgres-service-name]
   - `DB_PORT`: 5432
   - `DB_NAME`: pickpoint
   - `DB_USER`: pickpoint_user
   - `DB_PASSWORD`: [from-secrets]
   - `JWT_SECRET`: [generate-with-openssl]
   - `JWT_REFRESH_SECRET`: [generate-with-openssl]
   - `CORS_ORIGIN`: https://admin.pickpoint.my.id,https://paket.pickpoint.my.id
   - `NODE_ENV`: production
   - `PORT`: 3000
5. Network: Connect ke PostgreSQL service
6. Domain: `api.pickpoint.my.id` (jika ingin API endpoint terpisah) atau via proxy
7. Deploy

### 4. Deploy Frontend

Di Coolify:
1. Create new "Service" → "Docker"
2. Upload `Dockerfile` (frontend)
3. Environment: 
   - `VITE_API_URL`: https://api.pickpoint.my.id (atau IP backend lokal)
4. Domain: 
   - `admin.pickpoint.my.id` → `/admin/*`
   - `paket.pickpoint.my.id` → `/customer/*`
5. Deploy

### 5. Setup Reverse Proxy (Nginx)

Jika ingin single domain dengan multiple subdomains:

`nginx.conf`:
```nginx
upstream backend {
  server backend-service:3000;
}

upstream frontend {
  server frontend-service:80;
}

server {
  listen 80;
  server_name admin.pickpoint.my.id paket.pickpoint.my.id;
  
  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name admin.pickpoint.my.id;
  
  ssl_certificate /etc/letsencrypt/live/admin.pickpoint.my.id/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/admin.pickpoint.my.id/privkey.pem;
  
  location /api/ {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
  
  location /socket.io/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
  
  location / {
    proxy_pass http://frontend;
  }
}

server {
  listen 443 ssl http2;
  server_name paket.pickpoint.my.id;
  
  ssl_certificate /etc/letsencrypt/live/paket.pickpoint.my.id/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/paket.pickpoint.my.id/privkey.pem;
  
  location /api/ {
    proxy_pass http://backend;
    proxy_set_header Host $host;
  }
  
  location / {
    proxy_pass http://frontend;
  }
}
```

---

## ✅ TESTING CHECKLIST

### Staff App
- [ ] Login dengan admin/admin123
- [ ] Scan QR code dari mobile
- [ ] QR event muncul di desktop (socket.io)
- [ ] Tambah paket baru
- [ ] Realtime refresh di device lain
- [ ] PWA installable di mobile
- [ ] Works offline (cache shell)

### Customer Portal
- [ ] Register dengan nomor HP
- [ ] Receive OTP via WA
- [ ] Set PIN
- [ ] Login dengan nomor HP + PIN
- [ ] View packages list
- [ ] Filter by status
- [ ] Receive push notification saat paket tiba
- [ ] Deep link dari WA ke paket detail

### Database
- [ ] Data persist setelah restart
- [ ] Admin password hashed (bcrypt)
- [ ] Customer PIN hashed
- [ ] OTP expiry working

### Security
- [ ] JWT tokens validate
- [ ] CORS allow correct origins
- [ ] Rate limiting on auth endpoints
- [ ] No console errors (production)
- [ ] HTTPS working

---

## 📞 NEXT STEPS

1. **Test backend locally** dengan Postman/curl sebelum deploy
2. **Build frontend** dan verify PWA manifest
3. **Docker build** both services dan test dengan docker-compose
4. **Setup Coolify services** sesuai instruksi di atas
5. **Configure DNS** untuk subdomain
6. **Run UAT** sebelum go-live
7. **Monitor logs** di Coolify dashboard

---

**Generated:** December 15, 2025  
**Version:** Option A - All-in Coolify  
**Status:** Ready for Development
