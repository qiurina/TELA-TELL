import { ProfileScreenShell } from '@/features/profile/components/profile-screen-shell';
import { UserPreferencesPanel } from '@/features/profile/components/user-preferences-panel';

export default function ScanSettingsScreen() {
  return (
    <ProfileScreenShell title="Scan settings" showBack>
      <UserPreferencesPanel embedded scope="scan" />
    </ProfileScreenShell>
  );
}
