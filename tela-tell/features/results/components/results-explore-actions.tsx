import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRight, Leaf, Layers, Lock, Sparkles, type IconProps } from '@/components/ui/lucide-icons';
import { ScanAnotherButton } from '@/features/results/components/scan-another-button';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';

type ExploreCardProps = {
  icon: FC<IconProps>;
  label: string;
  subtitle: string;
  onPress: () => void;
  locked?: boolean;
};

function ExploreCard({ icon: Icon, label, subtitle, onPress, locked = false }: ExploreCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        faintCardShadow(),
        locked && styles.cardLocked,
        pressed && !locked && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={locked ? `${label}. Sign in required` : label}
      accessibilityState={{ disabled: locked }}>
      <View style={[styles.iconWrap, locked && styles.iconWrapLocked]}>
        {locked ? (
          <Lock size={16} color="#C27803" strokeWidth={2.25} />
        ) : (
          <Icon size={16} color={BrandColors.primary} strokeWidth={2.25} />
        )}
      </View>
      <View style={styles.cardText}>
        <Text style={[styles.cardLabel, locked && styles.cardLabelLocked]} numberOfLines={2}>
          {label}
        </Text>
        <Text style={[styles.cardSubtitle, locked && styles.cardSubtitleLocked]} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      {locked ? (
        <Lock size={14} color="#C27803" strokeWidth={2.25} />
      ) : (
        <ChevronRight size={14} color={BrandColors.textMuted} strokeWidth={2.25} />
      )}
    </Pressable>
  );
}

type ResultsExploreActionsProps = {
  onProfile: () => void;
  onEcoTips: () => void;
  onPersonalizedInsights: () => void;
  onLockedPersonalizedInsights?: () => void;
  personalizedInsightsLocked?: boolean;
  onScanAgain: () => void;
};

export function ResultsExploreActions({
  onProfile,
  onEcoTips,
  onPersonalizedInsights,
  onLockedPersonalizedInsights,
  personalizedInsightsLocked = false,
  onScanAgain,
}: ResultsExploreActionsProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>EXPLORE FABRIC</Text>

      <View style={styles.cardRow}>
        <ExploreCard icon={Layers} label="Profile" subtitle="Traits & care" onPress={onProfile} />
        <ExploreCard icon={Leaf} label="Eco tips" subtitle="Reuse ideas" onPress={onEcoTips} />
        <ExploreCard
          icon={Sparkles}
          label="Personalized Insights"
          subtitle={personalizedInsightsLocked ? 'Sign in required' : 'Colors, fit & allergies'}
          locked={personalizedInsightsLocked}
          onPress={
            personalizedInsightsLocked
              ? (onLockedPersonalizedInsights ?? (() => {}))
              : onPersonalizedInsights
          }
        />
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
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: BrandColors.white,
    borderRadius: 14,
    padding: 10,
    gap: 8,
    minHeight: 108,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  cardLocked: {
    backgroundColor: '#FFFBF5',
    borderColor: '#FCD9A8',
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavenderCard,
    flexShrink: 0,
  },
  iconWrapLocked: {
    backgroundColor: BrandColors.white,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
    color: BrandColors.primaryDark,
  },
  cardLabelLocked: {
    color: BrandColors.textMuted,
  },
  cardSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    lineHeight: 14,
    color: BrandColors.textMuted,
  },
  cardSubtitleLocked: {
    color: '#9A6700',
    fontFamily: Fonts.medium,
  },
  pressed: {
    opacity: 0.88,
  },
});
