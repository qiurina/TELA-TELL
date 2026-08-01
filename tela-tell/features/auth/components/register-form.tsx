import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AuthError } from '@/db/users';

import {
  AuthPrimaryButton,
  AuthSwitchPrompt,
} from '@/features/auth/components/auth-buttons';
import {
  AuthEmailField,
  AuthFormBanner,
  AuthPasswordField,
  AuthTextField,
} from '@/features/auth/components/auth-form-field';
import {
  AuthFormActions,
  AuthFormFields,
} from '@/features/auth/components/auth-form-layout-shared';
import { PasswordRequirements } from '@/features/auth/components/password-requirements';
import { useAuth } from '@/features/auth/context/auth-provider';
import { isPasswordValid } from '@/features/auth/lib/password';
import { isValidEmail } from '@/features/auth/lib/validation';

type RegisterFormProps = {
  onSwitchToLogin: () => void;
};

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter();
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const clearErrors = () => {
    setFieldErrors({});
    setFormError(null);
  };

  const handleRegister = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const nextErrors: FieldErrors = {};

    if (!trimmedFirstName) {
      nextErrors.firstName = 'Enter your first name.';
    }

    if (!trimmedLastName) {
      nextErrors.lastName = 'Enter your last name.';
    }

    if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!isPasswordValid(password)) {
      nextErrors.password = 'Password must meet all requirements below.';
    }

    if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setFormError(null);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);

    try {
      await signUp({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        middleInitial: middleInitial.trim() || null,
        email: trimmedEmail,
        password,
      });
      router.replace('/(tabs)' as Href);
    } catch (error) {
      const message =
        error instanceof AuthError
          ? error.message
          : 'Could not create your account. Please try again.';

      if (/already exists/i.test(message)) {
        setFieldErrors({ email: message });
        setFormError(null);
      } else {
        setFormError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AuthFormFields>
        <View style={styles.nameRow}>
          <View style={styles.firstNameCol}>
            <AuthTextField
              label="First Name"
              required
              value={firstName}
              onChangeText={(value) => {
                setFirstName(value);
                clearErrors();
              }}
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
              error={fieldErrors.firstName}
            />
          </View>
          <View style={styles.miCol}>
            <AuthTextField
              label="M.I."
              hideIcon
              fieldStyle={styles.miField}
              value={middleInitial}
              onChangeText={(value) =>
                setMiddleInitial(value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase())
              }
              autoCapitalize="characters"
              autoComplete="off"
              maxLength={2}
              placeholder="M.I."
            />
          </View>
        </View>
        <AuthTextField
          label="Last Name"
          required
          value={lastName}
          onChangeText={(value) => {
            setLastName(value);
            clearErrors();
          }}
          autoCapitalize="words"
          autoComplete="family-name"
          textContentType="familyName"
          error={fieldErrors.lastName}
        />
        <AuthEmailField
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            clearErrors();
          }}
          error={fieldErrors.email}
        />
        <View>
          <AuthPasswordField
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              clearErrors();
            }}
            textContentType="newPassword"
            autoComplete="new-password"
            error={fieldErrors.password}
          />
          <PasswordRequirements password={password} />
        </View>
        <AuthPasswordField
          label="Confirm Password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={(value) => {
            setConfirmPassword(value);
            clearErrors();
          }}
          textContentType="newPassword"
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
        />
      </AuthFormFields>

      <AuthFormActions>
        <AuthFormBanner message={formError} />
        <AuthPrimaryButton
          label={isSubmitting ? 'Creating account...' : 'Sign up'}
          onPress={() => void handleRegister()}
          disabled={isSubmitting}
        />
      </AuthFormActions>

      <View style={styles.switchWrap}>
        <AuthSwitchPrompt
          prompt="Already have an account?"
          action="Sign in"
          onPress={onSwitchToLogin}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  nameRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  firstNameCol: {
    flex: 1,
  },
  miCol: {
    width: 72,
  },
  miField: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  switchWrap: {
    marginTop: 24,
    alignItems: 'center',
  },
});
