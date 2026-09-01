import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { showAlert } from '@/components/ui/alert-dialog';
import { Camera } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { AuthError, changePassword, updateUserProfile } from '@/db/users';
import { AuthPrimaryButton, AuthSecondaryButton } from '@/features/auth/components/auth-buttons';
import {
  AuthFormBanner,
  AuthPasswordField,
  AuthTextField,
} from '@/features/auth/components/auth-form-field';
import { AuthFormActions, AuthFormFields } from '@/features/auth/components/auth-form-layout-shared';
import { PasswordRequirements } from '@/features/auth/components/password-requirements';
import { useAuth } from '@/features/auth/context/auth-provider';
import { isPasswordValid } from '@/features/auth/lib/password';
import { isValidUsername } from '@/features/auth/lib/validation';
import { pickAvatarFromCamera, pickAvatarFromGallery } from '@/features/profile/lib/avatar-picker';
import { saveAvatarFile } from '@/features/profile/lib/avatar-storage';
import { ProfileScreenShell } from '@/features/profile/components/profile-screen-shell';
import { SuccessModal } from '@/features/profile/components/success-modal';

type ProfileFieldErrors = {
  firstName?: string;
  lastName?: string;
  username?: string;
};

type PasswordFieldErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { session, refreshSession } = useAuth();

  const [firstName, setFirstName] = useState(session?.firstName ?? '');
  const [middleInitial, setMiddleInitial] = useState(session?.middleInitial ?? '');
  const [lastName, setLastName] = useState(session?.lastName ?? '');
  const [username, setUsername] = useState(session?.username ?? '');
  const [profileErrors, setProfileErrors] = useState<ProfileFieldErrors>({});
  const [profileFormError, setProfileFormError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [isAvatarSaving, setIsAvatarSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<PasswordFieldErrors>({});
  const [passwordFormError, setPasswordFormError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [successAction, setSuccessAction] = useState<'back' | 'stay'>('stay');

  const handleSuccessDone = useCallback(() => {
    setSuccessMessage(null);
    if (successAction === 'back') {
      router.back();
    }
  }, [successAction, router]);

  if (!session) {
    return null;
  }

  const initial = (session.firstName || session.username || '?').charAt(0).toUpperCase();

  const showSuccess = (message: string, action: 'back' | 'stay') => {
    setSuccessAction(action);
    setSuccessMessage(message);
  };

  const applyAvatarUri = async (uri: string | null) => {
    if (!uri) {
      return;
    }

    setIsAvatarSaving(true);
    try {
      const persistedUri = await saveAvatarFile(uri, session.userId);
      const updated = await updateUserProfile(session.userId, {
        firstName: session.firstName,
        lastName: session.lastName,
        middleInitial: session.middleInitial,
        username: session.username,
        avatarUri: persistedUri,
      });
      await refreshSession(updated);
      showSuccess('Profile picture updated!', 'stay');
    } catch {
      showAlert('Could not update photo', 'Please try again.');
    } finally {
      setIsAvatarSaving(false);
    }
  };

  const handlePickAvatar = () => {
    Alert.alert('Change profile picture', undefined, [
      {
        text: 'Take Photo',
        onPress: () => void pickAvatarFromCamera().then(applyAvatarUri),
      },
      {
        text: 'Choose from Gallery',
        onPress: () => void pickAvatarFromGallery().then(applyAvatarUri),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSaveProfile = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedUsername = username.trim();
    const nextErrors: ProfileFieldErrors = {};

    if (!trimmedFirstName) {
      nextErrors.firstName = 'Enter your first name.';
    }
    if (!trimmedLastName) {
      nextErrors.lastName = 'Enter your last name.';
    }
    if (!isValidUsername(trimmedUsername)) {
      nextErrors.username =
        'Username must be 3-20 characters, start with a letter, and use only letters, numbers, underscores, or periods.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setProfileErrors(nextErrors);
      setProfileFormError(null);
      return;
    }

    setProfileErrors({});
    setProfileFormError(null);
    setIsSavingProfile(true);

    try {
      const updated = await updateUserProfile(session.userId, {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        middleInitial: middleInitial.trim() || null,
        username: trimmedUsername,
        avatarUri: session.avatarUri,
      });
      await refreshSession(updated);
      showSuccess('Profile updated!', 'back');
    } catch (error) {
      const message =
        error instanceof AuthError ? error.message : 'Could not save your profile. Please try again.';
      if (/already exists/i.test(message)) {
        setProfileErrors({ username: message });
      } else {
        setProfileFormError(message);
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    const nextErrors: PasswordFieldErrors = {};

    if (!currentPassword) {
      nextErrors.currentPassword = 'Enter your current password.';
    }
    if (!isPasswordValid(newPassword)) {
      nextErrors.newPassword = 'Password must meet all requirements below.';
    }
    if (newPassword !== confirmNewPassword) {
      nextErrors.confirmNewPassword = 'Passwords do not match.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setPasswordErrors(nextErrors);
      setPasswordFormError(null);
      return;
    }

    setPasswordErrors({});
    setPasswordFormError(null);
    setIsSavingPassword(true);

    try {
      await changePassword(session.userId, currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showSuccess('Password updated!', 'stay');
    } catch (error) {
      const message =
        error instanceof AuthError ? error.message : 'Could not update your password. Please try again.';
      if (/current password/i.test(message)) {
        setPasswordErrors({ currentPassword: message });
      } else {
        setPasswordFormError(message);
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  const clearProfileErrors = () => {
    setProfileErrors({});
    setProfileFormError(null);
  };

  const clearPasswordErrors = () => {
    setPasswordErrors({});
    setPasswordFormError(null);
  };

  return (
    <ProfileScreenShell title="Edit Profile" showBack>
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrap}>
          <Pressable
            style={styles.avatar}
            onPress={handlePickAvatar}
            disabled={isAvatarSaving}
            accessibilityRole="button"
            accessibilityLabel="Change profile picture">
            {session.avatarUri ? (
              <Image source={{ uri: session.avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
            {isAvatarSaving ? (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color={BrandColors.white} />
              </View>
            ) : null}
          </Pressable>
          <Pressable
            style={[styles.avatarBadge, faintCardShadow()]}
            onPress={handlePickAvatar}
            disabled={isAvatarSaving}
            accessibilityRole="button"
            accessibilityLabel="Change profile picture">
            <Camera size={16} color={BrandColors.white} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.card, faintCardShadow()]}>
        <AuthFormFields>
          <View style={styles.nameRow}>
            <View style={styles.firstNameCol}>
              <AuthTextField
                label="First Name"
                required
                value={firstName}
                onChangeText={(value) => {
                  setFirstName(value);
                  clearProfileErrors();
                }}
                autoCapitalize="words"
                error={profileErrors.firstName}
                fieldStyle={styles.compactField}
                style={styles.compactInput}
              />
            </View>
            <View style={styles.miCol}>
              <AuthTextField
                label="M.I."
                hideIcon
                fieldStyle={[styles.compactField, styles.miField]}
                style={styles.compactInput}
                value={middleInitial}
                onChangeText={(value) =>
                  setMiddleInitial(value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase())
                }
                autoCapitalize="characters"
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
              clearProfileErrors();
            }}
            autoCapitalize="words"
            error={profileErrors.lastName}
            fieldStyle={styles.compactField}
            style={styles.compactInput}
          />
          <AuthTextField
            label="Username"
            required
            value={username}
            onChangeText={(value) => {
              setUsername(value);
              clearProfileErrors();
            }}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
            error={profileErrors.username}
            fieldStyle={styles.compactField}
            style={styles.compactInput}
          />
        </AuthFormFields>

        <AuthFormActions>
          <AuthFormBanner message={profileFormError} />
          <AuthPrimaryButton
            label={isSavingProfile ? 'Saving...' : 'Save Changes'}
            onPress={() => void handleSaveProfile()}
            disabled={isSavingProfile}
            compact
          />
        </AuthFormActions>
      </View>

      <View style={[styles.card, styles.passwordCard, faintCardShadow()]}>
        <Text style={styles.sectionTitle}>Change Password</Text>

        <AuthFormFields>
          <AuthPasswordField
            label="Current Password"
            value={currentPassword}
            onChangeText={(value) => {
              setCurrentPassword(value);
              clearPasswordErrors();
            }}
            error={passwordErrors.currentPassword}
            fieldStyle={styles.compactField}
            style={styles.compactInput}
          />
          <View>
            <AuthPasswordField
              label="New Password"
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);
                clearPasswordErrors();
              }}
              textContentType="newPassword"
              error={passwordErrors.newPassword}
              fieldStyle={styles.compactField}
              style={styles.compactInput}
            />
            <PasswordRequirements password={newPassword} />
          </View>
          <AuthPasswordField
            label="Confirm New Password"
            value={confirmNewPassword}
            onChangeText={(value) => {
              setConfirmNewPassword(value);
              clearPasswordErrors();
            }}
            textContentType="newPassword"
            error={passwordErrors.confirmNewPassword}
            fieldStyle={styles.compactField}
            style={styles.compactInput}
          />
        </AuthFormFields>

        <AuthFormActions>
          <AuthFormBanner message={passwordFormError} />
          <AuthSecondaryButton
            label={isSavingPassword ? 'Updating...' : 'Update Password'}
            onPress={() => void handleUpdatePassword()}
            disabled={isSavingPassword}
            compact
          />
        </AuthFormActions>
      </View>

      <SuccessModal
        visible={successMessage !== null}
        message={successMessage ?? ''}
        onDone={handleSuccessDone}
      />
    </ProfileScreenShell>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrap: {
    width: 96,
    height: 96,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: BrandColors.lavenderCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BrandColors.border,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontFamily: Fonts.bold,
    fontSize: 34,
    color: BrandColors.primary,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BrandColors.white,
  },
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    padding: 20,
  },
  passwordCard: {
    marginTop: 20,
  },
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
  compactField: {
    minHeight: 44,
    paddingVertical: 2,
    gap: 10,
  },
  compactInput: {
    fontSize: 14,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: BrandColors.text,
    marginBottom: 16,
  },
});
