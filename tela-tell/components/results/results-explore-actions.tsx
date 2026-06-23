import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRight, Leaf, Layers, type IconProps } from '@/components/ui/lucide-icons';
import { ScanAnotherButton } from '@/components/results/scan-another-button';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';

type ExploreCardProps = {
  icon: FC<IconProps>;
  label: string;
  subtitle: string;
  onPress: () => void;
};

function ExploreCard({ icon: Icon, label, subtitle, onPress }: ExploreCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, faintCardShadow(), pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <View style={styles.iconWrap}>
        <Icon size={18} color={BrandColors.primary} strokeWidth={2.25} />
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      <ChevronRight size={16} color={BrandColors.textMuted} strokeWidth={2.25} />
    </Pressable>
  );
}

type ResultsExploreActionsProps = {
  onProfile: () => void;
  onEcoTips: () => void;
  onScanAgain: () => void;
};

export function ResultsExploreActions({ onProfile, onEcoTips, onScanAgain }: ResultsExploreActionsProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>EXPLORE FABRIC</Text>

      <View style={styles.cardRow}>
        <ExploreCard icon={Layers} label="Profile" subtitle="Traits & care" onPress={onProfile} />
        <ExploreCard icon={Leaf} label="Eco tips" subtitle="Reuse ideas" onPress={onEcoTips} />
      </View>

      <ScanAnotherButton onPress={onScanAgain} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
    marginTop: 4,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 12,
    gap: 10,
    minHeight: 118,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavenderCard,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primaryDark,
  },
  cardSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: BrandColors.textMuted,
  },
  pressed: {
    opacity: 0.88,
  },
});
