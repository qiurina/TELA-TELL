import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { showAlert } from '@/components/ui/alert-dialog';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.85,
};

function showPermissionAlert(kind: 'camera' | 'gallery') {
  const label = kind === 'camera' ? 'camera' : 'photo library';

  showAlert(
    'Permission required',
    `TELA-TELL needs access to your ${label} to update your profile picture.`,
    'info',
  );
}

async function pickImage(
  launch: () => Promise<ImagePicker.ImagePickerResult>,
): Promise<string | null> {
  const result = await launch();

  if (result.canceled || !result.assets?.[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}

/** Opens the camera, then the OS's native crop screen (drag/zoom to fit a square). */
export async function pickAvatarFromCamera(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return pickAvatarFromGallery();
  }

  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    showPermissionAlert('camera');
    return null;
  }

  return pickImage(() => ImagePicker.launchCameraAsync(PICKER_OPTIONS));
}

/** Opens the gallery, then the OS's native crop screen (drag/zoom to fit a square). */
export async function pickAvatarFromGallery(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    showPermissionAlert('gallery');
    return null;
  }

  return pickImage(() => ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS));
}
