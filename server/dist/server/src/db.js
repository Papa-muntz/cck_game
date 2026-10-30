"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveGameState = saveGameState;
exports.loadGameState = loadGameState;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.resolve(__dirname, '../../game.db');
const db = new better_sqlite3_1.default(dbPath);
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
exports.default = db;
function saveGameState(gameId, state) {
    const stmt = db.prepare('INSERT OR REPLACE INTO games (id, date, state) VALUES (?, ?, ?)');
    stmt.run(gameId, new Date().toISOString(), JSON.stringify(state));
}
function loadGameState(gameId) {
    const stmt = db.prepare('SELECT state FROM games WHERE id = ?');
    const row = stmt.get(gameId);
    if (row) {
        return JSON.parse(row.state);
    }
    return null;
}
