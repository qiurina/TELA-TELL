import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRight, Info } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { Type } from '@/constants/typography';

export function Disclosure({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.block}>
      <Pressable
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${title}, ${open ? 'hide' : 'show'}`}>
        <Info size={16} color={BrandColors.primaryDark} strokeWidth={2.25} />
        <Text style={[Type.lead, styles.title]}>{title}</Text>
        <Text style={styles.toggle}>{open ? 'Hide' : 'Show'}</Text>
        <View style={{ transform: [{ rotate: open ? '-90deg' : '90deg' }] }}>
          <ChevronRight size={16} color={BrandColors.primaryDark} strokeWidth={2.25} />
        </View>
      </Pressable>
      {open ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: BrandColors.inputBackground,
  },
  title: {
    flex: 1,
  },
  toggle: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: BrandColors.primaryDark,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    gap: 10,
  },
});
