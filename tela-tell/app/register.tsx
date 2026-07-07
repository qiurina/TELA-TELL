import { useRouter, type Href } from 'expo-router';

import { RegisterForm } from '@/features/auth/components/register-form';
import { AuthFullscreenLayout } from '@/features/auth/components/auth-fullscreen-layout';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <AuthFullscreenLayout title="Create an Account">
      <RegisterForm onSwitchToLogin={() => router.replace('/login' as Href)} />
    </AuthFullscreenLayout>
  );
}
