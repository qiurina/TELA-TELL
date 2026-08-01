import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ChevronRight, Leaf, Search, Shield } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { FABRIC_REFERENCES } from '@/data/fabrics/fabric-references';
import { getFiberProfile, getFiberSlug } from '@/data/fabrics/fiber-profiles';
import {
  FABRIC_CATEGORY_COLORS,
  FABRIC_REGISTRY,
  type FabricCategory,
  type SupportedFabric,
} from '@/data/fabrics/fabrics';
import {
  getFiberHealthRiskLabel,
  getFiberHealthRiskLevel,
  type HealthRiskLevel,
} from '@/data/fabrics/synthetic-health-risk';

const RISK_CHIP_COLORS: Record<HealthRiskLevel, { text: string; background: string; border: string }> = {
  low: { text: '#15803D', background: '#F0FDF4', border: '#BBF7D0' },
  moderate: { text: '#B45309', background: '#FFFBEB', border: '#FDE68A' },
  high: { text: '#B91C1C', background: '#FEF2F2', border: '#FECACA' },
};

const SUSTAINABLE_CHIP = {
  text: '#15803D',
  background: '#F0FDF4',
  border: '#BBF7D0',
};

const CATEGORY_ORDER: FabricCategory[] = [
  'Natural',
  'Synthetic',
  'Semi-synthetic',
  'Animal material',
  'Philippine native',
];

type CategoryFilter = 'All' | FabricCategory;

const FILTER_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Natural', label: 'Natural' },
  { value: 'Synthetic', label: 'Synthetic' },
  { value: 'Semi-synthetic', label: 'Semi-synthetic' },
  { value: 'Animal material', label: 'Animal' },
  { value: 'Philippine native', label: 'Philippine' },
];

function matchesFabricSearch(fabric: SupportedFabric, query: string) {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return true;
  }

  const reference = FABRIC_REFERENCES[fabric];
  const category = FABRIC_REGISTRY.find((item) => item.name === fabric)?.category ?? '';

  return (
    fabric.toLowerCase().includes(trimmed) ||
    category.toLowerCase().includes(trimmed) ||
    reference.lookFor.toLowerCase().includes(trimmed) ||
    reference.textureNote.toLowerCase().includes(trimmed)
  );
}

function FabricSearchBar({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View style={styles.searchBar}>
      <Search size={16} color={BrandColors.textMuted} strokeWidth={2} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search fibers..."
        placeholderTextColor={BrandColors.textMuted}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Search fibers"
      />
    </View>
  );
}

function CategoryFilterBar({
  selected,
  onSelect,
}: {
  selected: CategoryFilter;
  onSelect: (value: CategoryFilter) => void;
}) {
  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      style={styles.filterScroll}
      contentContainerStyle={styles.filterRow}>
      {FILTER_OPTIONS.map(({ value, label }) => {
        const isSelected = selected === value;
        const categoryStyle = value !== 'All' ? FABRIC_CATEGORY_COLORS[value] : null;

        return (
          <Pressable
            key={value}
            onPress={() => onSelect(value)}
            style={({ pressed }) => [
              styles.filterPill,
              isSelected && value === 'All' && styles.filterPillAllActive,
              isSelected &&
                categoryStyle && {
                  backgroundColor: categoryStyle.background,
                  borderColor: categoryStyle.border,
                },
              !isSelected && styles.filterPillInactive,
              pressed && styles.filterPillPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}>
            <Text
              style={[
                styles.filterPillText,
                isSelected && value === 'All' && styles.filterPillTextAllActive,
                isSelected && categoryStyle && { color: categoryStyle.text },
                !isSelected && styles.filterPillTextInactive,
              ]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function FabricCard({ fabric }: { fabric: SupportedFabric }) {
  const router = useRouter();
  const reference = FABRIC_REFERENCES[fabric];
  const category = FABRIC_REGISTRY.find((item) => item.name === fabric)?.category;
  const categoryStyle = category ? FABRIC_CATEGORY_COLORS[category] : null;
  const riskLevel = getFiberHealthRiskLevel(fabric);
  const riskLabel = getFiberHealthRiskLabel(fabric);
  const riskStyle = RISK_CHIP_COLORS[riskLevel];
  const isSustainable = getFiberProfile(fabric).sustainabilityRating === 'green';

  const handlePress = () => {
    router.push(`/(tabs)/fabrics/${getFiberSlug(fabric)}` as Href);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, faintCardShadow(), pressed && styles.pressed]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${fabric} profile`}>
      <Image
        source={reference.image}
        style={styles.referenceImage}
        contentFit="cover"
        accessibilityLabel={`${fabric} reference swatch`}
      />

      <View style={styles.copyColumn}>
        <Text style={styles.fabricName}>{fabric}</Text>

        <View style={styles.metaPills}>
          {categoryStyle && category ? (
            <View
              style={[
                styles.metaPill,
                {
                  backgroundColor: categoryStyle.background,
                  borderColor: categoryStyle.border,
                },
              ]}>
              <Text
                numberOfLines={1}
                style={[styles.metaPillText, { color: categoryStyle.text }]}>
                {FILTER_OPTIONS.find((option) => option.value === category)?.label ?? category}
              </Text>
            </View>
          ) : null}
          <View
            style={[
              styles.metaPill,
              { backgroundColor: riskStyle.background, borderColor: riskStyle.border },
            ]}
            accessibilityLabel={`Synthetic fiber health risk: ${riskLabel}`}>
            <Shield size={9} color={riskStyle.text} strokeWidth={2.5} />
            <Text numberOfLines={1} style={[styles.metaPillText, { color: riskStyle.text }]}>
              {riskLabel}
            </Text>
          </View>
          {isSustainable ? (
            <View
              style={[
                styles.metaPill,
                {
                  backgroundColor: SUSTAINABLE_CHIP.background,
                  borderColor: SUSTAINABLE_CHIP.border,
                },
              ]}
              accessibilityLabel="Sustainable fiber">
              <Leaf size={9} color={SUSTAINABLE_CHIP.text} strokeWidth={2.5} />
              <Text
                numberOfLines={1}
                style={[styles.metaPillText, { color: SUSTAINABLE_CHIP.text }]}>
                Eco
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.detailText} numberOfLines={2}>
          {reference.lookFor}
        </Text>
      </View>

      <ChevronRight size={14} color={BrandColors.textMuted} strokeWidth={2.25} />
    </Pressable>
  );
}

export function FabricCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const grouped = useMemo(
    () =>
      CATEGORY_ORDER.filter(
        (category) => selectedCategory === 'All' || category === selectedCategory,
      )
        .map((category) => ({
          category,
          fabrics: FABRIC_REGISTRY.filter((fabric) => fabric.category === category)
            .map((fabric) => fabric.name as SupportedFabric)
            .filter((fabric) => matchesFabricSearch(fabric, searchQuery)),
        }))
        .filter((section) => section.fabrics.length > 0),
    [searchQuery, selectedCategory],
  );

  return (
    <View style={styles.root}>
      <FabricSearchBar value={searchQuery} onChangeText={setSearchQuery} />
      <CategoryFilterBar selected={selectedCategory} onSelect={setSelectedCategory} />

      {grouped.length > 0 ? (
        grouped.map(({ category, fabrics }) => (
          <View key={category} style={styles.section}>
            {selectedCategory === 'All' ? (
              <Text style={styles.sectionLabel}>{category.toUpperCase()}</Text>
            ) : null}
            <View style={styles.list}>
              {fabrics.map((fabric) => (
                <FabricCard key={fabric} fabric={fabric as SupportedFabric} />
              ))}
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No fibers match your search.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BrandColors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: BrandColors.text,
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filterPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    alignSelf: 'center',
    flexShrink: 0,
  },
  filterPillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: BrandColors.border,
  },
  filterPillAllActive: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  filterPillPressed: {
    opacity: 0.85,
  },
  filterPillText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  filterPillTextInactive: {
    color: BrandColors.textMuted,
  },
  filterPillTextAllActive: {
    color: BrandColors.white,
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
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    gap: 12,
  },
  referenceImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.lavenderCard,
    flexShrink: 0,
  },
  copyColumn: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  fabricName: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: BrandColors.text,
  },
  metaPills: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 4,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 3,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  metaPillText: {
    fontFamily: Fonts.semiBold,
    fontSize: 9,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  detailText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: BrandColors.textMuted,
    marginTop: 2,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: BrandColors.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
  },
  pressed: {
    opacity: 0.88,
  },
});
