import type { FC } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ChevronRight, type IconProps } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Type } from '@/constants/typography';

export function CardLink({
  label,
  onPress,
  icon: Icon,
}: {
  label: string;
  onPress: () => void;
  icon?: FC<IconProps>;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      {Icon ? <Icon size={16} color={BrandColors.primaryDark} strokeWidth={2.25} /> : null}
      <Text style={[Type.link, styles.label]}>{label}</Text>
      <ChevronRight size={16} color={BrandColors.primaryDark} strokeWidth={2.25} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: BrandColors.lavenderCard,
  },
  label: {
    flexShrink: 1,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
