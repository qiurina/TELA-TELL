import { getScanDateRange } from '@/features/history/lib/scan-date-filters';

// Wednesday, 2026-10-14, 15:30 local time.
const NOW = new Date(2026, 9, 14, 15, 30);
const local = (year: number, monthIndex: number, day: number) => new Date(year, monthIndex, day).toISOString();

describe('getScanDateRange', () => {
  it('does not restrict "all" or a custom filter with no date picked', () => {
    expect(getScanDateRange('all', null, NOW)).toBeNull();
    expect(getScanDateRange('custom', null, NOW)).toBeNull();
  });

  it('covers today as local midnight to the next local midnight', () => {
    expect(getScanDateRange('today', null, NOW)).toEqual({
      from: local(2026, 9, 14),
      to: local(2026, 9, 15),
    });
  });

  it('covers yesterday', () => {
    expect(getScanDateRange('yesterday', null, NOW)).toEqual({
      from: local(2026, 9, 13),
      to: local(2026, 9, 14),
    });
  });

  it('covers this week Monday to the following Monday', () => {
    expect(getScanDateRange('this_week', null, NOW)).toEqual({
      from: local(2026, 9, 12),
      to: local(2026, 9, 19),
    });
  });

  it('treats Sunday as the last day of the Monday-based week', () => {
    const sunday = new Date(2026, 9, 18, 9, 0);
    expect(getScanDateRange('this_week', null, sunday)).toEqual({
      from: local(2026, 9, 12),
      to: local(2026, 9, 19),
    });
  });

  it('covers this month, including rolling over the year', () => {
    expect(getScanDateRange('this_month', null, NOW)).toEqual({
      from: local(2026, 9, 1),
      to: local(2026, 10, 1),
    });
    expect(getScanDateRange('this_month', null, new Date(2026, 11, 20))).toEqual({
      from: local(2026, 11, 1),
      to: local(2027, 0, 1),
    });
  });

  it('covers a single picked day, ignoring its time of day', () => {
    expect(getScanDateRange('custom', new Date(2026, 8, 3, 23, 59), NOW)).toEqual({
      from: local(2026, 8, 3),
      to: local(2026, 8, 4),
    });
  });
});
