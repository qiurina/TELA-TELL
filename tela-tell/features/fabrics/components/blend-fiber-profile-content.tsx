import { useRouter, type Href } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRight, Droplets, Heart, Leaf } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { FABRIC_REFERENCES } from '@/data/fabrics/fabric-references';
import {
  FABRIC_CATEGORY_COLORS,
  FABRIC_REGISTRY,
  resolveFabricAlias,
  type SupportedFabric,
} from '@/data/fabrics/fabrics';
import { getFiberProfile, getFiberSlug } from '@/data/fabrics/fiber-profiles';
import { getSignificantFibers, type CompositionInput } from '@/data/scans/analysis';
import { SUSTAINABILITY_DOT } from '@/data/scans/mock-data';
import {
  getEnvironmentalSummary,
  getHealthVerdicts,
  getSheddingColor,
  getToneColor,
} from '@/features/fabrics/lib/fiber-profile-insights';

type BlendFiberProfileContentProps = {
  compositions: CompositionInput[];
};

type ResolvedFiberShare = {
  fabric: SupportedFabric;
  percentage: number;
};

function resolveSignificantFibers(compositions: CompositionInput[]): ResolvedFiberShare[] {
  const significant = getSignificantFibers(compositions);
  const resolved: ResolvedFiberShare[] = [];

  for (const item of significant) {
    const fabric = resolveFabricAlias(item.material);
    if (!fabric) {
      continue;
    }
    if (resolved.some((entry) => entry.fabric === fabric)) {
      continue;
    }
    resolved.push({ fabric, percentage: item.percentage });
  }

  return resolved;
}

function CompactFiberCard({
  fabric,
  percentage,
  isDominant,
}: {
  fabric: SupportedFabric;
  percentage: number;
  isDominant: boolean;
}) {
  const router = useRouter();
  const profile = getFiberProfile(fabric);
  const reference = FABRIC_REFERENCES[fabric];
  const category = FABRIC_REGISTRY.find((item) => item.name === fabric)?.category;
  const categoryColors = category ? FABRIC_CATEGORY_COLORS[category] : null;
  const health = getHealthVerdicts(profile);
  const environment = getEnvironmentalSummary(profile);
  const sheddingColor = getSheddingColor(environment.microplasticShedding);
  const skinColor = getToneColor(health.skinFriendliness.tone);
  const careTip =
    profile.careInstructions.find((item) => item.recommended)?.text ??
    profile.careInstructions[0]?.text ??
    'See full profile for care tips.';

  const openFullProfile = () => {
    router.push(`/fiber/${getFiberSlug(fabric)}` as Href);
  };

  return (
    <View style={[styles.fiberCard, faintCardShadow()]}>
      <View style={styles.fiberHeader}>
        <Image
          source={reference.image}
          style={styles.fiberThumb}
          contentFit="cover"
          accessibilityLabel={`${fabric} reference`}
        />
        <View style={styles.fiberHeaderText}>
          <View style={styles.fiberTitleRow}>
            <Text style={styles.fiberName}>{fabric}</Text>
            <Text style={styles.fiberPercent}>{percentage}%</Text>
          </View>
          <View style={styles.fiberMetaRow}>
            {category && categoryColors ? (
              <View
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: categoryColors.background,
                    borderColor: categoryColors.border,
                  },
                ]}>
                <Text style={[styles.categoryText, { color: categoryColors.text }]}>
                  {category}
                </Text>
              </View>
            ) : null}
            {isDominant ? (
              <View style={styles.dominantPill}>
                <Text style={styles.dominantText}>Dominant</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.snapshotList}>
        <View style={styles.snapshotRow}>
          <Heart size={14} color={skinColor} strokeWidth={2.25} />
          <Text style={styles.snapshotLabel}>Skin</Text>
          <Text style={[styles.snapshotValue, { color: skinColor }]} numberOfLines={2}>
            {health.skinFriendliness.label}
          </Text>
        </View>
        <View style={styles.snapshotRow}>
          <Droplets size={14} color={sheddingColor ?? BrandColors.textMuted} strokeWidth={2.25} />
          <Text style={styles.snapshotLabel}>Shedding</Text>
          <Text
            style={[styles.snapshotValue, sheddingColor ? { color: sheddingColor } : null]}
            numberOfLines={1}>
            {environment.microplasticShedding}
          </Text>
        </View>
        <View style={styles.snapshotRow}>
          <Leaf
            size={14}
            color={SUSTAINABILITY_DOT[profile.sustainabilityRating]}
            strokeWidth={2.25}
          />
          <Text style={styles.snapshotLabel}>Eco</Text>
          <Text
            style={[
              styles.snapshotValue,
              { color: SUSTAINABILITY_DOT[profile.sustainabilityRating] },
            ]}
            numberOfLines={1}>
            {profile.sustainabilityLabel} · {profile.sustainabilityScore.toFixed(1)}/10
          </Text>
        </View>
      </View>

      <Text style={styles.careTip} numberOfLines={2}>
        Care tip: {careTip}
      </Text>

      <Pressable
        style={({ pressed }) => [styles.fullProfileBtn, pressed && styles.pressed]}
        onPress={openFullProfile}
        accessibilityRole="button"
        accessibilityLabel={`View full ${fabric} profile`}>
        <Text style={styles.fullProfileText}>View full {fabric} profile</Text>
        <ChevronRight size={16} color={BrandColors.primary} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

/** Compact blend-aware profile: slim summary + one card per significant fiber. */
export function BlendFiberProfileContent({ compositions }: BlendFiberProfileContentProps) {
  const fibers = resolveSignificantFibers(compositions);

  if (fibers.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Blend details unavailable</Text>
        <Text style={styles.emptyBody}>
          We could not match the detected fibers to known profiles yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.sectionLabel}>FIBERS IN THIS FABRIC</Text>

      <View style={styles.list}>
        {fibers.map((item, index) => (
          <CompactFiberCard
            key={item.fabric}
            fabric={item.fabric}
            percentage={item.percentage}
            isDominant={index === 0}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  list: {
    gap: 12,
  },
  fiberCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    padding: 14,
    gap: 12,
  },
  fiberHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  fiberThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: BrandColors.lavenderCard,
  },
  fiberHeaderText: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  fiberTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  fiberName: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color: BrandColors.text,
  },
  fiberPercent: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: BrandColors.primaryDark,
  },
  fiberMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
  },
  dominantPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: BrandColors.lavender,
    borderWidth: 1,
    borderColor: BrandColors.primary,
  },
  dominantText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: BrandColors.primaryDark,
  },
  snapshotList: {
    gap: 8,
  },
  snapshotRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  snapshotLabel: {
    width: 62,
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: BrandColors.textMuted,
    paddingTop: 1,
  },
  snapshotValue: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
    color: BrandColors.text,
  },
  careTip: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
  fullProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BrandColors.borderLight,
    paddingTop: 12,
  },
  fullProfileText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.primary,
  },
  pressed: {
    opacity: 0.88,
  },
  emptyCard: {
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.lavenderCard,
  },
  emptyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
  },
  emptyBody: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: BrandColors.textMuted,
  },
});
