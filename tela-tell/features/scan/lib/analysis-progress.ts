export type AnalysisProgress =
  | { stage: 'loading_model' }
  | { stage: 'reading_photo'; photo: number; photos: number }
  | { stage: 'saving' };

export type AnalysisProgressListener = (progress: AnalysisProgress) => void;

export function analysisProgressFraction(progress: AnalysisProgress | null): number {
  if (!progress) return 0.05;
  switch (progress.stage) {
    case 'loading_model':
      return 0.1;
    case 'reading_photo':
      return 0.2 + 0.65 * ((progress.photo - 1) / Math.max(1, progress.photos));
    case 'saving':
      return 0.92;
  }
}

export function analysisProgressLabel(progress: AnalysisProgress | null): string {
  if (!progress || progress.stage === 'loading_model') return 'Preparing the fiber model…';
  if (progress.stage === 'saving') return 'Saving your scan…';
  return progress.photos > 1
    ? `Reading the fibers · photo ${progress.photo} of ${progress.photos}`
    : 'Reading the fibers…';
}
