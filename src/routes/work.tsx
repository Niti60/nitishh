import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { ProjectPreviewModal } from "../components/ProjectPreviewModal";
import { PROJECT_CATEGORIES, PROJECTS, getProjectsByCategory, type Project } from "../lib/projects";

const TITLE = "Selected Work — Nitish Kumar Yadav";
const DESC = "Selected work, experiments, and engineering projects by Nitish Kumar Yadav.";

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
    <>
      <WorkShell />
    </>
  );
}

function WorkShell() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="page-shell py-10 md:py-16">
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
          <Link to="/" className="text-link">Home</Link>
          <span>/</span>
          <span className="text-foreground">Work</span>
        </nav>

        <header className="max-w-4xl">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
            Selected Work
          </p>
          <h1 className="mt-6 font-serif text-[clamp(3rem,7vw,6rem)] leading-none tracking-[-0.04em]">
            Products, experiments and engineering projects I’ve built.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            I build thoughtful product experiences and backend systems with a focus on clarity, scale,
            and real-world utility.
          </p>
        </header>

        <div className="mt-12 flex flex-wrap gap-3 border-y py-4">
          {PROJECT_CATEGORIES.map((category) => (
            <a
              key={category.value}
              href={`#${category.value}`}
              className="rounded-full border border-border px-3 py-1.5 font-mono text-[0.63rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {category.label}
            </a>
          ))}
        </div>

        <div className="mt-16 space-y-24">
          {PROJECT_CATEGORIES.map((category) => {
            const projects = getProjectsByCategory(category.value);
            if (!projects.length) return null;

            return (
              <section key={category.value} id={category.value} className="space-y-8">
                <div className="flex items-end justify-between gap-3 border-b pb-4">
                  <div>
                    <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted-foreground">
                      {category.label}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{category.blurb}</p>
                  </div>
                </div>
                <div className="grid gap-8 lg:grid-cols-1">
                  {projects.map((project) => (
                    <ProjectBlock key={project.id} project={project} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="site-nav">
      <nav className="page-shell flex h-16 items-center justify-between gap-6" aria-label="Primary navigation">
        <Link to="/" className="wordmark">
          Nitish Yadav
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/work" className="nav-link active">Work</Link>
          <a href="/#engineering" className="nav-link">Engineering</a>
          <a href="/#experience" className="nav-link">Experience</a>
          <a href="/#journey" className="nav-link">Journey</a>
          <a href="/#about" className="nav-link">About</a>
          <a href="/Nitish-Kumar-Yadav-Resume.pdf" className="nav-link inline-flex items-center gap-1">
            Resume <ArrowRight aria-hidden className="size-3.5" />
          </a>
        </div>
        <div className="flex items-center gap-3 md:hidden">
          <Link to="/" className="nav-link text-xs">Home</Link>
          <Link to="/work" className="nav-link active text-xs">Work</Link>
        </div>
      </nav>
    </header>
  );
}

function ProjectBlock({ project }: { project: Project }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <article className="project reveal grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <ProjectPreview project={project} onOpen={() => setIsOpen(true)} />
      </div>
      <div className="lg:col-span-5">
        <p className="font-mono text-xs text-muted-foreground">
          {project.category}
          {project.status && (
            <span className="ml-2 rounded-full border px-2 py-0.5 text-accent-strong">
              {project.status}
            </span>
          )}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">{project.name}</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">{project.summary}</p>
        <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs">
          {project.tech.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          <button type="button" className="text-link" onClick={() => setIsOpen(true)}>
            Case study
          </button>
          {project.live && <a href={project.live} target="_blank" rel="noreferrer" className="text-link">Live demo</a>}
          {project.github && <a href={project.github} target="_blank" rel="noreferrer" className="text-link">GitHub</a>}
        </div>
      </div>

      <ProjectPreviewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        projectName={project.name}
        projectCategory={project.category}
        projectUrl={project.browserDomain}
        imageSrc={project.cover ?? ""}
      />
    </article>
  );
}

function ProjectPreview({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <>
      <button
        type="button"
        className="project-preview project-preview--trigger"
        aria-label={`Open ${project.name} project preview`}
        onClick={onOpen}
      >
        <span className="project-preview__window">
          <span className="project-preview__header" aria-hidden="true">
            <span className="project-preview__dots">
              <span />
              <span />
              <span />
            </span>
            <span className="project-preview__url">{project.browserDomain}</span>
          </span>
          <span className="project-preview__viewport" aria-hidden="true">
            <img
              src={project.cover}
              alt={`${project.name} long-form project screenshot`}
              className="project-preview__image"
            />
          </span>
          <span className="project-preview__indicator" aria-hidden="true">
            Click to explore
          </span>
        </span>
      </button>
    </>
  );
}
