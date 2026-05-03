"""
Startup script for FastAPI backend server
This script ensures the database is ready and starts the server
"""
import sys
import os
import sqlite3
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

def check_database():
    """Ensure database has all required columns"""
    db_path = Path(__file__).parent / "campushire.db"
    
    if not db_path.exists():
        print("Database will be created automatically on first run")
        return True
    
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Check required columns
        cursor.execute("PRAGMA table_info(users)")
        columns = {col[1]: col[2] for col in cursor.fetchall()}
        
        required_columns = {
            'full_name': 'VARCHAR',
            'email': 'VARCHAR',
            'linkedin_id': 'VARCHAR',
            'github_id': 'VARCHAR',
            'college_name': 'VARCHAR',
            'branch': 'VARCHAR',
            'bio': 'TEXT'
        }
        
        missing = []
        for col, col_type in required_columns.items():
            if col not in columns:
                missing.append(col)
        
        if missing:
            print(f"Warning: Missing columns: {', '.join(missing)}")
            print("These will be added automatically by SQLAlchemy")
        else:
            print("✓ Database schema verified")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error checking database: {e}")
        return False

def main():
    """Main startup function"""
    print("=" * 50)
    print("CampusHire AI - Backend Server")
    print("=" * 50)
    print()
    
    # Check database
    if not check_database():
        print("Database check failed, but continuing anyway...")
        print()
    
    # Import and run uvicorn
    print("Starting FastAPI server...")
    print("Server will be available at: http://localhost:8000")
    print("API docs at: http://localhost:8000/docs")
    print()
    print("Profile API Endpoints:")
    print("  GET  /api/v1/users/me")
    print("  PUT  /api/v1/users/me")
    print("  GET  /api/v1/users/profile-completion")
    print()
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    print()
    
    # Start uvicorn
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()
