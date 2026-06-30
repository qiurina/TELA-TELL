import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CircleCheck, Tag, TriangleAlert } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { type FabricComposition } from '@/data/scans/mock-data';

type SellerComparisonCardProps = {
  sellerLabel: string | null;
  detectedDominant: string;
  compositions: FabricComposition[];
  mislabelingDetected: boolean;
  onAddLabel?: () => void;
};

export function SellerComparisonCard({
  sellerLabel,
  detectedDominant,
  compositions,
  mislabelingDetected,
  onAddLabel,
}: SellerComparisonCardProps) {
  const trimmedLabel = sellerLabel?.trim() ?? '';
  const hasSellerLabel = trimmedLabel.length > 0;
  const detectedSummary = compositions
    .map((item) => `${item.material} (${item.percentage}%)`)
    .join(', ');

  if (!hasSellerLabel) {
    return (
      <View style={[styles.card, styles.cardNeutral, faintCardShadow()]}>
        <View style={styles.header}>
          <Tag size={16} color={BrandColors.primary} strokeWidth={2} />
          <Text style={styles.headerTitle}>Seller label comparison</Text>
        </View>

        <Text style={styles.neutralPrompt}>Add seller label to compare</Text>

        {onAddLabel ? (
          <Pressable
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
            onPress={onAddLabel}
            accessibilityRole="button"
            accessibilityLabel="Add seller label">
            <Tag size={16} color={BrandColors.primary} strokeWidth={2.25} />
            <Text style={styles.addButtonText}>Add seller label</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  const isConflict = mislabelingDetected;
  const cardTitle = isConflict ? 'MISLABELED' : 'NOT MISLABELED';

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
          {cardTitle}
        </Text>
      </View>

      <View style={styles.compareRow}>
        <View style={styles.compareCol}>
          <Text style={styles.compareLabel}>DECLARED</Text>
          <Text style={styles.compareValue}>{trimmedLabel}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.compareCol}>
          <Text style={styles.compareLabel}>DETECTED MATERIAL</Text>
          <Text style={styles.compareValue}>{detectedDominant}</Text>
          <Text style={styles.compareSub}>{detectedSummary}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
  },
  cardNeutral: {
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.white,
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
    fontSize: 12,
    letterSpacing: 0.8,
    color: BrandColors.text,
  },
  headerConflict: {
    color: '#dc2626',
  },
  headerClear: {
    color: '#15803d',
  },
  neutralPrompt: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: BrandColors.textMuted,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.white,
  },
  addButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primary,
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
  compareSub: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: BrandColors.textMuted,
  },
  divider: {
    width: 1,
    backgroundColor: BrandColors.borderLight,
  },
  pressed: {
    opacity: 0.88,
  },
});
