import type { FC } from 'react';
import { useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Calendar,
  CircleCheck,
  CircleX,
  Sun,
  type IconProps,
} from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { FABRIC_REFERENCES } from '@/data/fabrics/fabric-references';
import type { FiberProfile } from '@/data/fabrics/fiber-profiles';
import { FABRIC_CATEGORY_COLORS, FABRIC_REGISTRY } from '@/data/fabrics/fabrics';
import { getDressingContextLabel } from '@/data/preferences/occasion-weather';

type FiberProfileContentProps = {
  profile: FiberProfile;
  /** When false, skips the large reference hero (e.g. scan results already show a comparison). */
  showHero?: boolean;
};

type ProfileTab = 'care' | 'wear';

const PROFILE_TABS: { key: ProfileTab; label: string }[] = [
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
  const [activeTab, setActiveTab] = useState<ProfileTab>('care');
  const reference = FABRIC_REFERENCES[profile.fabric];
  const category = FABRIC_REGISTRY.find((item) => item.name === profile.fabric)?.category;
  const categoryStyle = category ? FABRIC_CATEGORY_COLORS[category] : null;

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
  textCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    gap: 12,
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
