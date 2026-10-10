import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import type { IconProps } from '@/components/ui/lucide-icons';
import { STATUS_COLORS, type StatusTone } from '@/constants/status-colors';

type StatusIconProps = {
  icon: FC<IconProps>;
  tone: StatusTone;
};

/** Card icon on a light, tone-tinted rounded square. */
export function StatusIcon({ icon: Icon, tone }: StatusIconProps) {
  const colors = STATUS_COLORS[tone];

  return (
    <View style={[styles.wrap, { backgroundColor: colors.tint }]}>
      <Icon size={16} color={colors.accent} strokeWidth={2.25} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
