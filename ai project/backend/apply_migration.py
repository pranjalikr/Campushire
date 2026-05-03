import sqlite3
import os

db_path = 'campushire.db'
if os.path.exists(db_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        # SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
        # So we'll check if column exists first
        cursor.execute("PRAGMA table_info(experiences)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'years_of_experience' not in columns:
            cursor.execute('ALTER TABLE experiences ADD COLUMN years_of_experience FLOAT')
            conn.commit()
            print("Migration applied: years_of_experience column added")
        else:
            print("Column years_of_experience already exists")
        
        conn.close()
    except Exception as e:
        print(f"Error applying migration: {e}")
        exit(1)
else:
    print("Database will be created on first server start")
