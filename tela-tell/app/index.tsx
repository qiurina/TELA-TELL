import { Redirect, type Href } from 'expo-router';
import { View } from 'react-native';

import { BrandColors } from '@/constants/brand';
import { useIntroState } from '@/features/onboarding/lib/intro-state';

export default function IndexScreen() {
  const { loaded, introSeen } = useIntroState();

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: BrandColors.white }} />;
  }

  return <Redirect href={(introSeen ? '/(tabs)' : '/onboarding') as Href} />;
}
