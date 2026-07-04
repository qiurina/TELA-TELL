export const BrandColors = {
  primary: '#4A8FA8',
  primaryDark: '#3A7792',
  primaryLight: '#6BAEC4',
  gradientStart: '#7EC5DB',
  gradientEnd: '#4A8FA8',
  splashGradientTop: '#F8FCFE',
  splashGradientBottom: '#B8E4EE',
  splashTitle: '#2A8C9D',
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

/** Per-fabric bar gradients — one entry per supported study fiber */
export const FabricBarStyles: Record<string, FabricBarStyle> = {
  Cotton: { gradient: ['#FF6B9D', '#FF8F6B', '#FFB347'], track: '#FCE8F0' },
  Wool: { gradient: ['#FB7185', '#F472B6', '#A78BFA'], track: '#FCE8F0' },
  Silk: { gradient: ['#E879F9', '#C084FC', '#818CF8'], track: '#F3EEFF' },
  Linen: { gradient: ['#4ADE80', '#3B82F6'], track: '#ECFDF5' },
  Polyester: { gradient: ['#FF9F43', '#FFC14D', '#FFD93D'], track: '#FFF4E6' },
  Nylon: { gradient: ['#60A5FA', '#38BDF8', '#22D3EE'], track: '#E0F2FE' },
  Acrylic: { gradient: ['#F472B6', '#FB923C', '#FBBF24'], track: '#FFF1F2' },
  Rayon: { gradient: ['#A78BFA', '#818CF8', '#6366F1'], track: '#EEF2FF' },
  Abaca: { gradient: ['#84CC16', '#65A30D', '#4D7C0F'], track: '#ECFCCB' },
  'Piña': { gradient: ['#FCD34D', '#FBBF24', '#F59E0B'], track: '#FEF9C3' },
};

export const FabricBarFallback: FabricBarStyle[] = [
  { gradient: ['#FF6B9D', '#FF9F6B', '#FFB347'], track: '#FCE8F0' },
  { gradient: ['#FF9F43', '#FFC14D', '#FFD93D'], track: '#FFF4E6' },
  { gradient: ['#4ADE80', '#3B82F6'], track: '#ECFDF5' },
];
