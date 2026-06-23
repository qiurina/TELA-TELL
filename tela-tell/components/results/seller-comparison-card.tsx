import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Tag } from '@/components/ui/lucide-icons';
import { MISLABEL_ALERT_MIN_CONFIDENCE } from '@/constants/analysis';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { type FabricComposition } from '@/constants/mock-data';

type SellerComparisonCardProps = {
  sellerLabel: string | null;
  detectedDominant: string;
  compositions: FabricComposition[];
  confidence: number;
  mislabelingDetected: boolean;
  onAddLabel?: () => void;
};

function getMismatchFootnote(
  mislabelingDetected: boolean,
  confidence: number,
): string {
  if (mislabelingDetected) {
    return `Possible mismatch flagged at ${confidence}% confidence (threshold: ${MISLABEL_ALERT_MIN_CONFIDENCE}%). This is guidance only — not proof of mislabeling.`;
  }

  return `Possible mislabel: None. Detection confidence: ${confidence}%.`;
}

export function SellerComparisonCard({
  sellerLabel,
  detectedDominant,
  compositions,
  confidence,
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
      <View style={[styles.card, faintCardShadow()]}>
        <View style={styles.header}>
          <Tag size={16} color={BrandColors.primary} strokeWidth={2} />
          <Text style={styles.headerTitle}>Seller label comparison</Text>
        </View>

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

  return (
    <View style={[styles.card, faintCardShadow()]}>
      <View style={styles.header}>
        <Tag size={16} color={BrandColors.primary} strokeWidth={2} />
        <Text style={styles.headerTitle}>Seller label comparison</Text>
      </View>

      <View style={styles.compareRow}>
        <View style={styles.compareCol}>
          <Text style={styles.compareLabel}>DECLARED</Text>
          <Text style={styles.compareValue}>{trimmedLabel}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.compareCol}>
          <Text style={styles.compareLabel}>DETECTED</Text>
          <Text style={styles.compareValue}>{detectedDominant}</Text>
          <Text style={styles.compareSub}>{detectedSummary}</Text>
        </View>
      </View>

      <Text style={styles.footnote}>
        {getMismatchFootnote(mislabelingDetected, confidence)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
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
  footnote: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: BrandColors.textMuted,
  },
  pressed: {
    opacity: 0.88,
  },
});
