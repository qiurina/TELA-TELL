import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { BrandColors, FabricBarFallback, FabricBarStyles } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { FABRIC_CATEGORY_COLORS } from '@/data/fabrics/fabrics';
import type { FabricDistributionEntry } from '@/features/history/lib/fabric-distribution';

type FabricDistributionCardProps = {
  distribution: FabricDistributionEntry[];
};

export function FabricDistributionCard({ distribution }: FabricDistributionCardProps) {
  if (distribution.length === 0) {
    return null;
  }

  const maxPercent = Math.max(...distribution.map((entry) => entry.percent), 1);

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>FABRIC TYPE DISTRIBUTION</Text>

      <View style={styles.rows}>
        {distribution.map((entry, index) => {
          const barStyle =
            FabricBarStyles[entry.fabric] ?? FabricBarFallback[index % FabricBarFallback.length];
          const categoryColors = entry.category
            ? FABRIC_CATEGORY_COLORS[entry.category]
            : undefined;
          const barWidth = Math.max((entry.percent / maxPercent) * 100, 6);

          return (
            <View key={entry.fabric} style={styles.row}>
              <View style={styles.rowHeader}>
                <Text style={styles.fabricName}>{entry.fabric}</Text>
                {categoryColors ? (
                  <View
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: categoryColors.background,
                        borderColor: categoryColors.border,
                      },
                    ]}>
                    <Text style={[styles.categoryChipText, { color: categoryColors.text }]}>
                      {entry.category}
                    </Text>
                  </View>
                ) : null}
                <Text style={styles.rowValue}>
                  {entry.count} {entry.count === 1 ? 'scan' : 'scans'} · {entry.percent}%
                </Text>
              </View>

              <View style={[styles.track, { backgroundColor: barStyle.track }]}>
                <LinearGradient
                  colors={barStyle.gradient as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.fill, { width: `${barWidth}%` }]}
                />
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.footnote}>Based on the dominant fiber detected in each scan.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
    padding: 14,
    gap: 12,
    marginBottom: 24,
  },
  cardLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  rows: {
    gap: 12,
  },
  row: {
    gap: 6,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fabricName: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.text,
  },
  categoryChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  categoryChipText: {
    fontFamily: Fonts.medium,
    fontSize: 9,
  },
  rowValue: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: BrandColors.textMuted,
    textAlign: 'right',
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
  footnote: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    lineHeight: 14,
    color: BrandColors.textMuted,
  },
});
