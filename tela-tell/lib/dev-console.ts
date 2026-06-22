import { LogBox } from 'react-native';

const SUPPRESSED_WARNINGS = [
  '[Reanimated] Reduced motion setting is enabled on this device',
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
