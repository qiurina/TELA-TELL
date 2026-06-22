import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { BrandColors, FabricBarFallback, FabricBarStyles } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { type FabricComposition } from '@/constants/mock-data';

type CompositionCardProps = {
  compositions: FabricComposition[];
};

function getBarStyle(material: string, index: number) {
  return FabricBarStyles[material] ?? FabricBarFallback[index % FabricBarFallback.length];
}

export function CompositionCard({ compositions }: CompositionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>FABRIC COMPOSITION</Text>
      <View style={styles.list}>
        {compositions.map((item, index) => {
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
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
