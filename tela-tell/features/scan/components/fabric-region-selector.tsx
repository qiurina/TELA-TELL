import { Image } from 'expo-image';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';

import { X } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import {
  getDefaultRegionBoxes,
  type NormalizedRect,
} from '@/features/scan/lib/region-selection';

const MIN_BOX_FRACTION = 0.08;
const REGION_COLORS = ['#4A8FA8', '#E879F9'] as const;

type FabricRegionSelectorProps = {
  imageUri: string;
  regions: NormalizedRect[];
  onChange: (regions: NormalizedRect[]) => void;
};

type PixelRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeRect(startX: number, startY: number, endX: number, endY: number): PixelRect {
  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  return { x, y, width, height };
}

function toNormalized(rect: PixelRect, layout: PixelRect): NormalizedRect | null {
  if (layout.width <= 0 || layout.height <= 0) {
    return null;
  }

  const width = rect.width / layout.width;
  const height = rect.height / layout.height;

  if (width < MIN_BOX_FRACTION || height < MIN_BOX_FRACTION) {
    return null;
  }

  return {
    id: `region-${Date.now()}`,
    x: clamp(rect.x / layout.width, 0, 1 - width),
    y: clamp(rect.y / layout.height, 0, 1 - height),
    width,
    height,
  };
}

function toPixelRect(region: NormalizedRect, layout: PixelRect): PixelRect {
  return {
    x: region.x * layout.width,
    y: region.y * layout.height,
    width: region.width * layout.width,
    height: region.height * layout.height,
  };
}

function hitTestRegion(
  regions: NormalizedRect[],
  pointX: number,
  pointY: number,
  layout: PixelRect,
): NormalizedRect | null {
  for (let index = regions.length - 1; index >= 0; index -= 1) {
    const region = regions[index];
    const pixel = toPixelRect(region, layout);
    const inside =
      pointX >= pixel.x &&
      pointX <= pixel.x + pixel.width &&
      pointY >= pixel.y &&
      pointY <= pixel.y + pixel.height;

    if (inside) {
      return region;
    }
  }

  return null;
}

export function FabricRegionSelector({ imageUri, regions, onChange }: FabricRegionSelectorProps) {
  const [layout, setLayout] = useState<PixelRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [draftRect, setDraftRect] = useState<PixelRect | null>(null);
  const dragState = useRef<{
    mode: 'draw' | 'move';
    regionId?: string;
    startX: number;
    startY: number;
    origin?: NormalizedRect;
  } | null>(null);

  const nextLabel = regions.length < 2 ? `Fabric ${regions.length + 1}` : null;

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ x: 0, y: 0, width, height });
  }, []);

  const removeRegion = useCallback(
    (regionId: string) => {
      onChange(regions.filter((region) => region.id !== regionId));
    },
    [onChange, regions],
  );

  const applySuggestedBoxes = useCallback(() => {
    onChange(getDefaultRegionBoxes());
  }, [onChange]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event: GestureResponderEvent) => {
          if (layout.width <= 0 || layout.height <= 0) {
            return;
          }

          const { locationX, locationY } = event.nativeEvent;
          const hit = hitTestRegion(regions, locationX, locationY, layout);

          if (hit) {
            dragState.current = {
              mode: 'move',
              regionId: hit.id,
              startX: locationX,
              startY: locationY,
              origin: { ...hit },
            };
            return;
          }

          if (regions.length >= 2) {
            return;
          }

          dragState.current = {
            mode: 'draw',
            startX: locationX,
            startY: locationY,
          };
          setDraftRect({
            x: locationX,
            y: locationY,
            width: 0,
            height: 0,
          });
        },
        onPanResponderMove: (event: GestureResponderEvent) => {
          const state = dragState.current;
          if (!state || layout.width <= 0 || layout.height <= 0) {
            return;
          }

          const { locationX, locationY } = event.nativeEvent;

          if (state.mode === 'draw') {
            const rect = normalizeRect(state.startX, state.startY, locationX, locationY);
            setDraftRect(rect);
            return;
          }

          if (state.mode === 'move' && state.origin && state.regionId) {
            const deltaX = (locationX - state.startX) / layout.width;
            const deltaY = (locationY - state.startY) / layout.height;
            const nextX = clamp(state.origin.x + deltaX, 0, 1 - state.origin.width);
            const nextY = clamp(state.origin.y + deltaY, 0, 1 - state.origin.height);

            onChange(
              regions.map((region) =>
                region.id === state.regionId
                  ? { ...region, x: nextX, y: nextY }
                  : region,
              ),
            );
          }
        },
        onPanResponderRelease: (event: GestureResponderEvent) => {
          const state = dragState.current;
          dragState.current = null;

          if (!state || layout.width <= 0 || layout.height <= 0) {
            setDraftRect(null);
            return;
          }

          if (state.mode === 'move') {
            setDraftRect(null);
            return;
          }

          const { locationX, locationY } = event.nativeEvent;
          const pixelRect = normalizeRect(state.startX, state.startY, locationX, locationY);
          const normalized = toNormalized(pixelRect, layout);

          setDraftRect(null);

          if (!normalized || regions.length >= 2) {
            return;
          }

          onChange([
            ...regions,
            {
              ...normalized,
              id: `fabric-${regions.length + 1}`,
            },
          ]);
        },
        onPanResponderTerminate: () => {
          dragState.current = null;
          setDraftRect(null);
        },
      }),
    [layout, onChange, regions],
  );

  return (
    <View style={styles.container}>
      <View style={styles.instructionRow}>
        <Text style={styles.instructionTitle}>
          {nextLabel ? `Draw a box around ${nextLabel}` : 'Both regions marked'}
        </Text>
        <Text style={styles.instructionBody}>
          Drag on empty space to draw. Drag inside a box to reposition. Tap × to remove.
        </Text>
      </View>

      <View style={styles.canvas} onLayout={handleLayout} {...panResponder.panHandlers}>
        <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />

        {regions.map((region, index) => {
          const pixel = toPixelRect(region, layout);
          const color = REGION_COLORS[index % REGION_COLORS.length];

          return (
            <View
              key={region.id}
              pointerEvents="box-none"
              style={[
                styles.regionBox,
                {
                  left: pixel.x,
                  top: pixel.y,
                  width: pixel.width,
                  height: pixel.height,
                  borderColor: color,
                },
              ]}>
              <View style={[styles.regionTag, { backgroundColor: color }]}>
                <Text style={styles.regionTagText}>{`Fabric ${index + 1}`}</Text>
                <Pressable
                  onPress={() => removeRegion(region.id)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove fabric ${index + 1} box`}>
                  <X size={12} color={BrandColors.white} strokeWidth={2.5} />
                </Pressable>
              </View>
            </View>
          );
        })}

        {draftRect ? (
          <View
            pointerEvents="none"
            style={[
              styles.draftBox,
              {
                left: draftRect.x,
                top: draftRect.y,
                width: draftRect.width,
                height: draftRect.height,
                borderColor: REGION_COLORS[regions.length % REGION_COLORS.length],
              },
            ]}
          />
        ) : null}
      </View>

      <View style={styles.helperRow}>
        <Pressable
          style={({ pressed }) => [styles.helperButton, pressed && styles.pressed]}
          onPress={applySuggestedBoxes}>
          <Text style={styles.helperButtonText}>Use suggested boxes</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.helperButton, pressed && styles.pressed]}
          onPress={() => onChange([])}>
          <Text style={styles.helperButtonText}>Clear all</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  instructionRow: {
    gap: 4,
  },
  instructionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
  },
  instructionBody: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
  },
  canvas: {
    height: 360,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#101820',
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  regionBox: {
    position: 'absolute',
    borderWidth: 2.5,
    backgroundColor: 'rgba(74, 143, 168, 0.14)',
  },
  regionTag: {
    position: 'absolute',
    top: -1,
    left: -1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 8,
    paddingRight: 6,
    paddingVertical: 4,
    borderTopLeftRadius: 6,
    borderBottomRightRadius: 8,
  },
  regionTagText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: BrandColors.white,
  },
  draftBox: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  helperRow: {
    flexDirection: 'row',
    gap: 10,
  },
  helperButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.lavenderCard,
  },
  helperButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: BrandColors.primary,
  },
  pressed: {
    opacity: 0.88,
  },
});
