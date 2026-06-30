import { StyleSheet, Text, View } from 'react-native';

import { TriangleAlert } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { ALLERGY_DISCLAIMER, type AllergyAlert } from '@/data/fabrics/fabric-allergies';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';

type AllergyAlertCardProps = {
  alert: AllergyAlert;
};

export function AllergyAlertCard({ alert }: AllergyAlertCardProps) {
  const isConflict = alert.conflictDetected;

  return (
    <View
      style={[
        styles.card,
        faintCardShadow(),
        isConflict ? styles.cardConflict : styles.cardClear,
      ]}>
      <View style={styles.headerRow}>
        <TriangleAlert
          size={20}
          color={isConflict ? '#b45309' : BrandColors.primary}
          strokeWidth={2.5}
        />
        <Text style={[styles.title, isConflict && styles.titleConflict]}>
          {isConflict ? 'Allergy alert' : 'Allergy check'}
        </Text>
      </View>

      <Text style={[styles.message, isConflict && styles.messageConflict]}>{alert.message}</Text>

      {isConflict ? (
        <>
          <Text style={styles.listTitle}>Hypoallergenic alternatives</Text>
          <View style={styles.list}>
            {alert.alternatives.map((item) => (
              <View key={item.name} style={styles.altRow}>
                <Text style={styles.altBullet}>●</Text>
                <Text style={styles.altText}>
                  <Text style={styles.altName}>{item.name}</Text>
                  {' — '}
                  {item.note}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      <Text style={styles.disclaimer}>{ALLERGY_DISCLAIMER}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
  },
  cardConflict: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
  },
  cardClear: {
    backgroundColor: BrandColors.lavenderCard,
    borderColor: BrandColors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: BrandColors.primaryDark,
  },
  titleConflict: {
    color: '#b45309',
  },
  message: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.text,
  },
  messageConflict: {
    fontFamily: Fonts.semiBold,
    color: '#92400e',
  },
  listTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.3,
    color: BrandColors.textMuted,
    textTransform: 'uppercase',
  },
  list: {
    gap: 10,
  },
  altRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  altBullet: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    lineHeight: 19,
    color: '#16a34a',
  },
  altText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: BrandColors.text,
  },
  altName: {
    fontFamily: Fonts.semiBold,
  },
  disclaimer: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: BrandColors.textMuted,
  },
});
