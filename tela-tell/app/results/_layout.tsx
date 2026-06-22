import { Stack } from 'expo-router';

export default function ResultsLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ title: 'Scan Results', headerShown: false }} />
      <Stack.Screen name="profile/[id]" options={{ title: 'Fabric Profile', headerShown: false }} />
      <Stack.Screen
        name="recommendations/[id]"
        options={{ title: 'Recommendations', headerShown: false }}
      />
    </Stack>
  );
}
