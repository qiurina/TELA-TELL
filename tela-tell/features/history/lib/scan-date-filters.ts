export type ScanDateFilter = 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

export type ScanDateRange = { from: string; to: string };

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const mondayBased = day === 0 ? 6 : day - 1;
  return addDays(startOfDay(date), -mondayBased);
}

/**
 * Converts a History date filter into a half-open [from, to) range of ISO timestamps (local day
 * boundaries) that can be compared against tblScan.createdAt in SQL. Returns null when the
 * filter doesn't restrict by date.
 */
export function getScanDateRange(
  filter: ScanDateFilter,
  customDate: Date | null,
  referenceDate = new Date(),
): ScanDateRange | null {
  const today = startOfDay(referenceDate);

  switch (filter) {
    case 'today':
      return toRange(today, addDays(today, 1));
    case 'yesterday':
      return toRange(addDays(today, -1), today);
    case 'this_week': {
      const start = startOfWeek(today);
      return toRange(start, addDays(start, 7));
    }
    case 'this_month':
      return toRange(
        new Date(today.getFullYear(), today.getMonth(), 1),
        new Date(today.getFullYear(), today.getMonth() + 1, 1),
      );
    case 'custom': {
      if (!customDate) {
        return null;
      }
      const start = startOfDay(customDate);
      return toRange(start, addDays(start, 1));
    }
    default:
      return null;
  }
}

function toRange(from: Date, to: Date): ScanDateRange {
  return { from: from.toISOString(), to: to.toISOString() };
}
