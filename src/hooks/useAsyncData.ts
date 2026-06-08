"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseAsyncDataOptions {
  keepPreviousData?: boolean;
}

interface UseAsyncDataResult<T> {
  data: T | undefined;
  loading: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
  hasLoadedOnce: boolean;
  isStale: boolean;
}

export function useAsyncData<T>(
  queryFn: () => Promise<T>,
  options: UseAsyncDataOptions = {}
): UseAsyncDataResult<T> {
  const keepPreviousData = options.keepPreviousData ?? true;
  const keepPreviousDataRef = useRef(keepPreviousData);

  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const queryFnRef = useRef(queryFn);

  useEffect(() => {
    keepPreviousDataRef.current = keepPreviousData;
    queryFnRef.current = queryFn;
  }, [keepPreviousData, queryFn]);

  const refetch = useCallback((): Promise<void> => {
    setLoading(true);
    setErrorMessage(null);
    return queryFnRef
      .current()
      .then((result) => {
        setData(result);
        setHasLoadedOnce(true);
      })
      .catch((err) => {
        if (!keepPreviousDataRef.current) setData(undefined);
        setErrorMessage(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    data,
    loading,
    errorMessage,
    refetch,
    hasLoadedOnce,
    isStale: hasLoadedOnce && errorMessage !== null,
  };
}
