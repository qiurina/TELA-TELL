import * as FileSystem from 'expo-file-system/legacy';

const AVATAR_DIR = `${FileSystem.documentDirectory}avatars/`;

export async function saveAvatarFile(uri: string, userId: string): Promise<string> {
  const dirInfo = await FileSystem.getInfoAsync(AVATAR_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AVATAR_DIR, { intermediates: true });
  }

  const destination = `${AVATAR_DIR}${userId}.jpg`;

  const existing = await FileSystem.getInfoAsync(destination);
  if (existing.exists) {
    await FileSystem.deleteAsync(destination, { idempotent: true });
  }

  await FileSystem.copyAsync({ from: uri, to: destination });

  // Cache-bust so an <Image> re-render picks up the new file at the same path.
  return `${destination}?v=${Date.now()}`;
}
