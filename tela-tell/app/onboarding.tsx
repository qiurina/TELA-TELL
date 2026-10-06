import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow, primaryButtonShadow } from '@/constants/shadows';
import {
  ONBOARDING_SLIDES,
  type OnboardingSlide,
} from '@/features/onboarding/lib/onboarding-slides';
import { markIntroSeen } from '@/features/onboarding/lib/intro-state';

function SlidePage({ slide, width }: { slide: OnboardingSlide; width: number }) {
  const Icon = slide.icon;

  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBadge}>
        <Icon size={44} color={BrandColors.white} strokeWidth={2} />
      </LinearGradient>

      <Text style={styles.title}>{slide.title}</Text>
      {slide.body ? <Text style={styles.body}>{slide.body}</Text> : null}

      {slide.points ? (
        <View style={styles.points}>
          {slide.points.map((point) => {
            const PointIcon = point.icon;
            return (
              <View key={point.title} style={[styles.pointCard, faintCardShadow()]}>
                <View style={styles.pointIcon}>
                  <PointIcon size={20} color={BrandColors.primaryDark} strokeWidth={2.25} />
                </View>
                <View style={styles.pointText}>
                  <Text style={styles.pointTitle}>{point.title}</Text>
                  <Text style={styles.pointBody}>{point.text}</Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {slide.footnote ? <Text style={styles.footnote}>{slide.footnote}</Text> : null}
    </ScrollView>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === ONBOARDING_SLIDES.length - 1;

  const finish = useCallback(() => {
    markIntroSeen();
    // Opened from Settings ("Replay tutorial"): go back to it. First launch: enter the app.
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)' as Href);
    }
  }, [router]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const handleNext = () => {
    if (isLast) {
      finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    setIndex(index + 1);
  };

  return (
    <LinearGradient
      colors={[BrandColors.welcomeGradientTop, BrandColors.welcomeGradientBottom]}
      style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topRow}>
        {isLast ? (
          <View style={styles.skipPlaceholder} />
        ) : (
          <Pressable
            onPress={finish}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Skip introduction">
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(slide) => slide.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={(_, itemIndex) => ({
          length: width,
          offset: width * itemIndex,
          index: itemIndex,
        })}
        renderItem={({ item }) => <SlidePage slide={item} width={width} />}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={styles.dots} accessibilityLabel={`Page ${index + 1} of ${ONBOARDING_SLIDES.length}`}>
          {ONBOARDING_SLIDES.map((slide, dotIndex) => (
            <View
              key={slide.key}
              style={[styles.dot, dotIndex === index && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Get started' : 'Next'}
          style={({ pressed }) => [pressed && styles.pressed]}>
          <LinearGradient
            colors={[BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.nextButton, primaryButtonShadow()]}>
            <Text style={styles.nextText}>{isLast ? 'Get started' : 'Next'}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topRow: {
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  skip: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.textMuted,
  },
  skipPlaceholder: {
    height: 20,
  },
  pageContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 12,
    gap: 14,
  },
  heroBadge: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    lineHeight: 32,
    color: BrandColors.primaryDark,
    textAlign: 'center',
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 23,
    color: BrandColors.text,
    textAlign: 'center',
  },
  points: {
    alignSelf: 'stretch',
    gap: 10,
    marginTop: 4,
  },
  pointCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    padding: 14,
  },
  pointIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavenderCard,
  },
  pointText: {
    flex: 1,
    gap: 2,
  },
  pointTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
  },
  pointBody: {
    fontFamily: Fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
  footnote: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 18,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BrandColors.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: BrandColors.primary,
  },
  nextButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 999,
  },
  nextText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: BrandColors.white,
  },
  pressed: {
    opacity: 0.9,
  },
});
