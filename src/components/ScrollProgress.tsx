import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { calculateScrollProgress } from "../lib/scroll-progress";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    let rafId: number | null = null;
    let isTicking = false;

    const update = () => {
      isTicking = false;
      if (!barRef.current) return;

      const doc = document.documentElement;
      const body = document.body;

      const scrollTop = window.scrollY || doc.scrollTop || (body ? body.scrollTop : 0) || 0;
      const scrollHeight = Math.max(
        doc.scrollHeight,
        doc.offsetHeight,
        doc.clientHeight,
        body ? body.scrollHeight : 0,
        body ? body.offsetHeight : 0,
      );
      const clientHeight = window.innerHeight || doc.clientHeight || 0;

      const progress = calculateScrollProgress(scrollTop, scrollHeight, clientHeight);
      barRef.current.style.transform = `scaleX(${progress / 100})`;
    };

    const handleScrollOrResize = () => {
      if (!isTicking) {
        isTicking = true;
        rafId = window.requestAnimationFrame(update);
      }
    };

    // Calculate immediately on mount and route changes
    update();

    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    // Observe document body height changes for dynamically loaded content
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && document.body) {
      resizeObserver = new ResizeObserver(() => {
        handleScrollOrResize();
      });
      resizeObserver.observe(document.body);
    }

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [pathname]);

  return <div ref={barRef} className="scroll-rule" aria-hidden="true" />;
}
