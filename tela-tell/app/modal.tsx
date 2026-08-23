import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { X } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import {
  resolveAllFabricAliases,
  SUPPORTED_FABRICS,
  type SupportedFabric,
} from '@/data/fabrics/fabrics';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { getScanById, updateScanSellerLabel } from '@/db/scans';
import {
  clearLastSellerLabel,
  getLastSellerLabel,
  setLastSellerLabel,
} from '@/features/scan/lib/last-seller-label';

const FIBER_CHIPS = [...SUPPORTED_FABRICS];

function formatBlendLabel(fibers: SupportedFabric[]): string {
  if (fibers.length === 0) {
    return '';
  }
  if (fibers.length === 1) {
    return fibers[0];
  }
  return `${fibers.join(' / ')} blend`;
}

export default function SellerLabelModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const params = useLocalSearchParams<{ scanId?: string | string[] }>();
  const scanIdParam = params.scanId;
  const scanId = Array.isArray(scanIdParam) ? scanIdParam[0] : scanIdParam;
  const [sellerLabel, setSellerLabel] = useState(() => getLastSellerLabel() ?? '');
  const sheetHeight = Math.min(windowHeight * 0.72, 620);
  const keyboardVerticalOffset = Platform.select({
    ios: 0,
    android: insets.bottom,
    default: 0,
  });

  const selectedFibers = useMemo(
    () => resolveAllFabricAliases(sellerLabel),
    [sellerLabel],
  );

  useEffect(() => {
    if (!scanId || scanId === 'dual') {
      return;
    }

    let active = true;
    void (async () => {
      const scan = await getScanById(scanId);
      if (!active) {
        return;
      }
      if (scan?.sellerLabel) {
        setSellerLabel(scan.sellerLabel);
      }
    })();

    return () => {
      active = false;
    };
  }, [scanId]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  }, []);

  const handleDismiss = () => {
    router.back();
  };

  const commitLabel = (next: string) => {
    setSellerLabel(next);
    const trimmed = next.trim();
    if (trimmed.length > 0) {
      setLastSellerLabel(trimmed);
    } else {
      clearLastSellerLabel();
    }

    if (scanId && scanId !== 'dual') {
      void updateScanSellerLabel(scanId, trimmed.length > 0 ? trimmed : null);
    }
  };

  const toggleFiber = (fiber: SupportedFabric) => {
    const current = resolveAllFabricAliases(sellerLabel);
    const next = current.includes(fiber)
      ? current.filter((item) => item !== fiber)
      : [...current, fiber];
    commitLabel(formatBlendLabel(next));
  };

  return (
    <View style={styles.root}>
      <Pressable
        style={styles.backdrop}
        onPress={handleDismiss}
        accessibilityRole="button"
        accessibilityLabel="Close stated label"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'web' ? undefined : 'padding'}
        enabled={Platform.OS !== 'web'}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={styles.keyboardView}>
        <View style={[styles.sheet, { height: sheetHeight, paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>Stated Label</Text>
            <Pressable
              onPress={handleDismiss}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <X size={20} color={BrandColors.textMuted} strokeWidth={2.5} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
            keyboardShouldPersistTaps="handled"
            bounces={false}>
            <Text style={styles.intro}>
              Enter what the care tag or seller claimed. Tap one fiber for a single label, or tap
              several for a blend.
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>DECLARED FIBER LABEL</Text>
              <View style={[styles.card, faintCardShadow()]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 60% Cotton / 40% Polyester"
                  placeholderTextColor={BrandColors.textMuted}
                  value={sellerLabel}
                  onChangeText={commitLabel}
                />
              </View>
              {selectedFibers.length >= 2 ? (
                <Text style={styles.blendHint}>
                  Blend selected: {selectedFibers.join(' · ')}
                </Text>
              ) : null}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>QUICK SELECT (TAP MORE FOR A BLEND)</Text>
              <View style={styles.chipGrid}>
                {FIBER_CHIPS.map((fiber) => {
                  const selected = selectedFibers.includes(fiber);

                  return (
                    <Pressable
                      key={fiber}
                      style={({ pressed }) => [
                        styles.chip,
                        faintCardShadow(),
                        selected && styles.chipSelected,
                        pressed && styles.chipPressed,
                      ]}
                      onPress={() => toggleFiber(fiber)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={
                        selected ? `Remove ${fiber} from label` : `Add ${fiber} to label`
                      }>
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {fiber}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  sheet: {
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
  },
  scroll: {
    flex: 1,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BrandColors.borderLight,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: BrandColors.text,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 18,
    flexGrow: 1,
  },
  intro: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.textMuted,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
  },
  input: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: BrandColors.text,
    padding: 0,
  },
  blendHint: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: BrandColors.primaryDark,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    minWidth: '47%',
    flexGrow: 1,
  },
  chipSelected: {
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.lavenderCard,
  },
  chipPressed: {
    opacity: 0.88,
  },
  chipText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.text,
    textAlign: 'center',
  },
  chipTextSelected: {
    color: BrandColors.primary,
  },
});
