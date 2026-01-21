import { Database } from 'bun:sqlite';
import type { PriceSnapshot, Alert } from './types';

export const db = new Database('data.db', { create: true });

db.exec(`
  CREATE TABLE IF NOT EXISTS price_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    changePerc REAL NOT NULL,
    currentPrice REAL NOT NULL,
    polyYesPrice REAL NOT NULL,
    polyNoPrice REAL NOT NULL,
    clobTokenIdYes TEXT,
    clobTokenIdNo TEXT,
    timestamp INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    changePerc REAL NOT NULL,
    realPrice REAL NOT NULL,
    polyYesPrice REAL NOT NULL,
    polyNoPrice REAL NOT NULL,
    clobTokenIdYes TEXT,
    clobTokenIdNo TEXT,
    analysis TEXT NOT NULL,
    sentAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    chatId INTEGER PRIMARY KEY,
    startedAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS muted_assets (
    chatId INTEGER NOT NULL,
    symbol TEXT NOT NULL,
    mutedAt INTEGER NOT NULL,
    PRIMARY KEY (chatId, symbol)
  );

  CREATE INDEX IF NOT EXISTS idx_snapshots_symbol_time 
    ON price_snapshots(symbol, timestamp);
  
  CREATE INDEX IF NOT EXISTS idx_alerts_symbol 
    ON alerts(symbol, sentAt);
`);

export const insertSnapshot = db.prepare(`
  INSERT INTO price_snapshots (symbol, changePerc, currentPrice, polyYesPrice, polyNoPrice, clobTokenIdYes, clobTokenIdNo, timestamp)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

export const getSnapshotsLast20Min = db.prepare(`
  SELECT * FROM price_snapshots 
  WHERE symbol = ? AND timestamp > ?
  ORDER BY timestamp DESC
`);

export const getSnapshotsLast30Min = db.prepare(`
  SELECT * FROM price_snapshots 
  WHERE symbol = ? AND timestamp > ?
  ORDER BY timestamp ASC
  LIMIT 6
`);

export const insertAlert = db.prepare(`
  INSERT INTO alerts (symbol, changePerc, realPrice, polyYesPrice, polyNoPrice, clobTokenIdYes, clobTokenIdNo, analysis, sentAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

export const getRecentAlerts = db.prepare(`
  SELECT * FROM alerts 
  WHERE symbol = ? AND sentAt > ?
  ORDER BY sentAt DESC
`);

export const addUser = db.prepare(`
  INSERT OR IGNORE INTO users (chatId, startedAt)
  VALUES (?, ?)
`);

export const getAllUsersQuery = db.prepare(`
  SELECT * FROM users
`);

export const muteAsset = db.prepare(`
  INSERT OR REPLACE INTO muted_assets (chatId, symbol, mutedAt)
  VALUES (?, ?, ?)
`);

export const unmuteAsset = db.prepare(`
  DELETE FROM muted_assets
  WHERE chatId = ? AND symbol = ?
`);

export const getMutedAssets = db.prepare(`
  SELECT symbol FROM muted_assets
  WHERE chatId = ?
`);

export const isAssetMuted = db.prepare(`
  SELECT COUNT(*) as count FROM muted_assets
  WHERE chatId = ? AND symbol = ?
`);

export function saveSnapshot(snapshot: PriceSnapshot) {
  insertSnapshot.run(
    snapshot.symbol,
    snapshot.changePerc,
    snapshot.currentPrice,
    snapshot.polyYesPrice,
    snapshot.polyNoPrice,
    snapshot.clobTokenIdYes || null,
    snapshot.clobTokenIdNo || null,
    snapshot.timestamp
  );
}

export function getSnapshotsForAlert(symbol: string): PriceSnapshot[] {
  const twentyMinAgo = Date.now() - 20 * 60 * 1000;
  return getSnapshotsLast20Min.all(symbol, twentyMinAgo) as PriceSnapshot[];
}

export function getHistoryForDashboard(symbol: string): PriceSnapshot[] {
  const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
  return getSnapshotsLast30Min.all(symbol, thirtyMinAgo) as PriceSnapshot[];
}

export function saveAlert(alert: Alert) {
  insertAlert.run(
    alert.symbol,
    alert.changePerc,
    alert.realPrice,
    alert.polyYesPrice,
    alert.polyNoPrice,
    alert.clobTokenIdYes || null,
    alert.clobTokenIdNo || null,
    alert.analysis,
    alert.sentAt
  );
}

export function hasRecentAlert(symbol: string, withinMinutes: number = 60): boolean {
  const threshold = Date.now() - withinMinutes * 60 * 1000;
  const alerts = getRecentAlerts.all(symbol, threshold) as Alert[];
  return alerts.length > 0;
}

export function clearOldSnapshots(olderThanHours: number = 24) {
  const threshold = Date.now() - olderThanHours * 60 * 60 * 1000;
  db.prepare('DELETE FROM price_snapshots WHERE timestamp < ?').run(threshold);
}

export function registerUser(chatId: number) {
  addUser.run(chatId, Date.now());
}

export function getActiveUsers(): number[] {
  const users = getAllUsersQuery.all() as { chatId: number }[];
  return users.map(u => u.chatId);
}

export function muteAssetForUser(chatId: number, symbol: string) {
  muteAsset.run(chatId, symbol, Date.now());
}

export function unmuteAssetForUser(chatId: number, symbol: string) {
  unmuteAsset.run(chatId, symbol);
}

export function getUserMutedAssets(chatId: number): string[] {
  const muted = getMutedAssets.all(chatId) as { symbol: string }[];
  return muted.map(m => m.symbol);
}

export function isAssetMutedForUser(chatId: number, symbol: string): boolean {
  const result = isAssetMuted.get(chatId, symbol) as { count: number };
  return result.count > 0;
}
