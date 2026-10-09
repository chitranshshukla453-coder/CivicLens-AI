import sqlite3

DB_NAME = "civiclens.db"


def create_database():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Create reports table if it does not exist
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            description TEXT,
            latitude REAL,
            longitude REAL,
            severity TEXT,
            image_path TEXT,
            ai_category TEXT,
            ai_confidence REAL,
            ai_severity TEXT,
            priority_score INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Add AI columns to an existing database
    existing_columns = [
        row[1] for row in cursor.execute("PRAGMA table_info(reports)")
    ]

    new_columns = {
        "ai_category": "TEXT",
        "ai_confidence": "REAL",
        "ai_severity": "TEXT",
        "priority_score": "INTEGER"
    }

    for column, data_type in new_columns.items():
        if column not in existing_columns:
            cursor.execute(
                f"ALTER TABLE reports ADD COLUMN {column} {data_type}"
            )
            print(f"Added column: {column}")

    conn.commit()
    conn.close()

    print("Database updated successfully!")


if __name__ == "__main__":
    create_database()