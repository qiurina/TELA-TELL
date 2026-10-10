import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { SCAN_PAGE_SIZE, type ScanPage } from '@/db/scans';

const EMPTY_PAGE: ScanPage = {
  items: [],
  total: 0,
  page: 1,
  pageSize: SCAN_PAGE_SIZE,
  totalPages: 1,
};

/**
 * Loads one page of scans at a time and re-fetches whenever the screen gains focus.
 *
 * `fetchPage` must be memoized (useCallback) on whatever filters it closes over, and `resetKey`
 * must change whenever those filters change -- that sends the list back to page 1. Responses that
 * arrive after a newer request was started are ignored, so fast typing or paging can't show
 * stale results.
 */
export function useScanPages(fetchPage: (page: number) => Promise<ScanPage>, resetKey: string) {
  const [data, setData] = useState<ScanPage>(EMPTY_PAGE);
  const [pageState, setPageState] = useState({ key: resetKey, page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const latestRequest = useRef(0);

  const page = pageState.key === resetKey ? pageState.page : 1;

  const load = useCallback(
    async (targetPage: number) => {
      const requestId = ++latestRequest.current;
      setLoading(true);
      setError(false);
      try {
        const result = await fetchPage(targetPage);
        if (requestId !== latestRequest.current) {
          return;
        }
        setData(result);
        // The query clamps the page (e.g. the last item on the last page was just deleted).
        if (result.page !== targetPage) {
          setPageState({ key: resetKey, page: result.page });
        }
      } catch (loadError) {
        if (requestId !== latestRequest.current) {
          return;
        }
        console.error('[TELA-TELL] Failed to load scans:', loadError);
        setError(true);
      } finally {
        if (requestId === latestRequest.current) {
          setLoading(false);
        }
      }
    },
    [fetchPage, resetKey],
  );

  useFocusEffect(
    useCallback(() => {
      void load(page);
    }, [load, page]),
  );

  const goToPage = useCallback(
    (nextPage: number) => {
      setPageState({ key: resetKey, page: Math.min(Math.max(1, nextPage), data.totalPages) });
    },
    [data.totalPages, resetKey],
  );

  const reload = useCallback(() => load(page), [load, page]);

  return {
    items: data.items,
    total: data.total,
    totalPages: data.totalPages,
    page,
    loading,
    error,
    goToPage,
    reload,
  };
}
