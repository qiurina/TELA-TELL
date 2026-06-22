import { StyleSheet, Text, View } from 'react-native';

import { TriangleAlert } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import {
  SUSTAINABILITY_BG,
  SUSTAINABILITY_BORDER,
  SUSTAINABILITY_DOT,
  type SustainabilityRating,
} from '@/constants/mock-data';

type StatusBadgesProps = {
  sustainability: {
    rating: SustainabilityRating;
    label: string;
    score: number;
  };
  mislabeling: {
    detected: boolean;
    title: string;
    message: string;
  };
};

export function StatusBadges({ sustainability, mislabeling }: StatusBadgesProps) {
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
      </View>

      <View
        style={[
          styles.badge,
          mislabeling.detected ? styles.mislabelBadgeAlert : styles.mislabelBadgeOk,
        ]}>
        <Text style={styles.badgeLabel}>MISLABELING</Text>
        <View style={styles.badgeValueRow}>
          {mislabeling.detected ? (
            <TriangleAlert size={14} color="#dc2626" strokeWidth={2.5} />
          ) : (
            <View style={[styles.dot, { backgroundColor: '#16a34a' }]} />
          )}
          <Text style={[styles.badgeValue, mislabeling.detected ? styles.alertText : styles.okText]}>
            {mislabeling.detected ? 'Alert' : 'Clear'}
          </Text>
        </View>
        {mislabeling.detected ? (
          <View style={styles.alertDetail}>
            <Text style={styles.alertTitle}>{mislabeling.title}</Text>
            <Text style={styles.alertMessage}>{mislabeling.message}</Text>
          </View>
        ) : (
          <Text style={styles.subtext}>no mismatch</Text>
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
  alertText: {
    color: '#dc2626',
  },
  okText: {
    color: '#16a34a',
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
