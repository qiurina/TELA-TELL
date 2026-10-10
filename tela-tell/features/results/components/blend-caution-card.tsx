import { StyleSheet, Text } from 'react-native';

import { Layers } from '@/components/ui/lucide-icons';
import { StatusCard } from '@/components/ui/status-card';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import type { BlendCaution } from '@/data/fabrics/blend-caution';

/** A neutral note that this scan cannot see blends (shown for Cotton, Linen, Rayon and Wool). */
export function BlendCautionCard({ caution }: { caution: BlendCaution }) {
  return (
    <StatusCard icon={Layers} tone="neutral" title={caution.title} pillLabel={caution.pill}>
      <Text style={styles.message}>{caution.message}</Text>
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
