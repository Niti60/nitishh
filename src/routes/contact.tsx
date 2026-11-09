import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { ContactSection } from "../components/ContactSection";
import { SiteFooter } from "../components/SiteFooter";
import { SiteNav } from "../components/SiteNav";
import { useReveal } from "../hooks/useReveal";
import { SITE } from "../lib/site";

const TITLE = "Contact Nitish Kumar Yadav | Full Stack Developer & AI Engineer";
const DESC =
  "Get in touch with Nitish Kumar Yadav in New Delhi, India. Discuss full-stack engineering roles, software projects, or AI integrations.";

const CONTACT_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": "https://nitishyadav.com/contact#webpage",
      url: "https://nitishyadav.com/contact",
      name: TITLE,
      description: DESC,
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://nitishyadav.com/#website",
        name: `${SITE.name} — Portfolio`,
        url: "https://nitishyadav.com",
      },
      about: {
        "@type": "Person",
        name: SITE.name,
        url: "https://nitishyadav.com",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://nitishyadav.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Contact",
          item: "https://nitishyadav.com/contact",
        },
      ],
    },
  ],
};

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "author", content: SITE.name },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://nitishyadav.com/contact" },
      { property: "og:image", content: "https://nitishyadav.com/profile.jpg" },
      {
        property: "og:image:alt",
        content: "Nitish Kumar Yadav — Full Stack Developer & AI Engineer",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: "https://nitishyadav.com/profile.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://nitishyadav.com/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(CONTACT_SCHEMA),
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  useReveal();

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="page-shell py-10 md:py-16">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground"
        >
          <Link to="/" className="text-link inline-flex items-center gap-1">
            <ArrowLeft aria-hidden className="size-3" /> Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-foreground" aria-current="page">
            Contact
          </span>
        </nav>

        <ContactSection standalone />
      </main>
      <SiteFooter />
    </div>
  );
}

