import { Redirect, type Href } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/features/auth/context/auth-provider';
import { BrandColors } from '@/constants/brand';

export default function IndexScreen() {
  const { isLoading, isSignedIn } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href={'/welcome' as Href} />;
  }

  return <Redirect href={'/(tabs)' as Href} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.splashGradientTop,
  },
});