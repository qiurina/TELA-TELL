const EPS = 0.008856;
const KAPPA = 903.3;
const XN = 0.950456;
const YN = 1.0;
const ZN = 1.088754;

const SRGB_TO_LINEAR = Float64Array.from({ length: 256 }, (_, c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
});

function srgbToLinear(c: number): number {
  return SRGB_TO_LINEAR[c];
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

const SIXTEEN_116 = 16 / 116;
const INV_GAMMA = 1 / 2.4;
const KAPPA_EPS = KAPPA * EPS;

const tableOf = (f: (value: number) => number) => Float64Array.from({ length: 256 }, (_, v) => f(v));
const X_R = tableOf((v) => 0.412453 * SRGB_TO_LINEAR[v]);
const X_G = tableOf((v) => 0.35758 * SRGB_TO_LINEAR[v]);
const X_B = tableOf((v) => 0.180423 * SRGB_TO_LINEAR[v]);
const Y_R = tableOf((v) => 0.212671 * SRGB_TO_LINEAR[v]);
const Y_G = tableOf((v) => 0.71516 * SRGB_TO_LINEAR[v]);
const Y_B = tableOf((v) => 0.072169 * SRGB_TO_LINEAR[v]);
const Z_R = tableOf((v) => 0.019334 * SRGB_TO_LINEAR[v]);
const Z_G = tableOf((v) => 0.119193 * SRGB_TO_LINEAR[v]);
const Z_B = tableOf((v) => 0.950227 * SRGB_TO_LINEAR[v]);
const FY_OF_L = tableOf((l) => ((l * 100) / 255 + 16) / 116);
const Y_OF_L = tableOf((l) => {
  const lStar = (l * 100) / 255;
  const fy = (lStar + 16) / 116;
  return lStar > KAPPA_EPS ? YN * fLabInv(fy) : YN * (lStar / KAPPA);
});
const A_OVER_500 = tableOf((a) => (a - 128) / 500);
const B_OVER_200 = tableOf((b) => (b - 128) / 200);

export function rgbToLabPacked(r: number, g: number, b: number): number {
  const X = X_R[r] + X_G[g] + X_B[b];
  const Y = Y_R[r] + Y_G[g] + Y_B[b];
  const Z = Z_R[r] + Z_G[g] + Z_B[b];

  const tx = X / XN;
  const ty = Y / YN;
  const tz = Z / ZN;
  const fx = tx > EPS ? Math.cbrt(tx) : 7.787 * tx + SIXTEEN_116;
  const fy = ty > EPS ? Math.cbrt(ty) : 7.787 * ty + SIXTEEN_116;
  const fz = tz > EPS ? Math.cbrt(tz) : 7.787 * tz + SIXTEEN_116;
  const yr = Y / YN;

  const lStar = yr > EPS ? 116 * fy - 16 : KAPPA * yr;
  const aStar = 500 * (fx - fy);
  const bStar = 200 * (fy - fz);

  const lv = (lStar * 255) / 100;
  const av = aStar + 128;
  const bv = bStar + 128;
  const l8 = lv < 0 ? 0 : lv > 255 ? 255 : Math.round(lv);
  const a8 = av < 0 ? 0 : av > 255 ? 255 : Math.round(av);
  const b8 = bv < 0 ? 0 : bv > 255 ? 255 : Math.round(bv);
  return (l8 << 16) | (a8 << 8) | b8;
}

export function labToRgbPacked(l: number, a: number, b: number): number {
  const fy = FY_OF_L[l];
  const fx = fy + A_OVER_500[a];
  const fz = fy - B_OVER_200[b];

  const y = Y_OF_L[l];
  const fx3 = fx * fx * fx;
  const x = XN * (fx3 > EPS ? fx3 : (fx - SIXTEEN_116) / 7.787);
  const fz3 = fz * fz * fz;
  const z = ZN * (fz3 > EPS ? fz3 : (fz - SIXTEEN_116) / 7.787);

  const r = 3.240479 * x - 1.53715 * y - 0.498535 * z;
  const g = -0.969256 * x + 1.875992 * y + 0.041556 * z;
  const bl = 0.055648 * x - 0.204043 * y + 1.057311 * z;

  const rc = (r <= 0.0031308 ? 12.92 * r : 1.055 * Math.pow(r, INV_GAMMA) - 0.055) * 255;
  const gc = (g <= 0.0031308 ? 12.92 * g : 1.055 * Math.pow(g, INV_GAMMA) - 0.055) * 255;
  const bc = (bl <= 0.0031308 ? 12.92 * bl : 1.055 * Math.pow(bl, INV_GAMMA) - 0.055) * 255;
  const r8 = rc < 0 ? 0 : rc > 255 ? 255 : Math.round(rc);
  const g8 = gc < 0 ? 0 : gc > 255 ? 255 : Math.round(gc);
  const b8 = bc < 0 ? 0 : bc > 255 ? 255 : Math.round(bc);
  return (r8 << 16) | (g8 << 8) | b8;
}
