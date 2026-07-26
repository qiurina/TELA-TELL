import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      <Stack.Screen name="skin-tone" />
      <Stack.Screen name="fabric-allergies" />
      <Stack.Screen name="preferred-fabrics" />
      <Stack.Screen name="weather" />
      <Stack.Screen name="occasion" />
      <Stack.Screen name="about" />
    </Stack>
  );
}
