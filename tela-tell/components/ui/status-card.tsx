import type { FC, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { InfoButton } from '@/components/ui/info-button';
import type { IconProps } from '@/components/ui/lucide-icons';
import { StatusIcon } from '@/components/ui/status-icon';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { STATUS_COLORS, type StatusTone } from '@/constants/status-colors';

type StatusCardProps = {
  icon: FC<IconProps>;
  tone: StatusTone;
  title: string;
  /** Short verdict shown as a pastel pill, e.g. "High" or "Possible mislabel". Omit for information-only cards. */
  pillLabel?: string;
  /** Omit when the card sits under a section label that already has its own (i). */
  onInfoPress?: () => void;
  infoAccessibilityLabel?: string;
  children?: ReactNode;
};

/**
 * Shared frame for the Results status cards (shedding tendency, label check):
 * white, 1px blue-gray border, soft shadow -- the same for every state. Only the icon, the pastel
 * pill and any score take the status color.
 */
export function StatusCard({
  icon,
  tone,
  title,
  pillLabel,
  onInfoPress,
  infoAccessibilityLabel,
  children,
}: StatusCardProps) {
  const colors = STATUS_COLORS[tone];

  return (
    <View style={[styles.card, faintCardShadow()]}>
      <View style={styles.header}>
        <StatusIcon icon={icon} tone={tone} />
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {pillLabel ? (
          <View style={[styles.pill, { backgroundColor: colors.pill }]}>
            <Text style={[styles.pillText, { color: colors.accent }]} numberOfLines={1}>
              {pillLabel}
            </Text>
          </View>
        ) : null}
        {onInfoPress ? (
          <InfoButton
            onPress={onInfoPress}
            accessibilityLabel={infoAccessibilityLabel ?? 'More information'}
          />
        ) : null}
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.white,
    padding: 14,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
  },
  pill: {
    flexShrink: 0,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  pillText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
  },
});
