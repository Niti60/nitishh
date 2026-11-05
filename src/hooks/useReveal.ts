import { useEffect } from "react";

/**
 * Progressive enhancement: content stays visible by default.
 * When this hook runs, it opts into reveal animation via `data-reveal="on"`.
 */
export function useReveal(root?: HTMLElement | null) {
  useEffect(() => {
    const scope = root ?? document;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    document.documentElement.setAttribute("data-reveal", "on");

    const els = Array.from(scope.querySelectorAll<HTMLElement>(".reveal"));
    if (!els.length) return;

    const reveal = (el: Element) => el.classList.add("is-visible");

    // Reveal anything already in (or near) the viewport immediately.
    const vh = window.innerHeight;
    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.92 && rect.bottom > 0) reveal(el);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );

    els.forEach((el) => {
      if (!el.classList.contains("is-visible")) io.observe(el);
    });

    // Safety net: never leave content invisible.
    const failSafe = window.setTimeout(() => {
      els.forEach(reveal);
    }, 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(failSafe);
    };
  }, [root]);
}
