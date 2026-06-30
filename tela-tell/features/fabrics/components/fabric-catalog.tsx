import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Eye } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { FABRIC_REFERENCES } from '@/data/fabrics/fabric-references';
import {
  FABRIC_CATEGORY_COLORS,
  FABRIC_REGISTRY,
  type FabricCategory,
  type SupportedFabric,
} from '@/data/fabrics/fabrics';

const CATEGORY_ORDER: FabricCategory[] = [
  'Natural',
  'Synthetic',
  'Semi-synthetic',
  'Philippine native fiber',
];

function FabricCard({ fabric }: { fabric: SupportedFabric }) {
  const reference = FABRIC_REFERENCES[fabric];
  const category = FABRIC_REGISTRY.find((item) => item.name === fabric)?.category;
  const categoryStyle = category ? FABRIC_CATEGORY_COLORS[category] : null;

  return (
    <View style={[styles.card, faintCardShadow()]}>
      <View style={styles.cardHeader}>
        <Text style={styles.fabricName}>{fabric}</Text>
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
      </View>

      <View style={styles.cardBody}>
        <Image
          source={reference.image}
          style={styles.referenceImage}
          contentFit="cover"
          accessibilityLabel={`${fabric} reference swatch`}
        />

        <View style={styles.copyColumn}>
          <View style={styles.detailRow}>
            <Eye size={14} color={BrandColors.primary} strokeWidth={2} />
            <Text style={styles.detailLabel}>Look for</Text>
          </View>
          <Text style={styles.detailText}>{reference.lookFor}</Text>
          <Text style={styles.textureText}>{reference.textureNote}</Text>
        </View>
      </View>
    </View>
  );
}

export function FabricCatalog() {
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    fabrics: FABRIC_REGISTRY.filter((fabric) => fabric.category === category).map(
      (fabric) => fabric.name as SupportedFabric,
    ),
  }));

  return (
    <View style={styles.root}>
      {grouped.map(({ category, fabrics }) => (
        <View key={category} style={styles.section}>
          <Text style={styles.sectionLabel}>{category.toUpperCase()}</Text>
          <View style={styles.list}>
            {fabrics.map((fabric) => (
              <FabricCard key={fabric} fabric={fabric as SupportedFabric} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
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
    gap: 12,
  },
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  referenceImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.lavenderCard,
  },
  copyColumn: {
    flex: 1,
    gap: 6,
  },
  fabricName: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: BrandColors.text,
  },
  categoryPill: {
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: BrandColors.textMuted,
  },
  detailText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    color: BrandColors.text,
  },
  textureText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
});
