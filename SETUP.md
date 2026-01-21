# Setup & Testing Guide - Phase 1 MVP

## Quick Start Checklist

### 1. Prerequisites Installation
- [ ] Node.js (v14+) installed
- [ ] MongoDB installed and running (or MongoDB Atlas account)
- [ ] Cloudinary account created

### 2. Environment Setup

#### Backend Environment Variables
Create `backend/.env` file with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/damage-reporting
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**To get Cloudinary credentials:**
1. Go to https://cloudinary.com
2. Sign up for free account
3. Go to Dashboard
4. Copy Cloud Name, API Key, and API Secret

#### Frontend Environment Variables
Create `frontend/.env` file with:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies

From root directory:
```bash
npm run install-all
```

Or manually:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 4. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas:**
- Create cluster at https://www.mongodb.com/cloud/atlas
- Get connection string
- Update `MONGODB_URI` in `backend/.env`

### 5. Run the Application

**Option 1: Run both together (from root):**
```bash
npm run dev
```

**Option 2: Run separately:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### 6. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## Testing Phase 1 Features

### Test 1: User Registration
1. Go to http://localhost:3000
2. Click "Register here"
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
4. Click "Register"
5. ✅ Should redirect to Dashboard

### Test 2: User Login
1. Logout (if logged in)
2. Go to Login page
3. Enter credentials
4. Click "Login"
5. ✅ Should redirect to Dashboard

### Test 3: Submit Complaint
1. On Dashboard, click "+ New Complaint"
2. Fill in:
   - Upload an image (damage photo)
   - Location: "Room 101, Building A"
   - Category: Select any
   - Priority: Select any
   - Notes: "Broken chair leg"
3. Click "Submit Complaint"
4. ✅ Should see success and complaint appear in list

### Test 4: View Complaints (User)
1. On Dashboard, verify:
   - ✅ All your complaints are listed
   - ✅ Status badges show correctly
   - ✅ Priority badges show correctly
   - ✅ Images display properly

### Test 5: Create Admin Account
**Option A: Using MongoDB Compass**
1. Open MongoDB Compass
2. Connect to your database
3. Navigate to `damage-reporting` → `users`
4. Find your user document
5. Edit and change `role` from `"user"` to `"admin"`

**Option B: Using MongoDB Shell**
```bash
mongo
use damage-reporting
db.users.updateOne(
  { email: "test@example.com" },
  { $set: { role: "admin" } }
)
```

**Option C: Register new admin user**
1. Register a new user
2. Update role in database (as above)

### Test 6: Admin Dashboard
1. Login as admin
2. Should redirect to `/admin`
3. Verify:
   - ✅ Stats cards show correct numbers
   - ✅ Chart displays category statistics
   - ✅ Filters work (Category, Priority, Status)
   - ✅ All complaints are visible
   - ✅ Can change status using dropdown

### Test 7: Status Updates
1. As admin, find a complaint
2. Change status from dropdown:
   - Submitted → In-Progress
   - In-Progress → Resolved
3. ✅ Status should update immediately
4. Logout and login as the user who created complaint
5. ✅ User should see updated status

## Common Issues & Solutions

### Issue: MongoDB Connection Error
**Error:** `MongoDB Connection Error: connect ECONNREFUSED`
**Solution:**
- Make sure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `backend/.env`
- For MongoDB Atlas, ensure IP is whitelisted

### Issue: Cloudinary Upload Error
**Error:** `Invalid API Key` or upload fails
**Solution:**
- Verify Cloudinary credentials in `backend/.env`
- Check that credentials match your Cloudinary dashboard
- Ensure no extra spaces in `.env` file

### Issue: CORS Error
**Error:** `Access to XMLHttpRequest blocked by CORS policy`
**Solution:**
- Verify `REACT_APP_API_URL` in `frontend/.env`
- Check backend is running on port 5000
- Clear browser cache

### Issue: JWT Token Error
**Error:** `Token is not valid`
**Solution:**
- Logout and login again
- Check `JWT_SECRET` in `backend/.env` hasn't changed
- Clear browser localStorage

### Issue: Images Not Displaying
**Solution:**
- Check Cloudinary upload was successful
- Verify image URL in browser console
- Check network tab for failed requests

### Issue: Port Already in Use
**Error:** `Port 5000 is already in use`
**Solution:**
- Change `PORT` in `backend/.env` to different port (e.g., 5001)
- Update `REACT_APP_API_URL` in `frontend/.env` accordingly

## Next Steps (Phase 2)
Once Phase 1 is tested and working:
- Set up Python ML environment
- Train category classifier
- Train priority predictor
- Set up FastAPI server
- Integrate ML models with backend

## Debugging Tips

1. **Check Backend Logs:**
   - Look for errors in terminal running `npm run dev` in backend
   - Check MongoDB connection messages

2. **Check Frontend Console:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed API calls

3. **Verify Environment Variables:**
   - Make sure `.env` files are in correct locations
   - No quotes around values in `.env` files
   - Restart server after changing `.env`

4. **Test API Endpoints:**
   - Use Postman or curl to test backend directly
   - Health check: `curl http://localhost:5000/api/health`

