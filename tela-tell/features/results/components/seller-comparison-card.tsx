import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CircleCheck, Info, Tag, TriangleAlert } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import type { DeclaredLabelCheck } from '@/features/scan/lib/declared-label';

type SellerComparisonCardProps = {
  sellerLabel: string | null;
  detectedLabel: string;
  check: DeclaredLabelCheck;
  onAddLabel?: () => void;
};

const STATUS_STYLE = {
  mismatch: { border: '#fecaca', background: '#fef2f2', accent: '#dc2626', text: '#991b1b' },
  weak: { border: '#fde68a', background: '#fffbeb', accent: '#b45309', text: '#92400e' },
  unreadable: {
    border: BrandColors.border,
    background: BrandColors.inputBackground,
    accent: BrandColors.textMuted,
    text: BrandColors.textMuted,
  },
  match: { border: '#bbf7d0', background: '#f0fdf4', accent: '#15803d', text: '#166534' },
} as const;

export function SellerComparisonCard({
  sellerLabel,
  detectedLabel,
  check,
  onAddLabel,
}: SellerComparisonCardProps) {
  const trimmedLabel = sellerLabel?.trim() ?? '';
  const hasSellerLabel = trimmedLabel.length > 0;

  if (!hasSellerLabel) {
    return (
      <Pressable
        style={({ pressed }) => [styles.ctaRow, faintCardShadow(), pressed && styles.pressed]}
        onPress={onAddLabel}
        disabled={!onAddLabel}
        accessibilityRole="button"
        accessibilityLabel="Add stated label to compare">
        <View style={styles.ctaIcon}>
          <Tag size={16} color={BrandColors.primary} strokeWidth={2.25} />
        </View>
        <View style={styles.ctaText}>
          <Text style={styles.ctaTitle}>Compare stated label</Text>
          <Text style={styles.ctaBody}>Add what the seller claimed to check for mislabeling</Text>
        </View>
      </Pressable>
    );
  }

  const tone = STATUS_STYLE[check.status === 'none' ? 'unreadable' : check.status];
  const heading =
    check.status === 'mismatch'
      ? 'Possible mislabel'
      : check.status === 'weak'
        ? 'Label only partly confirmed'
        : check.status === 'match'
          ? 'Label matches'
          : "Can't check this label";
  const detail = check.message.trim();

  return (
    <Pressable
      onPress={onAddLabel}
      disabled={!onAddLabel}
      accessibilityRole="button"
      accessibilityLabel={`${heading}. Edit stated label`}
      style={({ pressed }) => [
        styles.card,
        { borderColor: tone.border, backgroundColor: tone.background },
        faintCardShadow(),
        pressed && styles.pressed,
      ]}>
      <View style={styles.header}>
        {check.status === 'mismatch' ? (
          <TriangleAlert size={16} color={tone.accent} strokeWidth={2.5} />
        ) : check.status === 'match' ? (
          <CircleCheck size={16} color={tone.accent} strokeWidth={2.25} />
        ) : (
          <Info size={16} color={tone.accent} strokeWidth={2.25} />
        )}
        <Text style={[styles.headerTitle, { color: tone.accent }]}>{heading}</Text>
      </View>

      <View style={styles.compareRow}>
        <View style={styles.compareCol}>
          <Text style={styles.compareLabel}>SELLER SAID</Text>
          <Text style={styles.compareValue}>{trimmedLabel}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.compareCol}>
          <Text style={styles.compareLabel}>SCAN FOUND</Text>
          <Text style={styles.compareValue}>{detectedLabel}</Text>
        </View>
      </View>

      {detail ? <Text style={[styles.message, { color: tone.text }]}>{detail}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.white,
  },
  ctaIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavenderCard,
  },
  ctaText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  ctaTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primaryDark,
  },
  ctaBody: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  compareRow: {
    flexDirection: 'row',
    gap: 12,
  },
  compareCol: {
    flex: 1,
    gap: 4,
  },
  compareLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: BrandColors.textMuted,
  },
  compareValue: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: BrandColors.text,
    lineHeight: 20,
  },
  message: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  pressed: {
    opacity: 0.88,
  },
});
