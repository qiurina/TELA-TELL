import { useRef, useState, type FC, type ReactNode } from 'react';
import { Image } from 'expo-image';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InfoButton } from '@/components/ui/info-button';
import { InfoSheet } from '@/components/ui/info-sheet';

import {
  Camera,
  Layers,
  Shirt,
  Tag,
  X,
  type IconProps,
} from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { FABRIC_REFERENCES } from '@/data/fabrics/fabric-references';
import {
  FIBER_PROFILE_EDUCATION,
  PROFILE_CARE_REMINDER,
  PROFILE_IDENTIFICATION_REMINDER,
  PROFILE_PREDICTION_NOTICE,
  PROFILE_REFERENCE_CAPTION,
  type ProfileStatement,
} from '@/data/fabrics/fiber-profile-education';
import type { FiberProfile } from '@/data/fabrics/fiber-profiles';
import { FABRIC_CATEGORY_COLORS, FABRIC_REGISTRY } from '@/data/fabrics/fabrics';

type FiberProfileContentProps = {
  profile: FiberProfile;
  /** When false, omits the thumbnail because a scan comparison already shows the swatch. */
  showHero?: boolean;
  /** Scan-linked profiles describe a prediction, not confirmed composition. */
  predicted?: boolean;
  /** Optional scan comparison, inside the same scroll view as the profile. */
  headerContent?: ReactNode | ((openReference: () => void) => ReactNode);
  onIdentityHiddenChange?: (hidden: boolean) => void;
};

type ProfileTab = 'about' | 'look' | 'care';
const MUTED_TEXT = '#4F6671';

const PROFILE_TABS: { key: ProfileTab; label: string }[] = [
  { key: 'about', label: 'About' },
  { key: 'look', label: 'Look' },
  { key: 'care', label: 'Care' },
];

function ProfileTabs({
  active,
  onSelect,
}: {
  active: ProfileTab;
  onSelect: (tab: ProfileTab) => void;
}) {
  return (
    <View style={styles.tabTrack}>
      {PROFILE_TABS.map((tab) => {
        const isActive = tab.key === active;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            style={({ pressed }) => [
              styles.tabSegment,
              isActive && styles.tabSegmentActive,
              pressed && !isActive && styles.tabSegmentPressed,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <Text accessibilityRole="header" style={styles.sectionLabel}>{children}</Text>;
}

/** A titled block with a tinted icon tile, used for each part of a tab. */
function IconBlock({
  icon: Icon,
  title,
  children,
  onInfoPress,
  infoAccessibilityLabel,
}: {
  icon: FC<IconProps>;
  title: string;
  children: ReactNode;
  onInfoPress?: () => void;
  infoAccessibilityLabel?: string;
}) {
  return (
    <View style={styles.iconBlock}>
      <View style={styles.iconTile}>
        <Icon size={16} color={BrandColors.primaryDark} strokeWidth={2.25} />
      </View>
      <View style={styles.iconBlockBody}>
        <View style={styles.iconBlockTitleRow}>
          <SectionLabel>{title}</SectionLabel>
          {onInfoPress ? (
            <InfoButton onPress={onInfoPress} accessibilityLabel={infoAccessibilityLabel ?? title} />
          ) : null}
        </View>
        {children}
      </View>
    </View>
  );
}

const CALLOUT_TONES = {
  info: { background: BrandColors.lavenderCard, border: BrandColors.borderLight, accent: BrandColors.primaryDark, icon: Tag },
} as const;

/** A short tinted note placed under the content it qualifies. */
function Callout({
  tone,
  title,
  statements,
}: {
  tone: keyof typeof CALLOUT_TONES;
  title: string;
  statements: ProfileStatement[];
}) {
  const style = CALLOUT_TONES[tone];
  const Icon = style.icon;
  return (
    <View style={[styles.callout, { backgroundColor: style.background, borderColor: style.border }]}>
      <Icon size={16} color={style.accent} strokeWidth={2.25} />
      <View style={styles.calloutBody}>
        <Text accessibilityRole="header" style={[styles.calloutTitle, { color: style.accent }]}>{title}</Text>
        {statements.map((item) => (
          <Text key={item.text} style={styles.calloutText}>{item.text}</Text>
        ))}
      </View>
    </View>
  );
}

export function FiberProfileContent({
  profile,
  showHero = true,
  predicted = false,
  headerContent,
  onIdentityHiddenChange,
}: FiberProfileContentProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('look');
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [limitsOpen, setLimitsOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [tabsHeight, setTabsHeight] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffset = useRef(0);
  const identityBottom = useRef(0);
  const identityHidden = useRef<boolean | null>(null);
  const insets = useSafeAreaInsets();
  const content = FIBER_PROFILE_EDUCATION[profile.fabric];
  const reference = FABRIC_REFERENCES[profile.fabric];
  const category = FABRIC_REGISTRY.find((item) => item.name === profile.fabric)?.category;
  const categoryStyle = category ? FABRIC_CATEGORY_COLORS[category] : null;

  function reportIdentityVisibility(offset: number) {
    const hidden = identityBottom.current > 0 && offset >= identityBottom.current;
    if (hidden !== identityHidden.current) {
      identityHidden.current = hidden;
      onIdentityHiddenChange?.(hidden);
    }
  }

  function selectTab(tab: ProfileTab) {
    if (tab === activeTab) return;
    setActiveTab(tab);
    // Show the start of the new tab while keeping an already-pinned tab bar in place.
    scrollRef.current?.scrollTo({ y: Math.min(scrollOffset.current, identityBottom.current), animated: false });
  }

  const similarLabels = content.look.similarAppearances.text.replace(/\.$/, '').split(/,\s*(?:and\s+)?|\s+and\s+/);
  // Split presentation into sentence rows without changing the stored, verified wording.
  const careRows = content.care.flatMap(({ text }) => text.split('. ').map((sentence, index, sentences) =>
    index < sentences.length - 1 ? `${sentence}.` : sentence));

  const categoryPill = categoryStyle ? (
    <View
      style={[
        styles.categoryPill,
        {
          backgroundColor: categoryStyle.background,
          borderColor: categoryStyle.border,
        },
      ]}>
      <Text style={[styles.categoryText, { color: categoryStyle.text }]}>{content.classification.text}</Text>
    </View>
  ) : (
    <Text style={styles.fiberType}>{content.classification.text}</Text>
  );

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        testID="fiber-profile-scroll"
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
        onScroll={(event) => {
          scrollOffset.current = event.nativeEvent.contentOffset.y;
          reportIdentityVisibility(scrollOffset.current);
        }}>
        <View
          style={styles.profileHeader}
          testID="fiber-profile-identity"
          onLayout={(event) => {
            const { y, height } = event.nativeEvent.layout;
            identityBottom.current = y + height;
            reportIdentityVisibility(scrollOffset.current);
          }}>
          {typeof headerContent === 'function' ? headerContent(() => setReferenceOpen(true)) : headerContent}
          <View style={[styles.heroCard, faintCardShadow()]}>
            {showHero ? (
              <Pressable
                style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
                onPress={() => setReferenceOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={`Enlarge ${content.displayName} reference image`}>
                <Image source={reference.image} style={styles.bannerImage} contentFit="cover" accessible={false} />
                <View style={styles.enlargeChip}>
                  <Text style={styles.enlargeText}>Enlarge</Text>
                </View>
              </Pressable>
            ) : null}
            <View style={styles.heroBody}>
              <View style={styles.identityRow}>
                <Text style={styles.fabricName}>{content.displayName}</Text>
                {categoryPill}
              </View>
              <Text style={styles.description}>{content.about.origin.text}</Text>
              {showHero ? <Text style={styles.caption}>{PROFILE_REFERENCE_CAPTION}</Text> : null}
              {predicted ? <Text style={styles.caption}>{PROFILE_PREDICTION_NOTICE}</Text> : null}
            </View>
          </View>
        </View>

        <View style={styles.tabsSurface} onLayout={(event) => setTabsHeight(event.nativeEvent.layout.height)}>
          <ProfileTabs active={activeTab} onSelect={selectTab} />
        </View>

        <View style={[
          styles.tabBody,
          // Short tabs remain scrollable up to the pinned tabs; padding clears the raised scan button.
          { minHeight: Math.max(0, viewportHeight - tabsHeight), paddingBottom: insets.bottom + 40 },
        ]}>
          {activeTab === 'about' ? (
            <View style={[styles.textCard, faintCardShadow()]}>
              <IconBlock icon={Layers} title="What it is">
                <Text style={styles.description}>{content.about.description.text}</Text>
              </IconBlock>
            </View>
          ) : null}

          {activeTab === 'look' ? (
            <>
              <View style={[styles.textCard, faintCardShadow()]}>
                <IconBlock
                  icon={Camera}
                  title="In photos"
                  onInfoPress={() => setLimitsOpen(true)}
                  infoAccessibilityLabel="Identification limits">
                  <Text style={styles.description}>{content.look.photos.text}</Text>
                </IconBlock>
                <View style={styles.divider} />
                <IconBlock icon={Shirt} title="When handled">
                  <Text style={styles.description}>{content.look.handling.text}</Text>
                </IconBlock>
              </View>
              <View style={styles.section}>
                <SectionLabel>Similar appearances</SectionLabel>
                <View style={styles.chipWrap} accessible accessibilityLabel={content.look.similarAppearances.text}>
                  {similarLabels.map((label) => (
                    <View key={label} style={styles.comparisonChip}>
                      <Text style={styles.comparisonText}>{label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : null}

          {activeTab === 'care' ? (
            <>
              <Callout tone="info" title="Care label first" statements={[PROFILE_CARE_REMINDER]} />
              <View style={styles.section}>
                <SectionLabel>Care steps</SectionLabel>
                <View style={[styles.textCard, faintCardShadow()]}>
                  {careRows.map((text, index) => (
                    <View key={text} style={styles.stepRow}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.listText}>{text}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      <Modal
        visible={referenceOpen}
        animationType="fade"
        onRequestClose={() => setReferenceOpen(false)}
        accessibilityViewIsModal>
        <View style={[styles.imageViewer, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.viewerHeader}>
            <Text style={styles.viewerTitle}>{content.displayName} reference</Text>
            <Pressable
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              onPress={() => setReferenceOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Close reference image">
              <X size={24} color={BrandColors.text} strokeWidth={2.25} />
            </Pressable>
          </View>
          <Image
            source={reference.image}
            style={styles.viewerImage}
            contentFit="contain"
            accessibilityLabel={`${content.displayName} example reference swatch`}
          />
          <Text style={styles.caption}>{PROFILE_REFERENCE_CAPTION}</Text>
        </View>
      </Modal>

      <InfoSheet
        visible={limitsOpen}
        title="Identification limits"
        message={`${content.look.limitations.text}\n\n${PROFILE_IDENTIFICATION_REMINDER.text}`}
        onClose={() => setLimitsOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  profileHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 16,
  },
  heroCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
  },
  bannerImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: BrandColors.lavenderCard,
  },
  enlargeChip: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  enlargeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: BrandColors.primaryDark,
  },
  heroBody: {
    padding: 16,
    gap: 10,
  },
  identityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  fabricName: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: BrandColors.text,
    letterSpacing: -0.3,
  },
  caption: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: MUTED_TEXT,
  },
  fiberType: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: MUTED_TEXT,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.text,
  },
  tabsSurface: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: BrandColors.white,
    zIndex: 1,
  },
  tabTrack: {
    flexDirection: 'row',
    backgroundColor: BrandColors.inputBackground,
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  tabSegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minHeight: 44,
    borderRadius: 9,
  },
  tabSegmentActive: {
    backgroundColor: BrandColors.white,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  tabSegmentPressed: {
    opacity: 0.7,
  },
  tabLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: MUTED_TEXT,
  },
  tabLabelActive: {
    fontFamily: Fonts.semiBold,
    color: BrandColors.primaryDark,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    lineHeight: 19,
    color: MUTED_TEXT,
  },
  tabBody: {
    paddingHorizontal: 16,
    gap: 18,
  },
  textCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    gap: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BrandColors.border,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  comparisonChip: {
    maxWidth: '100%',
    backgroundColor: BrandColors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  comparisonText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    color: MUTED_TEXT,
  },
  iconBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavenderCard,
  },
  iconBlockBody: {
    flex: 1,
    gap: 6,
  },
  iconBlockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.text,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavenderCard,
  },
  stepNumberText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: BrandColors.primaryDark,
  },
  callout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  calloutBody: {
    flex: 1,
    gap: 4,
  },
  calloutTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    lineHeight: 19,
  },
  calloutText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: BrandColors.text,
  },
  pressed: {
    opacity: 0.7,
  },
  imageViewer: {
    flex: 1,
    backgroundColor: BrandColors.white,
    paddingHorizontal: 20,
    gap: 16,
  },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewerTitle: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: BrandColors.text,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: BrandColors.inputBackground,
  },
  viewerImage: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },
});
