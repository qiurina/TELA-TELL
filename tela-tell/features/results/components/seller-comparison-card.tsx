import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CircleCheck, Tag, TriangleAlert } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';

type SellerComparisonCardProps = {
  sellerLabel: string | null;
  detectedLabel: string;
  mislabelingDetected: boolean;
  mislabelMessage?: string;
  onAddLabel?: () => void;
};

export function SellerComparisonCard({
  sellerLabel,
  detectedLabel,
  mislabelingDetected,
  mislabelMessage,
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

  const isConflict = mislabelingDetected;
  const detail = mislabelMessage?.trim();

  return (
    <View
      style={[
        styles.card,
        isConflict ? styles.cardConflict : styles.cardClear,
        faintCardShadow(),
      ]}>
      <View style={styles.header}>
        {isConflict ? (
          <TriangleAlert size={16} color="#dc2626" strokeWidth={2.5} />
        ) : (
          <CircleCheck size={16} color="#15803d" strokeWidth={2.25} />
        )}
        <Text style={[styles.headerTitle, isConflict ? styles.headerConflict : styles.headerClear]}>
          {isConflict ? 'Possible mislabel' : 'Label matches'}
        </Text>
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

      {isConflict && detail ? <Text style={styles.message}>{detail}</Text> : null}
    </View>
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
  cardConflict: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  cardClear: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
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
  headerConflict: {
    color: '#dc2626',
  },
  headerClear: {
    color: '#15803d',
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
    color: '#991b1b',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  pressed: {
    opacity: 0.88,
  },
});
