import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useState, useSyncExternalStore } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Bookmark,
  Calendar,
  Camera,
  Download,
  Heart,
  Info,
  LogOut,
  Share2,
  Sun,
  Trash2,
  TriangleAlert,
  User,
} from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { useAuth } from '@/features/auth/context/auth-provider';
import { DeleteAccountSheet } from '@/features/profile/components/delete-account-sheet';
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
  formatProfileDisplayName,
  getOccasionDisplay,
  getPreferredFabricsDisplay,
  getProfileInitial,
  getSensitiveFabricsDisplay,
  getSkinToneDisplay,
  getWeatherDisplay,
} from '@/features/profile/lib/profile-display';
import {
  getUserPreferencesSnapshot,
  hydrateUserPreferences,
  persistUserPreferences,
  setUserPreferences,
  subscribeUserPreferences,
  type UserPreferences,
} from '@/features/profile/lib/user-preferences';
import { ScanConfirmSheet } from '@/features/scan/components/scan-confirm-sheet';

/** Root-stack routes (siblings of tabs) — tab bar stays under the push, no mid-anim hide. */
const PROFILE_SKIN_TONE_HREF = '/skin-tone' as Href;
const PROFILE_ALLERGIES_HREF = '/fabric-allergies' as Href;
const PROFILE_PREFERRED_HREF = '/preferred-fabrics' as Href;
const PROFILE_WEATHER_HREF = '/weather' as Href;
const PROFILE_OCCASION_HREF = '/occasion' as Href;
const PROFILE_ABOUT_HREF = '/about' as Href;
const PROFILE_EDIT_HREF = '/edit-profile' as Href;
const PROFILE_FAVORITES_HREF = '/favorite-scans' as Href;
const PROFILE_DELETED_HREF = '/deleted-scans' as Href;

export function ProfileSignedInView() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const [isDeleteSheetVisible, setIsDeleteSheetVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    count: number;
    preferences: UserPreferences;
  } | null>(null);
  const username = session?.username ?? '';
  const displayName = session
    ? formatProfileDisplayName(session)
    : formatProfileDisplayName(username);
  const initial = session ? getProfileInitial(session) : getProfileInitial(username);

  const prefs = useSyncExternalStore(
    subscribeUserPreferences,
    getUserPreferencesSnapshot,
    getUserPreferencesSnapshot,
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void (async () => {
        await hydrateUserPreferences(session?.userId ?? null);
        if (!active) {
          return;
        }
      })();

      return () => {
        active = false;
      };
    }, [session?.userId]),
  );

  const openNested = (href: Href) => {
    router.push(href);
  };

  const endSession = async () => {
    await signOut();
    router.replace('/welcome' as Href);
  };

  const handleExportData = async () => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      await exportUserData({ userId: session?.userId ?? null, username });
    } catch (error) {
      Alert.alert(
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

      const count = await importScans(
        payload.scans,
        payload.favoriteScanIds,
        session?.userId ?? null,
      );

      if (payload.preferences) {
        setPendingImport({ count, preferences: payload.preferences });
      } else {
        Alert.alert('Import complete', `Imported ${count} scan${count === 1 ? '' : 's'}.`);
      }
    } catch (error) {
      Alert.alert(
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
    void persistUserPreferences(session?.userId ?? null);
    setPendingImport(null);
  };

  const skinTone = getSkinToneDisplay(prefs);
  const allergies = getSensitiveFabricsDisplay(prefs);
  const preferred = getPreferredFabricsDisplay(prefs);
  const weather = getWeatherDisplay(prefs);
  const occasion = getOccasionDisplay(prefs);

  return (
    <>
      <Pressable
        style={styles.identity}
        onPress={() => openNested(PROFILE_EDIT_HREF)}
        accessibilityRole="button"
        accessibilityLabel="Edit Profile">
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            {session?.avatarUri ? (
              <Image source={{ uri: session.avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
          </View>
          <View style={styles.avatarBadge}>
            <Camera size={12} color={BrandColors.white} strokeWidth={2.5} />
          </View>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>@{username}</Text>
      </Pressable>

      <View style={styles.section}>
        <ProfileSectionLabel title="Profile" />
        <ProfileGroupedCard>
          <ProfilePreferenceRow
            title="Edit Profile"
            icon={<User size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => openNested(PROFILE_EDIT_HREF)}
            isLast
          />
        </ProfileGroupedCard>
      </View>

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
            title="Delete Account"
            icon={<Trash2 size={18} color="#DC2626" strokeWidth={2.25} />}
            titleColor="#DC2626"
            onPress={() => setIsDeleteSheetVisible(true)}
            isLast
          />
        </ProfileGroupedCard>
      </View>

      <Pressable
        style={({ pressed }) => [styles.logoutButton, faintCardShadow(), pressed && styles.pressed]}
        onPress={() => void endSession()}
        accessibilityRole="button"
        accessibilityLabel="Log out">
        <LogOut size={18} color={BrandColors.textMuted} strokeWidth={2.25} />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>

      <DeleteAccountSheet
        visible={isDeleteSheetVisible}
        username={username}
        userId={session?.userId ?? ''}
        onCancel={() => setIsDeleteSheetVisible(false)}
        onDeleted={() => void endSession()}
      />

      <ScanConfirmSheet
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
  identity: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 4,
  },
  avatarWrap: {
    width: 72,
    height: 72,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: BrandColors.lavenderCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BrandColors.border,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BrandColors.white,
  },
  avatarText: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    color: BrandColors.primary,
  },
  name: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: BrandColors.text,
  },
  email: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  logoutText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.textMuted,
  },
  pressed: {
    opacity: 0.9,
  },
});
