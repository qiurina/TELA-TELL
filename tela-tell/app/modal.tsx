import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronLeft } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow, primaryButtonShadow } from '@/constants/shadows';

const QUICK_LABELS = ['100% Cotton', 'Polyester', 'Linen blend', 'Silk'];

export default function SellerLabelModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sellerLabel, setSellerLabel] = useState('');

  const handleSave = () => {
    router.back();
    setTimeout(() => router.push('/results/1' as Href), 300);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark]}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <ChevronLeft size={24} color={BrandColors.white} strokeWidth={2.5} />
          <Text style={styles.headerTitle}>Seller Label</Text>
        </Pressable>
      </LinearGradient>

      <View style={styles.sheet}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.intro}>
            Enter what the seller claimed the fabric is made of. TELA-TELL will compare it against
            scan results.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DECLARED FABRIC LABEL</Text>
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
                    onPress={() => setSellerLabel(example)}>
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {example}
                    </Text>
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
            ]}
            onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save & View Results</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: BrandColors.white,
  },
  sheet: {
    flex: 1,
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 24,
    flexGrow: 1,
  },
  intro: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.textMuted,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0EDF8',
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
    gap: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: '#F0EDF8',
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
    fontSize: 14,
    color: BrandColors.text,
    textAlign: 'center',
  },
  chipTextSelected: {
    color: BrandColors.primary,
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: BrandColors.primary,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  saveButtonPressed: {
    opacity: 0.9,
  },
  saveButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.white,
  },
});
