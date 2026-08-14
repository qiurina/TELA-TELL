import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.85,
};

function showPermissionAlert(kind: 'camera' | 'gallery') {
  const label = kind === 'camera' ? 'camera' : 'photo library';

  Alert.alert(
    'Permission required',
    `TELA-TELL needs access to your ${label} to update your profile picture.`,
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
