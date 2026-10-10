-- TELA-TELL SQLite schema
-- Runtime migration uses the matching string in db/schema.ts
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tblDeviceProfile (
  profile_ID    INTEGER PRIMARY KEY AUTOINCREMENT,
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
  dominantFabric        TEXT NOT NULL,
  confidence            INTEGER NOT NULL,
  scannedAt             TEXT NOT NULL,
  scannedAtDate         TEXT NOT NULL,
  createdAt             TEXT,
  sellerLabel           TEXT,
  garmentCondition      TEXT NOT NULL DEFAULT 'New',
  imageUri              TEXT,
  -- Legacy: the app no longer scores sustainability. These three columns stay (NOT NULL, and
  -- dropping them needs a table rebuild) and hold the placeholders 'unrated', 'Not rated', 0.
  sustainabilityRating  TEXT NOT NULL,
  sustainabilityLabel   TEXT NOT NULL,
  sustainabilityScore   INTEGER NOT NULL,
  mislabelDetected      INTEGER NOT NULL DEFAULT 0,
  mislabelTitle         TEXT,
  mislabelMessage       TEXT,
  resultJson            TEXT,
  isFavorite            INTEGER NOT NULL DEFAULT 0,
  deletedAt             TEXT,
  CHECK (garmentCondition IN ('New', 'Good', 'Worn', 'Damaged'))
);

CREATE INDEX IF NOT EXISTS idx_scan_scannedAt ON tblScan(scannedAt DESC);
CREATE INDEX IF NOT EXISTS idx_scan_scannedAtDate ON tblScan(scannedAtDate DESC);

INSERT OR IGNORE INTO tblDeviceProfile (profile_ID, updatedAt)
VALUES (1, datetime('now'));
