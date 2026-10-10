import { Pressable, StyleSheet } from 'react-native';

import { Info } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';

type InfoButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
};

export function InfoButton({ onPress, accessibilityLabel }: InfoButtonProps) {
  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      <Info size={14} color={BrandColors.textMuted} strokeWidth={2.25} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavenderCard,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
});
