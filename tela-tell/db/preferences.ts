import { getDatabase, isDatabaseAvailable } from '@/db/client';
import type {
  UserPreferences,
  SkinTone,
  SkinUndertone,
  ColorSeason,
} from '@/features/profile/lib/user-preferences';
import type { SupportedFabric } from '@/data/fabrics/fabrics';
import type { DressingContext } from '@/data/preferences/occasion-weather';

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

export async function getPreferences(userId: string | null | undefined): Promise<UserPreferences> {
  if (!isDatabaseAvailable() || !userId) {
    return emptyPreferences();
  }

  const db = await getDatabase();
  const profile = await db.getFirstAsync<{
    profile_ID: number;
    skinTone: string | null;
    skinUndertone: string | null;
  }>(
    'SELECT profile_ID, skinTone, skinUndertone FROM tblDeviceProfile WHERE user_id = ? LIMIT 1',
    [userId],
  );

  if (!profile) {
    return emptyPreferences();
  }

  let colorSeason: string | null = null;
  try {
    const row = await db.getFirstAsync<{ colorSeason: string | null }>(
      'SELECT colorSeason FROM tblDeviceProfile WHERE profile_ID = ?',
      [profile.profile_ID],
    );
    colorSeason = row?.colorSeason ?? null;
  } catch {
    // Column may not exist yet if migration hasn't run.
  }

  const sensitive = await db.getAllAsync<{ fiberName: string }>(
    'SELECT fiberName FROM tblSensitiveFiber WHERE profile_ID = ?',
    [profile.profile_ID],
  );
  const preferred = await db.getAllAsync<{ fiberName: string }>(
    'SELECT fiberName FROM tblPreferredFiber WHERE profile_ID = ?',
    [profile.profile_ID],
  );
  const contexts = await db.getAllAsync<{ contextCode: string }>(
    'SELECT contextCode FROM tblDressingContext WHERE profile_ID = ?',
    [profile.profile_ID],
  );

  return {
    skinTone: (profile.skinTone as SkinTone | null) ?? null,
    skinUndertone: (profile.skinUndertone as SkinUndertone | null) ?? null,
    colorSeason: (colorSeason as ColorSeason | null) ?? null,
    sensitiveFabrics: sensitive.map((r) => r.fiberName as SupportedFabric),
    preferredFabrics: preferred.map((r) => r.fiberName as SupportedFabric),
    dressingContexts: contexts.map((r) => r.contextCode as DressingContext),
  };
}

export async function savePreferences(userId: string, prefs: UserPreferences): Promise<void> {
  if (!isDatabaseAvailable()) {
    return;
  }

  const db = await getDatabase();
  const now = new Date().toISOString();

  const existing = await db.getFirstAsync<{ profile_ID: number }>(
    'SELECT profile_ID FROM tblDeviceProfile WHERE user_id = ? LIMIT 1',
    [userId],
  );

  let profileId: number;

  if (existing) {
    profileId = existing.profile_ID;
    await db.runAsync(
      `UPDATE tblDeviceProfile
       SET skinTone = ?, skinUndertone = ?, updatedAt = ?
       WHERE profile_ID = ?`,
      [prefs.skinTone, prefs.skinUndertone, now, profileId],
    );
    try {
      await db.runAsync(
        'UPDATE tblDeviceProfile SET colorSeason = ? WHERE profile_ID = ?',
        [prefs.colorSeason ?? null, profileId],
      );
    } catch {
      // Column may not exist yet.
    }
  } else {
    await db.runAsync(
      `INSERT INTO tblDeviceProfile (user_id, skinTone, skinUndertone, updatedAt)
       VALUES (?, ?, ?, ?)`,
      [userId, prefs.skinTone, prefs.skinUndertone, now],
    );
    const created = await db.getFirstAsync<{ profile_ID: number }>(
      'SELECT profile_ID FROM tblDeviceProfile WHERE user_id = ? LIMIT 1',
      [userId],
    );
    if (!created) {
      throw new Error('Failed to create device profile.');
    }
    profileId = created.profile_ID;
    try {
      await db.runAsync(
        'UPDATE tblDeviceProfile SET colorSeason = ? WHERE profile_ID = ?',
        [prefs.colorSeason ?? null, profileId],
      );
    } catch {
      // Column may not exist yet.
    }
  }

  await db.runAsync('DELETE FROM tblSensitiveFiber WHERE profile_ID = ?', [profileId]);
  await db.runAsync('DELETE FROM tblPreferredFiber WHERE profile_ID = ?', [profileId]);
  await db.runAsync('DELETE FROM tblDressingContext WHERE profile_ID = ?', [profileId]);

  for (const fiber of prefs.sensitiveFabrics) {
    await db.runAsync('INSERT INTO tblSensitiveFiber (profile_ID, fiberName) VALUES (?, ?)', [
      profileId,
      fiber,
    ]);
  }
  for (const fiber of prefs.preferredFabrics) {
    await db.runAsync('INSERT INTO tblPreferredFiber (profile_ID, fiberName) VALUES (?, ?)', [
      profileId,
      fiber,
    ]);
  }
  for (const code of prefs.dressingContexts) {
    await db.runAsync('INSERT INTO tblDressingContext (profile_ID, contextCode) VALUES (?, ?)', [
      profileId,
      code,
    ]);
  }
}
