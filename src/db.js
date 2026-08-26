import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "..", "data", "database.sqlite");

const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_number TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        pin_hash TEXT NOT NULL,
        balance REAL NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        last4 TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        FOREIGN KEY (account_id) REFERENCES accounts(id)
    );

    CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_number TEXT UNIQUE NOT NULL,
        account_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(id)
    );
`);

export default db;