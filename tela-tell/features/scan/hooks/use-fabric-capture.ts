import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

import {
  GUIDE_ASPECT,
  cropUriToCenteredGuideAspect,
} from '@/features/scan/lib/crop-to-guide';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: false,
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

async function cropToAspect(uri: string, aspect: number): Promise<string> {
  return cropUriToCenteredGuideAspect(uri, aspect > 0 ? aspect : GUIDE_ASPECT);
}

export function useFabricCapture() {
  const captureFromCamera = async (aspect: number = GUIDE_ASPECT): Promise<string | null> => {
    if (Platform.OS === 'web') {
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!libraryPermission.granted) {
        showPermissionAlert('gallery');
        return null;
      }

      const uri = await pickImage(() => ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS));
      if (!uri) {
        return null;
      }
      return cropToAspect(uri, aspect);
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      showPermissionAlert('camera');
      return null;
    }

    const uri = await pickImage(() => ImagePicker.launchCameraAsync(PICKER_OPTIONS));
    if (!uri) {
      return null;
    }
    return cropToAspect(uri, aspect);
  };

  /** Picks from gallery and center-crops to the scan guide aspect. */
  const captureFromGallery = async (aspect: number = GUIDE_ASPECT): Promise<string | null> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showPermissionAlert('gallery');
      return null;
    }

    const uri = await pickImage(() => ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS));
    if (!uri) {
      return null;
    }

    return cropToAspect(uri, aspect);
  };

  return { captureFromCamera, captureFromGallery };
}
