import { StyleSheet, Text, View } from 'react-native';

import { Info, TriangleAlert } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import {
  LOW_CONFIDENCE_WARNING,
  MODERATE_CONFIDENCE_NOTE,
  getConfidenceLabel,
  getConfidenceLevel,
} from '@/data/scans/analysis';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';

type ScanConfidenceBannerProps = {
  confidence: number;
  dominantFabric: string;
  /** When true, dominant fabric is shown on the photo preview — banner shows notes only. */
  compact?: boolean;
};

export function ScanConfidenceBanner({
  confidence,
  dominantFabric,
  compact = false,
}: ScanConfidenceBannerProps) {
  const level = getConfidenceLevel(confidence);

  if (level === 'low') {
    return (
      <View style={styles.wrapper}>
        <View style={[styles.warningCard, faintCardShadow()]}>
          <TriangleAlert size={20} color="#ca8a04" strokeWidth={2.5} />
          <View style={styles.warningTextBlock}>
            <Text style={styles.warningTitle}>{LOW_CONFIDENCE_WARNING.title}</Text>
            <Text style={styles.warningMessage}>{LOW_CONFIDENCE_WARNING.message}</Text>
          </View>
        </View>
        <Text style={styles.lowConfidenceDetected}>
          Best estimate: {dominantFabric} ({confidence}%)
        </Text>
      </View>
    );
  }

  if (compact) {
    return level === 'moderate' ? (
      <View style={styles.moderateNote}>
        <Info size={14} color="#ca8a04" strokeWidth={2.25} />
        <Text style={styles.moderateNoteText}>{MODERATE_CONFIDENCE_NOTE}</Text>
      </View>
    ) : null;
  }

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.banner,
          faintCardShadow(),
          level === 'high' && styles.bannerHigh,
          level === 'moderate' && styles.bannerModerate,
        ]}>
        <View style={styles.topRow}>
          <Text style={styles.dominantLabel}>Dominant detection</Text>
          <View style={styles.confidencePill}>
            <Text style={styles.confidenceValue}>{confidence}%</Text>
          </View>
        </View>
        <Text style={styles.dominantValue}>{dominantFabric}</Text>
        <Text style={styles.confidenceLabel}>{getConfidenceLabel(confidence)}</Text>
      </View>

      {level === 'moderate' ? (
        <View style={styles.moderateNote}>
          <Info size={14} color="#ca8a04" strokeWidth={2.25} />
          <Text style={styles.moderateNoteText}>{MODERATE_CONFIDENCE_NOTE}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
  },
  warningTextBlock: {
    flex: 1,
    gap: 6,
  },
  warningTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  warningMessage: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: '#a16207',
  },
  banner: {
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.white,
  },
  bannerHigh: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  bannerModerate: {
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dominantLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
    textTransform: 'uppercase',
  },
  confidencePill: {
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  confidenceValue: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: BrandColors.primaryDark,
  },
  dominantValue: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: BrandColors.text,
    lineHeight: 24,
  },
  confidenceLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
  moderateNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 4,
  },
  moderateNoteText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: '#92400e',
  },
  lowConfidenceDetected: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: BrandColors.textMuted,
    paddingHorizontal: 4,
  },
});
