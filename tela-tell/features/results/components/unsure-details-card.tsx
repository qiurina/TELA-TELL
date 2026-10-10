import { StyleSheet, Text } from 'react-native';

import { Tag } from '@/components/ui/lucide-icons';
import { StatusCard } from '@/components/ui/status-card';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { UNSURE_NOTICE } from '@/data/scans/scan-confidence';

/**
 * Stands in for the shedding and sustainable-choices cards on an "Unsure" scan, so their absence is
 * explained instead of silent: they depend on knowing the fiber, which the scan could not name.
 */
export function UnsureDetailsCard() {
  return (
    <StatusCard
      icon={Tag}
      tone="neutral"
      title={UNSURE_NOTICE.fiberDetails.title}
      pillLabel={UNSURE_NOTICE.fiberDetails.pill}>
      <Text style={styles.message}>{UNSURE_NOTICE.fiberDetails.message}</Text>
    </StatusCard>
  );
}

const styles = StyleSheet.create({
  message: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
  },
});
