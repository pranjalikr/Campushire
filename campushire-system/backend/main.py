from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.v1 import auth, users, experiences, admin, chatbot, analytics, companies
from app.db.database import engine, Base
# Import all models to ensure they're registered with Base
from app.db.models import User, Experience, Bookmark, Admin, AuditLog


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    try:
        print("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
    except Exception as e:
        print(f"ERROR creating database tables: {e}")
        import traceback
        traceback.print_exc()
    yield
    # Shutdown: Cleanup if needed
    pass


app = FastAPI(
    title="CampusHire AI API",
    description="Backend API for CampusHire AI - Campus Interview Preparation Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - MUST be before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,  # Set to False when using allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Security
security = HTTPBearer()

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(experiences.router, prefix="/api/v1/experiences", tags=["Experiences"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(chatbot.router, prefix="/api/v1/chatbot", tags=["Chatbot"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(companies.router, prefix="/api/v1/companies", tags=["Companies"])


@app.get("/")
async def root():
    return {"message": "CampusHire AI API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
