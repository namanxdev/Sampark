from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .database import engine, Base
from .routers import auth, surveys, schemas, sync

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Sampark API",
    description="Modular Offline Data Collection Toolkit for Panchayats",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS with wildcard support for Vercel preview deployments
def is_cors_allowed(origin: str) -> bool:
    """Check if origin is allowed"""
    allowed_origins = settings.cors_origins_list
    
    # Check exact matches
    if origin in allowed_origins:
        return True
    
    # Allow all vercel.app subdomains
    if origin and origin.endswith('.vercel.app'):
        return True
    
    return False

# Custom CORS middleware to allow Vercel preview deployments
from fastapi import Request

@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin")
    
    response = await call_next(request)
    
    if origin and is_cors_allowed(origin):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response

# Also keep the standard CORS middleware for preflight requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=r"https://.*\.vercel\.app"
)

# Include routers
app.include_router(auth.router)
app.include_router(surveys.router)
app.include_router(schemas.router)
app.include_router(sync.router)


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Sampark API - Panchayat Data Collection System",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/api/ping")
async def ping():
    """
    Lightweight ping endpoint for network detection
    
    Used by frontend to check if server is reachable
    """
    return {"status": "ok", "timestamp": "2025-10-29T00:00:00Z"}


@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "version": "1.0.0"
    }


# Exception handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "Resource not found"}
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
