"# 🌾 Sampark - Modular Offline Data Collection Toolkit for Panchayats

**Sampark** is an offline-first web application designed for rural Panchayat survey data collection. It enables field workers to collect comprehensive village data even without internet connectivity, with automatic synchronization when online.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Setup & Installation](#-setup--installation)
- [Usage Guide](#-usage-guide)
- [Offline-First Architecture](#-offline-first-architecture)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## ✨ Features

### 🔌 **Offline-First Data Collection**
- **Full offline functionality** - Create, edit, and view surveys without internet
- **IndexedDB storage** - All data stored locally in browser
- **Automatic sync** - Data syncs automatically when connection is restored
- **Conflict resolution** - Smart timestamp-based conflict detection and resolution
- **Sync queue management** - Pending operations tracked and retried automatically

### 📊 **Modular Survey System**
- **7 Survey Modules:**
  1. Basic Information (Demographics, household data)
  2. Infrastructure (Roads, buildings, public facilities)
  3. Sanitation (Toilets, drainage, waste disposal)
  4. Connectivity (Internet, mobile, transport)
  5. Land & Forest (Agriculture, land use, forestry)
  6. Electricity (Power supply, street lights)
  7. Waste Management (Collection, disposal, recycling)

- **Progress Tracking** - Real-time completion percentage per survey
- **Module-wise editing** - Work on individual modules independently
- **Auto-save** - Changes saved automatically to local storage

### 👥 **User Management**
- **Role-based access control:**
  - **Admin** - Full system access, user management
  - **Block Officer** - Access to all surveys in their block
  - **Staff** - Access to their own Panchayat's surveys only
  
- **JWT Authentication** - Secure token-based authentication
- **Session persistence** - Stay logged in across browser sessions

### 🔄 **Smart Synchronization**
- **Bidirectional sync** - Push local changes, pull server updates
- **Conflict detection** - Identifies and resolves data conflicts
- **Sync status indicators** - Visual feedback on sync state
- **Manual & automatic sync** - Trigger sync manually or let it happen automatically
- **Sync logs** - Complete audit trail of all sync operations

### 📱 **Modern UI/UX**
- **Responsive design** - Works on desktop, tablet, and mobile
- **Real-time status indicators** - Online/offline badge
- **Progress visualization** - Progress bars and completion status
- **Toast notifications** - User feedback for all operations
- **Loading states** - Clear feedback during data operations
- **Smooth animations** - Framer Motion for polished interactions

### 🔍 **Survey Management**
- **Search & filter** - Find surveys by village name or status
- **Sort by status** - All, Complete, In Progress, Pending Sync
- **View & Edit** - Navigate to detailed survey views
- **Delete** - Remove surveys (online & offline support)
- **Duplicate detection** - Prevent duplicate survey creation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │   React UI   │  │   Services   │  │   IndexedDB     │    │
│  │              │  │              │  │                 │    │
│  │ • Pages      │  │ • API        │  │ • Surveys       │    │
│  │ • Components │  │ • Sync       │  │ • Pending Sync  │    │
│  │ • Context    │  │ • Auth       │  │ • Sync Logs     │    │
│  └──────────────┘  └──────────────┘  └─────────────────┘    │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              │ REST API (Online)
                              │
┌────────────────────────▼────────────────────────────────────┐
│                        BACKEND                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │   FastAPI    │  │  SQLAlchemy  │  │   PostgreSQL    │    │
│  │              │  │              │  │                 │    │
│  │ • Routers    │  │ • Models     │  │ • Surveys       │    │
│  │ • Auth       │  │ • Relations  │  │ • Users         │    │
│  │ • Middleware │  │ • Validation │  │ • Panchayats    │    │
│  └──────────────┘  └──────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### **Data Flow**

1. **User creates survey offline** → Saved to IndexedDB → Added to pending sync queue
2. **Network detected** → Sync service triggers → Sends pending operations to backend
3. **Backend processes** → Validates → Saves to PostgreSQL → Returns confirmation
4. **Frontend updates** → Marks as synced → Removes from queue → Updates UI

---

## 🛠️ Tech Stack

### **Frontend**
- **React 19.1.1** - UI framework
- **React Router 7.9.5** - Navigation and routing
- **Axios** - HTTP client for API calls
- **IndexedDB** - Browser-based offline storage
- **Framer Motion 12.23.24** - Animations
- **React Hot Toast** - Notification system
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS (via DaisyUI)

### **Backend**
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Relational database
- **Pydantic** - Data validation
- **JWT (python-jose)** - Authentication tokens
- **Bcrypt** - Password hashing
- **Alembic** - Database migrations
- **Uvicorn** - ASGI server

---

## 🚀 Setup & Installation

### **Prerequisites**

- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** 14+
- **Git**

### **1. Clone Repository**

```bash
git clone https://github.com/namanxdev/Sampark.git
cd Sampark
```

### **2. Backend Setup**

#### **A. Create PostgreSQL Database**

```sql
CREATE DATABASE sampark_db;
CREATE USER sampark_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sampark_db TO sampark_user;
```

#### **B. Configure Environment**

Create `Backend/.env`:

```env
# Database
DATABASE_URL=postgresql://sampark_user:your_password@localhost:5432/sampark_db

# JWT Secret (generate with: openssl rand -hex 32)
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Server
HOST=0.0.0.0
PORT=8000

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### **C. Install Dependencies**

```bash
cd Backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### **D. Run Migrations**

```bash
alembic upgrade head
```

#### **E. Seed Database (Optional)**

```bash
python seed_data.py
```

This creates:
- **Admin user:** `admin` / `admin123`
- **Block Officer:** `block1` / `block123`
- **Staff users:** `staff1` / `staff123`, `staff2` / `staff123`
- **Sample Panchayats**

#### **F. Start Backend**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### **3. Frontend Setup**

#### **A. Install Dependencies**

```bash
cd frontend
npm install
```

#### **B. Configure Environment (Optional)**

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

#### **C. Start Frontend**

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 📖 Usage Guide

### **1. Login**

Navigate to `http://localhost:5173` and login with:

- **Admin:** `admin` / `admin123`
- **Staff:** `staff1` / `staff123`

### **2. Create a Survey**

1. Click **"New Survey"** button
2. Enter **Village Name**
3. Fill out any of the 7 modules
4. Data is **automatically saved** to IndexedDB
5. Complete percentage updates in real-time

### **3. Work Offline**

1. Disconnect from internet (or use DevTools offline mode)
2. **Offline badge** appears in navbar
3. Continue creating/editing surveys
4. All changes saved to **IndexedDB**
5. **Pending sync indicator** shows unsaved count

### **4. Sync Data**

**Automatic Sync:**
- Reconnect to internet
- Sync happens automatically in background
- Notification confirms successful sync

**Manual Sync:**
- Click **sync icon** in navbar
- See real-time sync progress
- View sync logs in Settings

### **5. Edit Survey**

1. Click **"View"** on any survey card
2. Navigate between modules using sidebar
3. Edit fields in any module
4. Changes auto-save to IndexedDB
5. Sync when online

### **6. Delete Survey**

1. Click **trash icon** on survey card
2. Confirm deletion
3. **Online:** Deleted immediately from server
4. **Offline:** Queued for deletion on next sync

### **7. View Sync Status**

- **Synced badge (green)** - Data on server matches local
- **Pending badge (yellow)** - Local changes not yet synced
- **Progress bar** - Shows module completion %
- **Sync indicator** - Shows pending operations count

---

## 🔄 Offline-First Architecture

### **How It Works**

#### **IndexedDB Structure**

```javascript
SamparkDB
├── surveys           // All survey data
│   ├── id (PK)
│   ├── survey_id     // Server ID
│   ├── local_id      // Local identifier
│   ├── synced        // Boolean sync status
│   └── [module data] // 7 modules as JSONB
│
├── pendingSync       // Sync queue
│   ├── id (PK)
│   ├── action        // create, update, delete
│   ├── data          // Operation payload
│   ├── synced        // Boolean
│   └── timestamp
│
├── syncLogs          // Sync history
│   ├── id (PK)
│   ├── status        // success, failed
│   ├── message
│   └── timestamp
│
└── schemas           // Module schemas (future)
```

#### **Sync Process**

```
┌─────────────────────────────────────────────────────────┐
│                    SYNC WORKFLOW                        │
└─────────────────────────────────────────────────────────┘

1. DETECT ONLINE
   ↓
2. GET PENDING OPERATIONS from IndexedDB
   ↓
3. FOR EACH OPERATION:
   │
   ├─ CREATE: POST /api/surveys
   │   ├─ Success → Mark synced, update local survey_id
   │   └─ 409 Conflict → Backend handles upsert
   │
   ├─ UPDATE: PUT /api/surveys/{id}
   │   ├─ Success → Mark synced
   │   └─ 409 Conflict → Check timestamps, resolve
   │
   └─ DELETE: DELETE /api/surveys/{id}
       ├─ Success → Mark synced, remove from IndexedDB
       └─ Error → Retry later
   ↓
4. PULL FROM SERVER
   ↓
5. UPDATE LOCAL DATABASE
   ↓
6. CLEAN UP COMPLETED OPERATIONS (>24h old)
   ↓
7. UPDATE SYNC STATUS in UI
```

#### **Conflict Resolution**

When both local and server have changes:

1. **Compare timestamps** - `client_timestamp` vs `server_timestamp`
2. **Newer wins** - Most recent update takes precedence
3. **Log conflict** - Record in sync_logs for audit
4. **Notify user** - Toast notification of resolution

#### **Preventing Infinite Loops**

Critical fix applied to prevent sync queue growth:

```javascript
// ❌ WRONG - Creates infinite loop
await indexedDBService.saveSurvey(survey);
// This adds to sync queue even during sync!

// ✅ CORRECT - Prevents loop
await indexedDBService.saveSurvey(survey, false);
// addToSyncQueue = false prevents re-queueing
```

---

## 📡 API Documentation

### **Authentication**

#### **POST** `/api/auth/login`
Login and get JWT token

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "user_id": "USER_001",
    "username": "admin",
    "role": "admin",
    "panchayat_id": null
  }
}
```

---

### **Surveys**

#### **GET** `/api/surveys`
Get all surveys (filtered by panchayat for staff)

**Query Params:**
- `panchayat_id` (optional) - Filter by panchayat
- `status` (optional) - Filter by status

**Response:**
```json
[
  {
    "survey_id": "SURVEY_1234567890_abc",
    "village_name": "Phulera",
    "panchayat_id": "PANCH_001",
    "completion_percentage": 85,
    "is_complete": false,
    "sync_status": "synced",
    "basic_info": {...},
    "infrastructure": {...},
    "created_at": "2025-10-29T12:00:00Z",
    "updated_at": "2025-10-30T10:30:00Z"
  }
]
```

#### **GET** `/api/surveys/{survey_id}`
Get single survey by ID

#### **POST** `/api/surveys`
Create new survey (with upsert on conflict)

**Request:**
```json
{
  "survey_id": "SURVEY_1234567890_abc",
  "panchayat_id": "PANCH_001",
  "village_name": "Phulera",
  "basic_info": {
    "total_households": 450,
    "total_population": 2100
  },
  "infrastructure": {},
  "client_timestamp": "2025-10-30T10:30:00Z"
}
```

**Response:** Same as survey object

#### **PUT** `/api/surveys/{survey_id}`
Update existing survey

#### **DELETE** `/api/surveys/{survey_id}`
Delete survey (with cascade delete of sync_logs)

**Permissions:**
- **Admin/Block Officer:** Can delete any survey
- **Staff:** Can only delete own panchayat's surveys

---

### **Sync**

#### **POST** `/api/sync/detect-conflicts`
Check for conflicts between local and server data

**Request:**
```json
{
  "surveys": [
    {
      "survey_id": "SURVEY_123",
      "client_timestamp": "2025-10-30T10:00:00Z",
      "updated_at": "2025-10-30T10:00:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "conflicts": [
    {
      "survey_id": "SURVEY_123",
      "conflict_type": "timestamp",
      "local_timestamp": "2025-10-30T10:00:00Z",
      "server_timestamp": "2025-10-30T11:00:00Z",
      "resolution": "server_newer"
    }
  ]
}
```

---

## 🗄️ Database Schema

### **Users Table**
```sql
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'staff',
    panchayat_id VARCHAR(50) REFERENCES panchayats(panchayat_id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Panchayats Table**
```sql
CREATE TABLE panchayats (
    panchayat_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    block VARCHAR(255),
    district VARCHAR(255),
    state VARCHAR(100),
    pin_code VARCHAR(10),
    contact_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Surveys Table**
```sql
CREATE TABLE surveys (
    survey_id VARCHAR(50) PRIMARY KEY,
    panchayat_id VARCHAR(50) REFERENCES panchayats(panchayat_id) NOT NULL,
    user_id VARCHAR(50) REFERENCES users(user_id) NOT NULL,
    village_name VARCHAR(255),
    
    -- Module data (JSONB for flexibility)
    basic_info JSONB,
    infrastructure JSONB,
    sanitation JSONB,
    connectivity JSONB,
    land_forest JSONB,
    electricity JSONB,
    waste_management JSONB,
    
    -- Completion tracking
    completion_percentage INTEGER DEFAULT 0,
    is_complete BOOLEAN DEFAULT FALSE,
    
    -- Sync tracking
    sync_status VARCHAR(20) DEFAULT 'pending',
    last_synced_at TIMESTAMP,
    version INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    client_timestamp TIMESTAMP,
    server_timestamp TIMESTAMP DEFAULT NOW()
);
```

### **Sync Logs Table**
```sql
CREATE TABLE sync_logs (
    log_id SERIAL PRIMARY KEY,
    survey_id VARCHAR(50) REFERENCES surveys(survey_id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES users(user_id) NOT NULL,
    operation VARCHAR(20),  -- create, update, conflict
    status VARCHAR(20),     -- success, failed, conflict
    conflicts JSONB,
    resolution VARCHAR(50),
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

---

## 🐛 Troubleshooting

### **Frontend Issues**

#### **Surveys showing "pending" when they're synced**
**Cause:** Server surveys not being saved to IndexedDB  
**Solution:** Fixed in latest version - `getSurveys()` now saves to IndexedDB

#### **Sync queue growing infinitely**
**Cause:** Sync operations creating new pending operations  
**Solution:** Use `addToSyncQueue=false` flag in all sync-related saves

#### **CORS errors on DELETE requests**
**Cause:** Backend error causing connection issues  
**Solution:** Fixed cascade delete on sync_logs relationship

---

### **Backend Issues**

#### **500 Error on survey deletion**
**Error:** `null value in column "survey_id" of relation "sync_logs" violates not-null constraint`  
**Cause:** Missing cascade delete on Survey → SyncLog relationship  
**Solution:** Added `cascade="all, delete-orphan"` to relationship

#### **Duplicate key violations on sync**
**Error:** `duplicate key value violates unique constraint "surveys_pkey"`  
**Cause:** Backend trying to INSERT existing survey  
**Solution:** Implemented upsert pattern in `create_survey` endpoint

#### **Database connection failed**
**Check:**
```bash
psql -U sampark_user -d sampark_db
```
**Fix:** Verify DATABASE_URL in `.env` is correct

---

### **Sync Issues**

#### **Sync not triggering automatically**
**Check:**
1. Online status indicator in navbar
2. Browser console for errors
3. Sync status in Settings page

**Debug:**
```javascript
// Open browser console
indexedDBService.getPendingSyncOperations().then(console.log)
```

#### **Clear all offline data**
```javascript
// In browser console
indexedDBService.clearAllData()
```

#### **Reset sync queue**
Open DevTools → Application → IndexedDB → SamparkDB → pendingSync → Clear

---

## 🔐 Security

- **JWT tokens** - Secure authentication
- **Password hashing** - Bcrypt for password storage
- **Role-based access** - Endpoint-level authorization
- **SQL injection protection** - SQLAlchemy parameterized queries
- **XSS protection** - React's built-in escaping
- **CORS configuration** - Restricted origins

---

## 📊 Performance

- **Lazy loading** - Components loaded on demand
- **IndexedDB indexing** - Fast local queries
- **Batch sync** - Multiple operations in single request
- **Debounced auto-save** - Prevents excessive saves
- **Optimistic UI updates** - Instant feedback

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Naman** - [@namanxdev](https://github.com/namanxdev)

---

## 🙏 Acknowledgments

- **FastAPI** - Amazing Python web framework
- **React** - Powerful UI library
- **IndexedDB** - Enabling offline-first architecture
- **Panchayat community** - Inspiration for building this tool

---

## 📞 Support

For issues and questions:
- GitHub Issues: [Report a bug](https://github.com/namanxdev/Sampark/issues)
- Email: support@sampark.dev

---

**Built with ❤️ for rural India's digital transformation**" 
