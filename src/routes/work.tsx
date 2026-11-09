import { createFileRoute, Link } from "@tanstack/react-router";

import { ProjectCard } from "../components/ProjectCard";
import { SiteFooter } from "../components/SiteFooter";
import { SiteNav } from "../components/SiteNav";
import { PROJECTS, getProjectsByCategory } from "../lib/projects";
import { SITE } from "../lib/site";

const TITLE = "Selected Work & Projects | Nitish Kumar Yadav — Full Stack Developer";
const DESC =
  "Explore production web applications, SaaS platforms, and AI systems built by Nitish Kumar Yadav using React, Next.js, Node.js, FastAPI, and MongoDB.";
const SELECTED = getProjectsByCategory("selected");

const WORK_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://nitishyadav.com/work#webpage",
      url: "https://nitishyadav.com/work",
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
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: SELECTED.length,
        itemListElement: SELECTED.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "SoftwareApplication",
            name: project.name,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: project.live || "https://nitishyadav.com/work",
            description: project.summary,
            author: {
              "@type": "Person",
              name: SITE.name,
            },
          },
        })),
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
          name: "Work",
          item: "https://nitishyadav.com/work",
        },
      ],
    },
  ],
};

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "author", content: SITE.name },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://nitishyadav.com/work" },
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
    links: [{ rel: "canonical", href: "https://nitishyadav.com/work" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(WORK_SCHEMA),
      },
    ],
  }),
  component: WorkPage,
});

function WorkPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="page-shell py-10 md:py-16">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground"
        >
          <Link to="/" className="text-link">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-foreground" aria-current="page">
            Work
          </span>
        </nav>

        <header className="max-w-4xl">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-accent-strong">
            Engineering Portfolio
          </p>
          <h1 className="mt-6 font-serif text-[clamp(2.6rem,6vw,5.2rem)] leading-[0.98] tracking-[-0.03em]">
            Production software and engineering projects.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            A breakdown of full-stack web applications, backend APIs, and AI integrations I&apos;ve
            built — covering the problem solved, technical implementation, and core features.
          </p>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {SELECTED.length} featured projects · {PROJECTS.length} active in portfolio
          </p>
        </header>

        <div className="mt-16 space-y-20 border-t pt-14">
          {SELECTED.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} enhance={false} />
          ))}
        </div>

        <section className="mt-20 border-t pt-10" aria-label="Future project areas">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted-foreground">
            Upcoming Areas
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            <li className="border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">SaaS Tools</span>
              <p className="mt-1 text-xs">Self-contained productivity and developer utilities.</p>
            </li>
            <li className="border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">AI Workflows</span>
              <p className="mt-1 text-xs">
                Autonomous routing pipelines with LangGraph and FastAPI.
              </p>
            </li>
            <li className="border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Systems Architecture</span>
              <p className="mt-1 text-xs">
                Experiments in database indexing, caching, and rate limiting.
              </p>
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
