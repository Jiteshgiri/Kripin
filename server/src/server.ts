import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();
const PORT = 3001;

const db = new Database("kripin.db");

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    mobile TEXT,
    occupation TEXT,
    avatar_url TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date_timestamp INTEGER NOT NULL,
    is_income INTEGER NOT NULL,
    merchant TEXT,
    payment_mode TEXT,
    is_auto_debited INTEGER
  );
`);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "Kripin Server",
  });
});

app.post("/api/users/sync", (req, res) => {
  const {
    userId,
    name,
    mobile,
    occupation,
    avatarUrl,
  } = req.body;

  if (!userId || !name) {
    return res.status(400).json({
      ok: false,
      error: "userId and name are required",
    });
  }

  const statement = db.prepare(`
    INSERT INTO users (
      user_id,
      name,
      mobile,
      occupation,
      avatar_url
    )
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      name = excluded.name,
      mobile = excluded.mobile,
      occupation = excluded.occupation,
      avatar_url = excluded.avatar_url
  `);

  statement.run(
    userId,
    name,
    mobile ?? "",
    occupation ?? "",
    avatarUrl ?? ""
  );

  return res.json({ ok: true });
});

app.post("/api/transactions/sync", (req, res) => {
  const transaction = req.body;

  if (!transaction?.id || !transaction?.userId) {
    return res.status(400).json({
      ok: false,
      error: "transaction id and userId are required",
    });
  }

  const statement = db.prepare(`
    INSERT INTO transactions (
      id,
      user_id,
      title,
      amount,
      category,
      date_timestamp,
      is_income,
      merchant,
      payment_mode,
      is_auto_debited
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      amount = excluded.amount,
      category = excluded.category,
      date_timestamp = excluded.date_timestamp,
      is_income = excluded.is_income,
      merchant = excluded.merchant,
      payment_mode = excluded.payment_mode,
      is_auto_debited = excluded.is_auto_debited
  `);

  statement.run(
    transaction.id,
    transaction.userId,
    transaction.title,
    transaction.amount,
    transaction.category,
    transaction.dateTimestamp,
    transaction.isIncome ? 1 : 0,
    transaction.merchant ?? "",
    transaction.paymentMode ?? "",
    transaction.isAutoDebited ? 1 : 0
  );

  return res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Kripin Server running on http://localhost:${PORT}`);
});