import { StyleSheet, Text, View } from 'react-native';

import { Lock } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

export function ProfileLockedNotice() {
  return (
    <View style={styles.notice}>
      <View style={styles.iconWrap}>
        <Lock size={16} color="#C27803" strokeWidth={2.25} />
      </View>
      <Text style={styles.text}>
        Sign in to save skin tone, allergies, and fabric preferences
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCD9A8',
    backgroundColor: '#FFFBF5',
  },
  iconWrap: {
    marginTop: 1,
  },
  text: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    color: '#9A6700',
  },
});
