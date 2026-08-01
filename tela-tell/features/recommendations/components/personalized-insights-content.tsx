import { useRouter } from 'expo-router';
import type { FC, ReactNode } from 'react';
import { useSyncExternalStore } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  ChevronRight,
  CircleCheck,
  CircleX,
  Heart,
  Info,
  type IconProps,
} from '@/components/ui/lucide-icons';
import { Calendar } from 'lucide-react-native';
import { DRESSING_CONTEXT_ICONS } from '@/features/profile/dressing-context-icons';
import { AllergyAlertCard } from '@/features/results/components/allergy-alert-card';
import { SkinToneColorsSection } from '@/features/recommendations/components/skin-tone-colors-section';
import {
  getInsightsSetupItems,
  getPreferenceMatch,
  type InsightsSetupItem,
  type PreferenceMatchResult,
} from '@/features/recommendations/lib/personalized-insights';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { getAllergyAlert } from '@/data/fabrics/fabric-allergies';
import {
  getDressingContextFits,
  type DressingContextFit,
  type DressingContextFitStatus,
} from '@/data/preferences/dressing-context-fit';
import { WEATHER_CONTEXT_OPTIONS } from '@/data/preferences/occasion-weather';
import { getSkinToneColorGuidance } from '@/data/preferences/skin-tone-colors';
import type { FabricComposition } from '@/data/scans/mock-data';
import {
  getUserPreferencesSnapshot,
  subscribeUserPreferences,
} from '@/features/profile/lib/user-preferences';

type PersonalizedInsightsContentProps = {
  dominantFabric: string;
  detectedCompositions?: FabricComposition[];
};

const STATUS_STYLES: Record<
  DressingContextFitStatus,
  { label: string; text: string; background: string; border: string }
> = {
  great: { label: 'Great', text: '#15803D', background: '#F0FDF4', border: '#BBF7D0' },
  okay: {
    label: 'Okay',
    text: BrandColors.primaryDark,
    background: BrandColors.lavender,
    border: BrandColors.border,
  },
  poor: { label: 'Less ideal', text: '#B45309', background: '#FFFBEB', border: '#FDE68A' },
};

const STATUS_ICON: Record<DressingContextFitStatus, { icon: FC<IconProps>; color: string }> = {
  great: { icon: CircleCheck, color: '#15803D' },
  okay: { icon: Info, color: BrandColors.primaryDark },
  poor: { icon: CircleX, color: '#B45309' },
};

function SectionBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {children}
    </View>
  );
}

function SetupChecklist({ items }: { items: InsightsSetupItem[] }) {
  const router = useRouter();
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.setupBlock}>
      <Text style={styles.setupHint}>Finish setup for fuller insights</Text>
      <View style={styles.setupRow}>
        {items.map((item) => (
          <Pressable
            key={item.key}
            style={({ pressed }) => [styles.setupChip, pressed && styles.pressed]}
            onPress={() => router.push(item.href)}
            accessibilityRole="button"
            accessibilityLabel={`Set up ${item.label}`}>
            <Text style={styles.setupChipText}>{item.label}</Text>
            <ChevronRight size={12} color={BrandColors.primary} strokeWidth={2.5} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ContextFitRow({ fit, isLast }: { fit: DressingContextFit; isLast: boolean }) {
  const Icon = DRESSING_CONTEXT_ICONS[fit.context] ?? Calendar;
  const statusCfg = STATUS_STYLES[fit.status];
  const StatusIcon = STATUS_ICON[fit.status].icon;
  const showAlternatives = fit.status !== 'great' && fit.alternatives.length > 0;
  const altLine = showAlternatives
    ? fit.alternatives
        .slice(0, 3)
        .map((alt) => alt.fabric)
        .join(' · ')
    : null;
  const altReason = showAlternatives ? fit.alternatives[0]?.reason : null;

  return (
    <View style={[styles.fitRow, !isLast && styles.fitRowBorder]}>
      <View style={styles.fitIconWrap}>
        <Icon size={15} color={BrandColors.primaryDark} strokeWidth={2.25} />
      </View>

      <View style={styles.fitBody}>
        <View style={styles.fitHeaderRow}>
          <Text style={styles.fitLabel}>{fit.label}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusCfg.background, borderColor: statusCfg.border },
            ]}>
            <StatusIcon size={11} color={statusCfg.text} strokeWidth={2.5} />
            <Text style={[styles.statusBadgeText, { color: statusCfg.text }]}>
              {statusCfg.label}
            </Text>
          </View>
        </View>

        <Text style={styles.fitSummary}>{fit.summary}</Text>

        {altLine ? (
          <Text style={styles.fitAltLine}>
            Better: <Text style={styles.fitAltValue}>{altLine}</Text>
            {altReason ? `. ${altReason}` : ''}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function ContextFitGroups({ fits }: { fits: DressingContextFit[] }) {
  const weatherIds = new Set(WEATHER_CONTEXT_OPTIONS.map((item) => item.id));
  const weatherFits = fits.filter((fit) => weatherIds.has(fit.context));
  const occasionFits = fits.filter((fit) => !weatherIds.has(fit.context));

  const groups = [
    { key: 'weather', title: 'Weather', items: weatherFits },
    { key: 'occasion', title: 'Occasion', items: occasionFits },
  ].filter((group) => group.items.length > 0);

  return (
    <View style={styles.fitGroups}>
      {groups.map((group) => (
        <View key={group.key} style={styles.fitGroup}>
          {groups.length > 1 ? <Text style={styles.fitGroupLabel}>{group.title}</Text> : null}
          <View style={styles.fitCard}>
            {group.items.map((fit, index) => (
              <ContextFitRow
                key={fit.context}
                fit={fit}
                isLast={index === group.items.length - 1}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function PreferenceMatchRow({ match }: { match: PreferenceMatchResult }) {
  const hasMatch = match.matched.length > 0;
  const matchLine = match.matched
    .map((item) =>
      typeof item.percentage === 'number' ? `${item.fabric} ${item.percentage}%` : item.fabric,
    )
    .join(' · ');

  return (
    <View style={styles.preferenceCard}>
      {hasMatch ? (
        <CircleCheck size={16} color="#15803D" strokeWidth={2.25} />
      ) : (
        <Heart size={16} color={BrandColors.primaryDark} strokeWidth={2.25} />
      )}
      <Text style={styles.preferenceTitle} numberOfLines={2}>
        {hasMatch ? 'Matches your list' : 'Not in your list'}
      </Text>
      <Text style={styles.preferenceBody} numberOfLines={3}>
        {hasMatch
          ? matchLine
          : `You usually look for ${match.unmatchedPreferred.slice(0, 3).join(', ')}.`}
      </Text>
    </View>
  );
}

export function PersonalizedInsightsContent({
  dominantFabric,
  detectedCompositions,
}: PersonalizedInsightsContentProps) {
  const preferences = useSyncExternalStore(
    subscribeUserPreferences,
    getUserPreferencesSnapshot,
    getUserPreferencesSnapshot,
  );
  const compositions = detectedCompositions ?? [];

  const skinToneGuidance = getSkinToneColorGuidance(
    preferences.skinTone,
    dominantFabric,
    compositions,
    preferences.skinUndertone,
    preferences.colorSeason,
  );
  const allergyAlert = getAllergyAlert(
    preferences.sensitiveFabrics,
    dominantFabric,
    compositions,
  );
  const dressingFits = getDressingContextFits(
    preferences.dressingContexts ?? [],
    dominantFabric,
    compositions,
  );
  const preferenceMatch = getPreferenceMatch(
    preferences.preferredFabrics,
    dominantFabric,
    compositions,
  );
  const setupItems = getInsightsSetupItems(preferences);
  const hasDressingContexts = (preferences.dressingContexts ?? []).length > 0;
  const hasSensitivities = preferences.sensitiveFabrics.length > 0;
  const showColor = Boolean(skinToneGuidance);
  const showSensitivities = hasSensitivities && Boolean(allergyAlert);
  const showFit = hasDressingContexts && dressingFits.length > 0;
  const showPreference = preferenceMatch.hasPreferredList;

  return (
    <View style={styles.container}>
      <SetupChecklist items={setupItems} />

      {showColor ? (
        <SectionBlock title="COLOR">
          <SkinToneColorsSection guidance={skinToneGuidance!} />
        </SectionBlock>
      ) : null}

      {showSensitivities || showPreference ? (
        <View style={styles.pairRow}>
          {showSensitivities ? (
            <View style={styles.pairCol}>
              <Text style={styles.sectionLabel}>SENSITIVITIES</Text>
              <AllergyAlertCard alert={allergyAlert!} compact stacked />
            </View>
          ) : null}
          {showPreference ? (
            <View style={styles.pairCol}>
              <Text style={styles.sectionLabel}>PREFERENCE</Text>
              <PreferenceMatchRow match={preferenceMatch} />
            </View>
          ) : null}
        </View>
      ) : null}

      {showFit ? (
        <SectionBlock title="WEATHER & OCCASION">
          <ContextFitGroups fits={dressingFits} />
        </SectionBlock>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  pairCol: {
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  setupBlock: {
    gap: 8,
  },
  setupHint: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
  setupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  setupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.lavender,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  setupChipText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.primaryDark,
  },
  fitGroups: {
    gap: 12,
  },
  fitGroup: {
    gap: 6,
  },
  fitGroupLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.6,
    color: BrandColors.textMuted,
    paddingHorizontal: 2,
  },
  fitCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.white,
    paddingHorizontal: 12,
  },
  fitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
  },
  fitRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BrandColors.borderLight,
  },
  fitIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavender,
    marginTop: 1,
    flexShrink: 0,
  },
  fitBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  fitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  fitLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
    flex: 1,
  },
  fitSummary: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: BrandColors.textMuted,
  },
  fitAltLine: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
    marginTop: 1,
  },
  fitAltValue: {
    fontFamily: Fonts.semiBold,
    color: BrandColors.primaryDark,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
  },
  statusBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
  },
  preferenceCard: {
    flex: 1,
    gap: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.white,
    padding: 12,
    minHeight: 112,
  },
  preferenceTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
  },
  preferenceBody: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
  pressed: {
    opacity: 0.88,
  },
});
