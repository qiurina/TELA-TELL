import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScanConfirmSheet } from '@/features/scan/components/scan-confirm-sheet';
import { HealthSafetyScores } from '@/features/recommendations/components/health-safety-scores';
import { SyntheticMicroplasticGuide } from '@/features/recommendations/components/synthetic-microplastic-guide';
import {
  Heart,
  Leaf,
  Recycle,
  Scissors,
  Tag,
} from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { faintCardShadow } from '@/constants/shadows';
import {
  getEcoGuidance,
  getEcoAlternativeText,
} from '@/data/fabrics/eco-alternatives';
import { getHealthSafetyMetrics } from '@/data/fabrics/health-safety-scores';
import { getSyntheticHealthRisk } from '@/data/fabrics/synthetic-health-risk';
import { Fonts } from '@/constants/fonts';
import {
  type FabricComposition,
  type SustainabilityRating,
} from '@/data/scans/mock-data';
import type { GarmentCondition } from '@/data/scans/garment-condition';

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function EcoAlternativesSection({
  alternatives,
}: {
  alternatives: ReturnType<typeof getEcoGuidance>['ecoAlternatives'];
}) {
  return (
    <View style={styles.section}>
      <SectionLabel title="ECO-FRIENDLY ALTERNATIVES" />
      <View style={styles.list}>
        {alternatives.map((item) => (
          <View key={item.name} style={[styles.ecoCard, faintCardShadow()]}>
            <View style={styles.ecoIconWrap}>
              <Leaf size={18} color="#15803D" strokeWidth={2.25} />
            </View>
            <View style={styles.ecoTextBlock}>
              <Text style={styles.ecoName}>{item.name}</Text>
              <Text style={styles.ecoDescription}>{getEcoAlternativeText(item)}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function RecycledAwarenessSection({ message }: { message: string }) {
  return (
    <View style={styles.section}>
      <SectionLabel title="RECYCLED OPTIONS AWARENESS" />
      <View style={styles.recycledCard}>
        <View style={styles.recycledIconWrap}>
          <Recycle size={20} color="#ca8a04" strokeWidth={2.5} />
        </View>
        <Text style={styles.recycledText}>{message}</Text>
      </View>
    </View>
  );
}

function GarmentActionsSection({ reuse }: { reuse: ReturnType<typeof getEcoGuidance>['reuse'] }) {
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
      <ScanConfirmSheet
        visible={activeAction !== null}
        variant="info"
        title={activeAction?.label ?? ''}
        message={activeAction?.message ?? ''}
        confirmLabel="Got it"
        onConfirm={() => setActiveAction(null)}
        onCancel={() => setActiveAction(null)}
      />

      <SectionLabel title="WHAT TO DO WITH THIS GARMENT" />
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
  sustainabilityScore?: number;
  sustainabilityRating?: SustainabilityRating;
  garmentCondition?: GarmentCondition;
};

export function RecommendationsContent({
  dominantFabric,
  detectedCompositions,
  sustainabilityScore,
  sustainabilityRating,
  garmentCondition,
}: RecommendationsContentProps) {
  const compositions = detectedCompositions ?? [];
  const ecoGuidance = getEcoGuidance(dominantFabric, compositions);
  const healthRisk = getSyntheticHealthRisk(dominantFabric, compositions, garmentCondition);
  const healthMetrics = getHealthSafetyMetrics(dominantFabric, compositions, {
    sustainabilityScore,
    sustainabilityRating,
  });

  return (
    <View style={styles.container}>
      {healthRisk ? <SyntheticMicroplasticGuide risk={healthRisk} /> : null}

      <HealthSafetyScores metrics={healthMetrics} />

      <EcoAlternativesSection alternatives={ecoGuidance.ecoAlternatives} />
      <RecycledAwarenessSection message={ecoGuidance.recycledAwareness} />
      <GarmentActionsSection reuse={ecoGuidance.reuse} />
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
    backgroundColor: '#F0FDF4',
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
  recycledCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  recycledIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BrandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recycledText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: BrandColors.text,
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
