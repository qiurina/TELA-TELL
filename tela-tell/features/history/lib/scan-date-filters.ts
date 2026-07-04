import type { RecentScanPreview } from '@/data/scans/mock-data';

export type ScanDateFilter = 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function parseScanDate(value: string) {
  return startOfDay(new Date(value));
}

function isSameDay(left: Date, right: Date) {
  return startOfDay(left).getTime() === startOfDay(right).getTime();
}

function startOfWeek(date: Date) {
  const next = startOfDay(date);
  const day = next.getDay();
  next.setDate(next.getDate() - day);
  return next;
}

function endOfWeek(date: Date) {
  const next = startOfWeek(date);
  next.setDate(next.getDate() + 6);
  next.setHours(23, 59, 59, 999);
  return next;
}

function isSameMonth(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

export function matchesScanDateFilter(
  scan: RecentScanPreview,
  filter: ScanDateFilter,
  customDate: Date | null,
  referenceDate = new Date(),
) {
  if (filter === 'all') {
    return true;
  }

  const scanDate = parseScanDate(scan.scannedAtDate);
  const today = startOfDay(referenceDate);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  switch (filter) {
    case 'today':
      return isSameDay(scanDate, today);
    case 'yesterday':
      return isSameDay(scanDate, yesterday);
    case 'this_week':
      return scanDate >= startOfWeek(today) && scanDate <= endOfWeek(today);
    case 'this_month':
      return isSameMonth(scanDate, today);
    case 'custom':
      return customDate ? isSameDay(scanDate, customDate) : true;
    default:
      return true;
  }
}

export function filterScansByDate(
  scans: RecentScanPreview[],
  filter: ScanDateFilter,
  customDate: Date | null,
  referenceDate = new Date(),
) {
  return scans.filter((scan) => matchesScanDateFilter(scan, filter, customDate, referenceDate));
}
