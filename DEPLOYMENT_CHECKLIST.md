# ✅ COOLIFY DEPLOYMENT - PRE-LAUNCH CHECKLIST

**Status:** Ready to Deploy  
**Last Updated:** December 15, 2025

---

## 🔐 CREDENTIALS & SECRETS (Simpan di Safe Place)

### Database Credentials
```
Database: pickpoint
Host: pickpoint-postgres (internal)
Port: 5432
Username: pickpoint_user
Password: [GANTI - Generate strong password]
```

### JWT Secrets (Generate baru setiap environment)
```bash
# Run di terminal:
openssl rand -base64 32  # Copy ke JWT_SECRET
openssl rand -base64 32  # Copy ke JWT_REFRESH_SECRET
```

### WhatsApp Gateway
```
API Key: [dari provider Anda: MessageBird, Twilio, dll]
Endpoint: [dari provider]
Sender: PickPoint
```

### Domains & SSL
```
Admin: admin.pickpoint.my.id
Customer: paket.pickpoint.my.id
API: api.pickpoint.my.id (optional)

SSL: Let's Encrypt (automatic di Coolify)
```

---

## 📝 ENVIRONMENT CONFIGURATION

### Backend `.env` (Auto-generated di Coolify)

```env
# Server Config
PORT=3000
NODE_ENV=production

# Database
DB_HOST=pickpoint-postgres
DB_PORT=5432
DB_NAME=pickpoint
DB_USER=pickpoint_user
DB_PASSWORD=[SECURE_PASSWORD]

# JWT Authentication
JWT_SECRET=[RANDOM_32_CHARS]
JWT_REFRESH_SECRET=[RANDOM_32_CHARS]
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
OTP_EXPIRY_MINUTES=10

# CORS (hanya terima dari domain resmi)
CORS_ORIGIN=https://admin.pickpoint.my.id,https://paket.pickpoint.my.id

# WhatsApp Integration
WA_API_KEY=[YOUR_KEY]
WA_ENDPOINT=[YOUR_ENDPOINT]
WA_SENDER=PickPoint

# Web Push (optional, untuk notifikasi)
VAPID_PUBLIC_KEY=[GENERATE_LATER]
VAPID_PRIVATE_KEY=[GENERATE_LATER]
```

### Frontend `.env.production` (Di Coolify build args)
```
VITE_API_URL=https://api.pickpoint.my.id
```

---

## 🎯 DEPLOYMENT SEQUENCE (PENTING)

**JANGAN SKIP URUTAN INI:**

1. ✅ **PostgreSQL Service** → Deploy & wait ready
2. ✅ **Database Migration** → Apply schema
3. ✅ **Backend Service** → Deploy & test `/health`
4. ✅ **Frontend Service** → Deploy & test landing page
5. ✅ **Reverse Proxy** (optional) → Configure domains

---

## 📋 QUICK DEPLOYMENT COMMAND REFERENCE

### Login ke Coolify
```bash
# Via Coolify CLI (jika available)
coolify login
coolify deploy service pickpoint-postgres
coolify deploy service pickpoint-backend
coolify deploy service pickpoint-frontend
```

### Manual di Coolify Dashboard
1. Click service
2. Click "Deploy" button
3. Wait build process (5-10 min per service)

---

## 🧪 VALIDATION TESTS (Setelah Deploy)

### Test 1: Database Connection
```bash
psql -h [COOLIFY_HOST] -U pickpoint_user -d pickpoint -c "SELECT COUNT(*) FROM users;"
# Expected: 1 (admin user)
```

### Test 2: Backend API
```bash
# Health check
curl https://api.pickpoint.my.id/health
# Expected: {"status":"ok"}

# Staff login
curl -X POST https://api.pickpoint.my.id/api/auth/staff-login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# Expected: 200 with accessToken
```

### Test 3: Frontend
```bash
# Admin portal
curl https://admin.pickpoint.my.id | head -20
# Expected: HTML with Pickpoint branding

# Customer portal
curl https://paket.pickpoint.my.id | head -20
# Expected: HTML login form
```

### Test 4: Realtime (Socket.io)
- Open https://admin.pickpoint.my.id/mobile
- Open browser DevTools → Console
- Should see: `[Socket] Staff connected:` message
- If error: Check CORS_ORIGIN, check backend logs

### Test 5: Customer Flow
- Go to https://paket.pickpoint.my.id
- Register dengan nomor HP
- Input OTA (jika WA configured, terima via WA)
- Set PIN
- Login & view packages

---

## 🔧 COMMON ISSUES & FIXES

### Issue: "Connection refused to PostgreSQL"
**Fix:**
- Check DB_HOST = `pickpoint-postgres` (exact name)
- Check DB_PASSWORD matches Coolify service config
- Verify database service is running
- Check network connection between backend & postgres

### Issue: "Socket.io connection timeout"
**Fix:**
- Check CORS_ORIGIN includes frontend domain
- Verify backend service is running
- Check firewall port 3000 is accessible
- Restart backend service

### Issue: "OTP not sending"
**Fix:**
- Check WA_API_KEY is valid
- Check WA_ENDPOINT is correct
- Verify wa_api_key di database settings
- Check backend logs untuk error message

### Issue: "SSL certificate not working"
**Fix:**
- Wait 5-10 minutes untuk Let's Encrypt (automatic)
- Check domain DNS pointing ke Coolify IP
- Verify A record created
- Restart Coolify service if needed

### Issue: "502 Bad Gateway"
**Fix:**
- Check backend service is running
- View backend service logs
- Restart backend service
- Verify database connectivity

---

## 📊 MONITORING SETUP

### Health Checks (Coolify Built-in)
```
Backend: GET /health → Expected: 200
Database: Connection test
Frontend: Served static files
```

### Performance Metrics
- Monitor CPU/Memory per service
- Alert if > 80% usage
- Review logs daily

### External Monitoring (Optional)
```bash
# UptimeRobot
- Monitor: https://api.pickpoint.my.id/health
- Interval: 5 minutes
- Alert: email

# Sentry.io (Error tracking)
- Install Sentry in backend
- Track API errors automatically
```

---

## 🔒 SECURITY HARDENING

Before go-live:

- [ ] Change default admin password (via API)
- [ ] Enable rate limiting in auth routes
- [ ] Verify CORS origin whitelist
- [ ] Check no secrets in logs
- [ ] Setup SSL certificates (auto di Coolify)
- [ ] Enable database backups
- [ ] Setup access logs monitoring
- [ ] Test password hashing (bcrypt)
- [ ] Verify OTP expiry (10 minutes)

---

## 🎬 GO-LIVE SCHEDULE

**Recommended:**
- **Day 1:** Setup infrastructure (Step 1-3)
- **Day 2:** Deploy services (Step 4-6)
- **Day 3:** Testing & validation (Step 7-8)
- **Day 4:** Security hardening & monitoring (Step 9)
- **Day 5:** Soft launch to beta users
- **Day 6-7:** Monitor & fix bugs
- **Day 8:** Public launch 🎉

---

## 📞 DEPLOYMENT SUPPORT CONTACTS

If stuck:
1. Check logs in Coolify dashboard
2. Review this guide's troubleshooting section
3. Check GitHub issues: https://github.com/pickpointsystem-prog/Pickpoint/issues
4. Contact Coolify support: https://coolify.io/docs

---

## ✨ FINAL NOTES

- **Backup Database:** Daily automated backup recommended
- **Monitor Logs:** Check Coolify dashboard daily first week
- **User Training:** Prepare docs untuk staff & customer
- **Rollback Plan:** Keep previous version tagged di GitHub
- **Documentation:** Keep this checklist updated

---

**Status:** ✅ READY TO DEPLOY  
**Confidence:** 90%  
**Estimated Time:** 4-8 hours total  
**Risk Level:** MEDIUM-LOW (infrastructure proven)

---

**Last Updated:** December 15, 2025  
**Next Review:** After first 24 hours in production
