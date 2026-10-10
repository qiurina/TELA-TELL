import type { FC } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IconProps } from '@/components/ui/lucide-icons';
import { StatusIcon } from '@/components/ui/status-icon';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import type { StatusTone } from '@/constants/status-colors';
import type { InfoSection } from '@/data/fabrics/assessment-disclaimers';

type InfoSheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  /** Short labelled blocks ("What it is" / "What it isn't"). */
  sections?: InfoSection[];
  /** Plain text, for sheets that are not a disclaimer. */
  message?: string;
  icon?: FC<IconProps>;
  tone?: StatusTone;
};

/** Bottom sheet for short explanations: icon + title, labelled lines, one compact button. */
export function InfoSheet({
  visible,
  title,
  onClose,
  sections,
  message,
  icon,
  tone = 'neutral',
}: InfoSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal>
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            {icon ? <StatusIcon icon={icon} tone={tone} /> : null}
            <Text style={styles.title}>{title}</Text>
          </View>

          <ScrollView
            style={{ maxHeight: windowHeight * 0.5 }}
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}>
            {sections?.map((section) => (
              <View key={section.heading} style={styles.section}>
                <Text style={styles.heading}>{section.heading}</Text>
                <Text style={styles.text}>{section.body}</Text>
              </View>
            ))}
            {message ? <Text style={styles.text}>{message}</Text> : null}
          </ScrollView>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={onClose}
            accessibilityRole="button">
            <Text style={styles.buttonText}>Got it</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 22,
    gap: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BrandColors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: BrandColors.text,
  },
  body: {
    gap: 14,
  },
  section: {
    gap: 3,
  },
  heading: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: BrandColors.textMuted,
  },
  text: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: BrandColors.text,
  },
  button: {
    alignSelf: 'center',
    marginTop: 4,
    paddingVertical: 11,
    paddingHorizontal: 40,
    borderRadius: 999,
    backgroundColor: BrandColors.primary,
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.white,
  },
  pressed: {
    opacity: 0.88,
  },
});
