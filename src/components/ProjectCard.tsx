import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";

import { ProjectBrowserPreview } from "./ProjectBrowserPreview";
import { ProjectPreviewModal } from "./ProjectPreviewModal";
import type { Project } from "../lib/projects";

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  if (!href) return null;
  return (
    <a href={href} className="text-link" target="_blank" rel="noreferrer">
      {children}
      <ArrowUpRight aria-hidden className="size-3.5" />
    </a>
  );
}

function ProjectCover({ project }: { project: Project }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  if (!project.cover) {
    return (
      <div className="project-cover bg-muted">
        <div className="grid h-full place-items-center">
          <div className="text-center">
            <p className="font-serif text-4xl">{project.name}</p>
            <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
              Screenshot coming
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProjectBrowserPreview
        project={project}
        onOpen={() => setIsExpanded(true)}
        className="project-cover"
        triggerRef={triggerRef}
      />

      <ProjectPreviewModal
        isOpen={isExpanded}
        onClose={() => {
          setIsExpanded(false);
          triggerRef.current?.focus();
        }}
        projectName={project.name}
        projectCategory={project.category}
        projectUrl={project.browserDomain}
        imageSrc={project.cover}
      />
    </>
  );
}

type ProjectCardProps = {
  project: Project;
  index: number;
  enhance?: boolean;
};

export function ProjectCard({ project, index, enhance = true }: ProjectCardProps) {
  const [open, setOpen] = useState(false);
  const n = String(index + 1).padStart(2, "0");

  return (
    <article className={`project grid gap-8 lg:grid-cols-12${enhance ? " reveal" : ""}`}>
      <div className="lg:col-span-7">
        <ProjectCover project={project} />
      </div>
      <div className="lg:col-span-5">
        <p className="font-mono text-xs text-muted-foreground">
          {n} · selected
          {project.status ? (
            <span className="ml-2 rounded-full border px-2 py-0.5 text-accent-strong">
              {project.status}
            </span>
          ) : null}
        </p>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight">{project.name}</h3>
        <p className="mt-4 leading-relaxed text-muted-foreground">{project.summary}</p>
        <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
          {project.tech.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          <button
            type="button"
            className="text-link"
            aria-expanded={open}
            aria-controls={`${project.id}-details`}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Hide details" : "Case study"}
            <ChevronDown
              aria-hidden
              className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
          <Ext href={project.live ?? ""}>Live demo</Ext>
          <Ext href={project.github ?? ""}>GitHub</Ext>
        </div>
      </div>
      {open ? (
        <div
          id={`${project.id}-details`}
          className="case-panel grid gap-8 border-t pt-8 md:grid-cols-3 lg:col-span-12"
        >
          <div>
            <p className="section-kicker">Overview</p>
            <p className="mt-3 text-sm leading-relaxed">{project.summary}</p>
          </div>
          <div>
            <p className="section-kicker">Technical implementation</p>
            <ul className="mt-3 grid gap-3 text-sm leading-relaxed">
              {project.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="section-kicker">Key functionality</p>
            <ul className="mt-3 grid gap-2 text-sm">
              {project.features.map((f) => (
                <li key={f} className="border-b pb-2">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </article>
  );
}
