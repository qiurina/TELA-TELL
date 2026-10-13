import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, type ReactNode } from 'react';
import { useRouter, type Href } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { InfoButton } from '@/components/ui/info-button';
import { ReferenceItem } from '@/components/ui/reference-item';
import { BasisSheet } from '@/features/recommendations/components/basis-sheet';
import { ProfileScreenShell } from '@/features/profile/components/profile-screen-shell';
import { ChevronRight, Leaf, ScanLine, Shield, Shirt } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow, heroCardShadow } from '@/constants/shadows';
import {
  FAST_FASHION_BASIS_TITLE,
  FAST_FASHION_CLAIMS,
  FAST_FASHION_KEEP_IN_MIND,
  FAST_FASHION_TEXT,
  FAST_FASHION_TITLE,
} from '@/data/fabrics/fast-fashion-background';
import { GUIDE_SOURCES } from '@/data/fabrics/eco-guide';
import { FIBER_PROFILE_SOURCES } from '@/data/fabrics/fiber-profile-sources';
import { SOURCE_LIST } from '@/data/fabrics/source-registry';

const heroGradient = [BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark] as const;

function AboutSection({
  icon,
  iconBackground,
  title,
  body,
}: {
  icon: ReactNode;
  iconBackground: string;
  title: string;
  body: string;
}) {
  return (
    <View style={[styles.card, faintCardShadow()]}>
      <View style={[styles.iconWrap, { backgroundColor: iconBackground }]}>{icon}</View>
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardBody}>{body}</Text>
      </View>
    </View>
  );
}

function FastFashionSection() {
  const [basisVisible, setBasisVisible] = useState(false);

  return (
    <View style={[styles.card, faintCardShadow()]}>
      <BasisSheet
        visible={basisVisible}
        title={FAST_FASHION_BASIS_TITLE}
        claims={FAST_FASHION_CLAIMS}
        keepInMind={FAST_FASHION_KEEP_IN_MIND}
        icon={Shirt}
        onClose={() => setBasisVisible(false)}
      />
      <View style={[styles.iconWrap, { backgroundColor: BrandColors.lavenderCard }]}>
        <Shirt size={20} color={BrandColors.primaryDark} strokeWidth={2} />
      </View>
      <View style={styles.cardCopy}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>{FAST_FASHION_TITLE}</Text>
          <InfoButton
            onPress={() => setBasisVisible(true)}
            accessibilityLabel="About fast fashion and its sources"
          />
        </View>
        <Text style={styles.cardBody}>{FAST_FASHION_TEXT}</Text>
      </View>
    </View>
  );
}

function ShedExplainerLink() {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, faintCardShadow(), pressed && styles.linkPressed]}
      onPress={() => router.push('/why-synthetics-shed' as Href)}
      accessibilityRole="button"
      accessibilityLabel="Why synthetics shed">
      <View style={[styles.iconWrap, { backgroundColor: BrandColors.lavenderCard }]}>
        <Shield size={20} color={BrandColors.primaryDark} strokeWidth={2} />
      </View>
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>Why synthetics shed</Text>
        <Text style={styles.cardBody}>
          A short, plain explainer on why synthetic fabrics shed.
        </Text>
      </View>
      <ChevronRight size={18} color={BrandColors.textMuted} strokeWidth={2.25} />
    </Pressable>
  );
}

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ProfileScreenShell title="About TELA-TELL" showBack>
      <View style={styles.hero}>
        <LinearGradient
          colors={[...heroGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroBadge, heroCardShadow()]}>
          <ScanLine size={30} color={BrandColors.white} strokeWidth={2} />
        </LinearGradient>
        <Text style={styles.heroTitle}>TELA-TELL</Text>
        <Text style={styles.heroTagline}>Know your fabric before you buy it</Text>
      </View>

      <AboutSection
        icon={<ScanLine size={20} color={BrandColors.primaryDark} strokeWidth={2} />}
        iconBackground={BrandColors.lavenderCard}
        title="What it does"
        body="TELA-TELL gives you a quick, photo-based guess of what a fabric is before you buy it. It's especially handy for thrifted and secondhand finds."
      />
      <AboutSection
        icon={<Leaf size={20} color="#16a34a" strokeWidth={2} />}
        iconBackground="#f0fdf4"
        title="How it works"
        body="Take a photo of the fabric with your camera, or upload one you already have. The app predicts the most likely fabric types from the photo, then shows research-based eco tips and flags labels that may not match."
      />
      <AboutSection
        icon={<Shield size={20} color="#2563eb" strokeWidth={2} />}
        iconBackground="#eff6ff"
        title="Good to know"
        body="Results are predictions from a photo, not lab tests, so check the care tag when you can. Environmental, reuse and microplastic information is general guidance for each fiber type, not a measurement of your garment, and the app does not score sustainability, labor conditions, supply chains or brands. For the best results, get your camera close enough to clearly see the fabric's threads. Your scans and preferences are saved right on your phone. There is no account to create and no internet connection needed to scan."
      />

      <ShedExplainerLink />

      <FastFashionSection />

      <View style={[styles.card, faintCardShadow(), styles.sourcesCard]}>
        <Text style={styles.cardTitle}>Sources</Text>
        <Text style={styles.cardBody}>
          Shedding levels, what the studies found and what they do not show are explained on the
          &quot;Why synthetics shed&quot; page above. The studies are in the References list below.
        </Text>
        <Text style={[styles.cardBody, styles.sourcesFootnote]}>
          Eco tips come from the Microplastics &amp; Sustainable Choices Guide; its sources (S01 to
          S21) are listed below. Fabric profile facts come from the
          sources listed under &quot;Fabric profile sources&quot; at the end of this page, such as The
          Woolmark Company and PhilFIDA. The app no longer scores sustainability,
          because no published method compares all 12 fibers fairly.
        </Text>
      </View>

      <View style={[styles.card, faintCardShadow(), styles.sourcesCard]}>
        <Text style={styles.cardTitle}>References</Text>
        <Text style={styles.cardBody}>
          Where the facts in the app&apos;s notes come from. The numbers match the
          &quot;Basis&quot; sheets, which also explain what to keep in mind about each source.
        </Text>
        {SOURCE_LIST.map((source, index) => (
          <ReferenceItem key={source.id} source={source} number={index + 1} />
        ))}
      </View>

      <View style={[styles.card, faintCardShadow(), styles.sourcesCard]}>
        <Text style={styles.cardTitle}>Eco tips guide sources</Text>
        <Text style={styles.cardBody}>
          The Microplastics &amp; Sustainable Choices Guide behind Eco tips cites these sources.
          Opening a source needs internet; the details below stay readable offline.
        </Text>
        {Object.values(GUIDE_SOURCES).map((source) => (
          <View key={source.id} style={styles.guideSource}>
            <Text style={styles.guideSourceText}>
              <Text style={styles.guideSourceId}>{source.id} </Text>
              {source.citation}. {source.title}.
            </Text>
            <Pressable
              onPress={() => {
                Linking.openURL(source.url).catch(() => {
                  // No browser or no connection: the citation above stays readable.
                });
              }}
              hitSlop={6}
              accessibilityRole="link"
              accessibilityLabel={`Open source ${source.id}: ${source.title}`}>
              <Text style={styles.guideSourceLink}>Open original source (needs internet)</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={[styles.card, faintCardShadow(), styles.sourcesCard]}>
        <Text style={styles.cardTitle}>Fabric profile sources</Text>
        <Text style={styles.cardBody}>
          The fiber descriptions, photo clues and care steps in each Fabric profile come from these
          sources. Each was checked on the date shown. Opening a source needs internet.
        </Text>
        {Object.values(FIBER_PROFILE_SOURCES).map((source, index) => (
          <View key={source.url + source.title} style={styles.guideSource}>
            <Text style={styles.guideSourceText}>
              <Text style={styles.guideSourceId}>P{index + 1} </Text>
              {source.title}. {source.publisher}. Checked {source.checkedOn}.
            </Text>
            <Pressable
              onPress={() => {
                Linking.openURL(source.url).catch(() => {
                  // No browser or no connection: the citation above stays readable.
                });
              }}
              hitSlop={6}
              accessibilityRole="link"
              accessibilityLabel={`Open source P${index + 1}: ${source.title}`}>
              <Text style={styles.guideSourceLink}>Open original source (needs internet)</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Text style={styles.version}>Version {version}</Text>
    </ProfileScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 4,
  },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  heroTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: BrandColors.primaryDark,
    letterSpacing: 0.5,
  },
  heroTagline: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
  card: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardCopy: {
    flex: 1,
    gap: 4,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.primaryDark,
  },
  cardBody: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: BrandColors.text,
  },
  sourcesCard: {
    flexDirection: 'column',
    gap: 8,
  },
  guideSource: {
    gap: 2,
  },
  guideSourceText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.text,
  },
  guideSourceId: {
    fontFamily: Fonts.semiBold,
    color: BrandColors.primary,
  },
  guideSourceLink: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.primary,
  },
  sourcesFootnote: {
    fontSize: 12,
    color: BrandColors.textMuted,
  },
  linkPressed: {
    opacity: 0.88,
  },
  version: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: BrandColors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
