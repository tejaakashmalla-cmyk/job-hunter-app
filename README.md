# 🎯 Job Hunter App — Full Stack MERN

A location-aware job platform. **Owners** post jobs. **Hunters** find nearby opportunities within 5km.

---

## 📁 Project Structure

```
job-hunter/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register + Login logic
│   │   └── jobController.js      # Create, list, nearby jobs
│   ├── middleware/
│   │   └── auth.js               # JWT protect + role authorize
│   ├── models/
│   │   ├── User.js               # User schema (bcrypt, roles)
│   │   └── Job.js                # Job schema (GeoJSON, 2dsphere)
│   ├── routes/
│   │   ├── authRoutes.js         # POST /register, /login
│   │   └── jobRoutes.js          # POST /jobs, GET /my, /nearby
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express app entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── ProtectedRoute.js # Role-based route guard
    │   ├── context/
    │   │   └── AuthContext.js    # Global auth state
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── OwnerDashboard.js # Post jobs + Google Maps Autocomplete
    │   │   └── HunterDashboard.js# Find nearby jobs + Google Map
    │   ├── services/
    │   │   └── api.js            # Axios + API calls
    │   ├── App.js
    │   ├── index.css
    │   └── index.js
    ├── .env.example
    └── package.json
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** (local) or MongoDB Atlas account
- **Google Maps API Key** (Maps JS API + Places API + Geocoding API)

---

## 🚀 Step-by-Step Setup

### Step 1 — Clone / Navigate to Project

```bash
cd job-hunter
```

---

### Step 2 — Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
MONGO_URI=mongodb://localhost:27017/jobhunter
JWT_SECRET=replace_with_a_long_random_string
PORT=5000
```

> **MongoDB Atlas**: Replace MONGO_URI with your Atlas connection string.

Start the backend:

```bash
# Development (auto-reload)
npm run dev

# OR production
npm start
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running on http://localhost:5000
```

---

### Step 3 — Frontend Setup

```bash
cd ../frontend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

Opens at **http://localhost:3000**

---

## 🗝️ Google Maps API Key Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
4. Create credentials → API Key
5. Paste into `frontend/.env` as `REACT_APP_GOOGLE_MAPS_API_KEY`

> **Note**: The app works without a Maps key (location detection and job search still works), but autocomplete and the map view require it.

---

## 🔌 API Reference

### Auth Endpoints (Public)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |

**Register body:**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123",
  "role": "owner"
}
```

**Login body:**
```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

---

### Job Endpoints (Protected — Bearer Token required)

| Method | Route | Role | Description |
|--------|-------|------|-------------|
| POST | `/api/jobs` | owner | Post a new job |
| GET | `/api/jobs/my` | owner | Get my job listings |
| GET | `/api/jobs/nearby?lat=xx&lng=xx` | hunter | Find jobs within 5km |

**Create Job body:**
```json
{
  "title": "React Developer",
  "education": "B.Tech",
  "salary": 60000,
  "address": "Hyderabad, India",
  "latitude": 17.3850,
  "longitude": 78.4867
}
```

**Authorization header:**
```
Authorization: Bearer <jwt_token>
```

---

## 🧪 Quick Test (using curl)

```bash
# Register an owner
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com","password":"test123","role":"owner"}'

# Post a job (replace TOKEN)
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Node Dev","salary":50000,"address":"Mumbai","latitude":19.076,"longitude":72.877}'

# Register a hunter
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@test.com","password":"test123","role":"hunter"}'

# Find nearby jobs (replace TOKEN)
curl "http://localhost:5000/api/jobs/nearby?lat=19.076&lng=72.877" \
  -H "Authorization: Bearer TOKEN"
```

---

## 🔐 Security Features

- Passwords hashed with **bcryptjs** (salt rounds: 10)
- **JWT tokens** expire in 7 days
- **Role-based access control** on all job routes
- CORS restricted to `localhost:3000`

---

## 💡 Suggested Improvements

### 🔧 Backend
1. **Pagination** — Add `?page=1&limit=10` to job queries
2. **Job update/delete** — PUT/DELETE `/api/jobs/:id` for owners
3. **Search radius config** — Let hunter pass `?radius=10` for 10km
4. **Email verification** — Confirm email before allowing login
5. **Rate limiting** — Use `express-rate-limit` to prevent abuse
6. **Input validation** — Add `express-validator` for cleaner validation
7. **Refresh tokens** — Short-lived access tokens + refresh token rotation

### 🎨 Frontend
1. **Apply to job** — Hunters send applications, stored in DB
2. **Job filters** — Filter by salary range, education, date posted
3. **Notifications** — WebSocket or polling for new nearby jobs
4. **Profile page** — Edit name, upload avatar
5. **Dark/Light toggle** — Theme switcher
6. **PWA** — Make it installable as a mobile app
7. **Real-time map** — Auto-refresh nearby jobs as user moves

### 🚀 Deployment
1. **Backend** → Railway, Render, or AWS EC2
2. **Frontend** → Vercel or Netlify
3. **Database** → MongoDB Atlas (free tier)
4. **Environment** → Use separate `.env.production` files
