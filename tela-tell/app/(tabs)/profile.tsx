import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UserPreferencesPanel } from '@/features/profile/components/user-preferences-panel';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { primaryButtonShadow } from '@/constants/shadows';
import { resetScanSession } from '@/features/scan/lib/scan-session';
import { clearUserPreferences } from '@/features/profile/lib/user-preferences';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [formKey, setFormKey] = useState(0);
  const [saved, setSaved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setSaved(false);
    }, []),
  );

  const handleSave = () => {
    setSaved(true);
  };

  const handleClear = () => {
    clearUserPreferences();
    resetScanSession();
    setFormKey((current) => current + 1);
    setSaved(false);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={[styles.page, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topRow}>
          <Text style={styles.title}>My Preferences</Text>
        </View>

        <View style={styles.sheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
            keyboardShouldPersistTaps="handled">
            <UserPreferencesPanel key={formKey} embedded />

            <Pressable
              style={({ pressed }) => [
                styles.saveButtonWrap,
                pressed && styles.saveButtonPressed,
              ]}
              onPress={handleSave}
              accessibilityRole="button"
              accessibilityLabel="Save preferences">
              <LinearGradient
                colors={[BrandColors.primaryLight, BrandColors.primary, BrandColors.primaryDark]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[styles.saveButton, primaryButtonShadow()]}>
                <Text style={styles.saveButtonText}>{saved ? 'Saved' : 'Save'}</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}
              onPress={handleClear}>
              <Text style={styles.clearButtonText}>Clear preferences</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.primary,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  page: {
    flex: 1,
  },
  topRow: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: BrandColors.white,
    letterSpacing: -0.3,
  },
  saveButtonWrap: {
    width: '100%',
    marginTop: 8,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  saveButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
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
    paddingTop: 28,
    paddingBottom: 32,
    gap: 16,
    flexGrow: 1,
  },
  clearButton: {
    paddingVertical: 8,
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
