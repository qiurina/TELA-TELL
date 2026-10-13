import { StyleSheet, Text, View } from 'react-native';

import { InfoButton } from '@/components/ui/info-button';
import { Type } from '@/constants/typography';

export function SectionLabel({
  title,
  onInfoPress,
  infoAccessibilityLabel,
}: {
  title: string;
  onInfoPress?: () => void;
  infoAccessibilityLabel?: string;
}) {
  return (
    <View style={styles.row}>
      <Text accessibilityRole="header" style={[Type.sectionLabel, styles.title]}>
        {title}
      </Text>
      {onInfoPress ? (
        <InfoButton onPress={onInfoPress} accessibilityLabel={infoAccessibilityLabel ?? `About ${title.toLowerCase()}`} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    minHeight: 24,
  },
  title: {
    flex: 1,
  },
});
