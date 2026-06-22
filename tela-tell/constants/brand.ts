export const BrandColors = {
  primary: '#4A3F8C',
  primaryDark: '#3D326F',
  primaryLight: '#6B5B9A',
  gradientStart: '#7A6AAC',
  gradientEnd: '#4A3F8C',
  lavender: '#EEEBF7',
  lavenderCard: '#E8E4F3',
  text: '#212121',
  textMuted: '#8B85A8',
  white: '#FFFFFF',
  shadow: 'rgba(74, 63, 140, 0.15)',
};

export type FabricBarStyle = {
  fill: string;
  track: string;
};

/** Per-fabric bar colors — distinct but muted to sit with the purple brand */
export const FabricBarStyles: Record<string, FabricBarStyle> = {
  Cotton: { fill: '#5B6DB8', track: '#E8EBF5' },
  Polyester: { fill: '#9B6B9E', track: '#F3EBF3' },
  Linen: { fill: '#B8956A', track: '#F5F0E8' },
  Silk: { fill: '#C97B9A', track: '#F9EFF3' },
  Wool: { fill: '#6B8F7A', track: '#ECF3EF' },
};

export const FabricBarFallback: FabricBarStyle[] = [
  { fill: '#4A3F8C', track: '#EDE9F7' },
  { fill: '#5B8FAD', track: '#E8F2F7' },
  { fill: '#8F7B5C', track: '#F3EFE9' },
];
