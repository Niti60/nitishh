import { createFileRoute, Link } from "@tanstack/react-router";

import { ProjectCard } from "../components/ProjectCard";
import { SiteNav } from "../components/SiteNav";
import { PROJECTS, getProjectsByCategory } from "../lib/projects";

const TITLE = "Selected Work — Nitish Kumar Yadav";
const DESC = "Selected work, experiments, and engineering projects by Nitish Kumar Yadav.";
const SELECTED = getProjectsByCategory("selected");

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://nitishyadav.com/work" }],
  }),
  component: WorkPage,
});

function WorkPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="scroll-rule" aria-hidden />
      <SiteNav />
      <main className="page-shell py-10 md:py-16">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground"
        >
          <Link to="/" className="text-link">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Work</span>
        </nav>

        <header className="max-w-4xl">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-accent-strong">
            Selected Work
          </p>
          <h1 className="mt-6 font-serif text-[clamp(2.6rem,6vw,5.2rem)] leading-[0.98] tracking-[-0.03em]">
            Products, experiments and engineering projects I&apos;ve built.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            I build thoughtful product experiences and backend systems with a focus on clarity,
            scale, and real-world utility.
          </p>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {SELECTED.length} projects · {PROJECTS.length} total in portfolio
          </p>
        </header>

        <div className="mt-16 space-y-20 border-t pt-14">
          {SELECTED.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} enhance={false} />
          ))}
        </div>

        <section className="mt-20 border-t pt-10" aria-label="Future collections">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted-foreground">
            Coming later
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Personal Projects", "For Fun", "For Learning"].map((label) => (
              <li
                key={label}
                className="border border-dashed border-border px-4 py-5 text-sm text-muted-foreground"
              >
                {label}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
