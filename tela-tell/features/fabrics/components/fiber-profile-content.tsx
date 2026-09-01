import type { FC } from 'react';
import { useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Calendar,
  Check,
  CircleCheck,
  CircleX,
  Droplets,
  Leaf,
  MoveHorizontal,
  Recycle,
  Shield,
  Sun,
  TriangleAlert,
  Wind,
  type IconProps,
} from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { FABRIC_REFERENCES } from '@/data/fabrics/fabric-references';
import type { FiberProfile } from '@/data/fabrics/fiber-profiles';
import { FABRIC_CATEGORY_COLORS, FABRIC_REGISTRY } from '@/data/fabrics/fabrics';
import { getDressingContextLabel } from '@/data/preferences/occasion-weather';
import {
  SUSTAINABILITY_DOT,
  getFabricPropertyColor,
  type SustainabilityRating,
} from '@/data/scans/mock-data';
import {
  getEnvironmentalSummary,
  getHealthVerdicts,
  getSheddingColor,
} from '@/features/fabrics/lib/fiber-profile-insights';

type FiberProfileContentProps = {
  profile: FiberProfile;
  /** When false, skips the large reference hero (e.g. scan results already show a comparison). */
  showHero?: boolean;
};

type ProfileTab = 'health' | 'eco' | 'care' | 'wear';

const PROFILE_TABS: { key: ProfileTab; label: string }[] = [
  { key: 'health', label: 'Health' },
  { key: 'eco', label: 'Eco' },
  { key: 'care', label: 'Care' },
  { key: 'wear', label: 'Wear' },
];

function ProfileTabs({
  active,
  onSelect,
}: {
  active: ProfileTab;
  onSelect: (tab: ProfileTab) => void;
}) {
  return (
    <View style={styles.tabTrack}>
      {PROFILE_TABS.map((tab) => {
        const isActive = tab.key === active;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            style={({ pressed }) => [
              styles.tabSegment,
              isActive && styles.tabSegmentActive,
              pressed && !isActive && styles.tabSegmentPressed,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const SUSTAINABILITY_BADGE: Record<
  SustainabilityRating,
  { background: string; border: string; text: string }
> = {
  green: { background: '#F0FDF4', border: '#BBF7D0', text: '#15803D' },
  yellow: { background: '#FFFBEB', border: '#FDE68A', text: '#B45309' },
  red: { background: '#FEF2F2', border: '#FECACA', text: '#B91C1C' },
};

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
      <View style={styles.quickStatHeader}>
        <Icon size={15} color={BrandColors.primary} strokeWidth={2.25} />
        <Text style={styles.quickStatLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={[styles.quickStatValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

function SustainabilityScoreStack({
  score,
  label,
  rating,
}: {
  score: number;
  label: string;
  rating: SustainabilityRating;
}) {
  const badgeStyle = SUSTAINABILITY_BADGE[rating];
  const scoreColor = SUSTAINABILITY_DOT[rating];

  return (
    <View style={styles.sustainabilityBadgeWrap}>
      <View
        style={[
          styles.sustainabilityBadge,
          { backgroundColor: badgeStyle.background, borderColor: badgeStyle.border },
        ]}>
        <View style={[styles.sustainabilityDot, { backgroundColor: scoreColor }]} />
        <Text style={[styles.sustainabilityBadgeText, { color: badgeStyle.text }]}>{label}</Text>
      </View>
      <Text style={[styles.sustainabilityScore, { color: scoreColor }]}>
        {score.toFixed(1)}
        <Text style={styles.sustainabilityScoreSuffix}> / 10</Text>
      </Text>
    </View>
  );
}

function PropertyCell({
  icon: Icon,
  label,
  value,
}: {
  icon?: FC<IconProps>;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.propertyCell}>
      <View style={styles.propertyLabelRow}>
        {Icon ? <Icon size={13} color={BrandColors.textMuted} strokeWidth={2.25} /> : null}
        <Text style={styles.propertyLabel}>{label}</Text>
      </View>
      <Text style={styles.propertyValue}>{value}</Text>
    </View>
  );
}

function InsightLine({
  text,
  tone,
}: {
  text: string;
  tone: 'good' | 'caution' | 'warn';
}) {
  const icon =
    tone === 'good' ? (
      <CircleCheck size={16} color="#16A34A" strokeWidth={2.25} />
    ) : tone === 'caution' ? (
      <TriangleAlert size={16} color="#B45309" strokeWidth={2.25} />
    ) : (
      <CircleX size={16} color="#DC2626" strokeWidth={2.25} />
    );

  return (
    <View style={styles.insightLine}>
      {icon}
      <Text style={styles.insightText}>{text}</Text>
    </View>
  );
}

function InfoRow({
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
    <View style={styles.infoRow}>
      <View style={styles.infoLabelWrap}>
        <Icon size={14} color={BrandColors.textMuted} strokeWidth={2.25} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function ContextChipGroup({
  title,
  icon: Icon,
  labels,
}: {
  title: string;
  icon: FC<IconProps>;
  labels: string[];
}) {
  if (labels.length === 0) {
    return null;
  }

  return (
    <View style={styles.contextGroup}>
      <View style={styles.contextHeader}>
        <Icon size={14} color={BrandColors.primary} strokeWidth={2.25} />
        <Text style={styles.contextTitle}>{title}</Text>
      </View>
      <View style={styles.chipWrap}>
        {labels.map((label) => (
          <View key={label} style={styles.useChip}>
            <Text style={styles.useChipText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function FiberProfileContent({ profile, showHero = true }: FiberProfileContentProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('health');
  const reference = FABRIC_REFERENCES[profile.fabric];
  const category = FABRIC_REGISTRY.find((item) => item.name === profile.fabric)?.category;
  const categoryStyle = category ? FABRIC_CATEGORY_COLORS[category] : null;
  const health = getHealthVerdicts(profile);
  const environment = getEnvironmentalSummary(profile);

  const categoryPill = categoryStyle ? (
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
  ) : (
    <Text style={styles.fiberType}>{profile.fiberType}</Text>
  );

  const sustainabilityStack = (
    <SustainabilityScoreStack
      score={profile.sustainabilityScore}
      label={profile.sustainabilityLabel}
      rating={profile.sustainabilityRating}
    />
  );

  return (
    <View style={styles.root}>
      {showHero ? (
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
                {categoryPill}
              </View>
              {sustainabilityStack}
            </View>

            <Text style={styles.description}>{profile.description}</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.summaryCard, faintCardShadow()]}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIdentity}>
              <Text style={styles.fabricName}>{profile.fabric}</Text>
              <Text style={styles.scientificName}>{profile.scientificName}</Text>
              {categoryPill}
            </View>
            {sustainabilityStack}
          </View>
          <Text style={styles.description}>{profile.description}</Text>
        </View>
      )}

      <View style={styles.quickStatsGrid}>
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
        </View>
        <View style={styles.quickStatsRow}>
          <QuickStat
            icon={MoveHorizontal}
            label="Stretch"
            value={profile.stretch}
            valueColor={getFabricPropertyColor(profile.stretch)}
          />
          <QuickStat icon={Droplets} label="Moisture" value={profile.moisture} />
        </View>
      </View>

      <ProfileTabs active={activeTab} onSelect={setActiveTab} />

      {activeTab === 'health' ? (
        <View style={styles.section}>
          <SectionLabel>Skin health</SectionLabel>
          <View style={[styles.textCard, faintCardShadow()]}>
            <InsightLine text={health.skinFriendliness.label} tone={health.skinFriendliness.tone} />
            <InsightLine
              text={`Heat retention: ${health.heatRetention.label}`}
              tone={health.heatRetention.tone}
            />
            <InsightLine
              text={`Irritation potential: ${health.irritationPotential.label}`}
              tone={health.irritationPotential.tone}
            />
            <InsightLine text={health.tip.text} tone={health.tip.tone} />
          </View>
        </View>
      ) : null}

      {activeTab === 'eco' ? (
        <View style={styles.section}>
          <SectionLabel>Environmental impact</SectionLabel>
          <View style={[styles.propertiesCard, faintCardShadow()]}>
            <View style={styles.propertyRow}>
              <PropertyCell icon={Leaf} label="Renewable" value={environment.renewable} />
              <PropertyCell icon={Check} label="Biodegradable" value={environment.biodegradable} />
            </View>
            <View style={styles.propertyDivider} />
            <View style={styles.propertyRow}>
              <PropertyCell icon={Recycle} label="Recyclable" value={environment.recyclable} />
              <PropertyCell icon={Wind} label="Carbon impact" value={environment.carbonImpact} />
            </View>
            <View style={styles.propertyDivider} />
            <InfoRow
              icon={Droplets}
              label="Microplastic shedding"
              value={environment.microplasticShedding}
              valueColor={getSheddingColor(environment.microplasticShedding)}
            />
          </View>
        </View>
      ) : null}

      {activeTab === 'care' ? (
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
      ) : null}

      {activeTab === 'wear' ? (
        <>
          <View style={styles.section}>
            <SectionLabel>Good for</SectionLabel>
            <View style={[styles.contextCard, faintCardShadow()]}>
              <ContextChipGroup
                title="Weather"
                icon={Sun}
                labels={profile.bestWeather.map((id) => getDressingContextLabel(id))}
              />
              <ContextChipGroup
                title="Occasion"
                icon={Calendar}
                labels={profile.bestOccasion.map((id) => getDressingContextLabel(id))}
              />
            </View>
          </View>

          <View style={styles.section}>
            <SectionLabel>In Philippine markets</SectionLabel>
            <View style={[styles.phMarketsCard, faintCardShadow()]}>
              <Leaf size={16} color={BrandColors.primary} strokeWidth={2.25} />
              <Text style={styles.phMarketsText}>{profile.philippineMarkets}</Text>
            </View>
          </View>
        </>
      ) : null}
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
  summaryCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    padding: 16,
    gap: 12,
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
    gap: 6,
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
    color: BrandColors.textMuted,
  },
  fiberType: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: BrandColors.textMuted,
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
  quickStatsGrid: {
    gap: 8,
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  quickStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabTrack: {
    flexDirection: 'row',
    backgroundColor: BrandColors.inputBackground,
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  tabSegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
  },
  tabSegmentActive: {
    backgroundColor: BrandColors.white,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  tabSegmentPressed: {
    opacity: 0.7,
  },
  tabLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
  tabLabelActive: {
    fontFamily: Fonts.semiBold,
    color: BrandColors.primaryDark,
  },
  quickStatLabel: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: BrandColors.textMuted,
  },
  quickStatValue: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: BrandColors.text,
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
  propertyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLabelWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: BrandColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
    textAlign: 'right',
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
  insightLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  insightText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: BrandColors.text,
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
  contextCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    padding: 14,
    gap: 14,
  },
  contextGroup: {
    gap: 8,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contextTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.text,
  },
  useChip: {
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BrandColors.primary,
  },
  useChipText: {
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
