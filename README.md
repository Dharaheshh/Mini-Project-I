# Smart College Damage Reporting System

A MERN stack application with AI/ML capabilities for reporting and managing college infrastructure damage.

## Features

### Phase 1 - MVP (Current)
- ✅ User authentication (Register/Login)
- ✅ Image upload with Cloudinary
- ✅ Complaint submission (Image + Location + Note)
- ✅ Status tracking (Submitted → In-Progress → Resolved)
- ✅ Admin dashboard with filters
- ✅ Category and Priority management

### Phase 2 - ML Integration (Upcoming)
- Damage Category Classification (CNN)
- Priority Prediction (AI-based)
- Severity Detection
- Duplicate Complaint Detection
- Auto Description Generator

### Phase 3 - Smart Automation (Upcoming)
- Auto-assign priority
- Auto-alerts for high-priority issues
- Duplicate detection

### Phase 4 - Polish (Upcoming)
- Analytics dashboard
- Heatmap of problem locations
- Role-based admin access

## Tech Stack

- **Frontend**: React, Tailwind CSS, Zustand, Chart.js
- **Backend**: Node.js, Express, MongoDB, JWT
- **Image Upload**: Cloudinary
- **AI/ML**: Python, PyTorch, FastAPI (Phase 2)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for image uploads)

### Installation

1. **Install root dependencies:**
   ```bash
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

4. **Configure environment variables:**

   Create `backend/.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/damage-reporting
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

   Create `frontend/.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   ```

6. **Run the application:**

   From root directory:
   ```bash
   npm run dev
   ```

   Or run separately:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## Default Admin Account

To create an admin account, you can either:
1. Manually update the user role in MongoDB
2. Use MongoDB Compass or mongo shell:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Complaints
- `POST /api/complaints` - Create complaint (with image)
- `GET /api/complaints` - Get user's complaints
- `GET /api/complaints/:id` - Get single complaint

### Admin
- `GET /api/admin/complaints` - Get all complaints (with filters)
- `PUT /api/admin/complaints/:id/status` - Update complaint status
- `PUT /api/admin/complaints/:id` - Update complaint details
- `GET /api/admin/stats` - Get dashboard statistics

## Project Structure

```
miniproject-1/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Complaint.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── complaints.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   └── public/
└── package.json
```

## Development Status

- [x] Phase 1 - MVP
- [ ] Phase 2 - ML Integration
- [ ] Phase 3 - Smart Automation
- [ ] Phase 4 - Polish

## License

ISC

