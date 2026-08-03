function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function formatScannedAtDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatScanDisplayTime(date: Date, referenceDate = new Date()): string {
  const time = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  const scanDay = startOfDay(date).getTime();
  const today = startOfDay(referenceDate).getTime();
  const dayDiff = Math.round((today - scanDay) / (24 * 60 * 60 * 1000));

  if (dayDiff === 0) {
    return `Today, ${time}`;
  }
  if (dayDiff === 1) {
    return `Yesterday, ${time}`;
  }
  if (dayDiff > 1 && dayDiff < 7) {
    const weekday = date.toLocaleDateString(undefined, { weekday: 'long' });
    return `${weekday}, ${time}`;
  }

  const dateLabel = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== referenceDate.getFullYear() ? 'numeric' : undefined,
  });
  return `${dateLabel}, ${time}`;
}

export function resolveScanDate(
  createdAt?: string | null,
  scannedAtDate?: string | null,
  scannedAt?: string | null,
  scanId?: string | null,
): Date | null {
  if (createdAt) {
    const parsed = Date.parse(createdAt);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed);
    }
  }

  if (scannedAtDate && /^\d{4}-\d{2}-\d{2}$/.test(scannedAtDate)) {
    const [year, month, day] = scannedAtDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const timeMatch = scannedAt?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = Number(timeMatch[1]);
      const minutes = Number(timeMatch[2]);
      const meridiem = timeMatch[3]?.toUpperCase();
      if (meridiem === 'PM' && hours < 12) {
        hours += 12;
      }
      if (meridiem === 'AM' && hours === 12) {
        hours = 0;
      }
      date.setHours(hours, minutes, 0, 0);
    }
    return date;
  }

  if (scanId) {
    const parts = scanId.split('_');
    if (parts[0] === 'scan' && parts[1]) {
      const ms = Number.parseInt(parts[1], 36);
      if (Number.isFinite(ms) && ms > 1_000_000_000_000) {
        return new Date(ms);
      }
    }
  }

  return null;
}
