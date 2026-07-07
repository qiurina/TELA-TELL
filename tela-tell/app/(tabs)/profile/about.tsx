import { StyleSheet, Text, View } from 'react-native';

import { ProfileScreenShell } from '@/features/profile/components/profile-screen-shell';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

export default function AboutScreen() {
  return (
    <ProfileScreenShell title="About TELA-TELL" showBack>
      <View style={styles.card}>
        <Text style={styles.lead}>
          TELA-TELL helps you verify fabric composition before you buy — especially useful for ukay-ukay
          and secondhand finds.
        </Text>
        <Text style={styles.body}>
          Scan a fabric swatch with your camera or upload a photo, compare results against reference
          fibers, and get sustainability and mislabeling insights tailored to Philippine fibers like
          abaca and piña.
        </Text>
        <Text style={styles.note}>
          This capstone prototype uses mock scan data. Sign in to save preferences and build a
          persistent scan history when cloud sync is enabled.
        </Text>
      </View>
    </ProfileScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    backgroundColor: BrandColors.lavender,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  lead: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
    color: BrandColors.primaryDark,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.text,
  },
  note: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
});
