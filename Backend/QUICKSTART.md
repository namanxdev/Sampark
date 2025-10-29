# Quick Start Guide - Sampark Backend

## Prerequisites
- Python 3.8 or higher
- PostgreSQL 12+ installed and running
- pip (Python package manager)

## Installation Steps

### 1. Install Dependencies

**Option A: Using setup script (Windows)**
```bash
cd Backend
setup.bat
```

**Option B: Manual installation**
```bash
cd Backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 2. Configure Environment

Copy the example environment file and edit it:
```bash
copy .env.example .env
```

Edit `.env` and configure:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/sampark_db
SECRET_KEY=your-very-secret-key-change-this
```

**Generate a secure SECRET_KEY:**
```python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3. Setup PostgreSQL Database

Open PostgreSQL command line or pgAdmin and create database:
```sql
CREATE DATABASE sampark_db;
```

### 4. Run Database Migrations

```bash
alembic upgrade head
```

This will create all necessary tables (users, panchayats, surveys, etc.)

### 5. Start the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API:** http://localhost:8000
- **Docs:** http://localhost:8000/docs (Interactive Swagger UI)
- **ReDoc:** http://localhost:8000/redoc

## Testing the API

### 1. Health Check
```bash
curl http://localhost:8000/api/ping
```

### 2. Create First Admin User (Manual)

Since registration requires admin authentication, you need to create the first user manually:

```python
# Run this Python script in your activated environment
python -c "
from app.database import SessionLocal
from app.models.models import User, Panchayat
from app.utils.security import get_password_hash
import uuid

db = SessionLocal()

# Create a test panchayat
panchayat = Panchayat(
    panchayat_id='PANCH_001',
    name='Rampur Gram Panchayat',
    block='Rampur Block',
    district='Test District',
    state='Test State'
)
db.add(panchayat)

# Create admin user
admin = User(
    user_id='USER_ADMIN001',
    username='admin',
    email='admin@sampark.gov.in',
    hashed_password=get_password_hash('admin123'),
    full_name='Admin User',
    role='admin',
    panchayat_id='PANCH_001'
)
db.add(admin)

db.commit()
print('Admin user created successfully!')
print('Username: admin')
print('Password: admin123')
db.close()
"
```

### 3. Login and Get Token

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

You'll get a response like:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_info": {...}
}
```

### 4. Test Protected Endpoint

```bash
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## API Endpoints Overview

### Authentication
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/me` - Get current user info

### Surveys
- `POST /api/surveys` - Create/sync survey
- `GET /api/surveys` - Get all surveys
- `GET /api/surveys/{survey_id}` - Get specific survey
- `PUT /api/surveys/{survey_id}` - Update survey
- `DELETE /api/surveys/{survey_id}` - Delete survey (admin only)

### Sync
- `POST /api/sync/batch` - Batch sync multiple surveys
- `GET /api/sync/status` - Get sync status
- `GET /api/sync/logs` - Get sync logs

### Schemas
- `GET /api/schemas` - Get all form schemas
- `GET /api/schemas/{module_name}` - Get specific module schema
- `POST /api/schemas` - Create new schema (admin only)
- `PUT /api/schemas/{schema_id}` - Update schema (admin only)

## Common Issues & Solutions

### Issue: "Module not found" errors
**Solution:** Make sure virtual environment is activated
```bash
venv\Scripts\activate
```

### Issue: "Database connection failed"
**Solution:** 
1. Check if PostgreSQL is running
2. Verify DATABASE_URL in .env file
3. Ensure database exists: `CREATE DATABASE sampark_db;`

### Issue: Import errors for `jose` or `passlib`
**Solution:** These will be resolved after installing requirements.txt
```bash
pip install python-jose[cryptography] passlib[bcrypt]
```

### Issue: Port 8000 already in use
**Solution:** Use a different port
```bash
uvicorn app.main:app --reload --port 8001
```

## Development Workflow

1. **Make code changes**
2. **Server auto-reloads** (if using --reload flag)
3. **Test in browser:** http://localhost:8000/docs
4. **Check logs** in terminal

## Production Deployment

For production, use:
```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn (better performance)
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Next Steps

1. ✅ Backend is running
2. 🔄 Connect your React frontend
3. 📝 Test offline sync functionality
4. 📊 Add sample form schemas
5. 🚀 Deploy to production

## Support

For issues or questions, check:
- API Docs: http://localhost:8000/docs
- Backend README.md
- Project documentation in `ProposedSolution.md`
