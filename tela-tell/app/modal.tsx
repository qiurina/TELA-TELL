import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow, primaryButtonShadow } from '@/constants/shadows';
import { clearLastSellerLabel, getLastSellerLabel, setLastSellerLabel } from '@/features/scan/lib/last-seller-label';

const QUICK_LABELS = [...SUPPORTED_FABRICS];

export default function SellerLabelModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [sellerLabel, setSellerLabel] = useState(() => getLastSellerLabel() ?? '');
  const sheetHeight = Math.min(windowHeight * 0.62, 520);
  const trimmedLabel = sellerLabel.trim();
  const hasLabel = trimmedLabel.length > 0;
  const keyboardVerticalOffset = Platform.select({
    ios: 0,
    android: insets.bottom,
    default: 0,
  });

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

  const handleSave = () => {
    if (!hasLabel) {
      return;
    }

    setLastSellerLabel(trimmedLabel);
    router.back();
  };

  return (
    <View style={styles.root}>
      <Pressable
        style={styles.backdrop}
        onPress={handleDismiss}
        accessibilityRole="button"
        accessibilityLabel="Close seller label"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'web' ? undefined : 'padding'}
        enabled={Platform.OS !== 'web'}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={styles.keyboardView}>
        <View style={[styles.sheet, { height: sheetHeight, paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>Seller Label</Text>
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
              Enter the fiber content the seller claimed. TELA-TELL will compare it against your
              scan results.
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>DECLARED FIBER LABEL</Text>
              <View style={[styles.card, faintCardShadow()]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 100% Cotton"
                  placeholderTextColor={BrandColors.textMuted}
                  value={sellerLabel}
                  onChangeText={setSellerLabel}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>QUICK SELECT</Text>
              <View style={styles.chipGrid}>
                {QUICK_LABELS.map((example) => {
                  const selected = sellerLabel === example;

                  return (
                    <Pressable
                      key={example}
                      style={({ pressed }) => [
                        styles.chip,
                        faintCardShadow(),
                        selected && styles.chipSelected,
                        pressed && styles.chipPressed,
                      ]}
                      onPress={() => {
                        if (selected) {
                          setSellerLabel('');
                          clearLastSellerLabel();
                        } else {
                          setSellerLabel(example);
                        }
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={
                        selected ? `Deselect ${example}` : `Select ${example}`
                      }>
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {example}
                      </Text>
                      {selected ? (
                        <X size={14} color={BrandColors.primary} strokeWidth={2.5} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                primaryButtonShadow(),
                pressed && styles.saveButtonPressed,
                !hasLabel && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!hasLabel}>
              <Text style={styles.saveButtonText}>Save Label</Text>
            </Pressable>
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
  saveButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonPressed: {
    opacity: 0.9,
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.white,
  },
});
