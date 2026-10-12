import { Pressable, StyleSheet, Text } from 'react-native';

import { ChevronRight } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Type } from '@/constants/typography';

/** The "… ›" action at the bottom of a status card. */
export function CardLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Text style={Type.link}>{label}</Text>
      <ChevronRight size={16} color={BrandColors.primaryDark} strokeWidth={2.25} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    minHeight: 44,
  },
  pressed: {
    opacity: 0.7,
  },
});
