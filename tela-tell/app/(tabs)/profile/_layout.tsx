import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

/** Profile tab hub only — preference/gallery screens are root stack siblings (e.g. `/skin-tone`). */
export default function ProfileTabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
