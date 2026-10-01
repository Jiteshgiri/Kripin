import Database from "better-sqlite3";

const db = new Database("kripin.db");

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    mobile TEXT,
    occupation TEXT,
    app_version TEXT,
    created_at TEXT NOT NULL,
    last_active_at TEXT NOT NULL,
    cloud_sync_started_at TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT,
    description TEXT,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

console.log("Kripin database initialized successfully.");

db.close();
