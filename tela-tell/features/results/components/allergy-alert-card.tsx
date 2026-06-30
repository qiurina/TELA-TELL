import { StyleSheet, Text, View } from 'react-native';

import { CircleCheck, TriangleAlert } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import type { AllergyAlert } from '@/data/fabrics/fabric-allergies';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';

type AllergyAlertCardProps = {
  alert: AllergyAlert;
};

export function AllergyAlertCard({ alert }: AllergyAlertCardProps) {
  const isConflict = alert.conflictDetected;
  const alternativeNames = alert.alternatives.map((item) => item.name).join(' · ');

  return (
    <View
      style={[
        styles.card,
        faintCardShadow(),
        isConflict ? styles.cardConflict : styles.cardClear,
      ]}>
      <View style={styles.headerRow}>
        {isConflict ? (
          <TriangleAlert size={20} color="#b45309" strokeWidth={2.5} />
        ) : (
          <CircleCheck size={20} color="#15803d" strokeWidth={2.25} />
        )}
        <Text style={[styles.title, isConflict && styles.titleConflict]}>
          {isConflict ? 'Sensitivity alert' : 'All clear'}
        </Text>
      </View>

      {isConflict ? (
        <>
          <Text style={styles.messageConflict}>{alert.message}</Text>
          {alternativeNames ? <Text style={styles.altNames}>{alternativeNames}</Text> : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  cardConflict: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  cardClear: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: '#15803d',
  },
  titleConflict: {
    color: '#b45309',
  },
  messageConflict: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    lineHeight: 19,
    color: '#92400e',
  },
  altNames: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.primaryDark,
  },
});
