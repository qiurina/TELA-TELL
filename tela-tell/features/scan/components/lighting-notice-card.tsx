import { StyleSheet, Text, View } from 'react-native';

import { TriangleAlert } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { LIGHTING_NOTICES, type LightingWarning } from '@/features/scan/lib/ml/lighting';

/**
 * Advisory lighting notices for the photo on the review screen. It never blocks "Analyze Fabric";
 * it renders nothing when there is nothing to say.
 */
export function LightingNoticeCard({ warnings }: { warnings: LightingWarning[] }) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <View style={[styles.card, faintCardShadow()]} accessibilityRole="alert">
      <TriangleAlert size={20} color="#ca8a04" strokeWidth={2.5} />
      <View style={styles.textBlock}>
        {warnings.map((warning) => (
          <View key={warning} style={styles.notice}>
            <Text style={styles.title}>{LIGHTING_NOTICES[warning].title}</Text>
            <Text style={styles.message}>{LIGHTING_NOTICES[warning].message}</Text>
          </View>
        ))}
        <Text style={styles.footer}>You can still analyze this photo.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
  },
  textBlock: {
    flex: 1,
    gap: 8,
  },
  notice: {
    gap: 2,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: '#92400e',
  },
  message: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
  },
  footer: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: BrandColors.textMuted,
  },
});
