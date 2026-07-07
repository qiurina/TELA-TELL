import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '@/features/auth/context/auth-provider';
import { ProfileGuestView } from '@/features/profile/components/profile-guest-view';
import { ProfileScreenShell } from '@/features/profile/components/profile-screen-shell';
import { ProfileSignedInView } from '@/features/profile/components/profile-signed-in-view';

export default function ProfileHubScreen() {
  const { isSignedIn } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((current) => current + 1);
    }, []),
  );

  return (
    <ProfileScreenShell title="Profile">
      {isSignedIn ? (
        <ProfileSignedInView key={refreshKey} />
      ) : (
        <ProfileGuestView />
      )}
    </ProfileScreenShell>
  );
}
