"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type BreadcrumbLabels = Record<string, string>;

interface BreadcrumbContextValue {
  labels: BreadcrumbLabels;
  setLabel: (href: string, label: string) => void;
  clearLabel: (href: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

function normalizeHref(href: string) {
  if (!href || href === "/") return "/";
  return href.endsWith("/") ? href.slice(0, -1) : href;
}

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [labels, setLabels] = useState<BreadcrumbLabels>({});

  const setLabel = useCallback((href: string, label: string) => {
    const normalizedHref = normalizeHref(href);
    setLabels((prev) => ({ ...prev, [normalizedHref]: label }));
  }, []);

  const clearLabel = useCallback((href: string) => {
    const normalizedHref = normalizeHref(href);
    setLabels((prev) => {
      const next = { ...prev };
      delete next[normalizedHref];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ labels, setLabel, clearLabel }),
    [clearLabel, labels, setLabel]
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbLabels() {
  return useContext(BreadcrumbContext)?.labels ?? {};
}

export function useBreadcrumbLabel(href: string, label: string | null | undefined) {
  const context = useContext(BreadcrumbContext);
  const setLabel = context?.setLabel;
  const clearLabel = context?.clearLabel;

  useEffect(() => {
    if (!setLabel || !clearLabel || !label?.trim()) return;

    setLabel(href, label.trim());
    return () => clearLabel(href);
  }, [clearLabel, href, label, setLabel]);
}
