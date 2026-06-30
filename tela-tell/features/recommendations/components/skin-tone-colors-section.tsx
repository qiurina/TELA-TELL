import { StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/brand';
import type { SkinToneColorGuidance } from '@/data/preferences/skin-tone-colors';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';

type SkinToneColorsSectionProps = {
  guidance: SkinToneColorGuidance;
};

export function SkinToneColorsSection({ guidance }: SkinToneColorsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>COLORS FOR YOUR SKIN TONE</Text>
      <Text style={styles.sectionSubtitle}>
        Rule-based color guidance — not a medical or beauty diagnosis
      </Text>

      <View style={[styles.card, faintCardShadow()]}>
        <Text style={styles.fabricLine}>{guidance.detectedFabricLabel} detected</Text>
        <Text style={styles.skinToneLine}>
          You selected:{' '}
          {guidance.skinTone === 'Deep Dark' ? 'Deep / Dark' : guidance.skinTone} skin tone
          {guidance.skinUndertone ? ` · ${guidance.skinUndertone} undertone` : ''}
        </Text>

        <Text style={styles.listTitle}>Recommended colors for you</Text>
        <View style={styles.list}>
          {guidance.recommended.map((group) => (
            <View key={group.category} style={styles.recommendedRow}>
              <Text style={styles.bullet}>●</Text>
              <Text style={styles.recommendedText}>
                <Text style={styles.recommendedCategory}>{group.category}</Text>
                {' — '}
                {group.colors}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.listTitle}>Colors to avoid</Text>
        <View style={styles.list}>
          {guidance.avoid.map((color) => (
            <View key={color} style={styles.avoidRow}>
              <Text style={styles.avoidBullet}>●</Text>
              <Text style={styles.avoidText}>{color}</Text>
            </View>
          ))}
        </View>

        {guidance.fabricNote ? (
          <View style={styles.fabricNoteBox}>
            <Text style={styles.fabricNoteText}>{guidance.fabricNote}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  sectionSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.textMuted,
    marginTop: -6,
  },
  card: {
    gap: 12,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  fabricLine: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.primaryDark,
  },
  skinToneLine: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: BrandColors.text,
  },
  listTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.3,
    color: BrandColors.textMuted,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  list: {
    gap: 8,
  },
  recommendedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    lineHeight: 19,
    color: '#16a34a',
  },
  recommendedText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: BrandColors.text,
  },
  recommendedCategory: {
    fontFamily: Fonts.semiBold,
    color: BrandColors.text,
  },
  avoidRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  avoidBullet: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    lineHeight: 19,
    color: '#dc2626',
  },
  avoidText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: BrandColors.textMuted,
  },
  fabricNoteBox: {
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  fabricNoteText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
});
