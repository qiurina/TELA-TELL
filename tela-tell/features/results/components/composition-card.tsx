import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScanConfirmSheet } from '@/features/scan/components/scan-confirm-sheet';
import { Info } from '@/components/ui/lucide-icons';
import { COMPOSITION_DISCLAIMER } from '@/data/scans/analysis';
import { FABRIC_CATEGORY_COLORS, getFabricCategory } from '@/data/fabrics/fabrics';
import { BrandColors, FabricBarFallback, FabricBarStyles } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { type FabricComposition } from '@/data/scans/mock-data';

type CompositionCardProps = {
  compositions: FabricComposition[];
};

function getBarStyle(material: string, index: number) {
  return FabricBarStyles[material] ?? FabricBarFallback[index % FabricBarFallback.length];
}

export function CompositionCard({ compositions }: CompositionCardProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const items = compositions ?? [];

  return (
    <View style={styles.card}>
      <ScanConfirmSheet
        visible={showDisclaimer}
        variant="info"
        title="Estimated fiber composition"
        message={COMPOSITION_DISCLAIMER}
        confirmLabel="Got it"
        onConfirm={() => setShowDisclaimer(false)}
        onCancel={() => setShowDisclaimer(false)}
      />

      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>ESTIMATED FIBER COMPOSITION</Text>
        <Pressable
          style={styles.infoButton}
          onPress={() => setShowDisclaimer(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="About estimated fiber composition">
          <Info size={14} color={BrandColors.textMuted} strokeWidth={2.25} />
        </Pressable>
      </View>

      <View style={styles.list}>
        {items.map((item, index) => {
          const barStyle = getBarStyle(item.material, index);
          const category = getFabricCategory(item.material);
          const categoryColors = category ? FABRIC_CATEGORY_COLORS[category] : null;

          return (
            <View key={item.material} style={styles.row}>
              <View style={styles.rowHeader}>
                <View style={styles.materialRow}>
                  <Text style={styles.material}>{item.material}</Text>
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
                </View>
                <Text style={styles.percentage}>{item.percentage}%</Text>
              </View>
              <View style={[styles.track, { backgroundColor: barStyle.track }]}>
                <LinearGradient
                  colors={barStyle.gradient as [string, string, ...string[]]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[styles.fill, { width: `${item.percentage}%` }]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  infoButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavenderCard,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  list: {
    gap: 12,
  },
  row: {
    gap: 6,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  materialRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    minWidth: 0,
  },
  material: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
  },
  categoryPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  categoryText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    lineHeight: 13,
  },
  percentage: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
    flexShrink: 0,
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
