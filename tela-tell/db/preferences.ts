import { getDatabase, isDatabaseAvailable } from '@/db/client';
import type {
  UserPreferences,
  SkinTone,
  SkinUndertone,
  ColorSeason,
} from '@/features/profile/lib/user-preferences';
import type { SupportedFabric } from '@/data/fabrics/fabrics';
import type { DressingContext } from '@/data/preferences/occasion-weather';

/** The app has a single on-device profile; it is the seed row created by db/schema.ts. */
export const DEVICE_PROFILE_ID = 1;

function emptyPreferences(): UserPreferences {
  return {
    skinTone: null,
    skinUndertone: null,
    colorSeason: null,
    sensitiveFabrics: [],
    preferredFabrics: [],
    dressingContexts: [],
  };
}

export async function getPreferences(): Promise<UserPreferences> {
  if (!isDatabaseAvailable()) {
    return emptyPreferences();
  }

  const db = await getDatabase();
  const profile = await db.getFirstAsync<{
    skinTone: string | null;
    skinUndertone: string | null;
    colorSeason: string | null;
  }>('SELECT skinTone, skinUndertone, colorSeason FROM tblDeviceProfile WHERE profile_ID = ?', [
    DEVICE_PROFILE_ID,
  ]);

  if (!profile) {
    return emptyPreferences();
  }

  const sensitive = await db.getAllAsync<{ fiberName: string }>(
    'SELECT fiberName FROM tblSensitiveFiber WHERE profile_ID = ?',
    [DEVICE_PROFILE_ID],
  );
  const preferred = await db.getAllAsync<{ fiberName: string }>(
    'SELECT fiberName FROM tblPreferredFiber WHERE profile_ID = ?',
    [DEVICE_PROFILE_ID],
  );
  const contexts = await db.getAllAsync<{ contextCode: string }>(
    'SELECT contextCode FROM tblDressingContext WHERE profile_ID = ?',
    [DEVICE_PROFILE_ID],
  );

  return {
    skinTone: (profile.skinTone as SkinTone | null) ?? null,
    skinUndertone: (profile.skinUndertone as SkinUndertone | null) ?? null,
    colorSeason: (profile.colorSeason as ColorSeason | null) ?? null,
    sensitiveFabrics: sensitive.map((r) => r.fiberName as SupportedFabric),
    preferredFabrics: preferred.map((r) => r.fiberName as SupportedFabric),
    dressingContexts: contexts.map((r) => r.contextCode as DressingContext),
  };
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  if (!isDatabaseAvailable()) {
    return;
  }

  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO tblDeviceProfile (profile_ID, skinTone, skinUndertone, colorSeason, updatedAt)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(profile_ID) DO UPDATE SET
         skinTone = excluded.skinTone,
         skinUndertone = excluded.skinUndertone,
         colorSeason = excluded.colorSeason,
         updatedAt = excluded.updatedAt`,
      [DEVICE_PROFILE_ID, prefs.skinTone, prefs.skinUndertone, prefs.colorSeason ?? null, now],
    );

    await db.runAsync('DELETE FROM tblSensitiveFiber WHERE profile_ID = ?', [DEVICE_PROFILE_ID]);
    await db.runAsync('DELETE FROM tblPreferredFiber WHERE profile_ID = ?', [DEVICE_PROFILE_ID]);
    await db.runAsync('DELETE FROM tblDressingContext WHERE profile_ID = ?', [DEVICE_PROFILE_ID]);

    for (const fiber of prefs.sensitiveFabrics) {
      await db.runAsync('INSERT INTO tblSensitiveFiber (profile_ID, fiberName) VALUES (?, ?)', [
        DEVICE_PROFILE_ID,
        fiber,
      ]);
    }
    for (const fiber of prefs.preferredFabrics) {
      await db.runAsync('INSERT INTO tblPreferredFiber (profile_ID, fiberName) VALUES (?, ?)', [
        DEVICE_PROFILE_ID,
        fiber,
      ]);
    }
    for (const code of prefs.dressingContexts) {
      await db.runAsync('INSERT INTO tblDressingContext (profile_ID, contextCode) VALUES (?, ?)', [
        DEVICE_PROFILE_ID,
        code,
      ]);
    }
  });
}
