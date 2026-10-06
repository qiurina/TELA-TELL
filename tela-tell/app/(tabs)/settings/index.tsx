import { ProfileScreenShell } from '@/features/profile/components/profile-screen-shell';
import { ProfileView } from '@/features/profile/components/profile-view';

export default function SettingsScreen() {
  return (
    <ProfileScreenShell title="Settings">
      <ProfileView />
    </ProfileScreenShell>
  );
}
