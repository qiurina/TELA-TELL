import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronLeft } from '@/components/ui/lucide-icons';
import { AppLogo } from '@/constants/assets';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

const FORM_MAX_WIDTH = 420;

type AuthFullscreenLayoutProps = {
  title: string;
  children: ReactNode;
};

export function AuthFullscreenLayout({ title, children }: AuthFullscreenLayoutProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const keyboardOpen = keyboardHeight > 0;
  const bottomPad =
    Math.max(insets.bottom, 16) +
    24 +
    (Platform.OS === 'android' && keyboardOpen ? keyboardHeight : keyboardOpen ? 32 : 0);

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <ChevronLeft size={24} color={BrandColors.primaryDark} strokeWidth={2.5} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 52 : 0}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.scrollContent,
            keyboardOpen ? styles.scrollContentKeyboard : styles.scrollContentIdle,
            { paddingBottom: bottomPad },
          ]}>
          <View style={styles.formWrap}>
            <View style={[styles.headerBlock, keyboardOpen && styles.headerBlockCompact]}>
              {!keyboardOpen ? (
                <Image
                  source={AppLogo}
                  style={styles.logo}
                  contentFit="contain"
                  accessibilityLabel="Tela-Tell logo"
                />
              ) : null}
              <Text style={styles.title}>{title}</Text>
            </View>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  scrollContentIdle: {
    justifyContent: 'center',
    paddingTop: 8,
  },
  scrollContentKeyboard: {
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  formWrap: {
    width: '100%',
    maxWidth: FORM_MAX_WIDTH,
    alignSelf: 'center',
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  headerBlockCompact: {
    marginBottom: 16,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    lineHeight: 32,
    color: BrandColors.primaryDark,
    textAlign: 'center',
  },
});
