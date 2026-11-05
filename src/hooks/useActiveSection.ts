import { useEffect, useState } from "react";

import { NAV_OFFSET, SECTION_IDS, type SectionId } from "../lib/site";

export function useActiveSection(enabled = true) {
  const [active, setActive] = useState<SectionId>("top");

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
        (el): el is HTMLElement => Boolean(el),
      );
      if (!sections.length) return;

      const scrollY = window.scrollY;
      const viewportBottom = scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollY < 48) {
        setActive("top");
        return;
      }

      if (viewportBottom >= docHeight - 48) {
        setActive(sections[sections.length - 1].id as SectionId);
        return;
      }

      const probe = scrollY + NAV_OFFSET + Math.min(120, window.innerHeight * 0.18);
      let current: SectionId = "top";

      for (const section of sections) {
        if (section.offsetTop <= probe) {
          current = section.id as SectionId;
        }
      }

      setActive(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled]);

  return active;
}
