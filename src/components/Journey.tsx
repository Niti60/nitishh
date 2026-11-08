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
    title: "Web Fundamentals",
    description:
      "Started with HTML, CSS, and modern JavaScript. Built responsive websites and developed an appreciation for browser fundamentals, accessibility, and semantic markup.",
    focus: ["HTML5", "CSS3", "JavaScript", "Responsive Design"],
  },
  {
    year: "2023",
    title: "React & Modern Frontend",
    description:
      "Shifted focus to React and the modern frontend ecosystem. Built modular UI components, managed client state, and learned how to build fluid user interfaces.",
    focus: ["React", "TypeScript", "Tailwind CSS", "UI Systems"],
  },
  {
    year: "2024",
    title: "Backend, APIs & Databases",
    description:
      "Expanded into backend development with Node.js, Express, and MongoDB. Designed REST APIs, implemented JWT authentication, and worked on real-world freelance client deliveries.",
    focus: ["Node.js", "Express", "MongoDB", "REST APIs", "Git"],
  },
  {
    year: "2025",
    title: "Production Systems at Scale",
    description:
      "Joined Admeasy to architect admissions and student management software. Built full-stack workflows with Next.js, added Redis caching and BullMQ queues, and shipped mobile apps.",
    focus: ["Next.js", "Redis", "BullMQ", "Capacitor", "React Native", "Docker"],
  },
  {
    year: "2026",
    title: "AI Engineering & Architecture",
    description:
      "Developing practical AI-powered software with FastAPI, Gemini API, and LangGraph while deepening system design, database indexing, and backend performance.",
    focus: ["AI Engineering", "Python", "FastAPI", "Gemini API", "System Design"],
    exploring: ["PyTorch", "TensorFlow", "FastAPI"],
  },
];

const HIGHLIGHTS: Highlight[] = [
  {
    index: "01",
    title: "Practical Startup Experience",
    body: "Working on early-stage products taught me how to balance speed with maintainability, handle production bugs under pressure, and ship working features that users rely on.",
    figure: "03",
  },
  {
    index: "02",
    title: "4,000+ GitHub Contributions",
    body: "A continuous year of writing code, building APIs, fixing edge cases, and pushing production commits.",
    figure: "4K+",
  },
  {
    index: "03",
    title: "BCA — IGNOU",
    body: "Pursuing a Bachelor of Computer Applications while working as an active full-stack software engineer in New Delhi.",
    figure: "BCA",
  },
];

export function Journey() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeYear, setActiveYear] = useState<string | null>(MILESTONES[0]?.year ?? null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const revealNodes = section.querySelectorAll<HTMLElement>(".journey-enhance");
    const revealNode = (el: HTMLElement) => {
      el.classList.add("is-visible");
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      revealNodes.forEach(revealNode);
      setProgress(1);
      setActiveYear(MILESTONES[MILESTONES.length - 1]?.year ?? null);
      return;
    }

    revealNodes.forEach(revealNode);

    const milestoneNodes = section.querySelectorAll<HTMLElement>("[data-journey-year]");
    const activeObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        const year = visible?.target.getAttribute("data-journey-year");
        if (year) setActiveYear(year);
      },
      { rootMargin: "-30% 0px -45% 0px", threshold: [0.2, 0.4, 0.6] },
    );
    milestoneNodes.forEach((el) => activeObserver.observe(el));

    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const view = window.innerHeight * 0.62;
      const raw = (view - rect.top) / Math.max(rect.height, 1);
      setProgress(Math.min(1, Math.max(0, raw)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const failSafe = window.setTimeout(() => {
      revealNodes.forEach(revealNode);
    }, 2500);

    return () => {
      activeObserver.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(failSafe);
    };
  }, []);

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="journey-section border-y bg-surface"
      aria-labelledby="journey-heading"
    >
      <div className="page-shell section-space">
        <div className="journey-layout">
          <div className="journey-main">
            <header className="journey-intro journey-enhance">
              <p className="journey-eyebrow">The Journey</p>
              <h2 id="journey-heading" className="journey-title">
                Every year, a new layer.
              </h2>
              <p className="journey-lede">
                From writing my first lines of code to building products and exploring AI systems —
                here&apos;s how the journey has unfolded.
              </p>
            </header>

            <div
              className="journey-timeline"
              ref={trackRef}
              style={{ ["--journey-progress" as string]: String(progress) }}
            >
              <div className="journey-timeline__rail" aria-hidden>
                <span className="journey-timeline__track" />
                <span className="journey-timeline__fill" />
              </div>

              <ol className="journey-timeline__list">
                {MILESTONES.map((milestone) => {
                  const isActive = activeYear === milestone.year;
                  return (
                    <li
                      key={milestone.year}
                      className={`journey-item journey-enhance${isActive ? " is-active" : ""}`}
                      data-journey-year={milestone.year}
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
            <div className="journey-aside__panel journey-enhance">
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
                <p className="journey-aside__statement">
                  Still building. Still learning. Still curious.
                </p>
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
