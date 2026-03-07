# Local Testing Guide

## Quick Start

### 1. Install Dependencies
```bash
cd /root/mekness
npm install
```

### 2. Configure Environment (if needed)
```bash
# Create .env file with minimum required variables
# At minimum, you need:
# SESSION_SECRET=your-random-secret-key
```

### 3. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Test Production Routes Locally

### User Routes
- ✅ **User Login**: http://localhost:5000/user/login
- ✅ **User Signup**: http://localhost:5000/user/signup
- ✅ **Alternative Login**: http://localhost:5000/signin
- ✅ **Alternative Signup**: http://localhost:5000/signup

### Admin Routes
- ✅ **Admin Secret Path**: http://localhost:5000/huwnymfphhrq/
- ✅ **Admin Secret Path (no slash)**: http://localhost:5000/huwnymfphhrq
- ✅ **Admin Login**: http://localhost:5000/admin/login
- ✅ **Admin Dashboard**: http://localhost:5000/admin/dashboard

## Verification Checklist

### ✅ Routes Working
- [ ] `/user/login` loads SignIn component
- [ ] `/user/signup` loads SignUp component
- [ ] `/huwnymfphhrq/` loads AdminLogin component
- [ ] `/huwnymfphhrq` loads AdminLogin component
- [ ] `/signin` loads SignIn component (backward compatibility)
- [ ] `/admin/login` loads AdminLogin component (backward compatibility)

### ✅ API Endpoints
- [ ] `POST /api/auth/signin` - User login works
- [ ] `POST /api/auth/signup` - User registration works
- [ ] `POST /api/admin/auth/signin` - Admin login works

## Testing Commands

### Check Server Status
```bash
# Check if server is running
curl http://localhost:5000

# Check specific routes
curl http://localhost:5000/user/login
curl http://localhost:5000/huwnymfphhrq/
```

### Browser Testing
1. Open browser
2. Navigate to: http://localhost:5000/user/login
3. Should see login form
4. Navigate to: http://localhost:5000/huwnymfphhrq/
5. Should see admin login form

## Troubleshooting

### Server Won't Start
1. Check Node.js version: `node --version` (should be 18+)
2. Install dependencies: `npm install`
3. Check for port conflicts: `lsof -i :5000` or `netstat -an | grep 5000`
4. Check environment variables: `npm run check-env`

### Routes Not Working
1. Verify routes in `client/src/App.tsx`
2. Check browser console for errors
3. Check server logs for routing errors
4. Clear browser cache and hard refresh

### API Errors
1. Check server is running: `curl http://localhost:5000/api/health`
2. Verify database connection: `npm run verify`
3. Check API routes in `server/routes.ts`

## Expected Behavior

### User Login Page (`/user/login`)
- Shows email/username and password fields
- Has "Sign In" button
- Has link to signup page
- Has "Forgot Password" link

### Admin Login Page (`/huwnymfphhrq/`)
- Shows username and password fields
- Has "Sign In" button
- Shows "Admin" branding
- Secure login form

## Next Steps After Local Testing

1. ✅ Verify all routes work
2. ✅ Test user registration
3. ✅ Test user login
4. ✅ Test admin login
5. ✅ Verify API endpoints respond correctly
6. ✅ Check for console errors
7. ✅ Test on different browsers

## Production Deployment

After local testing passes:
1. Commit changes
2. Push to repository
3. Deploy to production
4. Verify production URLs work:
   - https://new.mekness.com/user/login
   - https://new.mekness.com/huwnymfphhrq/

