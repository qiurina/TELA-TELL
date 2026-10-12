import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useState, useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Bookmark,
  Calendar,
  CircleHelp,
  Database,
  Heart,
  Info,
  Sun,
  Trash2,
  TriangleAlert,
} from '@/components/ui/lucide-icons';
import { showAlert } from '@/components/ui/alert-dialog';
import { BrandColors } from '@/constants/brand';
import { ProfileSectionLabel } from '@/features/profile/components/profile-section-label';
import {
  ProfileGroupedCard,
  ProfilePreferenceRow,
} from '@/features/profile/components/profile-preference-row';
import {
  getOccasionDisplay,
  getPreferredFabricsDisplay,
  getSensitiveFabricsDisplay,
  getWeatherDisplay,
} from '@/features/profile/lib/profile-display';
import {
  formatBytes,
  getScanPhotoStorage,
  type ScanPhotoStorage,
} from '@/features/profile/lib/storage-usage';
import {
  getUserPreferencesSnapshot,
  hydrateUserPreferences,
  subscribeUserPreferences,
} from '@/features/profile/lib/user-preferences';

/** Root-stack routes (siblings of tabs) — tab bar stays under the push, no mid-anim hide. */
const PROFILE_ALLERGIES_HREF = '/fabric-allergies' as Href;
const PROFILE_PREFERRED_HREF = '/preferred-fabrics' as Href;
const PROFILE_WEATHER_HREF = '/weather' as Href;
const PROFILE_OCCASION_HREF = '/occasion' as Href;
const PROFILE_ABOUT_HREF = '/about' as Href;
const TUTORIAL_HREF = '/onboarding' as Href;
const PROFILE_FAVORITES_HREF = '/favorite-scans' as Href;
const PROFILE_DELETED_HREF = '/deleted-scans' as Href;
const PROFILE_DATA_HREF = '/data' as Href;

export function ProfileView() {
  const router = useRouter();
  // undefined while measuring; null where there is no file system (web).
  const [photoStorage, setPhotoStorage] = useState<ScanPhotoStorage | null | undefined>(undefined);

  const prefs = useSyncExternalStore(
    subscribeUserPreferences,
    getUserPreferencesSnapshot,
    getUserPreferencesSnapshot,
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void hydrateUserPreferences().catch(() => {
        if (active) showAlert('Could not load preferences', 'Please try opening Settings again.');
      });
      void getScanPhotoStorage()
        .then((next) => { if (active) setPhotoStorage(next); })
        .catch(() => { if (active) setPhotoStorage(null); });
      return () => { active = false; };
    }, []),
  );

  const openNested = (href: Href) => {
    router.push(href);
  };

  const allergies = getSensitiveFabricsDisplay(prefs);
  const preferred = getPreferredFabricsDisplay(prefs);
  const weather = getWeatherDisplay(prefs);
  const occasion = getOccasionDisplay(prefs);

  return (
    <>
      <View style={styles.section}>
        <ProfileSectionLabel title="My preferences" />
        <ProfileGroupedCard>
          <ProfilePreferenceRow
            title="Fabric allergies"
            value={allergies}
            icon={<TriangleAlert size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => openNested(PROFILE_ALLERGIES_HREF)}
          />
          <ProfilePreferenceRow
            title="Preferred fabrics"
            value={preferred}
            icon={<Heart size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => openNested(PROFILE_PREFERRED_HREF)}
          />
          <ProfilePreferenceRow
            title="Weather"
            value={weather}
            icon={<Sun size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => openNested(PROFILE_WEATHER_HREF)}
          />
          <ProfilePreferenceRow
            title="Occasion"
            value={occasion}
            icon={<Calendar size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => openNested(PROFILE_OCCASION_HREF)}
            isLast
          />
        </ProfileGroupedCard>
      </View>

      <View style={styles.section}>
        <ProfileSectionLabel title="My scans" />
        <ProfileGroupedCard>
          <ProfilePreferenceRow
            title="Favorite scans"
            icon={<Bookmark size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => openNested(PROFILE_FAVORITES_HREF)}
          />
          <ProfilePreferenceRow
            title="Recently deleted"
            value="Restore within 30 days"
            icon={<Trash2 size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => openNested(PROFILE_DELETED_HREF)}
            isLast
          />
        </ProfileGroupedCard>
      </View>

      <View style={styles.section}>
        <ProfileSectionLabel title="App settings" />
        <ProfileGroupedCard>
          <ProfilePreferenceRow
            title="Replay tutorial"
            icon={<CircleHelp size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => openNested(TUTORIAL_HREF)}
          />
          <ProfilePreferenceRow
            title="About TELA-TELL"
            icon={<Info size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => openNested(PROFILE_ABOUT_HREF)}
          />
          <ProfilePreferenceRow
            title="Data"
            value={
              photoStorage === undefined
                ? 'Measuring...'
                : photoStorage === null
                  ? 'Backup and reset'
                  : `${formatBytes(photoStorage.bytes)} used`
            }
            icon={<Database size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => openNested(PROFILE_DATA_HREF)}
            isLast
          />
        </ProfileGroupedCard>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
  },
});
