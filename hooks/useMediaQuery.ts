"use client";

import { useEffect, useState } from "react";

// SSR-safe media query hook. Starts false on the server / first paint, then
// syncs to the real match on mount and on viewport changes.
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [query]);

  return matches;
}
