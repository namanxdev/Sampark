from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Convert DATABASE_URL from postgresql:// to postgresql+asyncpg://
database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql://")

# Create database engine with proper connection pooling
engine = create_engine(
    database_url,
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,  # Maximum number of connections to keep in the pool
    max_overflow=10,  # Maximum number of connections that can be created beyond pool_size
    pool_recycle=3600,  # Recycle connections after 1 hour
    pool_timeout=30,  # Timeout for getting a connection from the pool
    connect_args={
        "connect_timeout": 10,  # Connection timeout in seconds
        "options": "-c statement_timeout=30000"  # Statement timeout (30 seconds)
    }
    # echo=True  # Log SQL queries (disable in production)
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """
    Dependency to get database session.
    Usage in routes:
        @router.get("/")
        def endpoint(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
