import { LogBox } from 'react-native';

const SUPPRESSED_WARNINGS = [
  '[Reanimated] Reduced motion setting is enabled on this device',
  'Reduced motion setting is enabled on this device',
  'props.pointerEvents is deprecated',
  '`useNativeDriver` is not supported because the native animated module is missing',
];

if (__DEV__) {
  LogBox.ignoreLogs(SUPPRESSED_WARNINGS);

  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const message = args.map((arg) => (typeof arg === 'string' ? arg : String(arg))).join(' ');
    if (SUPPRESSED_WARNINGS.some((snippet) => message.includes(snippet))) {
      return;
    }
    originalWarn(...args);
  };
}
