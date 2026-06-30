import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/fonts';
import { BrandColors } from '@/constants/brand';
import type { NormalizedRect } from '@/features/scan/lib/region-selection';

const REGION_COLORS = ['#4A8FA8', '#E879F9'] as const;

type RegionBoxOverlayProps = {
  regions: NormalizedRect[];
};

export function RegionBoxOverlay({ regions }: RegionBoxOverlayProps) {
  return (
    <View style={styles.overlay} pointerEvents="none">
      {regions.map((region, index) => {
        const color = REGION_COLORS[index % REGION_COLORS.length];

        return (
          <View
            key={region.id}
            style={[
              styles.box,
              {
                left: `${region.x * 100}%`,
                top: `${region.y * 100}%`,
                width: `${region.width * 100}%`,
                height: `${region.height * 100}%`,
                borderColor: color,
              },
            ]}>
            <View style={[styles.tag, { backgroundColor: color }]}>
              <Text style={styles.tagText}>{`Fabric ${index + 1}`}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  box: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'rgba(74, 143, 168, 0.16)',
  },
  tag: {
    position: 'absolute',
    top: -1,
    left: -1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopLeftRadius: 6,
    borderBottomRightRadius: 8,
  },
  tagText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: BrandColors.white,
  },
});
