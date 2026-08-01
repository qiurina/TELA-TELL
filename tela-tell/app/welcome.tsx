import { Redirect, useRouter, type Href } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

import {
  AuthPrimaryButton,
  AuthSecondaryButton,
} from '@/features/auth/components/auth-buttons';
import { AuthWelcomeLayout } from '@/features/auth/components/auth-welcome-layout';
import { useAuth } from '@/features/auth/context/auth-provider';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isLoading, isSignedIn } = useAuth();

  if (!isLoading && isSignedIn) {
    return <Redirect href={'/(tabs)' as Href} />;
  }

  return (
    <Animated.View entering={FadeIn.duration(450)} style={{ flex: 1 }}>
      <AuthWelcomeLayout>
        <AuthPrimaryButton
          label="Get started"
          onPress={() => router.push('/register' as Href)}
        />
        <AuthSecondaryButton
          label="I already have an account"
          onPress={() => router.push('/login' as Href)}
        />
      </AuthWelcomeLayout>
    </Animated.View>
  );
}