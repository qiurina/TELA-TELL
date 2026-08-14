import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRight } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';

type ProfilePreferenceRowProps = {
  title: string;
  value?: string;
  icon: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
  titleColor?: string;
};

export function ProfilePreferenceRow({
  title,
  value,
  icon,
  onPress,
  showChevron = true,
  isLast = false,
  titleColor,
}: ProfilePreferenceRowProps) {
  const content = (
    <>
      <View style={styles.iconWrap}>{icon}</View>
      <View style={styles.copy}>
        <Text style={[styles.title, titleColor ? { color: titleColor } : null]}>{title}</Text>
        {value ? (
          <Text style={styles.value} numberOfLines={2}>
            {value}
          </Text>
        ) : null}
      </View>
      {showChevron ? <ChevronRight size={18} color={BrandColors.textMuted} strokeWidth={2.25} /> : null}
    </>
  );

  if (!onPress) {
    return <View style={[styles.row, !isLast && styles.rowDivider]}>{content}</View>;
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.row, !isLast && styles.rowDivider, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}>
      {content}
    </Pressable>
  );
}

type ProfileGroupedCardProps = {
  children: ReactNode;
};

export function ProfileGroupedCard({ children }: ProfileGroupedCardProps) {
  return <View style={[styles.card, faintCardShadow()]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: BrandColors.white,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BrandColors.lavenderCard,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
  },
  value: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
  },
  pressed: {
    opacity: 0.92,
  },
});
