import { useRouter, type Href } from 'expo-router';

import { LoginForm } from '@/features/auth/components/login-form';
import { AuthFullscreenLayout } from '@/features/auth/components/auth-fullscreen-layout';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <AuthFullscreenLayout title="Welcome back">
      <LoginForm onSwitchToRegister={() => router.replace('/register' as Href)} />
    </AuthFullscreenLayout>
  );
}
