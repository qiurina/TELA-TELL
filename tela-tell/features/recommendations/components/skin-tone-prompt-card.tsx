import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

export function SkinTonePromptCard() {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Want color suggestions?</Text>
      <Text style={styles.body}>
        Set your skin tone in User Preferences to see which garment colors suit you best.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={() => router.push('/user-preferences' as Href)}>
        <Text style={styles.buttonText}>Open User Preferences</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.lavenderCard,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primaryDark,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.primary,
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: BrandColors.primary,
  },
  pressed: {
    opacity: 0.88,
  },
});
