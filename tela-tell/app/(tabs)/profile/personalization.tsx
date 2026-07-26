import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ProfilePreferencesGate } from '@/features/profile/components/profile-preferences-gate';
import { ProfileScreenShell } from '@/features/profile/components/profile-screen-shell';
import { UserPreferencesPanel } from '@/features/profile/components/user-preferences-panel';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { clearUserPreferences } from '@/features/profile/lib/user-preferences';
import { resetScanSession } from '@/features/scan/lib/scan-session';

export default function PersonalizationScreen() {
  const [formKey, setFormKey] = useState(0);

  const handleClear = () => {
    clearUserPreferences();
    resetScanSession();
    setFormKey((current) => current + 1);
  };

  return (
    <ProfileScreenShell
      title="Personalization"
      showBack
      footer={
        <Pressable
          style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear personalization">
          <Text style={styles.clearText}>Clear personalization</Text>
        </Pressable>
      }>
      <ProfilePreferencesGate>
        <UserPreferencesPanel key={formKey} embedded scope="personalization" />
      </ProfilePreferencesGate>
    </ProfileScreenShell>
  );
}

const styles = StyleSheet.create({
  clearButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
  pressed: {
    opacity: 0.88,
  },
});
