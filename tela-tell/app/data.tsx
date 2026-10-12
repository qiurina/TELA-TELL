import { DataSettingsView } from '@/features/profile/components/data-settings-view';
import { ProfileScreenShell } from '@/features/profile/components/profile-screen-shell';

export default function DataScreen() {
  return (
    <ProfileScreenShell title="Data" showBack>
      <DataSettingsView />
    </ProfileScreenShell>
  );
}
