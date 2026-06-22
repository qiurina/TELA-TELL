import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Frown,
  Heart,
  Leaf,
  Meh,
  Recycle,
  ScanLine,
  Scissors,
  Smile,
  Tag,
} from '@/components/ui/lucide-icons';
import { ScanAnotherButton } from '@/components/results/scan-another-button';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import {
  SUITABILITY_COLOR,
  type FabricComposition,
  type GarmentPurposeItem,
  type ScanRecommendations,
  type SuitabilityLevel,
} from '@/constants/mock-data';

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function DetectedTag({ compositions }: { compositions?: FabricComposition[] }) {
  const items = compositions ?? [];

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={[styles.detectedTag, faintCardShadow()]}>
      <ScanLine size={18} color={BrandColors.primary} strokeWidth={2.5} />
      <Text style={styles.detectedText}>
        Detected:{' '}
        {items.map((item, index) => (
          <Text key={`${item.material}-${item.percentage}`}>
            {index > 0 ? ', ' : ''}
            <Text style={styles.detectedValue}>
              {item.material} ({item.percentage}%)
            </Text>
          </Text>
        ))}
      </Text>
    </View>
  );
}

function EcoAlternativesSection({
  alternatives,
}: {
  alternatives: ScanRecommendations['ecoAlternatives'];
}) {
  return (
    <View style={styles.section}>
      <SectionLabel title="ECO-FRIENDLY ALTERNATIVES" />
      <View style={styles.list}>
        {alternatives.map((item) => (
          <View key={item.name} style={styles.ecoCard}>
            <View style={styles.ecoIconWrap}>
              <Leaf size={18} color="#16a34a" strokeWidth={2.5} />
            </View>
            <View style={styles.ecoTextBlock}>
              <Text style={styles.ecoName}>{item.name}</Text>
              <Text style={styles.ecoDescription}>{item.description}</Text>
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

function GarmentActionsSection({ reuse }: { reuse: ScanRecommendations['reuse'] }) {
  const actions = [
    { key: 'resale', label: 'Resale', icon: Tag, message: reuse.resale },
    { key: 'donate', label: 'Donate', icon: Heart, message: reuse.donate },
    { key: 'upcycle', label: 'Upcycle', icon: Scissors, message: reuse.upcycle },
  ] as const;

  return (
    <View style={styles.section}>
      <SectionLabel title="WHAT TO DO WITH THIS GARMENT" />
      <View style={styles.actionRow}>
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Pressable
              key={action.key}
              style={({ pressed }) => [styles.actionTile, pressed && styles.pressed]}
              onPress={() => Alert.alert(action.label, action.message)}
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

function getSuitabilityIcon(suitability: SuitabilityLevel) {
  if (suitability === 'Excellent' || suitability === 'Good') {
    return Smile;
  }

  if (suitability === 'Fair') {
    return Meh;
  }

  return Frown;
}

function PurposeBox({
  purpose,
  suitability,
}: {
  purpose: string;
  suitability: GarmentPurposeItem['suitability'];
}) {
  const SuitabilityIcon = getSuitabilityIcon(suitability);
  const ratingColor = SUITABILITY_COLOR[suitability];

  return (
    <View style={[styles.purposeBox, faintCardShadow()]}>
      <Text style={styles.purposeBoxName}>{purpose}</Text>
      <View style={styles.purposeRatingRow}>
        <SuitabilityIcon size={18} color={ratingColor} strokeWidth={2.5} />
        <Text style={[styles.purposeBoxRating, { color: ratingColor }]}>{suitability}</Text>
      </View>
    </View>
  );
}

function GarmentPurposeSection({ items }: { items: GarmentPurposeItem[] }) {
  const rows: GarmentPurposeItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  return (
    <View style={styles.section}>
      <SectionLabel title="GARMENT PURPOSE / SUITABILITY" />
      <View style={styles.purposeGrid}>
        {rows.map((row) => (
          <View key={row.map((item) => item.purpose).join('-')} style={styles.purposeRow}>
            {row.map((item) => (
              <PurposeBox key={item.purpose} purpose={item.purpose} suitability={item.suitability} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

type RecommendationsContentProps = {
  detectedCompositions?: FabricComposition[];
  recommendations: ScanRecommendations;
  onScanAnother: () => void;
};

type LegacyRecommendations = ScanRecommendations & {
  ecoAwareness?: {
    summary: string;
    tips: string[];
    alternative: string;
  };
};

function normalizeRecommendations(recommendations: LegacyRecommendations): ScanRecommendations {
  if (recommendations.ecoAlternatives?.length && recommendations.recycledAwareness) {
    return recommendations;
  }

  const legacy = recommendations.ecoAwareness;

  return {
    garmentPurposes: recommendations.garmentPurposes ?? [],
    ecoAlternatives:
      recommendations.ecoAlternatives ??
      (legacy
        ? [
            {
              name: 'Eco alternative',
              description: legacy.alternative || legacy.summary,
            },
          ]
        : []),
    recycledAwareness:
      recommendations.recycledAwareness ??
      legacy?.tips?.[0] ??
      legacy?.summary ??
      'Look for recycled fabric labels when shopping.',
    reuse: recommendations.reuse ?? {
      resale: 'List gently used items on secondhand apps.',
      donate: 'Donate to local textile collection programs.',
      upcycle: 'Repurpose into bags, cloths, or craft projects.',
    },
  };
}

export function RecommendationsContent({
  detectedCompositions,
  recommendations,
  onScanAnother,
}: RecommendationsContentProps) {
  const safeRecommendations = normalizeRecommendations(recommendations);
  const compositions = detectedCompositions ?? [];

  return (
    <View style={styles.container}>
      <DetectedTag compositions={compositions} />
      <EcoAlternativesSection alternatives={safeRecommendations.ecoAlternatives} />
      <RecycledAwarenessSection message={safeRecommendations.recycledAwareness} />
      <GarmentActionsSection reuse={safeRecommendations.reuse} />
      <GarmentPurposeSection items={safeRecommendations.garmentPurposes} />
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
  list: {
    gap: 10,
  },
  detectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: BrandColors.primary,
  },
  detectedText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: BrandColors.text,
  },
  detectedValue: {
    fontFamily: Fonts.semiBold,
    color: BrandColors.primary,
  },
  ecoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  ecoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BrandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ecoTextBlock: {
    flex: 1,
    gap: 4,
  },
  ecoName: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: '#15803d',
  },
  ecoDescription: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
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
  purposeGrid: {
    gap: 12,
  },
  purposeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  purposeBox: {
    flex: 1,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
  },
  purposeBoxName: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
    lineHeight: 20,
  },
  purposeRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  purposeBoxRating: {
    fontFamily: Fonts.bold,
    fontSize: 15,
  },
  pressed: {
    opacity: 0.88,
  },
});
