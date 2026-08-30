/**
 * Executable schema for expo-sqlite migrations.
 */
export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tblUser (
  user_ID       TEXT PRIMARY KEY NOT NULL,
  firstName     TEXT NOT NULL,
  middleInitial TEXT,
  lastName      TEXT NOT NULL,
  username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  passwordHash  TEXT NOT NULL,
  passwordSalt  TEXT NOT NULL,
  avatarUri     TEXT,
  createdAt     TEXT NOT NULL,
  updatedAt     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tblDeviceProfile (
  profile_ID    INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       TEXT,
  skinTone      TEXT,
  skinUndertone TEXT,
  colorSeason   TEXT,
  updatedAt     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tblSensitiveFiber (
  sensitiveFiber_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_ID        INTEGER NOT NULL,
  fiberName         TEXT NOT NULL,
  FOREIGN KEY (profile_ID) REFERENCES tblDeviceProfile(profile_ID) ON DELETE CASCADE,
  UNIQUE (profile_ID, fiberName)
);

CREATE TABLE IF NOT EXISTS tblPreferredFiber (
  preferredFiber_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_ID        INTEGER NOT NULL,
  fiberName         TEXT NOT NULL,
  FOREIGN KEY (profile_ID) REFERENCES tblDeviceProfile(profile_ID) ON DELETE CASCADE,
  UNIQUE (profile_ID, fiberName)
);

CREATE TABLE IF NOT EXISTS tblDressingContext (
  dressingContext_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_ID         INTEGER NOT NULL,
  contextCode        TEXT NOT NULL,
  FOREIGN KEY (profile_ID) REFERENCES tblDeviceProfile(profile_ID) ON DELETE CASCADE,
  UNIQUE (profile_ID, contextCode)
);

CREATE TABLE IF NOT EXISTS tblScan (
  scan_ID               TEXT PRIMARY KEY NOT NULL,
  user_id               TEXT,
  dominantFabric        TEXT NOT NULL,
  confidence            INTEGER NOT NULL,
  scannedAt             TEXT NOT NULL,
  scannedAtDate         TEXT NOT NULL,
  createdAt             TEXT,
  sellerLabel           TEXT,
  garmentCondition      TEXT NOT NULL DEFAULT 'New',
  imageUri              TEXT,
  sustainabilityRating  TEXT NOT NULL,
  sustainabilityLabel   TEXT NOT NULL,
  sustainabilityScore   INTEGER NOT NULL,
  mislabelDetected      INTEGER NOT NULL DEFAULT 0,
  mislabelTitle         TEXT,
  mislabelMessage       TEXT,
  resultJson            TEXT,
  syncStatus            TEXT NOT NULL DEFAULT 'local',
  isFavorite            INTEGER NOT NULL DEFAULT 0,
  deletedAt             TEXT,
  CHECK (garmentCondition IN ('New', 'Good', 'Worn', 'Damaged'))
);

CREATE TABLE IF NOT EXISTS tblScanComposition (
  composition_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  scan_ID        TEXT NOT NULL,
  material       TEXT NOT NULL,
  percentage     INTEGER NOT NULL,
  sortOrder      INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (scan_ID) REFERENCES tblScan(scan_ID) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_username ON tblUser(username);
CREATE INDEX IF NOT EXISTS idx_scan_scannedAt ON tblScan(scannedAt DESC);
CREATE INDEX IF NOT EXISTS idx_scan_scannedAtDate ON tblScan(scannedAtDate DESC);
CREATE INDEX IF NOT EXISTS idx_scan_user ON tblScan(user_id);
CREATE INDEX IF NOT EXISTS idx_composition_scan ON tblScanComposition(scan_ID);

INSERT OR IGNORE INTO tblDeviceProfile (profile_ID, updatedAt)
VALUES (1, datetime('now'));
`;
