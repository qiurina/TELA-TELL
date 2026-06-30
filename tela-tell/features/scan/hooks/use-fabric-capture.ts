import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.85,
};

function showPermissionAlert(kind: 'camera' | 'gallery') {
  const label = kind === 'camera' ? 'camera' : 'photo library';

  Alert.alert(
    'Permission required',
    `TELA-TELL needs access to your ${label} to capture or upload fabric photos.`,
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

export function useFabricCapture() {
  const captureFromCamera = async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!libraryPermission.granted) {
        showPermissionAlert('gallery');
        return null;
      }

      return pickImage(() => ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS));
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      showPermissionAlert('camera');
      return null;
    }

    return pickImage(() => ImagePicker.launchCameraAsync(PICKER_OPTIONS));
  };

  const captureFromGallery = async (): Promise<string | null> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showPermissionAlert('gallery');
      return null;
    }

    return pickImage(() => ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS));
  };

  return { captureFromCamera, captureFromGallery };
}
