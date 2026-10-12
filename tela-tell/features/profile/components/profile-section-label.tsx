import { StyleSheet, Text, View } from 'react-native';

import { InfoButton } from '@/components/ui/info-button';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

type ProfileSectionLabelProps = {
  title: string;
  /** Shows an (i) button after the label. */
  onInfoPress?: () => void;
  infoAccessibilityLabel?: string;
};

export function ProfileSectionLabel({ title, onInfoPress, infoAccessibilityLabel }: ProfileSectionLabelProps) {
  if (!onInfoPress) {
    return <Text style={styles.label}>{title}</Text>;
  }

  return (
    <View style={styles.row}>
      <Text style={[styles.label, styles.labelInRow]}>{title}</Text>
      <InfoButton onPress={onInfoPress} accessibilityLabel={infoAccessibilityLabel ?? `About ${title}`} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: BrandColors.textMuted,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  labelInRow: {
    marginBottom: 0,
    paddingHorizontal: 0,
  },
});
