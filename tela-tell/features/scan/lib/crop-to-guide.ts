import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';

export type ViewRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PixelCrop = {
  originX: number;
  originY: number;
  width: number;
  height: number;
};

export type Size = {
  width: number;
  height: number;
};

export const GUIDE_ASPECT = 1;

const SCAN_IMAGE_MAX_EDGE = 1920;
const SCAN_JPEG_QUALITY = 0.88;

export function computeCenteredGuideRect(
  view: Size,
  topInset: number,
  bottomReserve: number,
): ViewRect {
  const top = Math.max(0, topInset);
  const bottom = Math.max(0, bottomReserve);
  const availableHeight = Math.max(160, view.height - top - bottom);
  const availableWidth = Math.max(160, view.width - 40);
  const side = Math.min(availableWidth, availableHeight);
  return {
    x: Math.round((view.width - side) / 2),
    y: Math.round(top + (availableHeight - side) / 2),
    width: Math.round(side),
    height: Math.round(side),
  };
}

export function mapCoverCrop(view: Size, image: Size, guideInView: ViewRect): PixelCrop {
  if (view.width <= 0 || view.height <= 0 || image.width <= 0 || image.height <= 0) {
    return {
      originX: 0,
      originY: 0,
      width: Math.max(2, Math.round(image.width || 2)),
      height: Math.max(2, Math.round(image.height || 2)),
    };
  }

  const imageAspect = image.width / image.height;
  const viewAspect = view.width / view.height;

  let scale: number;
  let offsetX = 0;
  let offsetY = 0;

  if (imageAspect > viewAspect) {
    scale = view.height / image.height;
    offsetX = (image.width * scale - view.width) / 2;
  } else {
    scale = view.width / image.width;
    offsetY = (image.height * scale - view.height) / 2;
  }

  let originX = (guideInView.x + offsetX) / scale;
  let originY = (guideInView.y + offsetY) / scale;
  let width = guideInView.width / scale;
  let height = guideInView.height / scale;

  originX = Math.max(0, Math.min(originX, image.width - 2));
  originY = Math.max(0, Math.min(originY, image.height - 2));
  width = Math.min(width, image.width - originX);
  height = Math.min(height, image.height - originY);

  const evenWidth = Math.max(2, Math.floor(width / 2) * 2);
  const evenHeight = Math.max(2, Math.floor(height / 2) * 2);

  return {
    originX: Math.floor(originX),
    originY: Math.floor(originY),
    width: Math.min(evenWidth, Math.floor(image.width - originX)),
    height: Math.min(evenHeight, Math.floor(image.height - originY)),
  };
}

export function centerCropForAspect(image: Size, aspect: number): PixelCrop {
  const safeAspect = aspect > 0 ? aspect : 1;
  const imageAspect = image.width / image.height;

  if (imageAspect > safeAspect) {
    const height = Math.floor(image.height / 2) * 2;
    const width = Math.max(2, Math.floor((height * safeAspect) / 2) * 2);
    return {
      originX: Math.max(0, Math.floor((image.width - width) / 2)),
      originY: Math.max(0, Math.floor((image.height - height) / 2)),
      width,
      height: Math.max(2, height),
    };
  }

  const width = Math.floor(image.width / 2) * 2;
  const height = Math.max(2, Math.floor(width / safeAspect / 2) * 2);
  return {
    originX: Math.max(0, Math.floor((image.width - width) / 2)),
    originY: Math.max(0, Math.floor((image.height - height) / 2)),
    width: Math.max(2, width),
    height,
  };
}

export function getImageSize(uri: string): Promise<Size> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error),
    );
  });
}

export async function cropImageToRect(uri: string, crop: PixelCrop): Promise<string> {
  if (crop.width < 2 || crop.height < 2) {
    return uri;
  }

  const MAX_EDGE = SCAN_IMAGE_MAX_EDGE;
  const actions: ImageManipulator.Action[] = [
    {
      crop: {
        originX: crop.originX,
        originY: crop.originY,
        width: crop.width,
        height: crop.height,
      },
    },
  ];

  const longest = Math.max(crop.width, crop.height);
  if (longest > MAX_EDGE) {
    if (crop.width >= crop.height) {
      actions.push({ resize: { width: MAX_EDGE } });
    } else {
      actions.push({ resize: { height: MAX_EDGE } });
    }
  }

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: SCAN_JPEG_QUALITY,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  return result.uri;
}

export async function optimizeScanImage(uri: string): Promise<string> {
  try {
    const image = await getImageSize(uri);
    const longest = Math.max(image.width, image.height);
    const MAX_EDGE = SCAN_IMAGE_MAX_EDGE;
    const actions: ImageManipulator.Action[] = [];

    if (longest > MAX_EDGE) {
      if (image.width >= image.height) {
        actions.push({ resize: { width: MAX_EDGE } });
      } else {
        actions.push({ resize: { height: MAX_EDGE } });
      }
    }

    const result = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: SCAN_JPEG_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return result.uri;
  } catch {
    return uri;
  }
}

export async function cropUriToGuideWithSize(
  uri: string,
  image: Size,
  view: Size,
  guideInView: ViewRect,
): Promise<string> {
  try {
    const crop = mapCoverCrop(view, image, guideInView);
    if (crop.width < 8 || crop.height < 8) {
      return uri;
    }
    return await cropImageToRect(uri, crop);
  } catch {
    return uri;
  }
}

export async function cropUriToCenteredGuideAspect(
  uri: string,
  aspect: number = GUIDE_ASPECT,
  knownSize?: Size,
): Promise<string> {
  try {
    const image = knownSize ?? (await getImageSize(uri));
    const crop = centerCropForAspect(image, aspect);
    return await cropImageToRect(uri, crop);
  } catch {
    return uri;
  }
}
