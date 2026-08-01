import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Check, Eye, Bookmark } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import {
  SUSTAINABILITY_BG,
  SUSTAINABILITY_BORDER,
  SUSTAINABILITY_DOT,
  type RecentScanPreview,
} from '@/data/scans/mock-data';

const FAVORITE_BOOKMARK = '#EAB308';

type ScanHistoryCardProps = {
  scan: RecentScanPreview;
  onPress: () => void;
  onLongPress?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
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

export function ScanHistoryCard({
  scan,
  onPress,
  onLongPress,
  selectionMode = false,
  selected = false,
}: ScanHistoryCardProps) {
  const sustainColor = SUSTAINABILITY_DOT[scan.sustainability];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        faintCardShadow(),
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={280}
      accessibilityRole="button"
      accessibilityState={selectionMode ? { selected } : undefined}>
      <View style={styles.thumbWrap}>
        <Image
          source={scan.image}
          style={styles.thumbnail}
          contentFit="cover"
          accessibilityLabel="Scanned fabric"
        />
        {scan.isFavorite && !selectionMode ? (
          <View style={styles.favoriteBadge} pointerEvents="none">
            <Bookmark
              size={15}
              color={FAVORITE_BOOKMARK}
              fill={FAVORITE_BOOKMARK}
              strokeWidth={2.25}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.fabric}>{scan.primaryFabric}</Text>
        <Text style={styles.composition} numberOfLines={2}>
          {scan.composition}
        </Text>
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

      {selectionMode ? (
        <View style={[styles.checkButton, selected && styles.checkButtonSelected]}>
          {selected ? <Check size={16} color={BrandColors.white} strokeWidth={2.75} /> : null}
        </View>
      ) : (
        <LinearGradient
          colors={[BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.eyeButton}>
          <Eye size={16} color={BrandColors.white} strokeWidth={2} />
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.white,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    gap: 10,
    minHeight: 84,
    overflow: 'visible',
  },
  cardSelected: {
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.lavender,
  },
  cardPressed: {
    opacity: 0.92,
  },
  thumbWrap: {
    position: 'relative',
    flexShrink: 0,
    overflow: 'visible',
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: BrandColors.inputBackground,
  },
  favoriteBadge: {
    position: 'absolute',
    top: -4,
    right: 2,
    zIndex: 2,
  },
  content: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  fabric: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
  },
  composition: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: BrandColors.textMuted,
  },
  meta: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: BrandColors.textMuted,
    opacity: 0.85,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 3,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
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
    fontSize: 9,
    lineHeight: 11,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkButtonSelected: {
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.primary,
  },
});
