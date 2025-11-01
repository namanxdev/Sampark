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

## 🌍 Multilingual Support (i18n)

Sampark can be extended to support multiple languages for rural India's diverse linguistic landscape. Here's how to implement internationalization:

### **Recommended Approach: react-i18next**

#### **1. Install Dependencies**

```bash
cd frontend
npm install react-i18next i18next i18next-browser-languagedetector
```

#### **2. Project Structure**

```
frontend/
└── src/
    ├── i18n/
    │   ├── config.js           # i18n configuration
    │   └── locales/
    │       ├── en/
    │       │   ├── common.json      # Common UI text
    │       │   ├── auth.json        # Login/auth
    │       │   ├── survey.json      # Survey forms
    │       │   └── modules.json     # Module-specific
    │       ├── hi/              # Hindi
    │       │   ├── common.json
    │       │   ├── auth.json
    │       │   ├── survey.json
    │       │   └── modules.json
    │       ├── pa/              # Punjabi
    │       ├── bn/              # Bengali
    │       ├── ta/              # Tamil
    │       ├── te/              # Telugu
    │       └── mr/              # Marathi
    └── main.jsx
```

#### **3. Configure i18n**

Create `frontend/src/i18n/config.js`:

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enSurvey from './locales/en/survey.json';
import enModules from './locales/en/modules.json';

import hiCommon from './locales/hi/common.json';
import hiAuth from './locales/hi/auth.json';
import hiSurvey from './locales/hi/survey.json';
import hiModules from './locales/hi/modules.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    survey: enSurvey,
    modules: enModules,
  },
  hi: {
    common: hiCommon,
    auth: hiAuth,
    survey: hiSurvey,
    modules: hiModules,
  },
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next)  // Pass i18n to react-i18next
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    
    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'], // Save preference
    },
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;
```

#### **4. Initialize in main.jsx**

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n/config'; // Import i18n config

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

#### **5. Create Translation Files**

**`frontend/src/i18n/locales/en/common.json`:**
```json
{
  "app_name": "Sampark",
  "welcome": "Welcome",
  "logout": "Logout",
  "settings": "Settings",
  "dashboard": "Dashboard",
  "surveys": "Surveys",
  "new_survey": "New Survey",
  "search": "Search",
  "filter": "Filter",
  "save": "Save",
  "cancel": "Cancel",
  "delete": "Delete",
  "edit": "Edit",
  "view": "View",
  "loading": "Loading...",
  "online": "Online",
  "offline": "Offline",
  "sync": "Sync",
  "syncing": "Syncing...",
  "synced": "Synced",
  "pending": "Pending"
}
```

**`frontend/src/i18n/locales/hi/common.json`:**
```json
{
  "app_name": "संपर्क",
  "welcome": "स्वागत है",
  "logout": "लॉग आउट",
  "settings": "सेटिंग्स",
  "dashboard": "डैशबोर्ड",
  "surveys": "सर्वेक्षण",
  "new_survey": "नया सर्वेक्षण",
  "search": "खोजें",
  "filter": "फ़िल्टर",
  "save": "सहेजें",
  "cancel": "रद्द करें",
  "delete": "हटाएं",
  "edit": "संपादित करें",
  "view": "देखें",
  "loading": "लोड हो रहा है...",
  "online": "ऑनलाइन",
  "offline": "ऑफ़लाइन",
  "sync": "सिंक करें",
  "syncing": "सिंक हो रहा है...",
  "synced": "सिंक किया गया",
  "pending": "लंबित"
}
```

**`frontend/src/i18n/locales/en/survey.json`:**
```json
{
  "village_name": "Village Name",
  "panchayat": "Panchayat",
  "completion": "Completion",
  "status": "Status",
  "created": "Created",
  "updated": "Updated",
  "progress": "Progress",
  "complete": "Complete",
  "in_progress": "In Progress",
  "modules": {
    "basic_info": "Basic Information",
    "infrastructure": "Infrastructure",
    "sanitation": "Sanitation",
    "connectivity": "Connectivity",
    "land_forest": "Land & Forest",
    "electricity": "Electricity",
    "waste_management": "Waste Management"
  }
}
```

**`frontend/src/i18n/locales/hi/survey.json`:**
```json
{
  "village_name": "गांव का नाम",
  "panchayat": "पंचायत",
  "completion": "पूर्णता",
  "status": "स्थिति",
  "created": "बनाया गया",
  "updated": "अपडेट किया गया",
  "progress": "प्रगति",
  "complete": "पूर्ण",
  "in_progress": "प्रगति में",
  "modules": {
    "basic_info": "बुनियादी जानकारी",
    "infrastructure": "बुनियादी ढांचा",
    "sanitation": "स्वच्छता",
    "connectivity": "कनेक्टिविटी",
    "land_forest": "भूमि और वन",
    "electricity": "बिजली",
    "waste_management": "अपशिष्ट प्रबंधन"
  }
}
```

**`frontend/src/i18n/locales/en/modules.json`:**
```json
{
  "basic_info": {
    "title": "Basic Information",
    "total_households": "Total Households",
    "total_population": "Total Population",
    "male_population": "Male Population",
    "female_population": "Female Population",
    "sc_population": "SC Population",
    "st_population": "ST Population"
  },
  "infrastructure": {
    "title": "Infrastructure",
    "paved_roads": "Paved Roads (km)",
    "unpaved_roads": "Unpaved Roads (km)",
    "public_buildings": "Public Buildings",
    "schools": "Schools",
    "health_centers": "Health Centers"
  }
}
```

**`frontend/src/i18n/locales/hi/modules.json`:**
```json
{
  "basic_info": {
    "title": "बुनियादी जानकारी",
    "total_households": "कुल परिवार",
    "total_population": "कुल जनसंख्या",
    "male_population": "पुरुष जनसंख्या",
    "female_population": "महिला जनसंख्या",
    "sc_population": "अनुसूचित जाति जनसंख्या",
    "st_population": "अनुसूचित जनजाति जनसंख्या"
  },
  "infrastructure": {
    "title": "बुनियादी ढांचा",
    "paved_roads": "पक्की सड़कें (किमी)",
    "unpaved_roads": "कच्ची सड़कें (किमी)",
    "public_buildings": "सार्वजनिक भवन",
    "schools": "विद्यालय",
    "health_centers": "स्वास्थ्य केंद्र"
  }
}
```

#### **6. Use in Components**

**Basic Usage:**

```jsx
import { useTranslation } from 'react-i18next';

function Navbar() {
  const { t } = useTranslation('common');
  
  return (
    <nav>
      <h1>{t('app_name')}</h1>
      <button>{t('logout')}</button>
    </nav>
  );
}
```

**With Namespace:**

```jsx
import { useTranslation } from 'react-i18next';

function SurveyCard({ survey }) {
  const { t } = useTranslation('survey');
  
  return (
    <div>
      <h3>{t('village_name')}: {survey.village_name}</h3>
      <p>{t('progress')}: {survey.completion_percentage}%</p>
      <span>{t(survey.is_complete ? 'complete' : 'in_progress')}</span>
    </div>
  );
}
```

**With Nested Keys:**

```jsx
import { useTranslation } from 'react-i18next';

function ModuleList() {
  const { t } = useTranslation('survey');
  
  return (
    <ul>
      <li>{t('modules.basic_info')}</li>
      <li>{t('modules.infrastructure')}</li>
      <li>{t('modules.sanitation')}</li>
    </ul>
  );
}
```

**Dynamic Form Fields:**

```jsx
import { useTranslation } from 'react-i18next';

function BasicInfoModule({ data, onChange }) {
  const { t } = useTranslation('modules');
  
  return (
    <div>
      <h2>{t('basic_info.title')}</h2>
      
      <input
        type="number"
        placeholder={t('basic_info.total_households')}
        value={data.total_households || ''}
        onChange={(e) => onChange('total_households', e.target.value)}
      />
      
      <input
        type="number"
        placeholder={t('basic_info.total_population')}
        value={data.total_population || ''}
        onChange={(e) => onChange('total_population', e.target.value)}
      />
    </div>
  );
}
```

#### **7. Language Switcher Component**

Create `frontend/src/components/LanguageSwitcher.jsx`:

```jsx
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };
  
  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-circle">
        <span className="text-xl">
          {languages.find(l => l.code === i18n.language)?.flag || '🌐'}
        </span>
      </label>
      
      <ul 
        tabIndex={0} 
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-4"
      >
        {languages.map((lang) => (
          <li key={lang.code}>
            <button
              onClick={() => changeLanguage(lang.code)}
              className={i18n.language === lang.code ? 'active' : ''}
            >
              <span className="text-xl">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LanguageSwitcher;
```

Add to Navbar:

```jsx
import LanguageSwitcher from './LanguageSwitcher';

function Navbar() {
  return (
    <nav>
      {/* Other navbar content */}
      <LanguageSwitcher />
    </nav>
  );
}
```

#### **8. Backend Support (Optional)**

Store user's language preference in database:

**Update User Model:**

```python
# Backend/app/models/models.py
class User(Base):
    # ... existing fields
    preferred_language = Column(String(10), default='en')
```

**Migration:**

```bash
cd Backend
alembic revision -m "add_user_language_preference"
# Edit the migration file
alembic upgrade head
```

**API Endpoint:**

```python
# Backend/app/routers/auth.py
@router.put("/me/language")
async def update_language(
    language: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.preferred_language = language
    db.commit()
    return {"message": "Language updated", "language": language}
```

**Frontend Integration:**

```javascript
// Load user's preferred language on login
const loadUserLanguage = async () => {
  try {
    const response = await api.get('/api/auth/me');
    const userLang = response.data.preferred_language;
    i18n.changeLanguage(userLang);
  } catch (error) {
    console.error('Failed to load language preference');
  }
};

// Save language preference
const saveLanguagePreference = async (langCode) => {
  try {
    await api.put('/api/auth/me/language', { language: langCode });
    i18n.changeLanguage(langCode);
  } catch (error) {
    console.error('Failed to save language preference');
  }
};
```

#### **9. Offline Support**

Store translations in IndexedDB for offline access:

```javascript
// Add to indexedDBService.js
const STORES = {
  // ... existing stores
  TRANSLATIONS: 'translations',
};

// Store translations
async saveTranslations(language, translations) {
  const transaction = this.getTransaction(STORES.TRANSLATIONS, 'readwrite');
  const store = transaction.objectStore(STORES.TRANSLATIONS);
  
  return new Promise((resolve, reject) => {
    const request = store.put({ language, translations, updated_at: new Date() });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Load translations
async getTranslations(language) {
  const transaction = this.getTransaction(STORES.TRANSLATIONS, 'readonly');
  const store = transaction.objectStore(STORES.TRANSLATIONS);
  
  return new Promise((resolve, reject) => {
    const request = store.get(language);
    request.onsuccess = () => resolve(request.result?.translations);
    request.onerror = () => reject(request.error);
  });
}
```

#### **10. RTL Support (for Urdu, Arabic)**

Add RTL support in `i18n/config.js`:

```javascript
// Detect RTL languages
const rtlLanguages = ['ur', 'ar'];

i18n.on('languageChanged', (lng) => {
  const dir = rtlLanguages.includes(lng) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});
```

Add RTL CSS:

```css
/* index.css */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .btn {
  /* Mirror button styles */
}
```

### **Translation Best Practices**

1. **Keep keys organized** - Use nested namespaces
2. **Use interpolation** - `"welcome_user": "Welcome, {{name}}!"`
3. **Pluralization** - `"items_count": "{{count}} item", "items_count_plural": "{{count}} items"`
4. **Context-aware** - `"save": "Save", "save_survey": "Save Survey"`
5. **Professional translation** - Use native speakers for accuracy
6. **Test thoroughly** - Check UI with long text (German) and short text (Hindi)

### **Supported Languages Priority**

For rural India, prioritize:

1. **Hindi (hi)** - Official language, widely understood
2. **English (en)** - Official, administrative use
3. **Regional languages:**
   - **Punjabi (pa)** - Punjab
   - **Bengali (bn)** - West Bengal, Assam
   - **Tamil (ta)** - Tamil Nadu
   - **Telugu (te)** - Andhra Pradesh, Telangana
   - **Marathi (mr)** - Maharashtra
   - **Gujarati (gu)** - Gujarat
   - **Kannada (kn)** - Karnataka
   - **Malayalam (ml)** - Kerala

### **Testing Multilingual Features**

```bash
# Switch language and verify:
1. All UI text translates
2. Form labels and placeholders
3. Error messages and toasts
4. Date/time formats
5. Number formats (Indian numbering: 1,00,000)
6. RTL layout (if applicable)
7. Offline translations work
8. Language persists after reload
```

---

## 🤝 Contributing

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
