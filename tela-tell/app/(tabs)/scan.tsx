import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraGuide, type ViewfinderSource } from '@/features/scan/components/camera-guide';
import { DeviceStatusCard } from '@/features/scan/components/device-status-card';
import { ScanActions } from '@/features/scan/components/scan-actions';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { useFabricCapture } from '@/features/scan/hooks/use-fabric-capture';
import { clearLastCaptureUri, setLastCaptureUri } from '@/features/scan/lib/last-capture';
import { getDeviceMockCaptureUri } from '@/features/scan/lib/device-mock-capture';
import { clearLastSellerLabel, getLastSellerLabel } from '@/features/scan/lib/last-seller-label';
import { clearRegionSelection } from '@/features/scan/lib/region-selection';
import { consumeFreshScan } from '@/features/scan/lib/scan-fresh';
import { getScanMode } from '@/features/scan/lib/scan-session';

const DEVICE_SCAN_DURATION_MS = 2500;

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [guideVisible, setGuideVisible] = useState(true);
  const [savedSellerLabel, setSavedSellerLabel] = useState<string | null>(null);
  const [viewfinderSource, setViewfinderSource] = useState<ViewfinderSource>('iot');
  const [isDeviceScanning, setIsDeviceScanning] = useState(false);
  const [isBackupCapture, setIsBackupCapture] = useState(false);
  const { captureFromCamera, captureFromGallery } = useFabricCapture();

  useFocusEffect(
    useCallback(() => {
      if (consumeFreshScan()) {
        setPreviewUri(null);
        setViewfinderSource('iot');
        setIsDeviceScanning(false);
        setIsBackupCapture(false);
        clearRegionSelection();
      }
      setGuideVisible(true);
      setSavedSellerLabel(getLastSellerLabel());
    }, []),
  );

  const runAnalysis = (photoUri?: string | null) => {
    if (photoUri) {
      setLastCaptureUri(photoUri);
    } else {
      clearLastCaptureUri();
    }

    const resultId = getScanMode() === 'dual' ? 'dual' : isBackupCapture ? '3' : '1';

    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      router.push(`/results/${resultId}` as Href);
    }, 1500);
  };

  const handlePhoneScan = async () => {
    if (isAnalyzing || isDeviceScanning) {
      return;
    }

    if (Platform.OS === 'web') {
      const photoUri = await captureFromCamera();
      if (photoUri) {
        setIsBackupCapture(true);
        setPreviewUri(photoUri);
      }
      return;
    }

    setIsBackupCapture(true);
    setViewfinderSource('phone');
  };

  const handleUpload = async () => {
    if (isAnalyzing || isDeviceScanning) {
      return;
    }

    const photoUri = await captureFromGallery();

    if (photoUri) {
      setIsBackupCapture(true);
      setPreviewUri(photoUri);
    }
  };

  const handleAnalyze = () => {
    if (isAnalyzing) {
      return;
    }

    if (!previewUri) {
      Alert.alert(
        'No fabric photo',
        'Capture or upload a fabric image first, then tap Analyze Fabric.',
      );
      return;
    }

    if (getScanMode() === 'dual') {
      setLastCaptureUri(previewUri);
      clearRegionSelection();
      router.push('/region-select' as Href);
      return;
    }

    runAnalysis(previewUri);
  };

  const startDeviceScan = () => {
    setIsDeviceScanning(true);
    setTimeout(() => {
      void getDeviceMockCaptureUri().then((uri) => {
        setIsDeviceScanning(false);
        setIsBackupCapture(false);
        setPreviewUri(uri);
      });
    }, DEVICE_SCAN_DURATION_MS);
  };

  const handleDeviceScan = () => {
    if (isAnalyzing || isDeviceScanning) {
      return;
    }

    startDeviceScan();
  };

  const handleTryAnother = () => {
    if (isAnalyzing) {
      return;
    }

    setPreviewUri(null);
    setViewfinderSource('iot');
    setIsDeviceScanning(false);
    setIsBackupCapture(false);
    clearRegionSelection();
  };

  const handleAddLabel = () => {
    router.push('/modal');
  };

  const handleOpenPreferences = () => {
    router.push('/user-preferences');
  };

  const handleRemoveLabel = () => {
    clearLastSellerLabel();
    setSavedSellerLabel(null);
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
          </View>
        </View>

        <View style={styles.sheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}>
            <DeviceStatusCard status="online" />

            <CameraGuide
              previewUri={previewUri}
              source={viewfinderSource}
              isDeviceScanning={isDeviceScanning}
              onCapture={(uri) => {
                if (viewfinderSource === 'phone') {
                  setIsBackupCapture(true);
                }
                setPreviewUri(uri);
              }}
              guideVisible={guideVisible}
              onDismissGuide={() => setGuideVisible(false)}
              onShowGuide={() => setGuideVisible(true)}
            />

            <ScanActions
              hasPreview={Boolean(previewUri)}
              showPhoneCapture
              savedSellerLabel={savedSellerLabel}
              onDeviceScan={handleDeviceScan}
              onPhoneScan={handlePhoneScan}
              onUpload={handleUpload}
              onAnalyze={handleAnalyze}
              onTryAnother={handleTryAnother}
              onAddLabel={handleAddLabel}
              onRemoveLabel={handleRemoveLabel}
              onOpenPreferences={handleOpenPreferences}
              isAnalyzing={isAnalyzing}
              isDeviceScanning={isDeviceScanning}
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
    marginBottom: 8,
  },
  headerText: {
    gap: 1,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: BrandColors.white,
    letterSpacing: -0.3,
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
    gap: 12,
    flexGrow: 1,
  },
});
