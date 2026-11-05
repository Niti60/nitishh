import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useActiveSection } from "../hooks/useActiveSection";
import {
  LINKS,
  NAV_ITEMS,
  SITE,
  consumePendingSection,
  scrollToSection,
  storePendingSection,
  type SectionId,
} from "../lib/site";

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const set = (d: boolean) => {
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
    try {
      localStorage.setItem("theme", d ? "dark" : "light");
    } catch {
      // ignore
    }
  };
  return (
    <div className="theme-pill" role="group" aria-label="Color theme">
      <button
        type="button"
        aria-label="Light theme"
        aria-pressed={!dark}
        onClick={() => set(false)}
      >
        <Sun className="size-3.5" />
      </button>
      <button type="button" aria-label="Dark theme" aria-pressed={dark} onClick={() => set(true)}>
        <Moon className="size-3.5" />
      </button>
    </div>
  );
}

function Ext({
  href,
  children,
  className = "text-link",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (!href) return null;
  return (
    <a href={href} className={className} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const isWorkPage = pathname === "/work";
  const activeSection = useActiveSection(isHome);

  useEffect(() => {
    if (!isHome) return;
    const pending = consumePendingSection();
    if (!pending) return;
    const run = () => scrollToSection(pending, "smooth");
    const t1 = window.setTimeout(run, 50);
    const t2 = window.setTimeout(run, 220);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [isHome, pathname]);

  const isItemActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (isWorkPage) return item.id === "work-page";
    if (!isHome) return false;
    if (item.id === "work-page") return activeSection === "work";
    return activeSection === item.section;
  };

  const onHomeSection = (section: SectionId) => {
    setOpen(false);
    if (isHome) {
      scrollToSection(section);
      return;
    }
    storePendingSection(section);
  };

  return (
    <header className="site-nav">
      <nav
        className="page-shell flex h-16 items-center justify-between gap-6"
        aria-label="Primary navigation"
      >
        <Link
          to="/"
          className="wordmark"
          onClick={() => {
            setOpen(false);
            if (isHome) scrollToSection("top");
            else storePendingSection("top");
          }}
        >
          {SITE.short}
        </Link>

        <div className="hidden items-center gap-5 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item);
            const className = `nav-link ${active ? "active" : ""}`;

            if (item.id === "work-page") {
              return (
                <Link
                  key={item.id}
                  to="/work"
                  className={className}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            }

            if (!isHome && item.section) {
              return (
                <Link
                  key={item.id}
                  to="/"
                  className={className}
                  aria-current={active ? "true" : undefined}
                  onClick={() => onHomeSection(item.section!)}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                className={className}
                aria-current={active ? "true" : undefined}
                onClick={() => item.section && onHomeSection(item.section)}
              >
                {item.label}
              </button>
            );
          })}

          <span className="h-4 w-px bg-border" aria-hidden />
          <Ext
            href={LINKS.resume}
            className="nav-link inline-flex items-center gap-1 text-foreground!"
          >
            Resume
          </Ext>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="icon-btn"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t bg-background md:hidden">
          <ul className="page-shell grid py-4">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item);
              const className = `block w-full border-b py-3 text-left text-sm ${
                active ? "text-foreground" : "text-muted-foreground"
              }`;

              if (item.id === "work-page") {
                return (
                  <li key={item.id}>
                    <Link
                      to="/work"
                      className={className}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }

              if (!isHome && item.section) {
                return (
                  <li key={item.id}>
                    <Link
                      to="/"
                      className={className}
                      aria-current={active ? "true" : undefined}
                      onClick={() => onHomeSection(item.section!)}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={className}
                    aria-current={active ? "true" : undefined}
                    onClick={() => item.section && onHomeSection(item.section)}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
            <li className="flex gap-5 pt-4">
              <Ext href={LINKS.resume}>Resume</Ext>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
