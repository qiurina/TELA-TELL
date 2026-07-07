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
import {
  OCCASION_CONTEXT_OPTIONS,
  WEATHER_CONTEXT_OPTIONS,
} from '@/data/preferences/occasion-weather';
import { getSkinToneColorGuidance } from '@/data/preferences/skin-tone-colors';
import type { FabricComposition } from '@/data/scans/mock-data';
import { getUserPreferences } from '@/features/profile/lib/user-preferences';

type PersonalizedInsightsContentProps = {
  dominantFabric: string;
  detectedCompositions?: FabricComposition[];
  onScanAnother: () => void;
};

function SectionBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {children}
    </View>
  );
}

function ProfilePrompt({
  title,
  body,
  onPress,
}: {
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <View style={[styles.promptCard, faintCardShadow()]}>
      <Text style={styles.promptTitle}>{title}</Text>
      <Text style={styles.promptBody}>{body}</Text>
      <Pressable
        style={({ pressed }) => [styles.promptButton, pressed && styles.pressed]}
        onPress={onPress}>
        <Text style={styles.promptButtonText}>Open Profile</Text>
      </Pressable>
    </View>
  );
}

const WEATHER_CONTEXT_IDS = new Set(WEATHER_CONTEXT_OPTIONS.map((option) => option.id));
const OCCASION_CONTEXT_IDS = new Set(OCCASION_CONTEXT_OPTIONS.map((option) => option.id));

function partitionDressingFits(fits: DressingContextFit[]) {
  return {
    weather: fits.filter((fit) => WEATHER_CONTEXT_IDS.has(fit.context)),
    occasion: fits.filter((fit) => OCCASION_CONTEXT_IDS.has(fit.context)),
  };
}

function ContextFitRow({ fit }: { fit: DressingContextFit }) {
  const statusStyle =
    fit.status === 'great'
      ? styles.fitGreat
      : fit.status === 'poor'
        ? styles.fitPoor
        : styles.fitOkay;
  const alternativeNames = fit.alternatives.map((item) => item.fabric).join(' · ');

  return (
    <View style={styles.fitCard}>
      <View style={styles.fitHeader}>
        <Text style={styles.fitLabel}>{fit.label}</Text>
        <Text style={[styles.fitBadge, statusStyle]}>
          {fit.status === 'great' ? 'Great' : fit.status === 'poor' ? 'Poor' : 'Okay'}
        </Text>
      </View>
      {alternativeNames ? (
        <Text style={styles.altNames}>{alternativeNames}</Text>
      ) : null}
    </View>
  );
}

function ContextFitList({ fits }: { fits: DressingContextFit[] }) {
  return (
    <View style={[styles.fitList, faintCardShadow()]}>
      {fits.map((fit, index) => (
        <View
          key={fit.context}
          style={index < fits.length - 1 ? styles.fitCardBorder : undefined}>
          <ContextFitRow fit={fit} />
        </View>
      ))}
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
  const openProfile = () => router.push('/(tabs)/profile' as Href);

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
  const { weather: weatherFits, occasion: occasionFits } = partitionDressingFits(dressingFits);
  const hasDressingContexts = (preferences.dressingContexts ?? []).length > 0;
  const detected = resolveSupportedFabric(dominantFabric, compositions);
  const preferredMatch = preferences.preferredFabrics.find(
    (fabric) =>
      dominantFabric.toLowerCase().includes(fabric.toLowerCase()) ||
      compositions.some((item) => item.material.toLowerCase().includes(fabric.toLowerCase())),
  );
  const hasSensitivities = preferences.sensitiveFabrics.length > 0;

  return (
    <View style={styles.container}>
      <SectionBlock title="COLOR ANALYSIS">
        {skinToneGuidance ? (
          <SkinToneColorsSection guidance={skinToneGuidance} />
        ) : (
          <ProfilePrompt
            title="Add your skin tone"
            body="Set skin tone and undertone in Profile to see color swatches for this scan."
            onPress={openProfile}
          />
        )}
      </SectionBlock>

      <SectionBlock title="FIBER SENSITIVITIES">
        {hasSensitivities && allergyAlert ? (
          <AllergyAlertCard alert={allergyAlert} />
        ) : (
          <ProfilePrompt
            title="No sensitivities set"
            body="Mark fiber types you react to in Profile — we'll flag conflicts on every scan."
            onPress={openProfile}
          />
        )}
      </SectionBlock>

      {weatherFits.length > 0 ? (
        <SectionBlock title="WEATHER FIT">
          <ContextFitList fits={weatherFits} />
        </SectionBlock>
      ) : null}

      {occasionFits.length > 0 ? (
        <SectionBlock title="OCCASION FIT">
          <ContextFitList fits={occasionFits} />
        </SectionBlock>
      ) : null}

      {!hasDressingContexts ? (
        <SectionBlock title="WEATHER & OCCASION">
          <ProfilePrompt
            title="No contexts set"
            body="Pick weather and occasion chips in Profile to see fit ratings for this scan."
            onPress={openProfile}
          />
        </SectionBlock>
      ) : null}

      <SectionBlock title="PREFERENCE MATCH">
        <View
          style={[
            styles.preferenceCard,
            faintCardShadow(),
            preferredMatch ? styles.preferenceMatch : styles.preferenceNeutral,
          ]}>
          {preferredMatch ? (
            <CircleCheck size={20} color="#15803d" strokeWidth={2.25} />
          ) : (
            <TriangleAlert size={20} color={BrandColors.textMuted} strokeWidth={2.25} />
          )}
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceTitle}>
              {preferredMatch ? 'Matches your list' : 'Not in your preferred list'}
            </Text>
            <Text style={styles.preferenceBody}>
              {preferredMatch
                ? `${detected ?? dominantFabric} is a preferred fiber type for you.`
                : preferences.preferredFabrics.length > 0
                  ? `You usually shop for ${preferences.preferredFabrics.join(', ')}.`
                  : 'Add preferred fiber types in Profile to highlight good finds.'}
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
    gap: 22,
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
  promptCard: {
    gap: 8,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.white,
  },
  promptTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
  },
  promptBody: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
  promptButton: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: BrandColors.lavenderCard,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  promptButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: BrandColors.primary,
  },
  fitList: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.white,
    overflow: 'hidden',
  },
  fitCard: {
    gap: 4,
    padding: 14,
  },
  fitCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  fitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
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
    paddingVertical: 3,
    borderRadius: 999,
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
  altNames: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.primaryDark,
  },
  preferenceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.white,
  },
  preferenceMatch: {
    backgroundColor: '#fafffe',
  },
  preferenceNeutral: {
    backgroundColor: BrandColors.white,
  },
  preferenceText: {
    flex: 1,
    gap: 3,
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
