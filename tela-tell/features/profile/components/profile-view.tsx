import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useState, useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Bookmark,
  Calendar,
  CircleHelp,
  Download,
  Heart,
  Info,
  Share2,
  Sun,
  Trash2,
  TriangleAlert,
} from '@/components/ui/lucide-icons';
import { showAlert } from '@/components/ui/alert-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BrandColors } from '@/constants/brand';
import { deleteAllScans } from '@/db/scans';
import { ProfileSectionLabel } from '@/features/profile/components/profile-section-label';
import {
  ProfileGroupedCard,
  ProfilePreferenceRow,
} from '@/features/profile/components/profile-preference-row';
import {
  exportUserData,
  importScans,
  pickAndParseExportFile,
} from '@/features/profile/lib/data-export';
import {
  getOccasionDisplay,
  getPreferredFabricsDisplay,
  getSensitiveFabricsDisplay,
  getSkinToneDisplay,
  getWeatherDisplay,
} from '@/features/profile/lib/profile-display';
import {
  clearUserPreferences,
  getUserPreferencesSnapshot,
  hydrateUserPreferences,
  persistUserPreferences,
  setUserPreferences,
  subscribeUserPreferences,
  type UserPreferences,
} from '@/features/profile/lib/user-preferences';
import { clearLastGarmentCondition } from '@/features/scan/lib/garment-condition';
import { clearLastSellerLabel } from '@/features/scan/lib/last-seller-label';

/** Root-stack routes (siblings of tabs) — tab bar stays under the push, no mid-anim hide. */
const PROFILE_SKIN_TONE_HREF = '/skin-tone' as Href;
const PROFILE_ALLERGIES_HREF = '/fabric-allergies' as Href;
const PROFILE_PREFERRED_HREF = '/preferred-fabrics' as Href;
const PROFILE_WEATHER_HREF = '/weather' as Href;
const PROFILE_OCCASION_HREF = '/occasion' as Href;
const PROFILE_ABOUT_HREF = '/about' as Href;
const TUTORIAL_HREF = '/onboarding' as Href;
const PROFILE_FAVORITES_HREF = '/favorite-scans' as Href;
const PROFILE_DELETED_HREF = '/deleted-scans' as Href;

export function ProfileView() {
  const router = useRouter();
  const [isResetVisible, setIsResetVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    count: number;
    preferences: UserPreferences;
  } | null>(null);

  const prefs = useSyncExternalStore(
    subscribeUserPreferences,
    getUserPreferencesSnapshot,
    getUserPreferencesSnapshot,
  );

  useFocusEffect(
    useCallback(() => {
      void hydrateUserPreferences();
    }, []),
  );

  const openNested = (href: Href) => {
    router.push(href);
  };

  const handleExportData = async () => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      await exportUserData();
    } catch (error) {
      showAlert(
        'Could not export data',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    if (isImporting) {
      return;
    }

    setIsImporting(true);
    try {
      const payload = await pickAndParseExportFile();
      if (!payload) {
        return;
      }

      const count = await importScans(payload.scans, payload.favoriteScanIds);

      if (payload.preferences) {
        setPendingImport({ count, preferences: payload.preferences });
      } else {
        showAlert(
          'Import complete',
          `Imported ${count} scan${count === 1 ? '' : 's'}.`,
          'success',
        );
      }
    } catch (error) {
      showAlert(
        'Could not import data',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmImportPreferences = () => {
    if (!pendingImport) {
      return;
    }
    setUserPreferences(pendingImport.preferences);
    void persistUserPreferences();
    setPendingImport(null);
  };

  const handleConfirmReset = () => {
    setIsResetVisible(false);
    void (async () => {
      try {
        await deleteAllScans();
        clearUserPreferences();
        await persistUserPreferences();
        clearLastSellerLabel();
        clearLastGarmentCondition();
        showAlert('Data reset', 'All scans and preferences were removed from this device.', 'success');
      } catch {
        showAlert('Could not reset data', 'Please try again.');
      }
    })();
  };

  const skinTone = getSkinToneDisplay(prefs);
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
            title="Skin tone"
            value={skinTone.label}
            icon={
              skinTone.swatch ? (
                <View style={[styles.toneDot, { backgroundColor: skinTone.swatch }]} />
              ) : (
                <View style={styles.toneDotEmpty} />
              )
            }
            onPress={() => openNested(PROFILE_SKIN_TONE_HREF)}
          />
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
            title="Export My Data"
            value={isExporting ? 'Preparing export...' : undefined}
            icon={<Share2 size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => void handleExportData()}
          />
          <ProfilePreferenceRow
            title="Import My Data"
            value={isImporting ? 'Importing...' : undefined}
            icon={<Download size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => void handleImportData()}
          />
          <ProfilePreferenceRow
            title="Reset My Data"
            value="Delete all scans and preferences"
            icon={<Trash2 size={18} color="#DC2626" strokeWidth={2.25} />}
            titleColor="#DC2626"
            onPress={() => setIsResetVisible(true)}
            isLast
          />
        </ProfileGroupedCard>
      </View>

      <ConfirmDialog
        visible={isResetVisible}
        title="Reset all data?"
        message="This permanently deletes every scan (including favorites and Recently deleted) and clears your preferences on this device. Export first if you want a backup."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetVisible(false)}
      />

      <ConfirmDialog
        visible={pendingImport !== null}
        title="Replace your preferences?"
        message={
          pendingImport
            ? `Imported ${pendingImport.count} scan${pendingImport.count === 1 ? '' : 's'}. This file also has saved preferences (skin tone, allergies, preferred fabrics, etc). Replace what's on this device with them?`
            : ''
        }
        confirmLabel="Replace"
        cancelLabel="Keep mine"
        onConfirm={handleConfirmImportPreferences}
        onCancel={() => setPendingImport(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
  },
  toneDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  toneDotEmpty: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.inputBackground,
  },
});
