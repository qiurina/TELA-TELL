export type ImportReport = {
  imported: number;
  total: number;
  missingPhotoIds: string[];
};

export function importSummary(report: ImportReport): string {
  const count = report.imported;
  const saved = `Imported ${count} scan${count === 1 ? '' : 's'}.`;
  const missing = report.missingPhotoIds.length;
  return missing
    ? `${saved} ${missing} backup photo${missing === 1 ? '' : 's'} could not be restored. Import the file again to retry those photos.`
    : saved;
}

export class ImportScansError extends Error {
  constructor(public readonly report: ImportReport) {
    super(`Imported ${report.imported} of ${report.total} scans before saving failed. The saved scans were kept. Import the file again to retry.${report.missingPhotoIds.length ? ` ${report.missingPhotoIds.length} backup photos also could not be restored.` : ''}`);
    this.name = 'ImportScansError';
  }
}
