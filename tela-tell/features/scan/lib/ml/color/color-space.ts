/**
 * sRGB <-> CIELAB conversion using OpenCV's 8-bit LAB convention (L in [0,255]
 * scaled from L* in [0,100]; a,b in [0,255] offset from CIE's +-127), D65 white
 * point. Needed so CLAHE can run on the same luminance channel OpenCV's
 * normalize_contrast() operates on in ml-training/opencv_preprocess.py.
 */

const EPS = 0.008856; // (6/29)^3
const KAPPA = 903.3;
const XN = 0.950456;
const YN = 1.0;
const ZN = 1.088754;

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function linearToSrgb(v: number): number {
  const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return clamp255(c * 255);
}

function fLab(t: number): number {
  return t > EPS ? Math.cbrt(t) : 7.787 * t + 16 / 116;
}

function fLabInv(t: number): number {
  const t3 = t * t * t;
  return t3 > EPS ? t3 : (t - 16 / 116) / 7.787;
}

function clamp255(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

export function rgbToLab8u(r: number, g: number, b: number): [number, number, number] {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);

  const X = 0.412453 * R + 0.35758 * G + 0.180423 * B;
  const Y = 0.212671 * R + 0.71516 * G + 0.072169 * B;
  const Z = 0.019334 * R + 0.119193 * G + 0.950227 * B;

  const fx = fLab(X / XN);
  const fy = fLab(Y / YN);
  const fz = fLab(Z / ZN);
  const yr = Y / YN;

  const lStar = yr > EPS ? 116 * fy - 16 : KAPPA * yr;
  const aStar = 500 * (fx - fy);
  const bStar = 200 * (fy - fz);

  return [clamp255((lStar * 255) / 100), clamp255(aStar + 128), clamp255(bStar + 128)];
}

export function labToRgb8u(l: number, a: number, b: number): [number, number, number] {
  const lStar = (l * 100) / 255;
  const aStar = a - 128;
  const bStar = b - 128;

  const fy = (lStar + 16) / 116;
  const fx = fy + aStar / 500;
  const fz = fy - bStar / 200;

  const y = lStar > KAPPA * EPS ? YN * fLabInv(fy) : YN * (lStar / KAPPA);
  const x = XN * fLabInv(fx);
  const z = ZN * fLabInv(fz);

  const r = 3.240479 * x - 1.53715 * y - 0.498535 * z;
  const g = -0.969256 * x + 1.875992 * y + 0.041556 * z;
  const bl = 0.055648 * x - 0.204043 * y + 1.057311 * z;

  return [linearToSrgb(r), linearToSrgb(g), linearToSrgb(bl)];
}