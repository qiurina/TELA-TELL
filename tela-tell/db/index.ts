export { getDatabase } from '@/db/client';
export { migrateDatabase } from '@/db/migrate';
export {
    deleteScan,
    getAllScans,
    getAllScanResults,
    getDeletedScans,
    getFavoriteScans,
    getScanById,
    isScanFavorite,
    permanentlyDeleteAllDeletedScans,
    permanentlyDeleteScans,
    purgeExpiredDeletedScans,
    restoreScans,
    saveScan,
    setScanFavorite,
    type SaveScanOptions,
  } from '@/db/scans';
export {
  registerUser,
  loginUser,
  getUserById,
  AuthError,
  type AuthUser,
  type RegisterUserInput,
  type LoginUserInput,
} from '@/db/users';
export { getPreferences, savePreferences } from '@/db/preferences';
