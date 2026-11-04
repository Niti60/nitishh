import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Milestone = {
  year: string;
  title: string;
  description: string;
  focus: string[];
  exploring?: string[];
};

type Highlight = {
  index: string;
  title: string;
  body: string;
  figure?: string;
};

const MILESTONES: Milestone[] = [
  {
    year: "2022",
    title: "The Foundations",
    description:
      "Started learning HTML, CSS, and JavaScript. Built my first responsive websites and began understanding how the web works, from structure to interaction.",
    focus: ["HTML", "CSS", "JavaScript", "Responsive Design"],
  },
  {
    year: "2023",
    title: "From Interfaces to React",
    description:
      "Moved into React and modern frontend development. Started building reusable components, improving UI quality, and developing a stronger understanding of application architecture.",
    focus: ["React", "JavaScript", "Component Architecture", "UI Development"],
  },
  {
    year: "2024",
    title: "Backend, APIs & Real Projects",
    description:
      "Expanded into backend development with Node.js, Express, and MongoDB. Started working on real-world projects, freelancing, API development, Git, and deployment.",
    focus: ["Node.js", "Express", "MongoDB", "REST APIs", "Git"],
  },
  {
    year: "2025",
    title: "Building with a Team",
    description:
      "Co-founded Admeasy and began building products beyond individual projects. Worked across full-stack development, product systems, dashboards, and backend infrastructure.",
    focus: ["Next.js", "TypeScript", "Supabase", "Redis", "BullMQ", "Docker"],
  },
  {
    year: "2026",
    title: "Deeper into AI & Systems",
    description:
      "Moved deeper into AI engineering and production-grade systems. Exploring AI-powered products while strengthening my understanding of system design, backend architecture, and performance.",
    focus: ["AI Engineering", "LangGraph", "PyTorch", "TensorFlow", "FastAPI", "System Design"],
    exploring: ["PyTorch", "TensorFlow", "FastAPI"],
  },
];

const HIGHLIGHTS: Highlight[] = [
  {
    index: "01",
    title: "Three Startup Attempts",
    body: "Three startup attempts. One taught me how to fail, another showed me what it takes to generate revenue, and each one pushed me to build better. Still building.",
    figure: "03",
  },
  {
    index: "02",
    title: "4,000+ GitHub Contributions",
    body: "A year of consistent building, experimentation, debugging, and iteration. More than just commits — a habit of showing up and improving.",
    figure: "4K+",
  },
  {
    index: "03",
    title: "BCA — IGNOU",
    body: "Pursuing a Bachelor of Computer Applications while learning through real-world product development and engineering.",
    figure: "BCA",
  },
];

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Journey() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeYears, setActiveYears] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const items = section.querySelectorAll<HTMLElement>("[data-journey-reveal]");
    if (prefersReducedMotion()) {
      items.forEach((el) => el.classList.add("is-visible"));
      setActiveYears(new Set(MILESTONES.map((m) => m.year)));
      setProgress(1);
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );

    items.forEach((el) => revealObserver.observe(el));

    const milestoneNodes = section.querySelectorAll<HTMLElement>("[data-journey-year]");
    const activeObserver = new IntersectionObserver(
      (entries) => {
        setActiveYears((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            const year = entry.target.getAttribute("data-journey-year");
            if (!year) return;
            if (entry.isIntersecting) next.add(year);
          });
          return next;
        });
      },
      { rootMargin: "-20% 0px -35% 0px", threshold: 0.35 },
    );

    milestoneNodes.forEach((el) => activeObserver.observe(el));

    const updateProgress = () => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const view = window.innerHeight * 0.65;
      const raw = (view - rect.top) / rect.height;
      setProgress(Math.min(1, Math.max(0, raw)));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      revealObserver.disconnect();
      activeObserver.disconnect();
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <section id="journey" ref={sectionRef} className="journey-section border-y bg-surface" aria-labelledby="journey-heading">
      <div className="page-shell section-space">
        <div className="journey-layout">
          <div className="journey-main">
            <header className="journey-intro" data-journey-reveal>
              <p className="journey-eyebrow">The Journey</p>
              <h2 id="journey-heading" className="journey-title">
                Every year, a new layer.
              </h2>
              <p className="journey-lede">
                From writing my first lines of code to building products and exploring AI systems —
                here&apos;s how the journey has unfolded.
              </p>
            </header>

            <div className="journey-timeline" ref={trackRef} style={{ ["--journey-progress" as string]: progress }}>
              <div className="journey-timeline__rail" aria-hidden>
                <span className="journey-timeline__track" />
                <span className="journey-timeline__fill" />
              </div>

              <ol className="journey-timeline__list">
                {MILESTONES.map((milestone, index) => {
                  const isActive = activeYears.has(milestone.year);
                  return (
                    <li
                      key={milestone.year}
                      className={`journey-item${isActive ? " is-active" : ""}`}
                      data-journey-year={milestone.year}
                      data-journey-reveal
                      style={{ transitionDelay: `${Math.min(index * 60, 240)}ms` }}
                    >
                      <div className="journey-item__meta">
                        <span className="journey-item__year">{milestone.year}</span>
                        <span className="journey-item__node" aria-hidden />
                      </div>
                      <div className="journey-item__body">
                        <h3 className="journey-item__title">{milestone.title}</h3>
                        <p className="journey-item__copy">{milestone.description}</p>
                        <p className="journey-item__focus">
                          <span className="journey-item__focus-label">Focus</span>
                          <span>{milestone.focus.join(" · ")}</span>
                        </p>
                        {milestone.exploring?.length ? (
                          <p className="journey-item__exploring">
                            Currently learning / exploring: {milestone.exploring.join(" · ")}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          <aside className="journey-aside" aria-label="Beyond the milestones">
            <div className="journey-aside__panel" data-journey-reveal>
              <h3 className="journey-aside__heading">Beyond the milestones</h3>

              <ul className="journey-highlights">
                {HIGHLIGHTS.map((item) => (
                  <li key={item.index} className="journey-highlight">
                    <div className="journey-highlight__top">
                      <span className="journey-highlight__index">{item.index}</span>
                      {item.figure ? (
                        <span className="journey-highlight__figure" aria-hidden>
                          {item.figure}
                        </span>
                      ) : null}
                    </div>
                    <h4 className="journey-highlight__title">{item.title}</h4>
                    <p className="journey-highlight__body">{item.body}</p>
                  </li>
                ))}
              </ul>

              <div className="journey-aside__footer">
                <p className="journey-aside__statement">Still building. Still learning. Still curious.</p>
                <Link to="/work" className="journey-aside__cta">
                  Explore my work
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
