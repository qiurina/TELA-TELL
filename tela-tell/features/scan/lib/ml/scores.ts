export type ScoredLabel = { material: string; percentage: number };

export class ModelOutputMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModelOutputMismatchError';
  }
}

export function scoresToCompositions(
  scores: ArrayLike<number>,
  labels: readonly string[],
): ScoredLabel[] {
  if (scores.length !== labels.length) {
    throw new ModelOutputMismatchError(
      `The model outputs ${scores.length} classes but the app has ${labels.length} labels. ` +
        'Bundle a model trained on the same classes, in the same order, as the app.',
    );
  }

  let total = 0;
  for (let i = 0; i < scores.length; i += 1) {
    const value = scores[i];
    if (!Number.isFinite(value) || value < 0 || value > 1.0001) {
      throw new ModelOutputMismatchError(
        'The model output is not a probability distribution (was it exported without softmax?).',
      );
    }
    total += value;
  }
  if (Math.abs(total - 1) > 0.05) {
    throw new ModelOutputMismatchError(
      `The model scores sum to ${total.toFixed(3)} instead of 1 (was it exported without softmax?).`,
    );
  }

  const all = labels
    .map((material, index) => ({
      material,
      percentage: Math.round((scores[index] / total) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const significant = all.filter((item) => item.percentage > 0);
  return significant.length > 0 ? significant : all.slice(0, 1);
}
