import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Eye } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import {
  SUSTAINABILITY_BG,
  SUSTAINABILITY_BORDER,
  SUSTAINABILITY_DOT,
  type RecentScanPreview,
} from '@/data/scans/mock-data';

type ScanHistoryCardProps = {
  scan: RecentScanPreview;
  onPress: () => void;
};

const SUSTAINABILITY_PILL_LABEL = {
  green: 'Sustainable',
  yellow: 'Moderate',
  red: 'Low impact',
} as const;

const MISLABEL_PILL_LABEL = {
  true: 'Mislabeled',
  false: 'Label OK',
} as const;

export function ScanHistoryCard({ scan, onPress }: ScanHistoryCardProps) {
  const sustainColor = SUSTAINABILITY_DOT[scan.sustainability];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, faintCardShadow(), pressed && styles.cardPressed]}
      onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.fabric}>{scan.primaryFabric}</Text>
        <Text style={styles.composition}>{scan.composition}</Text>
        <Text style={styles.meta}>{scan.scannedAt}</Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusPill,
              scan.mislabeling ? styles.mislabelPillAlert : styles.mislabelPillOk,
            ]}>
            <Text
              numberOfLines={1}
              style={[
                styles.statusPillText,
                scan.mislabeling ? styles.mislabelTextAlert : styles.mislabelTextOk,
              ]}>
              {scan.mislabeling ? MISLABEL_PILL_LABEL.true : MISLABEL_PILL_LABEL.false}
            </Text>
          </View>
          <View
            style={[
              styles.statusPill,
              {
                borderColor: SUSTAINABILITY_BORDER[scan.sustainability],
                backgroundColor: SUSTAINABILITY_BG[scan.sustainability],
              },
            ]}>
            <View style={[styles.sustainDot, { backgroundColor: sustainColor }]} />
            <Text numberOfLines={1} style={[styles.statusPillText, { color: sustainColor }]}>
              {SUSTAINABILITY_PILL_LABEL[scan.sustainability]}
            </Text>
          </View>
        </View>
      </View>
      <LinearGradient
        colors={[BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.eyeButton}>
        <Eye size={18} color={BrandColors.white} strokeWidth={2} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    minHeight: 88,
  },
  cardPressed: {
    opacity: 0.92,
  },
  content: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  fabric: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
  },
  composition: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
  meta: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: BrandColors.textMuted,
    opacity: 0.85,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  mislabelPillAlert: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  mislabelPillOk: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  statusPillText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    lineHeight: 12,
    flexShrink: 1,
  },
  mislabelTextAlert: {
    color: '#dc2626',
  },
  mislabelTextOk: {
    color: '#16a34a',
  },
  sustainDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    flexShrink: 0,
  },
  eyeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
