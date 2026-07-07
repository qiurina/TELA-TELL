import type { FC } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View, type DimensionValue } from 'react-native';

import {
  CircleCheck,
  CircleX,
  Droplets,
  Leaf,
  MoveHorizontal,
  Shield,
  Wind,
  type IconProps,
} from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { FABRIC_REFERENCES } from '@/data/fabrics/fabric-references';
import type { FiberProfile, SustainabilityBreakdown } from '@/data/fabrics/fiber-profiles';
import { FABRIC_CATEGORY_COLORS, FABRIC_REGISTRY } from '@/data/fabrics/fabrics';
import {
  WEATHER_CONTEXT_OPTIONS,
  type WeatherContext,
} from '@/data/preferences/occasion-weather';
import { DRESSING_CONTEXT_ICONS } from '@/features/profile/dressing-context-icons';
import {
  SUSTAINABILITY_DOT,
  getFabricPropertyColor,
  type SustainabilityRating,
} from '@/data/scans/mock-data';

type FiberProfileContentProps = {
  profile: FiberProfile;
};

const SUSTAINABILITY_BADGE: Record<
  SustainabilityRating,
  { background: string; border: string; text: string }
> = {
  green: { background: '#F0FDF4', border: '#BBF7D0', text: '#15803D' },
  yellow: { background: '#FFFBEB', border: '#FDE68A', text: '#B45309' },
  red: { background: '#FEF2F2', border: '#FECACA', text: '#B91C1C' },
};

const BREAKDOWN_LABELS: { key: keyof SustainabilityBreakdown; label: string }[] = [
  { key: 'biodegradability', label: 'Biodegradability' },
  { key: 'waterEfficiency', label: 'Water usage' },
  { key: 'recyclability', label: 'Recyclability' },
  { key: 'lowCarbon', label: 'Carbon footprint' },
];

const BREAKDOWN_GOOD = '#16a34a';
const BREAKDOWN_WARN = '#ea580c';
const BREAKDOWN_MID = '#ca8a04';

function getBreakdownStatus(
  metric: keyof SustainabilityBreakdown,
  score: number,
): { label: string; color: string; fillColor: string; barWidth: number } {
  const clamped = Math.min(Math.max(score, 0), 10);

  if (metric === 'waterEfficiency') {
    if (clamped < 5) {
      return {
        label: 'High concern',
        color: BREAKDOWN_WARN,
        fillColor: BREAKDOWN_WARN,
        barWidth: (10 - clamped) * 10 + 10,
      };
    }
    if (clamped < 7) {
      return {
        label: 'Moderate',
        color: BREAKDOWN_MID,
        fillColor: BREAKDOWN_MID,
        barWidth: clamped * 10,
      };
    }
    return {
      label: 'Low usage',
      color: BREAKDOWN_GOOD,
      fillColor: BREAKDOWN_GOOD,
      barWidth: clamped * 10,
    };
  }

  if (metric === 'lowCarbon') {
    if (clamped >= 8) {
      return { label: 'Low', color: BREAKDOWN_GOOD, fillColor: BREAKDOWN_GOOD, barWidth: clamped * 10 };
    }
    if (clamped >= 6) {
      return { label: 'Good', color: BREAKDOWN_GOOD, fillColor: BREAKDOWN_GOOD, barWidth: clamped * 10 };
    }
    if (clamped >= 4) {
      return { label: 'Moderate', color: BREAKDOWN_MID, fillColor: BREAKDOWN_MID, barWidth: clamped * 10 };
    }
    return { label: 'High', color: BREAKDOWN_WARN, fillColor: BREAKDOWN_WARN, barWidth: clamped * 10 };
  }

  if (clamped >= 8.5) {
    return { label: 'High', color: BREAKDOWN_GOOD, fillColor: BREAKDOWN_GOOD, barWidth: clamped * 10 };
  }
  if (clamped >= 6.5) {
    return { label: 'Good', color: BREAKDOWN_GOOD, fillColor: BREAKDOWN_GOOD, barWidth: clamped * 10 };
  }
  if (clamped >= 4.5) {
    return { label: 'Moderate', color: BREAKDOWN_MID, fillColor: BREAKDOWN_MID, barWidth: clamped * 10 };
  }
  return { label: 'Low', color: BREAKDOWN_WARN, fillColor: BREAKDOWN_WARN, barWidth: clamped * 10 };
}

function BreakdownBar({
  label,
  metric,
  score,
}: {
  label: string;
  metric: keyof SustainabilityBreakdown;
  score: number;
}) {
  const status = getBreakdownStatus(metric, score);
  const width = `${Math.min(status.barWidth, 100)}%` as DimensionValue;

  return (
    <View style={styles.breakdownRow}>
      <View style={styles.breakdownHeader}>
        <Text style={styles.breakdownLabel}>{label}</Text>
        <Text style={[styles.breakdownStatus, { color: status.color }]}>{status.label}</Text>
      </View>
      <View style={styles.breakdownTrack}>
        <View style={[styles.breakdownFill, { width, backgroundColor: status.fillColor }]} />
      </View>
    </View>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  valueColor,
}: {
  icon: FC<IconProps>;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={[styles.quickStat, faintCardShadow()]}>
      <Icon size={16} color={BrandColors.primary} strokeWidth={2.25} />
      <Text style={styles.quickStatLabel}>{label}</Text>
      <Text style={[styles.quickStatValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

function PropertyCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.propertyCell}>
      <Text style={styles.propertyLabel}>{label}</Text>
      <Text style={styles.propertyValue}>{value}</Text>
    </View>
  );
}

function WeatherChip({ context }: { context: WeatherContext }) {
  const label =
    WEATHER_CONTEXT_OPTIONS.find((option) => option.id === context)?.label ?? context;
  const Icon = DRESSING_CONTEXT_ICONS[context];

  return (
    <View style={styles.weatherChip}>
      <Icon size={14} color={BrandColors.primaryDark} strokeWidth={2.25} />
      <Text style={styles.weatherChipText}>{label}</Text>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function FiberProfileContent({ profile }: FiberProfileContentProps) {
  const reference = FABRIC_REFERENCES[profile.fabric];
  const category = FABRIC_REGISTRY.find((item) => item.name === profile.fabric)?.category;
  const categoryStyle = category ? FABRIC_CATEGORY_COLORS[category] : null;
  const badgeStyle = SUSTAINABILITY_BADGE[profile.sustainabilityRating];
  const scoreColor = SUSTAINABILITY_DOT[profile.sustainabilityRating];

  return (
    <View style={styles.root}>
      <View style={[styles.heroCard, faintCardShadow()]}>
        <Image
          source={reference.image}
          style={styles.heroImage}
          contentFit="cover"
          accessibilityLabel={`${profile.fabric} reference swatch`}
        />

        <View style={styles.heroBody}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIdentity}>
              <Text style={styles.fabricName}>{profile.fabric}</Text>
              <Text style={styles.scientificName}>{profile.scientificName}</Text>
              <Text style={styles.fiberType}>{profile.fiberType}</Text>
            </View>

            <View style={styles.sustainabilityBadgeWrap}>
              <View
                style={[
                  styles.sustainabilityBadge,
                  { backgroundColor: badgeStyle.background, borderColor: badgeStyle.border },
                ]}>
                <View style={[styles.sustainabilityDot, { backgroundColor: scoreColor }]} />
                <Text style={[styles.sustainabilityBadgeText, { color: badgeStyle.text }]}>
                  {profile.sustainabilityLabel}
                </Text>
              </View>
              <Text style={[styles.sustainabilityScore, { color: scoreColor }]}>
                {profile.sustainabilityScore.toFixed(1)}
                <Text style={styles.sustainabilityScoreSuffix}> / 10</Text>
              </Text>
            </View>
          </View>

          {categoryStyle ? (
            <View
              style={[
                styles.categoryPill,
                {
                  backgroundColor: categoryStyle.background,
                  borderColor: categoryStyle.border,
                },
              ]}>
              <Text style={[styles.categoryText, { color: categoryStyle.text }]}>{category}</Text>
            </View>
          ) : null}

          <Text style={styles.description}>{profile.description}</Text>
        </View>
      </View>

      <View style={styles.quickStatsRow}>
        <QuickStat
          icon={Wind}
          label="Breathability"
          value={profile.breathability}
          valueColor={getFabricPropertyColor(profile.breathability)}
        />
        <QuickStat
          icon={Shield}
          label="Durability"
          value={profile.durability}
          valueColor={getFabricPropertyColor(profile.durability)}
        />
        <QuickStat
          icon={MoveHorizontal}
          label="Stretch"
          value={profile.stretch}
          valueColor={getFabricPropertyColor(profile.stretch)}
        />
        <QuickStat icon={Droplets} label="Moisture" value={profile.moisture} />
      </View>

      <View style={styles.section}>
        <SectionLabel>Fabric properties</SectionLabel>
        <View style={[styles.propertiesCard, faintCardShadow()]}>
          <View style={styles.propertyRow}>
            <PropertyCell label="Texture" value={profile.texture} />
            <PropertyCell label="Weave type" value={profile.weaveType} />
          </View>
          <View style={styles.propertyDivider} />
          <View style={styles.propertyRow}>
            <PropertyCell label="Weight" value={profile.weight} />
            <PropertyCell label="Origin" value={profile.origin} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sustainabilitySectionLabel}>Sustainability breakdown</Text>
        <View style={[styles.breakdownCard, faintCardShadow()]}>
          {BREAKDOWN_LABELS.map(({ key, label }) => (
            <BreakdownBar key={key} label={label} metric={key} score={profile.breakdown[key]} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionLabel>Care instructions</SectionLabel>
        <View style={[styles.textCard, faintCardShadow()]}>
          {profile.careInstructions.map((instruction) => (
            <View key={instruction.text} style={styles.careRow}>
              {instruction.recommended ? (
                <CircleCheck size={18} color="#16a34a" strokeWidth={2.25} />
              ) : (
                <CircleX size={18} color="#dc2626" strokeWidth={2.25} />
              )}
              <Text style={styles.careText}>{instruction.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionLabel>Best weather</SectionLabel>
        <View style={styles.chipWrap}>
          {profile.bestWeather.map((weather) => (
            <WeatherChip key={weather} context={weather} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionLabel>Best used for</SectionLabel>
        <View style={styles.chipWrap}>
          {profile.useCases.map((useCase) => (
            <View key={useCase} style={styles.weatherChip}>
              <Text style={styles.weatherChipText}>{useCase}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionLabel>In Philippine markets</SectionLabel>
        <View style={[styles.phMarketsCard, faintCardShadow()]}>
          <Leaf size={16} color={BrandColors.primary} strokeWidth={2.25} />
          <Text style={styles.phMarketsText}>{profile.philippineMarkets}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 18,
  },
  heroCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: BrandColors.lavenderCard,
  },
  heroBody: {
    padding: 16,
    gap: 12,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroIdentity: {
    flex: 1,
    gap: 2,
  },
  fabricName: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: BrandColors.text,
    letterSpacing: -0.3,
  },
  scientificName: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#15803D',
  },
  fiberType: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: BrandColors.textMuted,
    marginTop: 2,
  },
  sustainabilityBadgeWrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  sustainabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  sustainabilityDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  sustainabilityBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
  },
  sustainabilityScore: {
    fontFamily: Fonts.bold,
    fontSize: 18,
  },
  sustainabilityScoreSuffix: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: BrandColors.textMuted,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.text,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickStat: {
    flex: 1,
    backgroundColor: BrandColors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    padding: 10,
    gap: 6,
    alignItems: 'center',
    minHeight: 88,
  },
  quickStatLabel: {
    fontFamily: Fonts.medium,
    fontSize: 9,
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
  quickStatValue: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: BrandColors.text,
    textAlign: 'center',
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
    textTransform: 'uppercase',
  },
  propertiesCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    padding: 16,
    gap: 12,
  },
  propertyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  propertyCell: {
    flex: 1,
    gap: 4,
  },
  propertyLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: BrandColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  propertyValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
    lineHeight: 20,
  },
  propertyDivider: {
    height: 1,
    backgroundColor: BrandColors.borderLight,
  },
  textCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    gap: 12,
  },
  sustainabilitySectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: '#15803D',
    textTransform: 'uppercase',
  },
  breakdownCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    gap: 14,
  },
  breakdownRow: {
    gap: 8,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  breakdownLabel: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
  breakdownStatus: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
  },
  breakdownTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: BrandColors.inputBackground,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 999,
  },
  careRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  careText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: BrandColors.text,
    lineHeight: 20,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weatherChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BrandColors.primary,
  },
  weatherChipText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: BrandColors.primaryDark,
  },
  phMarketsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  phMarketsText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.primaryDark,
  },
});
