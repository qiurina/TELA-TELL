import { ProfileScreenShell } from '@/features/profile/components/profile-screen-shell';
import { UserPreferencesPanel } from '@/features/profile/components/user-preferences-panel';

type PreferenceSectionScreenProps = {
  title: string;
  scope: 'skin-tone' | 'allergies' | 'preferred' | 'weather' | 'occasion';
};

export function PreferenceSectionScreen({ title, scope }: PreferenceSectionScreenProps) {
  return (
    <ProfileScreenShell title={title} showBack>
      <UserPreferencesPanel embedded scope={scope} />
    </ProfileScreenShell>
  );
}
