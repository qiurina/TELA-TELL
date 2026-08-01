import { Stack } from 'expo-router';

import { BrandColors } from '@/constants/brand';

export default function ResultsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: BrandColors.white },
      }}>
      <Stack.Screen name="[scanId]" options={{ title: 'Scan Results' }} />
      <Stack.Screen name="profile/[scanId]" options={{ title: 'Fabric Profile' }} />
      <Stack.Screen name="recommendations/[scanId]" options={{ title: 'Eco and Health Tips' }} />
      <Stack.Screen name="insights/[scanId]" options={{ title: 'Personalized Insights' }} />
    </Stack>
  );
}
