import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

type NotFoundFallbackProps = {
  message: string;
};

export function NotFoundFallback({ message }: NotFoundFallbackProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.message} accessibilityRole="alert">
        {message}
      </Text>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={12}
        style={styles.link}>
        <Text style={styles.linkText}>Go back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: BrandColors.white,
  },
  message: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: BrandColors.text,
  },
  link: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  linkText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.primary,
  },
});
