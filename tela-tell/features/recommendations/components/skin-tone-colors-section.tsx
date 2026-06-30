import { StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/brand';
import type { SkinToneColorGuidance } from '@/data/preferences/skin-tone-colors';
import { tokenizeColorString, type ColorToken } from '@/data/preferences/color-swatches';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';

type SkinToneColorsSectionProps = {
  guidance: SkinToneColorGuidance;
};

function ColorSwatchChip({ token, variant }: { token: ColorToken; variant: 'recommend' | 'avoid' }) {
  const isLight =
    token.hex === '#FFFFFF' ||
    token.hex === '#FAFAFA' ||
    token.hex === '#F5F5F0' ||
    token.hex === '#FFFDD0' ||
    token.hex === '#FFFFE0';

  return (
    <View style={styles.swatchChip}>
      <View
        style={[
          styles.swatchDot,
          { backgroundColor: token.hex },
          isLight && styles.swatchDotLight,
          variant === 'avoid' && styles.swatchDotAvoid,
        ]}
      />
      <Text style={[styles.swatchLabel, variant === 'avoid' && styles.swatchLabelAvoid]} numberOfLines={2}>
        {token.label}
      </Text>
    </View>
  );
}

function SwatchGrid({ tokens, variant }: { tokens: ColorToken[]; variant: 'recommend' | 'avoid' }) {
  return (
    <View style={styles.swatchGrid}>
      {tokens.map((token) => (
        <ColorSwatchChip key={`${variant}-${token.label}`} token={token} variant={variant} />
      ))}
    </View>
  );
}

export function SkinToneColorsSection({ guidance }: SkinToneColorsSectionProps) {
  const avoidTokens = guidance.avoid.flatMap((item) => tokenizeColorString(item));

  return (
    <View style={[styles.card, faintCardShadow()]}>
      <View style={styles.metaRow}>
        <Text style={styles.metaPrimary}>{guidance.detectedFabricLabel}</Text>
        <Text style={styles.metaSecondary}>
          {guidance.skinTone === 'Deep Dark' ? 'Deep / Dark' : guidance.skinTone}
          {guidance.skinUndertone ? ` · ${guidance.skinUndertone}` : ''}
        </Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Recommended</Text>
        {guidance.recommended.map((group) => (
          <View key={group.category} style={styles.group}>
            <Text style={styles.groupLabel}>{group.category}</Text>
            <SwatchGrid tokens={tokenizeColorString(group.colors)} variant="recommend" />
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Avoid near face</Text>
        <SwatchGrid tokens={avoidTokens} variant="avoid" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
  },
  metaRow: {
    gap: 2,
  },
  metaPrimary: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
  },
  metaSecondary: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
  block: {
    gap: 10,
  },
  blockTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: BrandColors.textMuted,
  },
  group: {
    gap: 8,
  },
  groupLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: BrandColors.text,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  swatchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 4,
    maxWidth: '48%',
    flexGrow: 1,
  },
  swatchDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  swatchDotLight: {
    borderColor: BrandColors.border,
  },
  swatchDotAvoid: {
    borderColor: '#fca5a5',
    borderWidth: 1.5,
  },
  swatchLabel: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: BrandColors.text,
  },
  swatchLabelAvoid: {
    color: BrandColors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: BrandColors.borderLight,
  },
});
