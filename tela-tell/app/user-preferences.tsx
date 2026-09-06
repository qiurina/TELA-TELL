import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UserPreferencesPanel } from '@/features/profile/components/user-preferences-panel';
import { X } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { primaryButtonShadow } from '@/constants/shadows';
import { useAuth } from '@/features/auth/context/auth-provider';
import { clearLastGarmentCondition } from '@/features/scan/lib/garment-condition';
import {
  clearUserPreferences,
  persistUserPreferences,
} from '@/features/profile/lib/user-preferences';

export default function UserPreferencesScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = Math.min(windowHeight * 0.92, 780);
  const [formKey, setFormKey] = useState(0);

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

  const handleClear = () => {
    clearUserPreferences();
    clearLastGarmentCondition();
    void persistUserPreferences(session?.userId);
    setFormKey((current) => current + 1);
  };

  return (
    <View style={styles.root}>
      <Pressable
        style={styles.backdrop}
        onPress={handleDismiss}
        accessibilityRole="button"
        accessibilityLabel="Close user preferences"
      />

      <View style={[styles.sheet, { height: sheetHeight, paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.handle} />

        <View style={styles.headerRow}>
          <Text style={styles.title}>Personalization</Text>
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
          <UserPreferencesPanel key={formKey} embedded scope="personalization" hideAutoSaveHint />

          <Pressable
            style={({ pressed }) => [
              styles.doneButton,
              primaryButtonShadow(),
              pressed && styles.doneButtonPressed,
            ]}
            onPress={handleDismiss}>
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}
            onPress={handleClear}>
            <Text style={styles.clearButtonText}>Clear preferences</Text>
          </Pressable>
        </ScrollView>
      </View>
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
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
  doneButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  doneButtonPressed: {
    opacity: 0.9,
  },
  doneButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.white,
  },
  clearButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  clearButtonPressed: {
    opacity: 0.88,
  },
  clearButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
});
