# Sampark Backend - Panchayat Data Collection API

FastAPI backend for the Modular Offline Data Collection Toolkit for Panchayats.

## Features

- **Offline-First Sync**: Handles data sync from offline-collected surveys
- **Conflict Resolution**: Manages data conflicts between multiple devices
- **Modular Schemas**: Dynamic form schema management
- **JWT Authentication**: Secure token-based authentication
- **PostgreSQL Database**: Reliable data storage with JSONB support

## Setup

### 1. Install Python Dependencies

```bash
cd Backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
copy .env.example .env
# Edit .env with your database credentials and secret key
```

### 3. Setup PostgreSQL Database

```bash
# Create database
psql -U postgres
CREATE DATABASE sampark_db;
\q
```

### 4. Run Database Migrations

```bash
alembic upgrade head
```

### 5. Start the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)

### Surveys
- `POST /api/surveys` - Submit survey data
- `GET /api/surveys` - Get surveys for a panchayat
- `GET /api/surveys/{survey_id}` - Get specific survey
- `PUT /api/surveys/{survey_id}` - Update survey

### Schemas
- `GET /api/schemas` - Get all form schemas
- `GET /api/schemas/{module_id}` - Get specific schema

### Sync
- `POST /api/sync/batch` - Batch sync multiple surveys
- `GET /api/sync/status` - Get sync status

## Project Structure

```
Backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration management
│   ├── database.py          # Database connection
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── routers/             # API route handlers
│   ├── services/            # Business logic
│   └── utils/               # Utility functions
├── alembic/                 # Database migrations
├── requirements.txt
└── .env
```

## Development

Run with auto-reload:
```bash
uvicorn app.main:app --reload
```

Run tests:
```bash
pytest
```

## Production Deployment

See deployment guide for production setup with gunicorn, nginx, and SSL.
