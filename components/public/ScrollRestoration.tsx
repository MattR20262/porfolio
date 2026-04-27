"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Disables browser scroll restoration and scrolls to top on every route change.
 * Without this, browsers may restore the previous scroll position, pushing
 * hero content off-screen.
 */
export default function ScrollRestoration() {
  const pathname = usePathname();

  // Disable browser scroll restoration once on mount
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
