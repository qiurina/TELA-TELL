import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRight, Leaf } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { STATUS_COLORS } from '@/constants/status-colors';
import {
  SUSTAINABLE_CHOICES_ACTION,
  SUSTAINABLE_CHOICES_CLAIMS,
  SUSTAINABLE_CHOICES_KEEP_IN_MIND,
  SUSTAINABLE_CHOICES_SHEET_TITLE,
  SUSTAINABLE_CHOICES_TEXT,
  SUSTAINABLE_CHOICES_TITLE,
} from '@/data/fabrics/sustainable-choices';
import { BasisSheet } from '@/features/recommendations/components/basis-sheet';

/** Points to reuse and wearing clothes longer; no score, no rating, nothing about this garment. */
export function SustainableChoicesCard() {
  const [sheetVisible, setSheetVisible] = useState(false);
  const good = STATUS_COLORS.good;

  return (
    <View style={[styles.card, faintCardShadow()]}>
      <BasisSheet
        visible={sheetVisible}
        title={SUSTAINABLE_CHOICES_SHEET_TITLE}
        icon={Leaf}
        claims={SUSTAINABLE_CHOICES_CLAIMS}
        keepInMind={SUSTAINABLE_CHOICES_KEEP_IN_MIND}
        onClose={() => setSheetVisible(false)}
      />

      <View style={styles.body}>
        <View style={[styles.iconWrap, { backgroundColor: good.tint }]}>
          <Leaf size={18} color={good.accent} strokeWidth={2.25} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{SUSTAINABLE_CHOICES_TITLE}</Text>
          <Text style={styles.text}>{SUSTAINABLE_CHOICES_TEXT}</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        onPress={() => setSheetVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={SUSTAINABLE_CHOICES_ACTION}>
        <Text style={styles.actionText}>{SUSTAINABLE_CHOICES_ACTION}</Text>
        <ChevronRight size={16} color={BrandColors.primaryDark} strokeWidth={2.25} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    overflow: 'hidden',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    lineHeight: 21,
    color: BrandColors.text,
  },
  text: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.textMuted,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BrandColors.border,
    backgroundColor: BrandColors.lavenderCard,
  },
  actionText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primaryDark,
  },
  pressed: {
    opacity: 0.8,
  },
});
