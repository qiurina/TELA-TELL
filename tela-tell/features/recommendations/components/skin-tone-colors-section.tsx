import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/brand';
import type { SkinToneColorGuidance } from '@/data/preferences/skin-tone-colors';
import { tokenizeColorString, type ColorToken } from '@/data/preferences/color-swatches';
import { Fonts } from '@/constants/fonts';

type SkinToneColorsSectionProps = {
  guidance: SkinToneColorGuidance;
};

function isLightHex(hex: string): boolean {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return false;
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.86;
}

function tokenKey(token: ColorToken): string {
  return `${token.label}|${token.hex}`;
}

function ColorBlob({
  token,
  selected,
  onPress,
}: {
  token: ColorToken;
  selected: boolean;
  onPress: () => void;
}) {
  const light = isLightHex(token.hex);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${token.label}, ${token.hex}`}
      style={({ pressed }) => [
        styles.blob,
        { backgroundColor: token.hex },
        light && styles.blobLight,
        selected && styles.blobSelected,
        pressed && styles.blobPressed,
      ]}
    />
  );
}

function PaletteBlock({
  title,
  subtitle,
  tokens,
  selected,
  onSelect,
}: {
  title: string;
  subtitle?: string;
  tokens: ColorToken[];
  selected: ColorToken | null;
  onSelect: (token: ColorToken) => void;
}) {
  if (tokens.length === 0) {
    return null;
  }

  return (
    <View style={styles.paletteBlock}>
      <View style={styles.paletteHeader}>
        <Text style={styles.paletteTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.paletteSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.blobRow}>
        {tokens.map((token, index) => (
          <ColorBlob
            key={`${tokenKey(token)}-${index}`}
            token={token}
            selected={selected !== null && tokenKey(selected) === tokenKey(token)}
            onPress={() => onSelect(token)}
          />
        ))}
      </View>
    </View>
  );
}

export function SkinToneColorsSection({ guidance }: SkinToneColorsSectionProps) {
  const [selected, setSelected] = useState<ColorToken | null>(null);

  const recommendedTokens = guidance.recommended
    .flatMap((group) => tokenizeColorString(group.colors))
    .filter((token, index, arr) => arr.findIndex((t) => tokenKey(t) === tokenKey(token)) === index);

  const avoidTokens = guidance.avoid
    .flatMap((item) => tokenizeColorString(item))
    .filter((token, index, arr) => arr.findIndex((t) => tokenKey(t) === tokenKey(token)) === index);

  const recommendedSubtitle = guidance.recommended[0]?.category?.toUpperCase();

  const skinToneLabel = guidance.skinTone === 'Deep Dark' ? 'Deep / Dark' : guidance.skinTone;
  const headerTitle = guidance.colorSeason ?? 'Your colors';
  const profileMeta = [
    skinToneLabel ? `${skinToneLabel} skin` : null,
    guidance.skinUndertone ? `${guidance.skinUndertone} undertone` : null,
    // Season is already the title when set; only list it under "Your colors".
    guidance.colorSeason && headerTitle !== guidance.colorSeason ? guidance.colorSeason : null,
  ].filter((item): item is string => Boolean(item));

  const handleSelect = (token: ColorToken) => {
    setSelected((current) =>
      current && tokenKey(current) === tokenKey(token) ? null : token,
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        {profileMeta.length > 0 ? (
          <Text style={styles.profileMeta}>{profileMeta.join(' · ')}</Text>
        ) : null}
      </View>

      {guidance.fabricNote ? <Text style={styles.fabricNote}>{guidance.fabricNote}</Text> : null}

      <View style={styles.palettes}>
        <PaletteBlock
          title="BEST COLOURS"
          subtitle={recommendedSubtitle}
          tokens={recommendedTokens}
          selected={selected}
          onSelect={handleSelect}
        />

        <PaletteBlock
          title="AVOID THESE COLORS"
          subtitle="COOL OR CLASHING TONES"
          tokens={avoidTokens}
          selected={selected}
          onSelect={handleSelect}
        />
      </View>

      {selected ? (
        <View style={styles.selectedBar}>
          <View
            style={[
              styles.selectedDot,
              { backgroundColor: selected.hex },
              isLightHex(selected.hex) && styles.blobLight,
            ]}
          />
          <Text style={styles.selectedName}>{selected.label}</Text>
          <Text style={styles.selectedHex}>{selected.hex.toUpperCase()}</Text>
        </View>
      ) : (
        <Text style={styles.hint}>Tap a colour for its name and hex</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    gap: 12,
  },
  header: {
    gap: 4,
  },
  headerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
  },
  profileMeta: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: BrandColors.primaryDark,
  },
  fabricNote: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: BrandColors.textMuted,
  },
  palettes: {
    gap: 16,
  },
  paletteBlock: {
    gap: 10,
  },
  paletteHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  paletteTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  paletteSubtitle: {
    flexShrink: 1,
    fontFamily: Fonts.medium,
    fontSize: 11,
    letterSpacing: 0.4,
    color: BrandColors.textMuted,
    textAlign: 'right',
  },
  blobRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  blob: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  blobLight: {
    borderColor: 'rgba(0,0,0,0.14)',
  },
  blobSelected: {
    transform: [{ scale: 1.1 }],
    borderWidth: 1.5,
    borderColor: BrandColors.primaryDark,
  },
  blobPressed: {
    opacity: 0.88,
  },
  selectedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BrandColors.borderLight,
    paddingTop: 10,
  },
  selectedDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  selectedName: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.text,
    textTransform: 'capitalize',
  },
  selectedHex: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: BrandColors.textMuted,
    letterSpacing: 0.3,
  },
  hint: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: BrandColors.textMuted,
  },
});
