import { useRouter, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CircleCheck, TriangleAlert } from '@/components/ui/lucide-icons';
import { AllergyAlertCard } from '@/features/results/components/allergy-alert-card';
import { ScanAnotherButton } from '@/features/results/components/scan-another-button';
import { SkinToneColorsSection } from '@/features/recommendations/components/skin-tone-colors-section';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { getAllergyAlert } from '@/data/fabrics/fabric-allergies';
import { resolveSupportedFabric } from '@/data/fabrics/fabric-references';
import {
  getDressingContextFits,
  type DressingContextFit,
} from '@/data/preferences/dressing-context-fit';
import { getSkinToneColorGuidance } from '@/data/preferences/skin-tone-colors';
import type { FabricComposition } from '@/data/scans/mock-data';
import { getUserPreferences } from '@/features/profile/lib/user-preferences';

type PersonalizedInsightsContentProps = {
  dominantFabric: string;
  detectedCompositions?: FabricComposition[];
  onScanAnother: () => void;
};

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {children}
    </View>
  );
}

function OccasionFitCard({ fit, rank }: { fit: DressingContextFit; rank: number }) {
  const statusStyle =
    fit.status === 'great'
      ? styles.fitGreat
      : fit.status === 'poor'
        ? styles.fitPoor
        : styles.fitOkay;

  return (
    <View style={[styles.fitCard, faintCardShadow()]}>
      <View style={styles.fitHeader}>
        <Text style={styles.fitRank}>{rank}.</Text>
        <Text style={styles.fitLabel}>{fit.label}</Text>
        <Text style={[styles.fitBadge, statusStyle]}>
          {fit.status === 'great' ? 'Great fit' : fit.status === 'poor' ? 'Poor fit' : 'Okay fit'}
        </Text>
      </View>
      <Text style={styles.fitSummary}>{fit.summary}</Text>
      {fit.alternatives.length > 0 ? (
        <View style={styles.altList}>
          <Text style={styles.altTitle}>Better alternatives</Text>
          {fit.alternatives.map((item, index) => (
            <View key={`${fit.context}-${item.fabric}`} style={styles.altRow}>
              <Text style={styles.altRank}>{index + 1}.</Text>
              <Text style={styles.altText}>
                <Text style={styles.altFabric}>{item.fabric}</Text>
                {' — '}
                {item.reason}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function PersonalizedInsightsContent({
  dominantFabric,
  detectedCompositions,
  onScanAnother,
}: PersonalizedInsightsContentProps) {
  const router = useRouter();
  const compositions = detectedCompositions ?? [];
  const preferences = getUserPreferences();
  const skinToneGuidance = getSkinToneColorGuidance(
    preferences.skinTone,
    dominantFabric,
    compositions,
    preferences.skinUndertone,
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
  const detected = resolveSupportedFabric(dominantFabric, compositions);
  const preferredMatch = preferences.preferredFabrics.find(
    (fabric) =>
      dominantFabric.toLowerCase().includes(fabric.toLowerCase()) ||
      compositions.some((item) => item.material.toLowerCase().includes(fabric.toLowerCase())),
  );

  return (
    <View style={styles.container}>
      <SectionBlock title="COLOR MATCH">
        {skinToneGuidance ? (
          <SkinToneColorsSection guidance={skinToneGuidance} />
        ) : (
          <View style={[styles.promptCard, faintCardShadow()]}>
            <Text style={styles.promptTitle}>Set your skin tone</Text>
            <Text style={styles.promptBody}>
              Add skin tone and undertone in Profile to see recommended colors and shades to avoid
              for this fabric.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.promptButton, pressed && styles.pressed]}
              onPress={() => router.push('/profile' as Href)}>
              <Text style={styles.promptButtonText}>Open Profile</Text>
            </Pressable>
          </View>
        )}
      </SectionBlock>

      <SectionBlock title="OCCASION AND WEATHER FIT">
        {dressingFits.length > 0 ? (
          <View style={styles.fitList}>
            {dressingFits.map((fit, index) => (
              <OccasionFitCard key={fit.context} fit={fit} rank={index + 1} />
            ))}
          </View>
        ) : (
          <View style={[styles.promptCard, faintCardShadow()]}>
            <Text style={styles.promptTitle}>No dressing context set</Text>
            <Text style={styles.promptBody}>
              Pick weather and occasion preferences in Profile to see how well this fabric fits your
              plans.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.promptButton, pressed && styles.pressed]}
              onPress={() => router.push('/profile' as Href)}>
              <Text style={styles.promptButtonText}>Open Profile</Text>
            </Pressable>
          </View>
        )}
      </SectionBlock>

      {allergyAlert?.conflictDetected ? (
        <SectionBlock title="ALLERGY CHECK">
          <AllergyAlertCard alert={allergyAlert} />
        </SectionBlock>
      ) : null}

      <SectionBlock title="PREFERENCE MATCH">
        <View
          style={[
            styles.preferenceCard,
            faintCardShadow(),
            preferredMatch ? styles.preferenceMatch : styles.preferenceNoMatch,
          ]}>
          {preferredMatch ? (
            <CircleCheck size={22} color="#15803d" strokeWidth={2.25} />
          ) : (
            <TriangleAlert size={22} color={BrandColors.textMuted} strokeWidth={2.25} />
          )}
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceTitle}>
              {preferredMatch ? 'Matches your preferences' : 'Not in your preferred list'}
            </Text>
            <Text style={styles.preferenceBody}>
              {preferredMatch
                ? `${detected ?? dominantFabric} is one of your preferred fabrics (${preferredMatch}).`
                : preferences.preferredFabrics.length > 0
                  ? `You usually look for ${preferences.preferredFabrics.join(', ')}. This scan is a different fiber mix to compare.`
                  : 'Add preferred fabrics in Profile to flag finds that match what you usually shop for.'}
            </Text>
          </View>
        </View>
      </SectionBlock>

      <ScanAnotherButton onPress={onScanAnother} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  promptCard: {
    gap: 8,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.lavenderCard,
  },
  promptTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primaryDark,
  },
  promptBody: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
  promptButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.primary,
  },
  promptButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: BrandColors.primary,
  },
  fitList: {
    gap: 10,
  },
  fitCard: {
    gap: 8,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.white,
  },
  fitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  fitRank: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: BrandColors.primary,
  },
  fitLabel: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
  },
  fitBadge: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fitGreat: {
    color: '#15803d',
    backgroundColor: '#f0fdf4',
  },
  fitOkay: {
    color: BrandColors.primaryDark,
    backgroundColor: BrandColors.lavenderCard,
  },
  fitPoor: {
    color: '#b45309',
    backgroundColor: '#fffbeb',
  },
  fitSummary: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: BrandColors.text,
  },
  altList: {
    gap: 6,
    marginTop: 4,
  },
  altTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: BrandColors.textMuted,
  },
  altRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  altRank: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: BrandColors.primary,
    width: 16,
  },
  altText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.text,
  },
  altFabric: {
    fontFamily: Fonts.semiBold,
    color: '#15803d',
  },
  preferenceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  preferenceMatch: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  preferenceNoMatch: {
    backgroundColor: BrandColors.lavenderCard,
    borderColor: BrandColors.border,
  },
  preferenceText: {
    flex: 1,
    gap: 4,
  },
  preferenceTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
  },
  preferenceBody: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
  pressed: {
    opacity: 0.88,
  },
});
