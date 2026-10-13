import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { FC } from 'react';

import { CircleCheck, Info, TriangleAlert, type IconProps } from '@/components/ui/lucide-icons';
import { StatusIcon } from '@/components/ui/status-icon';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { STATUS_COLORS } from '@/constants/status-colors';
import type { EcoClaim } from '@/data/scans/mock-data';

type BasisSheetProps = {
  visible: boolean;
  title: string;
  icon: FC<IconProps>;
  claims: EcoClaim[];
  keepInMind: string;
  onClose: () => void;
};

export function BasisSheet({ visible, title, icon, claims, keepInMind, onClose }: BasisSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const caution = STATUS_COLORS.caution;
  const good = STATUS_COLORS.good;

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
            <StatusIcon icon={icon} tone="neutral" />
            <Text style={styles.title}>{title}</Text>
          </View>

          <ScrollView
            style={{ maxHeight: windowHeight * 0.62 }}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}>
            <View style={styles.points}>
              {claims.map((claim, index) => {
                const isBenefit = claim.kind === 'benefit';
                const PointIcon = isBenefit ? CircleCheck : Info;
                return (
                  <View key={claim.text}>
                    {index > 0 ? <View style={styles.divider} /> : null}
                    <View style={styles.point}>
                      <View style={[styles.pointIcon, { backgroundColor: isBenefit ? good.tint : BrandColors.lavenderCard }]}>
                        <PointIcon
                          size={15}
                          color={isBenefit ? good.accent : BrandColors.primaryDark}
                          strokeWidth={2.25}
                        />
                      </View>
                      <View style={styles.pointBody}>
                        {claim.aspect ? <Text style={styles.pointHeading}>{claim.aspect}</Text> : null}
                        <Text style={styles.pointText}>{claim.text}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={[styles.keepBox, { backgroundColor: caution.tint, borderColor: caution.border }]}>
              <View style={styles.keepHeader}>
                <TriangleAlert size={14} color={caution.accent} strokeWidth={2.25} />
                <Text style={[styles.keepLabel, { color: caution.accent }]}>Keep in mind</Text>
              </View>
              <Text style={styles.keepText}>{keepInMind}</Text>
            </View>

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
  list: {
    gap: 16,
  },
  points: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    paddingHorizontal: 14,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
  },
  pointIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointBody: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BrandColors.border,
  },
  pointHeading: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: BrandColors.primaryDark,
  },
  pointText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.text,
  },
  keepBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  keepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  keepLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  keepText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: BrandColors.text,
  },
  button: {
    alignSelf: 'center',
    minWidth: 140,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.white,
  },
  pressed: {
    opacity: 0.85,
  },
});
