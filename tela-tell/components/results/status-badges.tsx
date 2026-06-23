import { StyleSheet, Text, View } from 'react-native';

import { TriangleAlert } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import {
  SUSTAINABILITY_BG,
  SUSTAINABILITY_BORDER,
  SUSTAINABILITY_DOT,
  type SustainabilityFactor,
  type SustainabilityRating,
} from '@/constants/mock-data';

type StatusBadgesProps = {
  hasSellerLabel?: boolean;
  sustainability: {
    rating: SustainabilityRating;
    label: string;
    score: number;
    factors: SustainabilityFactor[];
  };
  mislabeling: {
    detected: boolean;
    title: string;
    message: string;
  };
};

export function StatusBadges({ hasSellerLabel = false, sustainability, mislabeling }: StatusBadgesProps) {
  const showMislabelAlert = hasSellerLabel && mislabeling.detected;
  const mislabelStatus = !hasSellerLabel || !mislabeling.detected ? 'None' : 'Possible';
  const sustainColor = SUSTAINABILITY_DOT[sustainability.rating];

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.badge,
          {
            borderColor: SUSTAINABILITY_BORDER[sustainability.rating],
            backgroundColor: SUSTAINABILITY_BG[sustainability.rating],
          },
        ]}>
        <Text style={styles.badgeLabel}>SUSTAINABILITY</Text>
        <View style={styles.badgeValueRow}>
          <View style={[styles.dot, { backgroundColor: sustainColor }]} />
          <Text style={[styles.badgeValue, { color: sustainColor }]}>{sustainability.label}</Text>
          <Text style={styles.score}>{sustainability.score}/10</Text>
        </View>
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
      </View>

      <View
        style={[
          styles.badge,
          showMislabelAlert
            ? styles.mislabelBadgeAlert
            : hasSellerLabel
              ? styles.mislabelBadgeOk
              : styles.mislabelBadgeNeutral,
        ]}>
        <Text style={styles.badgeLabel}>MISLABELING</Text>
        <View style={styles.badgeValueRow}>
          {showMislabelAlert ? (
            <TriangleAlert size={14} color="#dc2626" strokeWidth={2.5} />
          ) : (
            <View style={[styles.dot, { backgroundColor: BrandColors.textMuted }]} />
          )}
          <Text
            style={[
              styles.badgeValue,
              showMislabelAlert ? styles.alertText : styles.noneText,
            ]}>
            {mislabelStatus}
          </Text>
        </View>
        {showMislabelAlert ? (
          <View style={styles.alertDetail}>
            <Text style={styles.alertTitle}>{mislabeling.title}</Text>
            <Text style={styles.alertMessage}>{mislabeling.message}</Text>
          </View>
        ) : (
          <Text style={styles.subtext}>
            {!hasSellerLabel ? 'add seller label to compare' : 'no mismatch flagged'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'column',
    gap: 12,
  },
  badge: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    gap: 6,
  },
  mislabelBadgeAlert: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  mislabelBadgeOk: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  mislabelBadgeNeutral: {
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.white,
  },
  badgeLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
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
    fontSize: 14,
    color: BrandColors.textMuted,
    marginLeft: 'auto',
  },
  factorList: {
    gap: 6,
    marginTop: 2,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  factorBullet: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    lineHeight: 18,
    width: 12,
  },
  factorUp: {
    color: '#16a34a',
  },
  factorDown: {
    color: '#ca8a04',
  },
  factorText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.text,
  },
  alertText: {
    color: '#dc2626',
  },
  noneText: {
    color: BrandColors.textMuted,
  },
  subtext: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: BrandColors.textMuted,
  },
  alertDetail: {
    gap: 4,
    marginTop: 2,
  },
  alertTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: '#dc2626',
    lineHeight: 16,
  },
  alertMessage: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: BrandColors.text,
  },
});
