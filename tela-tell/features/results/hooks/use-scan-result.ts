import { useCallback, useEffect, useState } from 'react';

import type { ScanResult } from '@/data/scans/mock-data';
import { resolveScanId } from '@/data/scans/mock-data';
import { loadScanResult } from '@/features/results/lib/load-scan-result';

type UseScanResultState = {
  scanId: string;
  result: ScanResult | undefined;
  isLoading: boolean;
  reload: () => Promise<void>;
};

export function useScanResult(rawScanId: string | string[] | undefined): UseScanResultState {
  const scanId = resolveScanId(rawScanId);
  const [result, setResult] = useState<ScanResult | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    const loaded = await loadScanResult(scanId);
    setResult(loaded);
  }, [scanId]);

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    void (async () => {
      const loaded = await loadScanResult(scanId);
      if (!active) {
        return;
      }
      setResult(loaded);
      setIsLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [scanId]);

  return { scanId, result, isLoading, reload };
}
