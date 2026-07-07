import { StyleSheet, Text } from 'react-native';

import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

type ProfileSectionLabelProps = {
  title: string;
};

export function ProfileSectionLabel({ title }: ProfileSectionLabelProps) {
  return <Text style={styles.label}>{title}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: BrandColors.textMuted,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
});
