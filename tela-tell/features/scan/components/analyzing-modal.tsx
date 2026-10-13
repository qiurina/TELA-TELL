import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { Type } from '@/constants/typography';
import {
  analysisProgressFraction,
  analysisProgressLabel,
  type AnalysisProgress,
} from '@/features/scan/lib/analysis-progress';

const barGradient = [BrandColors.gradientStart, '#5CC8A0', BrandColors.primaryDark] as const;

export function AnalyzingModal({ visible, progress }: { visible: boolean; progress: AnalysisProgress | null }) {
  const fill = useRef(new Animated.Value(0)).current;
  const fraction = analysisProgressFraction(progress);

  useEffect(() => {
    if (!visible) {
      fill.setValue(0);
      return;
    }
    Animated.timing(fill, {
      toValue: fraction,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [visible, fraction, fill]);

  const label = analysisProgressLabel(progress);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}} statusBarTranslucent>
      <View style={styles.root}>
        <View style={styles.backdrop} />
        <View
          style={[styles.card, faintCardShadow()]}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={`Analyzing fabric. ${label}`}
          accessibilityValue={{ min: 0, max: 100, now: Math.round(fraction * 100) }}>
          <Image
            source={require('@/assets/images/analyzefabric.png')}
            style={styles.image}
            contentFit="contain"
            accessibilityIgnoresInvertColors
          />
          <Text style={styles.title}>Analyzing Fabric</Text>
          <Text style={styles.subtitle}>This may take a few seconds</Text>

          <View style={styles.track}>
            <Animated.View
              style={[
                styles.fill,
                { width: fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
              ]}>
              <LinearGradient
                colors={[...barGradient]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
          <Text style={[Type.secondary, styles.stage]}>{label}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  card: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: BrandColors.white,
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 22,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  image: {
    width: 150,
    aspectRatio: 214 / 196,
    marginBottom: 14,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    lineHeight: 28,
    color: BrandColors.primaryDark,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: BrandColors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  track: {
    alignSelf: 'stretch',
    height: 8,
    borderRadius: 4,
    marginTop: 20,
    overflow: 'hidden',
    backgroundColor: BrandColors.inputBackground,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  stage: {
    marginTop: 10,
    textAlign: 'center',
  },
});
