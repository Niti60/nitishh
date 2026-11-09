import { Link } from "@tanstack/react-router";
import { LINKS, SITE } from "../lib/site";

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
  const external = href.startsWith("http") || href.endsWith(".pdf");
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="page-shell flex flex-col gap-4 border-t py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
      <div>
        <p>© 2026 {SITE.name}</p>
        <p className="mt-1 font-mono text-xs">{SITE.role} · New Delhi, India</p>
      </div>
      <div className="flex flex-wrap gap-5">
        <Ext href={LINKS.social.github}>GitHub</Ext>
        <Ext href={LINKS.social.linkedin}>LinkedIn</Ext>
        <Link to="/contact" className="text-link">
          Contact
        </Link>
        <Ext href={LINKS.resume}>Resume</Ext>
      </div>
    </footer>
  );
}

