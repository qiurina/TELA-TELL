import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Calendar,
  Heart,
  Info,
  LogOut,
  Sun,
  TriangleAlert,
} from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { SUSTAINABILITY_DOT } from '@/data/scans/mock-data';
import { useAuth } from '@/features/auth/context/auth-provider';
import { ProfileSectionLabel } from '@/features/profile/components/profile-section-label';
import {
  ProfileGroupedCard,
  ProfilePreferenceRow,
} from '@/features/profile/components/profile-preference-row';
import {
  formatProfileDisplayName,
  getOccasionDisplay,
  getPreferredFabricsDisplay,
  getProfileInitial,
  getScanStats,
  getSensitiveFabricsDisplay,
  getSkinToneDisplay,
  getWeatherDisplay,
} from '@/features/profile/lib/profile-display';

const PROFILE_SKIN_TONE_HREF = '/(tabs)/profile/skin-tone' as Href;
const PROFILE_ALLERGIES_HREF = '/(tabs)/profile/fabric-allergies' as Href;
const PROFILE_PREFERRED_HREF = '/(tabs)/profile/preferred-fabrics' as Href;
const PROFILE_WEATHER_HREF = '/(tabs)/profile/weather' as Href;
const PROFILE_OCCASION_HREF = '/(tabs)/profile/occasion' as Href;
const PROFILE_ABOUT_HREF = '/(tabs)/profile/about' as Href;

export function ProfileSignedInView() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const email = session?.email ?? '';
  const displayName = formatProfileDisplayName(email);
  const initial = getProfileInitial(email);
  const stats = getScanStats();
  const skinTone = getSkinToneDisplay();
  const allergies = getSensitiveFabricsDisplay();
  const preferred = getPreferredFabricsDisplay();
  const weather = getWeatherDisplay();
  const occasion = getOccasionDisplay();

  return (
    <>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, faintCardShadow()]}>
          <Text style={[styles.statValue, styles.statPrimary]}>{stats.totalScans}</Text>
          <Text style={styles.statLabel}>scans</Text>
        </View>
        <View style={[styles.statCard, faintCardShadow()]}>
          <Text style={[styles.statValue, styles.statSustainable]}>{stats.sustainableCount}</Text>
          <Text style={styles.statLabel}>sustainable</Text>
        </View>
        <View style={[styles.statCard, faintCardShadow()]}>
          <Text style={[styles.statValue, styles.statMislabeled]}>{stats.mislabeledCount}</Text>
          <Text style={styles.statLabel}>mislabeled</Text>
        </View>
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
            onPress={() => router.push(PROFILE_SKIN_TONE_HREF)}
          />
          <ProfilePreferenceRow
            title="Fabric allergies"
            value={allergies}
            icon={<TriangleAlert size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => router.push(PROFILE_ALLERGIES_HREF)}
          />
          <ProfilePreferenceRow
            title="Preferred fabrics"
            value={preferred}
            icon={<Heart size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => router.push(PROFILE_PREFERRED_HREF)}
          />
          <ProfilePreferenceRow
            title="Weather"
            value={weather}
            icon={<Sun size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => router.push(PROFILE_WEATHER_HREF)}
          />
          <ProfilePreferenceRow
            title="Occasion"
            value={occasion}
            icon={<Calendar size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => router.push(PROFILE_OCCASION_HREF)}
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
            onPress={() => router.push(PROFILE_ABOUT_HREF)}
            isLast
          />
        </ProfileGroupedCard>
      </View>

      <Pressable
        style={({ pressed }) => [styles.logoutButton, faintCardShadow(), pressed && styles.pressed]}
        onPress={() => void signOut()}
        accessibilityRole="button"
        accessibilityLabel="Log out">
        <LogOut size={18} color={SUSTAINABILITY_DOT.red} strokeWidth={2.25} />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
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
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: BrandColors.lavenderCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BrandColors.border,
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
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    backgroundColor: BrandColors.white,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 22,
  },
  statPrimary: {
    color: BrandColors.primary,
  },
  statSustainable: {
    color: SUSTAINABILITY_DOT.green,
  },
  statMislabeled: {
    color: SUSTAINABILITY_DOT.red,
  },
  statLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: BrandColors.textMuted,
    textTransform: 'lowercase',
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
    borderColor: '#FECACA',
  },
  logoutText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: SUSTAINABILITY_DOT.red,
  },
  pressed: {
    opacity: 0.9,
  },
});
