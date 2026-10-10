import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { InfoSheet } from '@/components/ui/info-sheet';
import { InfoButton } from '@/components/ui/info-button';
import { BasisSheet } from '@/features/recommendations/components/basis-sheet';
import { HealthSafetyScores } from '@/features/recommendations/components/health-safety-scores';
import { SyntheticMicroplasticGuide } from '@/features/recommendations/components/synthetic-microplastic-guide';
import {
  Heart,
  Scissors,
  Shirt,
  Tag,
} from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { faintCardShadow } from '@/constants/shadows';
import { getEcoGuidance, getEcoAlternativeText } from '@/data/fabrics/eco-alternatives';
import { getHealthSafetyMetrics } from '@/data/fabrics/health-safety-scores';
import { getFiberInformation } from '@/data/fabrics/shedding-why';
import { getSyntheticHealthRisk } from '@/data/fabrics/synthetic-health-risk';
import { assessScanReliability } from '@/data/scans/scan-confidence';
import { FiberInformationCard } from '@/features/results/components/fiber-information-card';
import { Fonts } from '@/constants/fonts';
import { type FabricComposition } from '@/data/scans/mock-data';
import type { GarmentCondition } from '@/data/scans/garment-condition';

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function SectionHeader({ title, onBasisPress }: { title: string; onBasisPress?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <SectionLabel title={title} />
      {onBasisPress ? (
        <InfoButton onPress={onBasisPress} accessibilityLabel={`About ${title.toLowerCase()}`} />
      ) : null}
    </View>
  );
}

function AlternativeCard({
  item,
}: {
  item: ReturnType<typeof getEcoGuidance>['ecoAlternatives'][number];
}) {
  const [basisVisible, setBasisVisible] = useState(false);

  return (
    <View style={[styles.ecoCard, faintCardShadow()]}>
      <BasisSheet
        visible={basisVisible}
        title={`About ${item.name}`}
        claims={item.claims ?? []}
        onClose={() => setBasisVisible(false)}
      />
      <View style={styles.ecoIconWrap}>
        <Shirt size={18} color={BrandColors.primary} strokeWidth={2.25} />
      </View>
      <View style={styles.ecoTextBlock}>
        <Text style={styles.ecoName}>{item.name}</Text>
        <Text style={styles.ecoDescription}>{getEcoAlternativeText(item)}</Text>
      </View>
      <InfoButton
        onPress={() => setBasisVisible(true)}
        accessibilityLabel={`About ${item.name}`}
      />
    </View>
  );
}

const NOTES_BASIS_NOTE =
  'These notes say what the research did and did not show. They are not a recommendation.';

/** Shown when no source we could read supports a swap: what we checked, never a suggestion. */
function NoSwapCard({
  title,
  notes,
}: {
  title: string;
  notes: ReturnType<typeof getEcoGuidance>['evidenceNotes'];
}) {
  const [basisVisible, setBasisVisible] = useState(false);
  const summary = notes
    .filter((note) => note.kind === 'fact' && (note.sourceIds ?? []).length === 0)
    .map((note) => note.text)
    .join(' ');
  const hasSources = notes.some((note) => (note.sourceIds ?? []).length > 0);

  return (
    <View style={[styles.ecoCard, faintCardShadow()]}>
      <BasisSheet
        visible={basisVisible}
        title={title}
        claims={notes}
        editorialNote={NOTES_BASIS_NOTE}
        onClose={() => setBasisVisible(false)}
      />
      <View style={styles.ecoIconWrap}>
        <Shirt size={18} color={BrandColors.primary} strokeWidth={2.25} />
      </View>
      <View style={styles.ecoTextBlock}>
        <Text style={styles.ecoName}>{title}</Text>
        <Text style={styles.ecoDescription}>{summary}</Text>
      </View>
      {hasSources ? (
        <InfoButton onPress={() => setBasisVisible(true)} accessibilityLabel={`About ${title}`} />
      ) : null}
    </View>
  );
}

function EcoAlternativesSection({
  alternatives,
  notes,
  emptyTitle,
}: {
  alternatives: ReturnType<typeof getEcoGuidance>['ecoAlternatives'];
  notes: ReturnType<typeof getEcoGuidance>['evidenceNotes'];
  emptyTitle: string;
}) {
  return (
    <View style={styles.section}>
      <SectionHeader title="OTHER FABRICS TO CONSIDER" />
      <View style={styles.list}>
        {alternatives.length > 0 ? (
          alternatives.map((item) => <AlternativeCard key={item.name} item={item} />)
        ) : (
          <NoSwapCard title={emptyTitle} notes={notes} />
        )}
      </View>
    </View>
  );
}

function GarmentActionsSection({
  reuse,
  reuseClaims,
}: {
  reuse: ReturnType<typeof getEcoGuidance>['reuse'];
  reuseClaims: ReturnType<typeof getEcoGuidance>['reuseClaims'];
}) {
  const [basisVisible, setBasisVisible] = useState(false);
  const [activeAction, setActiveAction] = useState<{
    label: string;
    message: string;
  } | null>(null);

  const actions = [
    { key: 'resale', label: 'Resale', icon: Tag, message: reuse.resale },
    { key: 'donate', label: 'Donate', icon: Heart, message: reuse.donate },
    { key: 'upcycle', label: 'Upcycle', icon: Scissors, message: reuse.upcycle },
  ] as const;

  return (
    <View style={styles.section}>
      <InfoSheet
        visible={activeAction !== null}
        title={activeAction?.label ?? ''}
        message={activeAction?.message ?? ''}
        onClose={() => setActiveAction(null)}
      />

      <BasisSheet
        visible={basisVisible}
        title="About resale and donate tips"
        claims={reuseClaims}
        editorialNote="These tips are the app authors' practical ideas. Repair and upcycling tips are not shown to reduce environmental impact."
        onClose={() => setBasisVisible(false)}
      />
      <SectionHeader
        title="WHAT TO DO WITH THIS GARMENT"
        onBasisPress={() => setBasisVisible(true)}
      />
      <View style={styles.actionRow}>
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Pressable
              key={action.key}
              style={({ pressed }) => [styles.actionTile, pressed && styles.pressed]}
              onPress={() => setActiveAction({ label: action.label, message: action.message })}
              accessibilityRole="button"
              accessibilityLabel={action.label}>
              <Icon size={22} color={BrandColors.primary} strokeWidth={2} />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type RecommendationsContentProps = {
  dominantFabric: string;
  detectedCompositions?: FabricComposition[];
  garmentCondition?: GarmentCondition;
};

export function RecommendationsContent({
  dominantFabric,
  detectedCompositions,
  garmentCondition,
}: RecommendationsContentProps) {
  const compositions = detectedCompositions ?? [];
  const ecoGuidance = getEcoGuidance(dominantFabric, compositions);
  const healthRisk = getSyntheticHealthRisk(dominantFabric, compositions, garmentCondition);
  // Information (no rating) when the most likely fiber is not one of the four rated synthetics.
  // Not shown for an Unsure scan, which names no reliable fiber.
  const fiberInfo =
    healthRisk || !assessScanReliability(compositions).reliable ? null : getFiberInformation(dominantFabric);
  const healthMetrics = getHealthSafetyMetrics(dominantFabric, compositions);

  return (
    <View style={styles.container}>
      {healthRisk ? <SyntheticMicroplasticGuide risk={healthRisk} /> : null}
      {fiberInfo ? <FiberInformationCard info={fiberInfo} /> : null}

      <HealthSafetyScores metrics={healthMetrics} />

      <EcoAlternativesSection
        alternatives={ecoGuidance.ecoAlternatives}
        notes={ecoGuidance.evidenceNotes}
        emptyTitle={
          ecoGuidance.context.kind === 'mixed' ? ecoGuidance.context.title : 'No better-supported swap found'
        }
      />
      <GarmentActionsSection reuse={ecoGuidance.reuse} reuseClaims={ecoGuidance.reuseClaims} />
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  list: {
    gap: 10,
  },
  ecoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
  },
  ecoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BrandColors.lavenderCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ecoTextBlock: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  ecoName: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
  },
  ecoDescription: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: BrandColors.primary,
    minHeight: 88,
  },
  actionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.primary,
  },
  pressed: {
    opacity: 0.88,
  },
});
