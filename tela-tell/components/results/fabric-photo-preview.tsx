import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { ScanLine } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

type FabricPhotoPreviewProps = {
  imageUri?: string | null;
};

export function FabricPhotoPreview({ imageUri }: FabricPhotoPreviewProps) {
  return (
    <View style={styles.container}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={styles.placeholder}>
          <ScanLine size={52} color={BrandColors.textMuted} strokeWidth={1.5} />
          <Text style={styles.placeholderText}>Scanned fabric photo</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: BrandColors.lavenderCard,
    borderWidth: 1,
    borderColor: '#E0DBF0',
    minHeight: 320,
  },
  image: {
    width: '100%',
    minHeight: 320,
  },
  placeholder: {
    flex: 1,
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  placeholderText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: BrandColors.textMuted,
  },
});
