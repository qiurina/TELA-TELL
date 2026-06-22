export const BrandColors = {
  primary: '#4A8FA8',
  primaryDark: '#3A7792',
  primaryLight: '#6BAEC4',
  gradientStart: '#7EC5DB',
  gradientEnd: '#4A8FA8',
  lavender: '#EAF4F8',
  lavenderCard: '#DFEEF4',
  text: '#212121',
  textMuted: '#6B8794',
  white: '#FFFFFF',
  shadow: 'rgba(74, 143, 168, 0.15)',
  border: '#D4E4EB',
  borderLight: '#E8F2F6',
};

export type FabricBarStyle = {
  track: string;
  gradient: readonly string[];
};

/** Per-fabric bar gradients — vivid pink / orange / yellow / violet */
export const FabricBarStyles: Record<string, FabricBarStyle> = {
  Cotton: { gradient: ['#FF6B9D', '#FF8F6B', '#FFB347'], track: '#FCE8F0' },
  Polyester: { gradient: ['#FF9F43', '#FFC14D', '#FFD93D'], track: '#FFF4E6' },
  Linen: { gradient: ['#4ADE80', '#3B82F6'], track: '#ECFDF5' },
  Silk: { gradient: ['#E879F9', '#C084FC', '#818CF8'], track: '#F3EEFF' },
  Wool: { gradient: ['#FB7185', '#F472B6', '#A78BFA'], track: '#FCE8F0' },
};

export const FabricBarFallback: FabricBarStyle[] = [
  { gradient: ['#FF6B9D', '#FF9F6B', '#FFB347'], track: '#FCE8F0' },
  { gradient: ['#FF9F43', '#FFC14D', '#FFD93D'], track: '#FFF4E6' },
  { gradient: ['#4ADE80', '#3B82F6'], track: '#ECFDF5' },
];
