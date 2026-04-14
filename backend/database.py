import sqlite3
import json
from datetime import datetime

DB_FILE = "justinsight.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        plagiarism_score INTEGER NOT NULL,
        ai_score INTEGER NOT NULL,
        suggestions TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        username TEXT DEFAULT 'Guest'
    )
    """)
    
    try:
        cursor.execute("ALTER TABLE analysis ADD COLUMN username TEXT DEFAULT 'Guest'")
    except sqlite3.OperationalError:
        pass # Column already exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        plagiarism_threshold INTEGER DEFAULT 20,
        ai_threshold INTEGER DEFAULT 30
    )
    """)
    
    # Initialize basic settings if empty
    cursor.execute("SELECT id FROM settings WHERE id = 1")
    if not cursor.fetchone():
         cursor.execute("INSERT INTO settings (id, plagiarism_threshold, ai_threshold) VALUES (1, 20, 30)")
    
    conn.commit()
    conn.close()

def save_analysis(filename: str, plagiarism_score: int, ai_score: int, suggestions: list, username: str = 'Guest'):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    now = datetime.now().isoformat()
    # Serialize suggestions array to JSON string to save in DB
    suggestions_json = json.dumps(suggestions)
    
    cursor.execute("""
    INSERT INTO analysis (filename, plagiarism_score, ai_score, suggestions, timestamp, username)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (filename, plagiarism_score, ai_score, suggestions_json, now, username))
    
    last_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return get_analysis(last_id)

def get_analysis(id: int):
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analysis WHERE id = ?", (id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        data = dict(row)
        data['suggestions'] = json.loads(data['suggestions'])
        return data
    return None

def get_all_history(username: str = 'Guest'):
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analysis WHERE username = ? ORDER BY id DESC", (username,))
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for row in rows:
        data = dict(row)
        data['suggestions'] = json.loads(data['suggestions'])
        results.append(data)
    return results

def get_settings():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM settings WHERE id = 1")
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return dict(row)
    return {"plagiarism_threshold": 20, "ai_threshold": 30}

def update_settings(plagiarism_threshold: int, ai_threshold: int):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE settings SET plagiarism_threshold = ?, ai_threshold = ? WHERE id = 1
    """, (plagiarism_threshold, ai_threshold))
    conn.commit()
    conn.close()
    return get_settings()

def clear_history(username: str = 'Guest'):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM analysis WHERE username = ?", (username,))
    conn.commit()
    conn.close()
