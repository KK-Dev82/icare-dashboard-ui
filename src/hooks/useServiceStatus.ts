"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/api/dashboard";
import type { ServiceStatus } from "@/types/dashboard";

const POLL_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Polls service status every 5 minutes while the tab is visible.
 * When the tab becomes visible again, it fetches right away only if the
 * last fetch is older than the interval; otherwise it waits out the rest.
 */
export function useServiceStatus(enabled: boolean) {
  const [services, setServices] = useState<ServiceStatus[] | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let timer: number | undefined;
    let lastFetchedAt = 0;
    let inFlight = false;
    let cancelled = false;

    function schedule(delay: number) {
      window.clearTimeout(timer);
      timer = window.setTimeout(poll, delay);
    }

    async function poll() {
      if (inFlight || document.visibilityState === "hidden") return;

      inFlight = true;
      lastFetchedAt = Date.now();
      try {
        const data = await dashboardApi.getServiceStatus();
        if (!cancelled) setServices(data.services);
      } catch {
        // Keep the last known status and try again on the next cycle.
      } finally {
        inFlight = false;
        if (!cancelled && document.visibilityState === "visible") {
          schedule(POLL_INTERVAL_MS);
        }
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        window.clearTimeout(timer);
        return;
      }
      if (inFlight) return;
      schedule(Math.max(0, lastFetchedAt + POLL_INTERVAL_MS - Date.now()));
    }

    poll();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled]);

  return services;
}
