import { StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import {
  SUSTAINABILITY_BG,
  SUSTAINABILITY_BORDER,
  SUSTAINABILITY_DOT,
  type SustainabilityFactor,
  type SustainabilityRating,
} from '@/data/scans/mock-data';

type StatusBadgesProps = {
  sustainability: {
    rating: SustainabilityRating;
    label: string;
    score: number;
    factors: SustainabilityFactor[];
  };
};

export function StatusBadges({ sustainability }: StatusBadgesProps) {
  const sustainColor = SUSTAINABILITY_DOT[sustainability.rating];

  return (
    <View
      style={[
        styles.badge,
        {
          borderColor: SUSTAINABILITY_BORDER[sustainability.rating],
          backgroundColor: SUSTAINABILITY_BG[sustainability.rating],
        },
      ]}>
      <Text style={[styles.badgeLabel, { color: sustainColor }]}>SUSTAINABILITY</Text>
      <View style={styles.badgeValueRow}>
        <View style={[styles.dot, { backgroundColor: sustainColor }]} />
        <Text style={[styles.badgeValue, { color: sustainColor }]}>{sustainability.label}</Text>
        <Text style={[styles.score, { color: sustainColor }]}>{sustainability.score}/10</Text>
      </View>

      {(sustainability.factors ?? []).length > 0 ? (
        <View style={styles.factorList}>
          {(sustainability.factors ?? []).map((factor) => (
            <View key={factor.text} style={styles.factorRow}>
              <Text style={[styles.factorBullet, factor.positive ? styles.factorUp : styles.factorDown]}>
                {factor.positive ? '+' : '−'}
              </Text>
              <Text style={styles.factorText}>{factor.text}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    gap: 6,
  },
  badgeLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
  },
  badgeValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeValue: {
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
  score: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    marginLeft: 'auto',
  },
  factorList: {
    marginTop: 6,
    gap: 4,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  factorBullet: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    lineHeight: 17,
    width: 12,
  },
  factorUp: {
    color: '#15803d',
  },
  factorDown: {
    color: '#b45309',
  },
  factorText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.text,
  },
});
