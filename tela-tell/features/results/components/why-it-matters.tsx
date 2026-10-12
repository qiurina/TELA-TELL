import { StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/brand';
import { Type } from '@/constants/typography';
import { WHY_IT_MATTERS } from '@/data/fabrics/health-advisory';

/** The health link under a synthetic fiber's shedding level (WHO 2022). */
export function WhyItMatters() {
  return (
    <View style={styles.block}>
      <View style={styles.divider} />
      <Text style={Type.lead}>{WHY_IT_MATTERS.aspect}</Text>
      <Text style={Type.body}>{WHY_IT_MATTERS.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BrandColors.border,
    marginBottom: 8,
  },
});
