import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraGuide } from '@/components/scan/camera-guide';
import { DeviceStatusCard } from '@/components/scan/device-status-card';
import { ScanActions } from '@/components/scan/scan-actions';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { useFabricCapture } from '@/hooks/use-fabric-capture';
import { clearLastCaptureUri, setLastCaptureUri } from '@/lib/last-capture';

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { captureFromCamera, captureFromGallery } = useFabricCapture();

  const runAnalysis = (photoUri?: string | null) => {
    if (photoUri) {
      setLastCaptureUri(photoUri);
    } else {
      clearLastCaptureUri();
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      router.push('/results/1' as Href);
    }, 1500);
  };

  const handlePhoneScan = async () => {
    if (isAnalyzing) {
      return;
    }

    const photoUri = await captureFromCamera();

    if (photoUri) {
      setPreviewUri(photoUri);
    }
  };

  const handleUpload = async () => {
    if (isAnalyzing) {
      return;
    }

    const photoUri = await captureFromGallery();

    if (photoUri) {
      setPreviewUri(photoUri);
    }
  };

  const handleAnalyze = () => {
    if (!previewUri || isAnalyzing) {
      return;
    }

    runAnalysis(previewUri);
  };

  const handleDeviceScan = () => {
    if (isAnalyzing) {
      return;
    }

    Alert.alert(
      'IoT Scanner',
      'Place the scanner over the fabric. Using sample analysis results for this prototype.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start scan', onPress: () => runAnalysis() },
      ],
    );
  };

  const handleTryAnother = () => {
    if (isAnalyzing) {
      return;
    }

    setPreviewUri(null);
  };

  const handleAddLabel = () => {
    router.push('/modal');
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={[styles.page, { paddingTop: insets.top + 16 }]}>
        <View style={styles.topRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Scan Fabric</Text>
            <Text style={styles.subtitle}>Use the IoT scanner for best results</Text>
          </View>
        </View>

        <View style={styles.sheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}>
            <DeviceStatusCard connectionType="wifi" status="ready" />

            <CameraGuide previewUri={previewUri} />

            <ScanActions
              hasPreview={Boolean(previewUri)}
              onDeviceScan={handleDeviceScan}
              onPhoneScan={handlePhoneScan}
              onUpload={handleUpload}
              onAnalyze={handleAnalyze}
              onTryAnother={handleTryAnother}
              onAddLabel={handleAddLabel}
              isAnalyzing={isAnalyzing}
            />
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.primary,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  page: {
    flex: 1,
  },
  topRow: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerText: {
    gap: 1,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    color: BrandColors.white,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  sheet: {
    flex: 1,
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 20,
    flexGrow: 1,
  },
});
