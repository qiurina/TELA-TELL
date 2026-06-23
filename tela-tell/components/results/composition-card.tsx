import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScanConfirmSheet } from '@/components/scan/scan-confirm-sheet';
import { BlendNotice } from '@/components/results/blend-notice';
import { Info } from '@/components/ui/lucide-icons';
import { COMPOSITION_DISCLAIMER, getBlendNotice } from '@/constants/analysis';
import { BrandColors, FabricBarFallback, FabricBarStyles } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { type FabricComposition } from '@/constants/mock-data';

type CompositionCardProps = {
  compositions: FabricComposition[];
  confidence?: number;
};

function getBarStyle(material: string, index: number) {
  return FabricBarStyles[material] ?? FabricBarFallback[index % FabricBarFallback.length];
}

export function CompositionCard({ compositions, confidence }: CompositionCardProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const items = compositions ?? [];
  const blendNotice = getBlendNotice(items, confidence);

  return (
    <View style={styles.card}>
      <ScanConfirmSheet
        visible={showDisclaimer}
        variant="info"
        title="Estimated composition"
        message={COMPOSITION_DISCLAIMER}
        confirmLabel="Got it"
        onConfirm={() => setShowDisclaimer(false)}
        onCancel={() => setShowDisclaimer(false)}
      />

      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>ESTIMATED FABRIC COMPOSITION</Text>
        <Pressable
          style={styles.infoButton}
          onPress={() => setShowDisclaimer(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="About estimated composition">
          <Info size={14} color={BrandColors.textMuted} strokeWidth={2.25} />
        </Pressable>
      </View>

      <View style={styles.list}>
        {items.map((item, index) => {
          const barStyle = getBarStyle(item.material, index);

          return (
            <View key={item.material} style={styles.row}>
              <View style={styles.rowHeader}>
                <Text style={styles.material}>{item.material}</Text>
                <Text style={styles.percentage}>{item.percentage}%</Text>
              </View>
              <View style={[styles.track, { backgroundColor: barStyle.track }]}>
                <LinearGradient
                  colors={[...barStyle.gradient]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[styles.fill, { width: `${item.percentage}%` }]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {blendNotice ? <BlendNotice notice={blendNotice} /> : null}
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
    gap: 14,
  },
  row: {
    gap: 8,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  material: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
  },
  percentage: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
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
