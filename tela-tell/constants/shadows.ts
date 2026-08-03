import { Platform, type ViewStyle } from 'react-native';

import { BrandColors } from '@/constants/brand';

type NativeShadow = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

function webOrNative(boxShadow: string, native: NativeShadow): ViewStyle {
  if (Platform.OS === 'web') {
    return { boxShadow };
  }

  return native;
}

export function faintCardShadow(color: string = BrandColors.shadow): ViewStyle {
  return webOrNative(`0px 2px 10px ${color}`, {
    shadowColor: color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  });
}

export function heroCardShadow(): ViewStyle {
  return webOrNative(`0px 4px 12px ${BrandColors.shadow}`, {
    shadowColor: BrandColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  });
}

export function primaryButtonShadow(): ViewStyle {
  const color = 'rgba(74, 143, 168, 0.3)';

  return webOrNative(`0px 4px 8px ${color}`, {
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  });
}

export function fabShadow(): ViewStyle {
  const color = 'rgba(74, 143, 168, 0.35)';

  return webOrNative(`0px 6px 10px ${color}`, {
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  });
}
