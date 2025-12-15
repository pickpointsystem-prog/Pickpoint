# 🚀 COOLIFY DEPLOYMENT - PANDUAN LANGKAH DEMI LANGKAH

**Repository:** https://github.com/pickpointsystem-prog/Pickpoint  
**Target:** Coolify (All-in solution dengan PostgreSQL, Backend, Frontend)

---

## 📋 PRE-DEPLOYMENT CHECKLIST

- [x] GitHub repository initialized & pushed
- [ ] Coolify instance ready (self-hosted atau cloud)
- [ ] Domain DNS configured (admin.pickpoint.my.id, paket.pickpoint.my.id)
- [ ] SSL certificate ready (Let's Encrypt automatic di Coolify)

---

## **STEP 1: Setup Coolify (Jika Belum)**

### **Option A: Self-Hosted Coolify**
```bash
# Install Docker & Docker Compose
# See: https://docs.docker.com/install

# Deploy Coolify via Docker
docker run -d \
  -p 80:3000 \
  -p 443:3443 \
  -e COOLIFY_SECRET=your-secret-key \
  -v coolify:/data \
  --name coolify \
  ghcr.io/coollabsio/coolify:latest

# Access: https://your-server-ip
# Setup wizard akan muncul
```

### **Option B: Cloud Coolify**
- Go to: https://app.coolify.io
- Sign up → Create organization
- Connect server (atau deploy ke managed instance)

Lanjut ke **STEP 2** setelah Coolify running.

---

## **STEP 2: Setup PostgreSQL Service di Coolify**

### **Langkah 2.1: Create Database Service**

1. **Dashboard Coolify** → Click "+ New" → **"Database"**
2. Select **"PostgreSQL"** (version 15+)
3. Set name: `pickpoint-postgres`
4. **Environment Variables:**
   ```
   POSTGRES_DB=pickpoint
   POSTGRES_USER=pickpoint_user
   POSTGRES_PASSWORD=SuperSecurePassword123!  # GANTI dengan password kuat
   ```
5. Click **"Deploy"** → Wait 2-3 minutes

### **Langkah 2.2: Verify Database Connection**

1. Di Coolify dashboard, click service `pickpoint-postgres`
2. Go to **"Logs"** tab → Should see: `database system is ready to accept connections`
3. Note down:
   - **Host:** `pickpoint-postgres` (internal docker network)
   - **Port:** `5432`
   - **Username:** `pickpoint_user`
   - **Password:** (yang Anda set)
   - **Database:** `pickpoint`

---

## **STEP 3: Run Database Migration**

### **Langkah 3.1: Connect to Database**

Dari server lokal atau dari Coolify terminal:

```bash
# Via Coolify SSH/Terminal (lebih aman)
# Atau dari lokal dengan remote psql:

psql -h your-coolify-domain-or-ip \
     -p 5432 \
     -U pickpoint_user \
     -d pickpoint \
     -c "SELECT 1"  # Test connection

# Jika error: Database belum exist, buat dulu:
createdb -h your-server-ip -U postgres pickpoint
```

### **Langkah 3.2: Load Schema**

```bash
# Download schema dari repo
git clone https://github.com/pickpointsystem-prog/Pickpoint.git
cd Pickpoint

# Apply schema (via Coolify terminal atau lokal)
psql -h your-coolify-postgres-host \
     -U pickpoint_user \
     -d pickpoint \
     -f supabase-reset.sql

# Verify
psql -h your-coolify-postgres-host \
     -U pickpoint_user \
     -d pickpoint \
     -c "\dt"  # List tables
```

**Expected output:**
```
               List of relations
 Schema |     Name      | Type  |      Owner      
--------+---------------+-------+-----------------
 public | activities    | table | pickpoint_user
 public | customers     | table | pickpoint_user
 public | locations     | table | pickpoint_user
 public | packages      | table | pickpoint_user
 public | settings      | table | pickpoint_user
 public | users         | table | pickpoint_user
(6 rows)
```

✅ **Database migration done!**

---

## **STEP 4: Deploy Backend Service**

### **Langkah 4.1: Create Service di Coolify**

1. **Coolify Dashboard** → Click "+ New" → **"Service"**
2. Select **"Docker"** → Select **"Git"**
3. **Configure:**
   - Name: `pickpoint-backend`
   - GitHub Repo: `https://github.com/pickpointsystem-prog/Pickpoint`
   - Branch: `main`
   - Dockerfile Path: `backend/Dockerfile`
   - Port: `3000`

### **Langkah 4.2: Environment Variables**

Di Coolify service settings → **"Environment Variables"** tab:

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=pickpoint-postgres
DB_PORT=5432
DB_NAME=pickpoint
DB_USER=pickpoint_user
DB_PASSWORD=SuperSecurePassword123!

# JWT (Generate 2x dengan: openssl rand -base64 32)
JWT_SECRET=your-random-secret-key-32-chars-here
JWT_REFRESH_SECRET=your-random-refresh-secret-key-here
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=https://admin.pickpoint.my.id,https://paket.pickpoint.my.id,http://localhost:5173

# WhatsApp (dari settings database)
WA_API_KEY=your-wa-gateway-key
WA_ENDPOINT=https://your-wa-gateway-endpoint

# Web Push VAPID (nanti untuk push notifications)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

### **Langkah 4.3: Network & Domain**

1. **Networks:** Connect ke `pickpoint-postgres` service
2. **Domain:** 
   - Primary domain: `api.pickpoint.my.id` (atau skip jika pakai proxy)
   - Let's Encrypt: Automatic
3. Click **"Deploy"** → Wait 3-5 minutes

### **Langkah 4.4: Verify Backend**

```bash
# Test health endpoint
curl https://api.pickpoint.my.id/health

# Expected:
# {"status":"ok","timestamp":"2025-12-15T..."}
```

✅ **Backend deployed!**

---

## **STEP 5: Deploy Frontend Service**

### **Langkah 5.1: Create Frontend Service**

1. **Coolify Dashboard** → "+ New" → **"Service"** → **"Docker"** → **"Git"**
2. **Configure:**
   - Name: `pickpoint-frontend`
   - GitHub Repo: `https://github.com/pickpointsystem-prog/Pickpoint`
   - Branch: `main`
   - Dockerfile Path: `Dockerfile` (root)
   - Port: `80`

### **Langkah 5.2: Build Arguments**

Di **"Build"** tab:
```
VITE_API_URL=https://api.pickpoint.my.id
```

### **Langkah 5.3: Domains**

Add 2 domains:

**Domain 1:**
- Domain: `admin.pickpoint.my.id`
- Port: `80`
- Path: `/` → Backend internal routing ke `/admin`

**Domain 2:**
- Domain: `paket.pickpoint.my.id`
- Port: `80`
- Path: `/` → Backend internal routing ke `/customer`

**SSL:** Let's Encrypt automatic ✅

### **Langkah 5.4: Persistent Storage (Optional)**

Jika ingin serve static files:
- Mount path: `/usr/share/nginx/html`
- Size: `5GB`

Click **"Deploy"** → Wait 3-5 minutes

### **Langkah 5.5: Verify Frontend**

```bash
# Test admin portal
curl https://admin.pickpoint.my.id

# Test customer portal  
curl https://paket.pickpoint.my.id

# Expected: HTML content
```

✅ **Frontend deployed!**

---

## **STEP 6: Configure Reverse Proxy (Optional)**

Jika ingin API & Frontend di satu domain:

### Langkah 6.1: Create Nginx Service

**Create new Docker service:**

```dockerfile
FROM nginx:alpine

COPY <<EOF /etc/nginx/conf.d/default.conf
upstream backend {
  server pickpoint-backend:3000;
}

upstream frontend {
  server pickpoint-frontend:80;
}

server {
  listen 80;
  server_name admin.pickpoint.my.id paket.pickpoint.my.id;
  
  # API routes → Backend
  location /api/ {
    proxy_pass http://backend;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
  }

  # Socket.io → Backend
  location /socket.io/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host \$host;
  }

  # Everything else → Frontend
  location / {
    proxy_pass http://frontend;
  }
}
EOF

CMD ["nginx", "-g", "daemon off;"]
```

---

## **STEP 7: Test Semua Flows**

### **Test 1: Staff Login**
```bash
curl -X POST https://api.pickpoint.my.id/api/auth/staff-login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Expected: 
# {
#   "accessToken": "eyJhbGciOiJIUzI1NiIs...",
#   "user": { "id": "user_admin", "username": "admin", ... }
# }
```

### **Test 2: Customer Register**
1. Open: `https://paket.pickpoint.my.id`
2. Click **"Daftar"**
3. Enter: Phone, Name, Unit
4. Should receive OTP via WhatsApp (jika configured)
5. Enter OTP, set PIN
6. Login dengan phone + PIN

### **Test 3: Admin Portal**
1. Open: `https://admin.pickpoint.my.id`
2. Login: `admin` / `admin123`
3. View packages, add new package
4. Check realtime updates (Socket.io working?)

### **Test 4: PWA Installation**
1. Open `https://admin.pickpoint.my.id/mobile`
2. Browser should show "Install" prompt
3. Click install → Should add to home screen
4. Launch as standalone app

### **Test 5: Push Notifications**
(After Web Push setup)

---

## **STEP 8: Monitor & Troubleshoot**

### **Langkah 8.1: Check Logs**

Di Coolify dashboard setiap service:
- **Logs** tab untuk error messages
- **Stats** untuk CPU/Memory usage

Common errors:

| Error | Solusi |
|-------|--------|
| `Connection refused to postgres` | Verify DB_HOST, passwords di .env |
| `Socket.io connection timeout` | Check CORS_ORIGIN, firewall ports |
| `404 Not Found API` | Verify backend service health, logs |
| `502 Bad Gateway` | Backend down atau not responding, check logs |

### **Langkah 8.2: Health Checks**

```bash
# Backend health
curl https://api.pickpoint.my.id/health

# Database connection (dari backend logs)
# Should show: "Connected to PostgreSQL"

# Socket.io test
# Open admin portal → Check browser console for socket connection
```

### **Langkah 8.3: Performance**

- Monitor CPU/Memory di Coolify dashboard
- If high usage: Scale up resources atau optimize queries
- Check slow queries: Enable query logging di PostgreSQL

---

## **STEP 9: Post-Deployment Checklist**

- [ ] All 3 services running (status = "Running" di Coolify)
- [ ] Domains resolving (DNS A record pointing ke Coolify IP)
- [ ] SSL certificates active (green lock 🔒)
- [ ] Database accessible
- [ ] Staff login working
- [ ] Customer portal working
- [ ] Socket.io events firing (check browser console)
- [ ] WA OTP sending (check database settings)
- [ ] Logs clean (no critical errors)
- [ ] Rate limiting working (test 6x login = blocked)

---

## **STEP 10: Backup & Monitoring (Optional)**

### **Backup Database**
```bash
# Daily backup to S3 atau Coolify backup service
pg_dump -h pickpoint-postgres \
        -U pickpoint_user \
        -d pickpoint > backup-$(date +%Y%m%d).sql
```

### **Monitoring**
- Setup uptime monitoring (UptimeRobot, Pingdom, dll)
- Email alerts untuk errors
- Regular log review

---

## 🎯 FINAL CHECKLIST

```bash
✅ GitHub pushed
✅ PostgreSQL deployed
✅ Database migrated  
✅ Backend deployed
✅ Frontend deployed
✅ Domains configured
✅ SSL working
✅ All tests passing
✅ Monitoring setup
✅ Team notified
✅ LIVE! 🎉
```

---

## 📞 TROUBLESHOOTING QUICK REFERENCE

**Backend won't connect to database:**
```sql
-- Check credentials
psql -h pickpoint-postgres -U pickpoint_user -d pickpoint
```

**Socket.io not connecting:**
- Check browser console: `connect_error: xhr poll error`
- Solution: Verify CORS_ORIGIN includes frontend domain

**Customer OTA not sending:**
- Check: `wa_api_key` di database settings
- Verify: WA_ENDPOINT environment variable di backend
- Check: Backend logs untuk WA API response

**PWA not installing:**
- Open DevTools → Application tab → Manifest
- Check: manifest.json syntax
- Requires: HTTPS + valid manifest

---

**Timeline:** ~1-2 hours untuk complete setup  
**Support:** Check logs first, then Coolify documentation  
**Status:** Ready to deploy! 🚀

