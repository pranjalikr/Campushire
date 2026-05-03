"""
Migration script to add is_preuploaded column to experiences table
"""
import sqlite3
import os

def add_preuploaded_column():
    db_path = 'campushire.db'
    
    if not os.path.exists(db_path):
        print(f"Database file {db_path} not found!")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(experiences)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'is_preuploaded' in columns:
            print("[SKIP] Column 'is_preuploaded' already exists")
            conn.close()
            return True
        
        # Add the column
        print("[OK] Adding 'is_preuploaded' column to experiences table...")
        cursor.execute("""
            ALTER TABLE experiences 
            ADD COLUMN is_preuploaded BOOLEAN DEFAULT 0
        """)
        
        conn.commit()
        conn.close()
        
        print("[OK] Successfully added 'is_preuploaded' column!")
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to add column: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("ADDING is_preuploaded COLUMN TO EXPERIENCES TABLE")
    print("=" * 60)
    print()
    
    success = add_preuploaded_column()
    
    if success:
        print()
        print("=" * 60)
        print("MIGRATION COMPLETED SUCCESSFULLY!")
        print("=" * 60)
    else:
        print()
        print("=" * 60)
        print("MIGRATION FAILED!")
        print("=" * 60)
        exit(1)
