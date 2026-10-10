import type { FC } from 'react';
import { useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { InfoButton } from '@/components/ui/info-button';
import { InfoSheet } from '@/components/ui/info-sheet';
import {
  Calendar,
  CircleCheck,
  CircleX,
  Droplets,
  Sun,
  TriangleAlert,
  type IconProps,
} from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { SHEDDING_SHEET_TITLE } from '@/data/fabrics/assessment-disclaimers';
import { FABRIC_REFERENCES } from '@/data/fabrics/fabric-references';
import { getFiberSheddingSheet } from '@/data/fabrics/shedding-why';
import { getComfortProfile } from '@/data/fabrics/comfort-profile';
import type { FiberProfile } from '@/data/fabrics/fiber-profiles';
import { FABRIC_CATEGORY_COLORS, FABRIC_REGISTRY } from '@/data/fabrics/fabrics';
import { getDressingContextLabel } from '@/data/preferences/occasion-weather';
import { FiberResearchSection } from '@/features/fabrics/components/fiber-research-section';
import { getEnvironmentalSummary, getSheddingColor } from '@/features/fabrics/lib/fiber-profile-insights';

type FiberProfileContentProps = {
  profile: FiberProfile;
  /** When false, skips the large reference hero (e.g. scan results already show a comparison). */
  showHero?: boolean;
};

type ProfileTab = 'health' | 'eco' | 'care' | 'wear';

const PROFILE_TABS: { key: ProfileTab; label: string }[] = [
  { key: 'health', label: 'Comfort' },
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

const COMFORT_TONE_STYLE: Record<
  'good' | 'caution' | 'warn',
  { background: string; border: string; accent: string }
> = {
  good: { background: '#F0FDF4', border: '#BBF7D0', accent: '#16A34A' },
  caution: { background: '#FFFBEB', border: '#FDE68A', accent: '#B45309' },
  warn: { background: '#FEF2F2', border: '#FECACA', accent: '#DC2626' },
};

function ComfortInsightRow({
  label,
  text,
  tone,
}: {
  label: string;
  text: string;
  tone: 'good' | 'caution' | 'warn';
}) {
  const toneStyle = COMFORT_TONE_STYLE[tone];
  const icon =
    tone === 'good' ? (
      <CircleCheck size={15} color={toneStyle.accent} strokeWidth={2.25} />
    ) : tone === 'caution' ? (
      <TriangleAlert size={15} color={toneStyle.accent} strokeWidth={2.25} />
    ) : (
      <CircleX size={15} color={toneStyle.accent} strokeWidth={2.25} />
    );

  return (
    <View
      style={[
        styles.comfortRow,
        { backgroundColor: toneStyle.background, borderColor: toneStyle.border },
      ]}>
      <View style={styles.comfortRowHeader}>
        {icon}
        <Text style={[styles.comfortRowLabel, { color: toneStyle.accent }]}>{label}</Text>
      </View>
      <Text style={styles.comfortRowText}>{text}</Text>
    </View>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  valueColor,
  onInfoPress,
  infoAccessibilityLabel,
}: {
  icon: FC<IconProps>;
  label: string;
  value: string;
  valueColor?: string;
  onInfoPress?: () => void;
  infoAccessibilityLabel?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelWrap}>
        <Icon size={14} color={BrandColors.textMuted} strokeWidth={2.25} />
        <Text style={styles.infoLabel}>{label}</Text>
        {onInfoPress ? (
          <InfoButton onPress={onInfoPress} accessibilityLabel={infoAccessibilityLabel ?? label} />
        ) : null}
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
  const [sheet, setSheet] = useState<'shedding' | null>(null);
  const reference = FABRIC_REFERENCES[profile.fabric];
  const category = FABRIC_REGISTRY.find((item) => item.name === profile.fabric)?.category;
  const categoryStyle = category ? FABRIC_CATEGORY_COLORS[category] : null;
  const comfort = getComfortProfile(profile);
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

  return (
    <View style={styles.root}>
      <InfoSheet
        visible={sheet === 'shedding'}
        title={SHEDDING_SHEET_TITLE}
        sections={getFiberSheddingSheet(profile.fabric)}
        icon={Droplets}
        onClose={() => setSheet(null)}
      />
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
          </View>
          <Text style={styles.description}>{profile.description}</Text>
        </View>
      )}

      <ProfileTabs active={activeTab} onSelect={setActiveTab} />

      {activeTab === 'health' ? (
        <View style={styles.section}>
          <SectionLabel>Wearing comfort</SectionLabel>
          <View style={styles.comfortList}>
            <ComfortInsightRow
              label="Breathability"
              text={comfort.breathability.note}
              tone={comfort.breathability.tone}
            />
            <ComfortInsightRow
              label="Moisture"
              text={comfort.moistureManagement.note}
              tone={comfort.moistureManagement.tone}
            />
            <ComfortInsightRow
              label="Heat retention"
              text={comfort.heatRetention.note}
              tone={comfort.heatRetention.tone}
            />
            <ComfortInsightRow
              label="Feel"
              text={comfort.mechanicalComfort.note}
              tone={comfort.mechanicalComfort.tone}
            />
          </View>
        </View>
      ) : null}

      {activeTab === 'eco' ? (
        <View style={styles.section}>
          <SectionLabel>Fiber shedding</SectionLabel>
          <View style={[styles.propertiesCard, faintCardShadow()]}>
            <InfoRow
              icon={Droplets}
              label="Shedding tendency"
              value={environment.microplasticShedding}
              valueColor={getSheddingColor(environment.microplasticShedding)}
              onInfoPress={() => setSheet('shedding')}
              infoAccessibilityLabel="About this shedding estimate"
            />
          </View>
          <FiberResearchSection fabric={profile.fabric} />
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
  textCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    gap: 12,
  },
  comfortList: {
    gap: 10,
  },
  comfortRow: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  comfortRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comfortRowLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  comfortRowText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
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
});
