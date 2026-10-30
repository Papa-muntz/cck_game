import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../game.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    date TEXT,
    state TEXT,
    is_finished INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT,
    data TEXT,
    FOREIGN KEY(game_id) REFERENCES games(id)
  );
`);

export default db;

export function saveGameState(gameId: string, state: any) {
  const stmt = db.prepare('INSERT OR REPLACE INTO games (id, date, state) VALUES (?, ?, ?)');
  stmt.run(gameId, new Date().toISOString(), JSON.stringify(state));
}

export function loadGameState(gameId: string): any {
  const stmt = db.prepare('SELECT state FROM games WHERE id = ?');
  const row = stmt.get(gameId) as { state: string } | undefined;
  if (row) {
    return JSON.parse(row.state);
  }
  return null;
}
