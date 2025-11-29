# Pickpoint Dashboard - Deployment Guide

## 🌐 Domain Architecture

### Production (LIVE)
- **Public Domain**: `pickpoint.my.id`
  - Landing page, tracking, public forms
  - **Status**: ✅ LIVE
  
- **Admin Domain**: `admin.pickpoint.my.id`
  - Dashboard, admin panel, management
  - **Status**: ✅ LIVE

### QA/Pre-Production
- **Domain**: `qa.pickpoint.my.id`
  - Testing environment before production
  - Full feature testing
  - **Purpose**: Pre-production validation

### Demo
- **Domain**: `demo.pickpoint.my.id`
  - Client demonstrations
  - Sample data for presentations
  - **Purpose**: Sales & client showcase

### Development
- **Local**: `localhost:5173`
  - Local development environment
  - Hot module replacement enabled

---

## 🚀 Deployment Commands

### Build Commands

```bash
# Development build
npm run dev

# Production build (for pickpoint.my.id & admin.pickpoint.my.id)
npm run build:production

# QA build (for qa.pickpoint.my.id)
npm run build:qa

# Demo build (for demo.pickpoint.my.id)
npm run build:demo
```

### Preview Commands

```bash
# Preview production build locally
npm run preview:production

# Preview QA build locally
npm run preview:qa

# Preview demo build locally
npm run preview:demo
```

---

## ⚙️ Environment Configuration

### Setup Steps

1. **Copy environment template**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure for your environment**
   - Edit `.env.local` for local development
   - `.env.production` is used for production builds
   - `.env.qa` is used for QA builds
   - `.env.demo` is used for demo builds

3. **Required Variables**
   ```env
   VITE_APP_ENV=production
   VITE_WHATSAPP_TOKEN=your_token_here
   VITE_PUBLIC_DOMAIN=pickpoint.my.id
   VITE_ADMIN_DOMAIN=admin.pickpoint.my.id
   ```

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_APP_ENV` | Environment name | `production`, `qa`, `demo`, `development` |
| `VITE_WHATSAPP_TOKEN` | WhatsApp API token | Your API key |
| `VITE_WHATSAPP_API_URL` | WhatsApp API endpoint | `https://api.whatsapp.com/send` |
| `VITE_PUBLIC_DOMAIN` | Public domain | `pickpoint.my.id` |
| `VITE_ADMIN_DOMAIN` | Admin domain | `admin.pickpoint.my.id` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `true` / `false` |
| `VITE_ENABLE_DEBUG_MODE` | Enable debug logs | `true` / `false` |
| `VITE_STORAGE_PREFIX` | LocalStorage prefix | `pickpoint_` |
| `VITE_SESSION_TIMEOUT` | Session timeout (ms) | `3600000` (1 hour) |
| `VITE_MAX_LOGIN_ATTEMPTS` | Max login tries | `5` |

---

## 🔒 Security Features

### Implemented
- ✅ Environment-specific storage prefixes
- ✅ Session timeout management
- ✅ Max login attempts limiting
- ✅ Security headers in Vercel config
- ✅ XSS protection headers
- ✅ Frame protection
- ✅ Content-Type nosniff

### Vercel Security Headers
```json
{
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
}
```

---

## 📦 Vercel Deployment

### Automatic Deployment
Connect your GitHub repository to Vercel. Configure multiple projects:

1. **Production Project**
   - Domain: `admin.pickpoint.my.id`
   - Branch: `main`
   - Build command: `npm run build:production`
   - Environment: Load from `.env.production`

2. **QA Project**
   - Domain: `qa.pickpoint.my.id`
   - Branch: `qa` or `develop`
   - Build command: `npm run build:qa`
   - Environment: Load from `.env.qa`

3. **Demo Project**
   - Domain: `demo.pickpoint.my.id`
   - Branch: `demo`
   - Build command: `npm run build:demo`
   - Environment: Load from `.env.demo`

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# Deploy to specific project
vercel --prod --scope=your-team --project=pickpoint-admin
```

---

## 🧪 Testing Before Deployment

### 1. Local Testing
```bash
# Build for target environment
npm run build:production

# Preview the build
npm run preview:production
```

### 2. Environment Verification
Check console for environment info:
```javascript
// In browser console
console.log('Environment:', import.meta.env.VITE_APP_ENV);
console.log('Public Domain:', import.meta.env.VITE_PUBLIC_DOMAIN);
```

### 3. Feature Flags Check
- Analytics enabled/disabled
- Debug mode on/off
- Notifications working

---

## 🗂️ Storage Isolation

Each environment uses separate localStorage keys:

| Environment | Storage Prefix | Example Key |
|-------------|---------------|-------------|
| Production | `pickpoint_` | `pickpoint_packages` |
| QA | `pickpoint_qa_` | `pickpoint_qa_packages` |
| Demo | `pickpoint_demo_` | `pickpoint_demo_packages` |
| Development | `pickpoint_dev_` | `pickpoint_dev_packages` |

This prevents data conflicts when testing multiple environments.

---

## 📊 Monitoring & Debug

### Enable Debug Mode
Set in `.env.local`:
```env
VITE_ENABLE_DEBUG_MODE=true
```

### Debug Logs
- ✅ Environment configuration on startup
- ✅ Storage operations (key, item count)
- ✅ WhatsApp notifications (recipient, tracking, success)
- ✅ Domain routing information

### Browser Console
```javascript
// Check environment config
console.log(config);

// View current storage
localStorage.getItem('pickpoint_dev_packages');
```

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build:production
```

### Environment Variables Not Loading
- Ensure file is named correctly (`.env.production`, not `.env.prod`)
- Restart dev server after changing env files
- Check Vercel dashboard for environment variables

### Storage Issues
- Check browser console for storage prefix
- Clear localStorage if switching environments
- Verify `VITE_STORAGE_PREFIX` in env file

### Domain Routing Issues
- Verify DNS settings point to Vercel
- Check Vercel project domain configuration
- Ensure `VITE_PUBLIC_DOMAIN` matches actual domain

---

## 📞 Support

For deployment issues or questions:
- Check GitHub Issues
- Review Vercel deployment logs
- Contact team lead

---

**Last Updated**: 2025-11-29
**Version**: 1.0.0
