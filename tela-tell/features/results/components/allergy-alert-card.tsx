import { StyleSheet, Text, View } from 'react-native';

import { CircleCheck, TriangleAlert } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import type { AllergyAlert } from '@/data/fabrics/fabric-allergies';
import { Fonts } from '@/constants/fonts';

type AllergyAlertCardProps = {
  alert: AllergyAlert;
  compact?: boolean;
  stacked?: boolean;
};

export function AllergyAlertCard({
  alert,
  compact = false,
  stacked = false,
}: AllergyAlertCardProps) {
  const isConflict = alert.conflictDetected;
  const alternativeNames = alert.alternatives.map((item) => item.name).join(' · ');

  return (
    <View
      style={[
        styles.card,
        compact && styles.cardCompact,
        stacked && styles.cardStacked,
        isConflict ? styles.cardConflict : styles.cardClear,
      ]}>
      {isConflict ? (
        <TriangleAlert size={16} color="#B45309" strokeWidth={2.5} />
      ) : (
        <CircleCheck size={16} color="#15803D" strokeWidth={2.25} />
      )}

      <View style={styles.body}>
        <Text style={[styles.title, isConflict ? styles.titleConflict : styles.titleClear]}>
          {isConflict ? 'Sensitivity alert' : 'All clear'}
        </Text>
        <Text style={styles.message} numberOfLines={stacked ? 3 : undefined}>
          {isConflict
            ? alert.message
            : stacked
              ? 'No conflicts with your sensitivity list.'
              : 'No conflicts with the fiber sensitivities in your profile.'}
        </Text>
        {isConflict && alternativeNames ? (
          <Text style={styles.altNames} numberOfLines={stacked ? 2 : undefined}>
            Try: <Text style={styles.altNamesValue}>{alternativeNames}</Text>
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  cardCompact: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cardStacked: {
    flex: 1,
    flexDirection: 'column',
    minHeight: 112,
    gap: 6,
  },
  cardConflict: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  cardClear: {
    backgroundColor: BrandColors.white,
    borderColor: BrandColors.borderLight,
  },
  body: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  titleConflict: {
    color: '#92400E',
  },
  titleClear: {
    color: BrandColors.text,
  },
  message: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
  altNames: {
    marginTop: 2,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
  },
  altNamesValue: {
    fontFamily: Fonts.medium,
    color: BrandColors.primaryDark,
  },
});
