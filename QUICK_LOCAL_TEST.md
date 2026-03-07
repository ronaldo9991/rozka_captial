# Quick Local Testing Guide

## Prerequisites

1. **Node.js 18+** installed
2. **npm** installed
3. **Dependencies** installed

## Setup Steps

### 1. Install Dependencies
```bash
cd /root/mekness
npm install
```

### 2. Create .env File (if needed)
```bash
# Minimum required
echo "SESSION_SECRET=$(openssl rand -base64 32)" > .env
```

### 3. Start Development Server
```bash
npm run dev
```

Server will start on: **http://localhost:5000**

## Test Production Routes

### Option 1: Browser Testing (Recommended)

Open these URLs in your browser:

**User Routes:**
- http://localhost:5000/user/login ✅
- http://localhost:5000/user/signup ✅
- http://localhost:5000/signin ✅ (backward compatibility)

**Admin Routes:**
- http://localhost:5000/huwnymfphhrq/ ✅
- http://localhost:5000/huwnymfphhrq ✅
- http://localhost:5000/admin/login ✅ (backward compatibility)

### Option 2: Script Testing

```bash
# Run test script
./test-routes-local.sh
```

### Option 3: Manual curl Testing

```bash
# Test user login
curl http://localhost:5000/user/login

# Test admin login
curl http://localhost:5000/huwnymfphhrq/

# Check HTTP status
curl -I http://localhost:5000/user/login
```

## Expected Results

### ✅ Success Indicators

1. **Server starts** without errors
2. **Routes load** in browser (may show 404 in curl - that's OK for SPA)
3. **Login forms appear** correctly
4. **No console errors** in browser
5. **API endpoints** respond correctly

### ⚠️ Common Issues

**Server won't start:**
- Check Node.js version: `node --version`
- Install dependencies: `npm install`
- Check port 5000 is free

**Routes return 404 in curl:**
- This is **normal** for Single Page Applications (SPA)
- React Router handles routing client-side
- Test in browser instead

**Routes don't work in browser:**
- Check browser console for errors
- Verify routes in `client/src/App.tsx`
- Clear browser cache

## Verification Checklist

- [ ] Server starts successfully
- [ ] `/user/login` shows login form
- [ ] `/user/signup` shows signup form
- [ ] `/huwnymfphhrq/` shows admin login form
- [ ] `/signin` works (backward compatibility)
- [ ] `/admin/login` works (backward compatibility)
- [ ] No console errors
- [ ] Forms are functional

## Next Steps

After local testing:
1. ✅ All routes work
2. ✅ Forms are functional
3. ✅ Ready for production deployment

## Production URLs

Once deployed, these will work:
- https://new.mekness.com/user/login
- https://new.mekness.com/huwnymfphhrq/

