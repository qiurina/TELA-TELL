import { useEffect } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CircleCheck, ScanLine, X } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { type ScanMode } from '@/features/scan/lib/scan-session';

const SCAN_MODE_OPTIONS: {
  value: ScanMode;
  label: string;
  subtitle: string;
}[] = [
  {
    value: 'single',
    label: 'One swatch',
    subtitle: 'Scan one fabric at a time',
  },
  // Dual-swatch mode is hidden from the UI for now.
  // Re-enable this option and `SHOW_SCAN_MODE_SELECTOR` in scan-actions.tsx to restore it.
  // {
  //   value: 'dual',
  //   label: 'Two swatches',
  //   subtitle: 'Compare two fabrics side by side',
  // },
];

export function getScanModeLabel(mode: ScanMode): string {
  return SCAN_MODE_OPTIONS.find((option) => option.value === mode)?.label ?? mode;
}

type ScanModeSheetProps = {
  visible: boolean;
  value: ScanMode;
  onChange: (value: ScanMode) => void;
  onClose: () => void;
};

export function ScanModeSheet({ visible, value, onChange, onClose }: ScanModeSheetProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible || Platform.OS !== 'web') {
      return;
    }

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  }, [visible]);

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

        <View style={[styles.sheet, faintCardShadow(), { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Scan mode</Text>
              <Text style={styles.subtitle}>Choose how many swatches to capture</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
              <X size={20} color={BrandColors.textMuted} strokeWidth={2.5} />
            </Pressable>
          </View>

          <View style={styles.optionsBlock}>
            {SCAN_MODE_OPTIONS.map((option, index) => {
              const selected = value === option.value;
              const isLast = index === SCAN_MODE_OPTIONS.length - 1;

              return (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => [
                    styles.optionRow,
                    isLast && styles.optionRowLast,
                    selected && styles.optionRowSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => {
                    onChange(option.value);
                    onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${option.label}, ${option.subtitle}`}>
                  <View style={styles.optionIcon}>
                    <ScanLine
                      size={18}
                      color={selected ? BrandColors.primary : BrandColors.textMuted}
                      strokeWidth={2.25}
                    />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                      {option.label}
                    </Text>
                    <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                  </View>
                  {selected ? <CircleCheck size={18} color={BrandColors.primary} strokeWidth={2.25} /> : null}
                </Pressable>
              );
            })}
          </View>
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
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BrandColors.border,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: BrandColors.text,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
  optionsBlock: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: BrandColors.white,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  optionRowLast: {
    borderBottomWidth: 0,
  },
  optionRowSelected: {
    backgroundColor: BrandColors.lavenderCard,
  },
  optionIcon: {
    width: 24,
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
  },
  optionLabelSelected: {
    color: BrandColors.primaryDark,
  },
  optionSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
  },
  pressed: {
    opacity: 0.9,
  },
});
