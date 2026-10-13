import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';

import {
  assessLighting,
  measureRgbaLighting,
  type LightingAssessment,
  type LightingReading,
} from '@/features/scan/lib/ml/lighting';
import { base64ToUint8Array } from '@/features/scan/lib/ml/preprocess';
import {
  SHARPNESS_ANALYSIS_SIZE,
  judgeSharpness,
  measureRgbaSharpness,
  type SharpnessVerdict,
} from '@/features/scan/lib/ml/sharpness';

type DecodedImage = { data: Uint8Array; width: number; height: number };

async function decodeForAnalysis(uri: string): Promise<DecodedImage | null> {
  const resized = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: SHARPNESS_ANALYSIS_SIZE, height: SHARPNESS_ANALYSIS_SIZE } }],
    { base64: true, compress: 1, format: ImageManipulator.SaveFormat.JPEG },
  );
  if (!resized.base64) {
    return null;
  }
  const decoded = jpeg.decode(base64ToUint8Array(resized.base64), { useTArray: true });
  return { data: decoded.data, width: decoded.width, height: decoded.height };
}

export async function measureImageSharpness(uri: string): Promise<number | null> {
  try {
    const image = await decodeForAnalysis(uri);
    return image ? measureRgbaSharpness(image.data, image.width, image.height) : null;
  } catch (error) {
    console.warn('[TELA-TELL] sharpness measurement failed:', error);
    return null;
  }
}

export async function checkCaptureSharpness(uris: string[]): Promise<SharpnessVerdict> {
  const readings: (number | null)[] = [];
  for (const uri of uris) {
    readings.push(await measureImageSharpness(uri));
  }
  return judgeSharpness(readings);
}

export type CaptureCheck = {
  verdict: SharpnessVerdict;
  lighting: LightingAssessment;
};

export async function checkCapture(uris: string[]): Promise<CaptureCheck> {
  const sharpness: (number | null)[] = [];
  const lighting: (LightingReading | null)[] = [];

  for (const uri of uris) {
    let image: DecodedImage | null = null;
    try {
      image = await decodeForAnalysis(uri);
    } catch (error) {
      console.warn('[TELA-TELL] capture analysis failed:', error);
    }

    let sharp: number | null = null;
    let light: LightingReading | null = null;
    if (image) {
      try {
        sharp = measureRgbaSharpness(image.data, image.width, image.height);
      } catch (error) {
        console.warn('[TELA-TELL] sharpness measurement failed:', error);
      }
      try {
        light = measureRgbaLighting(image.data, image.width, image.height);
      } catch (error) {
        console.warn('[TELA-TELL] lighting measurement failed:', error);
      }
    }
    sharpness.push(sharp);
    lighting.push(light);
  }

  return judgeCapture(sharpness, lighting);
}

export function judgeCapture(
  sharpness: (number | null)[],
  lighting: (LightingReading | null)[],
): CaptureCheck {
  return { verdict: judgeSharpness(sharpness), lighting: assessLighting(lighting) };
}
