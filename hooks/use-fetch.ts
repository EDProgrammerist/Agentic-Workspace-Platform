"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

// Thin wrapper around a Server Action for client-triggered mutations (button clicks, form
// submits) — loading state plus an automatic error toast, without a full caching
// library. Doesn't cover streaming (agent/canvas state stays on the AI SDK's own hooks).
export function useFetch<T, Args extends unknown[]>(cb: (...args: Args) => Promise<T>) {
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);

  const fn = async (...args: Args) => {
    // State updates are asynchronous: a ref also blocks two submissions in the same render.
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);

    try {
      return await cb(...args);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  };

  return { loading, fn };
}
