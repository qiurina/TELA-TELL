import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Check, Eye, Bookmark, TriangleAlert } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import type { RecentScanPreview } from '@/data/scans/mock-data';
import type { FiberBadge } from '@/features/results/lib/fiber-badge';
import type { DeclaredLabelStatus } from '@/features/scan/lib/declared-label';

const FAVORITE_BOOKMARK = '#EAB308';

type ScanHistoryCardProps = {
  scan: RecentScanPreview;
  onPress: () => void;
  onLongPress?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
};

type PillTone = 'alert' | 'ok' | 'caution' | 'neutral';

/**
 * Pill for the stated-label check. No label ('none') and an unsure scan get no label pill: there
 * was nothing to compare, so "Label matches" would claim a check that never happened.
 */
const LABEL_PILL: Partial<Record<DeclaredLabelStatus, { text: string; tone: PillTone }>> = {
  mismatch: { text: 'May not match', tone: 'alert' },
  weak: { text: 'Partly matches', tone: 'caution' },
  unreadable: { text: "Can't check label", tone: 'neutral' },
  match: { text: 'Label matches', tone: 'ok' },
};

/** Shortened from the badge on the results photo, so both screens make the same call. */
const FIBER_PILL: Record<FiberBadge['kind'], { text: string; tone: PillTone }> = {
  likely: { text: 'Synthetic', tone: 'caution' },
  possible: { text: 'Possible synthetic', tone: 'caution' },
  not_synthetic: { text: 'Not synthetic', tone: 'ok' },
};

const UNSURE_AMBER = '#b45309';

/**
 * An unsure scan names no fiber, so the card says why instead of listing scores that read like a
 * blend: a close call shows the two fibers it was torn between; a weak match hedges on the top
 * fiber and suggests a rescan.
 */
function getUnsureCardText(scan: RecentScanPreview) {
  const [first, second] = scan.closestCandidates ?? [];
  if (scan.unsureReason === 'close_call' && first && second) {
    return {
      title: `${first.material} or ${second.material}?`,
      subtitle: `Too close to call · ${first.percentage}% vs ${second.percentage}%`,
    };
  }
  return {
    title: `Possibly ${first?.material ?? scan.primaryFabric}`,
    subtitle: 'Weak match · try rescanning',
  };
}

export function ScanHistoryCard({
  scan,
  onPress,
  onLongPress,
  selectionMode = false,
  selected = false,
}: ScanHistoryCardProps) {
  const unsureText = scan.unsure ? getUnsureCardText(scan) : null;
  const labelPill =
    LABEL_PILL[scan.labelStatus ?? (scan.mislabeling ? 'mismatch' : 'none')] ?? null;
  const fiberPill = scan.fiberBadgeKind ? FIBER_PILL[scan.fiberBadgeKind] : null;
  const pills = [fiberPill, labelPill].filter((pill) => pill !== null);

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
          recyclingKey={scan.id}
          cachePolicy="memory-disk"
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
        <Text style={styles.fabric} numberOfLines={1}>
          {unsureText ? unsureText.title : scan.primaryFabric}
        </Text>
        <Text style={styles.composition} numberOfLines={2}>
          {unsureText ? unsureText.subtitle : scan.composition}
        </Text>
        <Text style={styles.meta}>{scan.scannedAt}</Text>
        {unsureText ? (
          <View style={styles.statusRow}>
            <View style={[styles.statusPill, styles.cautionPill]}>
              <TriangleAlert size={10} color={UNSURE_AMBER} strokeWidth={2.5} />
              <Text numberOfLines={1} style={[styles.statusPillText, styles.cautionText]}>
                Unsure
              </Text>
            </View>
          </View>
        ) : pills.length > 0 ? (
          <View style={styles.statusRow}>
            {pills.map((pill) => (
              <View
                key={pill.text}
                style={[styles.statusPill, PILL_TONE_STYLES[pill.tone].pill]}>
                <Text
                  numberOfLines={1}
                  style={[styles.statusPillText, PILL_TONE_STYLES[pill.tone].text]}>
                  {pill.text}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
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
  alertPill: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  okPill: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  neutralPill: {
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.inputBackground,
  },
  statusPillText: {
    fontFamily: Fonts.medium,
    fontSize: 9,
    lineHeight: 11,
    flexShrink: 1,
  },
  alertText: {
    color: '#dc2626',
  },
  okText: {
    color: '#16a34a',
  },
  neutralText: {
    color: BrandColors.textMuted,
  },
  cautionPill: {
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
  },
  cautionText: {
    color: UNSURE_AMBER,
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

const PILL_TONE_STYLES = {
  alert: { pill: styles.alertPill, text: styles.alertText },
  ok: { pill: styles.okPill, text: styles.okText },
  caution: { pill: styles.cautionPill, text: styles.cautionText },
  neutral: { pill: styles.neutralPill, text: styles.neutralText },
} satisfies Record<PillTone, unknown>;
