import { Stack } from 'expo-router';

export default function ResultsLayout() {
  return (
    <Stack>
      <Stack.Screen name="[scanId]" options={{ title: 'Scan Results', headerShown: false }} />
      <Stack.Screen name="profile/[scanId]" options={{ title: 'Fabric Profile', headerShown: false }} />
      <Stack.Screen
        name="recommendations/[scanId]"
        options={{ title: 'Eco Tips', headerShown: false }}
      />
      <Stack.Screen
        name="insights/[scanId]"
        options={{ title: 'Personalized Insights', headerShown: false }}
      />
    </Stack>
  );
}
