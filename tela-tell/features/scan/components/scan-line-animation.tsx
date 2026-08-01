import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { BrandColors } from '@/constants/brand';

type ScanLineAnimationProps = {
  active: boolean;
};

const CYCLE_MS = 1500;

/** Horizontal glowing scan bar that sweeps top → bottom while analyzing. */
export function ScanLineAnimation({ active }: ScanLineAnimationProps) {
  const progress = useSharedValue(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!active || height <= 0) {
      cancelAnimation(progress);
      progress.value = 0;
      return;
    }

    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration: CYCLE_MS, easing: Easing.inOut(Easing.quad) }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(progress);
    };
  }, [active, height, progress]);

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * height }],
    opacity: active ? 1 : 0,
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.height);
    if (next > 0 && next !== height) {
      setHeight(next);
    }
  };

  if (!active) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="none" onLayout={onLayout}>
      <Animated.View style={[styles.lineWrap, lineStyle]}>
        <View style={styles.glow} />
        <View style={styles.line} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 5,
  },
  lineWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 48,
    marginTop: -24,
    justifyContent: 'center',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  line: {
    height: 2,
    marginHorizontal: 8,
    borderRadius: 999,
    backgroundColor: BrandColors.white,
    shadowColor: BrandColors.gradientStart,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
});
