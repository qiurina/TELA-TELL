import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { InfoButton } from '@/components/ui/info-button';
import { ChevronRight, Leaf } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import {
  SUSTAINABLE_CHOICES_ACTION,
  SUSTAINABLE_CHOICES_CLAIMS,
  SUSTAINABLE_CHOICES_SHEET_NOTE,
  SUSTAINABLE_CHOICES_SHEET_TITLE,
  SUSTAINABLE_CHOICES_TEXT,
  SUSTAINABLE_CHOICES_TITLE,
} from '@/data/fabrics/sustainable-choices';
import { BasisSheet } from '@/features/recommendations/components/basis-sheet';

type SustainableChoicesCardProps = {
  onEcoTips: () => void;
};

/** Points to reuse and wearing clothes longer; no score, no rating, nothing about this garment. */
export function SustainableChoicesCard({ onEcoTips }: SustainableChoicesCardProps) {
  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <View style={[styles.card, faintCardShadow()]}>
      <BasisSheet
        visible={sheetVisible}
        title={SUSTAINABLE_CHOICES_SHEET_TITLE}
        claims={SUSTAINABLE_CHOICES_CLAIMS}
        editorialNote={SUSTAINABLE_CHOICES_SHEET_NOTE}
        noEvidenceNote={null}
        onClose={() => setSheetVisible(false)}
      />

      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Leaf size={16} color={BrandColors.primary} strokeWidth={2.25} />
        </View>
        <Text style={styles.title}>{SUSTAINABLE_CHOICES_TITLE}</Text>
        <InfoButton
          onPress={() => setSheetVisible(true)}
          accessibilityLabel="About sustainable choices"
        />
      </View>

      <Text style={styles.text}>{SUSTAINABLE_CHOICES_TEXT}</Text>

      <Pressable
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        onPress={onEcoTips}
        accessibilityRole="button"
        accessibilityLabel={SUSTAINABLE_CHOICES_ACTION}>
        <Text style={styles.actionText}>{SUSTAINABLE_CHOICES_ACTION}</Text>
        <ChevronRight size={14} color={BrandColors.primaryDark} strokeWidth={2.25} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavenderCard,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
  },
  text: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: BrandColors.text,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    minHeight: 44,
  },
  actionText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.primaryDark,
  },
  pressed: {
    opacity: 0.7,
  },
});
