import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Journey } from "../components/Journey";
import { ProjectPreviewModal } from "../components/ProjectPreviewModal";
import { PROJECTS, type Project } from "../lib/projects";

const SITE = {
  name: "Nitish Kumar Yadav",
  short: "Nitish Yadav",
  role: "Full Stack Developer · AI Engineer",
  location: "New Delhi, India",
  email: "hi@nitishyadav.com",
  phone: "+91 96255 32559",
  website: "nitishyadav.com",
  status: "Currently: Full Stack Developer @ Admeasy",
  profileImage: "/profile.jpg",
};

const LINKS = {
  resume: "/Nitish-Kumar-Yadav-Resume.pdf",
  social: {
    github: "",
    linkedin: "",
  },
  projects: {
    admeasy: { github: "", live: "" },
    "admeasy-ai": { github: "", live: "" },
    mohinder: { github: "", live: "" },
  },
};

const FEATURED_PROJECTS = PROJECTS.filter((project) => project.category === "selected").slice(0, 3);
const HOMEPAGE_NAV = [["top", "Home"], ["work", "Work"], ["engineering", "Engineering"], ["experience", "Experience"], ["journey", "Journey"], ["about", "About"]] as const;

const ENGINEERING = [
  {
    n: "01",
    title: "Full Stack Development",
    summary:
      "Production-grade web applications, SaaS products, and user-facing systems built for speed, clarity, and real-world use.",
    items: ["React", "Next.js", "TypeScript", "Node.js", "Express", "REST APIs"],
  },
  {
    n: "02",
    title: "Backend & Architecture",
    summary:
      "Designing secure, maintainable systems with the right trade-offs between performance, scale, and developer velocity.",
    items: [
      "API design",
      "Authentication & authorization",
      "MongoDB",
      "SQL",
      "Redis",
      "BullMQ",
      "Database design",
    ],
  },
  {
    n: "03",
    title: "AI Engineering",
    summary:
      "Building AI-powered experiences and integrations that turn product ideas into usable workflows and intelligent features.",
    items: [
      "Python",
      "FastAPI",
      "PyTorch",
      "TensorFlow",
      "Gemini API",
      "AI integrations",
      "AI-powered products",
    ],
  },
  {
    n: "04",
    title: "Infrastructure & Performance",
    summary:
      "Optimizing deployments, caching flows, background jobs, and application performance across the full stack.",
    items: [
      "Docker",
      "CI/CD",
      "GitHub Actions",
      "Caching",
      "Background jobs",
      "Deployment",
      "Performance optimization",
    ],
  },
  {
    n: "05",
    title: "Engineering Focus",
    summary:
      "I care most about backend architecture, scalable system design, performance engineering, and shipping reliable software.",
    items: [
      "System Design",
      "Backend Architecture",
      "Performance Engineering",
      "Data Structures & Algorithms",
      "AI-powered Products",
    ],
  },
] as const;

const EXPERIENCE = [
  {
    company: "Admeasy Admission Solutions Pvt. Ltd.",
    role: "Full Stack Developer",
    period: "Mar 2026 – Present",
    current: true,
    points: [
      "Architected and developed scalable full-stack applications using React.js, Node.js, Express, and MongoDB with secure authentication and optimized APIs.",
      "Integrated Redis caching, BullMQ background jobs, and CI/CD pipelines using GitHub Actions to improve performance and deployment efficiency.",
      "Delivered **50+ responsive UI/UX pages** focused on clean design, scalability, and user experience.",
      "Independently developed and deployed mobile applications using Capacitor and Android Studio on the Google Play Store.",
    ],
  },
  {
    company: "Rishiwar Industries Pvt. Ltd.",
    role: "Full Stack Developer Intern — Paid Internship (₹11,000/month)",
    period: "Nov 2025 – Feb 2026",
    points: [
      "Architected and developed scalable Order Management and Authentication APIs, ensuring high performance and security.",
      "Built a real-time Admin Verification Dashboard for efficient applicant review, approval workflows, and operational oversight.",
      "Developed **2 mobile applications** using React Native and Android Studio, extending core platform functionality to mobile users.",
      "Consistently delivered features ahead of deadlines by leveraging AI tools to boost development speed and code quality.",
    ],
  },
  {
    company: "Hindustan Soft Education Ltd.",
    role: "Web Developer Intern — Non-Monetary",
    period: "Sep 2025 – Oct 2025",
    points: [
      "Assisted in maintaining and debugging web applications by resolving UI and functional issues.",
      "Collaborated with the team to fix frontend and backend bugs.",
      "Improved overall system stability, performance, and code quality.",
    ],
  },
];

const TITLE = "Nitish Kumar Yadav — Full Stack Developer & AI Engineer";
const DESC =
  "Full Stack Developer and AI Engineer building scalable web applications, SaaS platforms, APIs, mobile applications and AI-powered products.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: "https://nitishyadav.com" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: "https://nitishyadav.com" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: SITE.name,
          jobTitle: "Full Stack Developer & AI Engineer",
          email: `mailto:${SITE.email}`,
          url: "https://nitishyadav.com",
          address: { "@type": "PostalAddress", addressLocality: "New Delhi", addressCountry: "IN" },
        }),
      },
    ],
  }),
  component: Portfolio,
});

function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <strong key={i} className="metric">
            {p}
          </strong>
        ) : (
          p
        ),
      )}
    </>
  );
}

function Ext({ href, children, className = "text-link" }: { href: string; children: React.ReactNode; className?: string }) {
  if (!href) return null;
  const external = href.startsWith("http") || href.endsWith(".pdf");
  return (
    <a href={href} className={className} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
      {children}
      {external && <ArrowUpRight aria-hidden className="size-3.5" />}
    </a>
  );
}

function SectionHead({ n, title, sub }: { n: string; title: string; sub?: string }) {
  return (
    <header className="section-heading reveal">
      <span>{n}</span>
      <div>
        <h2>{title}</h2>
        {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
      </div>
    </header>
  );
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && (e.target.classList.add("is-visible"), io.unobserve(e.target)),
        ),
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const navHeight = 72;
  const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
  window.scrollTo({ top, behavior: "smooth" });
}

function useActiveSection() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const ids = ["top", "work", "engineering", "experience", "journey", "about"] as const;
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) {
          setActive("top");
          return;
        }

        setActive(visible.target.id);
      },
      {
        root: null,
        threshold: [0.1, 0.2, 0.35, 0.55, 0.75],
        rootMargin: "-12% 0px -35% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return active;
}

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
      <button type="button" aria-label="Light theme" aria-pressed={!dark} onClick={() => set(false)}>
        <Sun className="size-3.5" />
      </button>
      <button type="button" aria-label="Dark theme" aria-pressed={dark} onClick={() => set(true)}>
        <Moon className="size-3.5" />
      </button>
    </div>
  );
}

function Portfolio() {
  useReveal();

  return (
    <>
      <div className="scroll-rule" aria-hidden />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-200 focus:bg-background focus:p-2"
      >
        Skip to content
      </a>
      <SiteNav />
      <main id="main">
        <Hero />
        <Work />
        <Engineering />
        <Experience />
        <Journey />
        <About />
      </main>
      <Footer />
    </>
  );
}

function SiteNav() {
  const active = useActiveSection();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isWork = pathname === "/work";

  const navItems = [
    { id: "top", label: "Home" },
    { id: "work", label: "Work" },
    { id: "engineering", label: "Engineering" },
    { id: "experience", label: "Experience" },
    { id: "journey", label: "Journey" },
    { id: "about", label: "About" },
  ];

  return (
    <header className="site-nav">
      <nav className="page-shell flex h-16 items-center justify-between gap-6" aria-label="Primary navigation">
        <Link to="/" className="wordmark" onClick={() => setOpen(false)}>
          {SITE.short}
        </Link>

        <div className="hidden items-center gap-5 md:flex">
          {navItems.map(({ id, label }) => {
            const isActive = isWork ? id === "work" : isHome ? id === "top" : active === id;

            return (
              <button
                key={id}
                type="button"
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={() => {
                  if (id === "work") {
                    window.history.pushState({}, "", "/work");
                    return;
                  }

                  if (pathname !== "/") {
                    window.history.pushState({}, "", "/");
                  }

                  const target = document.getElementById(id === "top" ? "top" : id);
                  if (target) {
                    const navHeight = 72;
                    const nextTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
                    window.scrollTo({ top: nextTop, behavior: "smooth" });
                  }
                }}
              >
                {label}
              </button>
            );
          })}

          <span className="h-4 w-px bg-border" aria-hidden />
          <Ext href={LINKS.resume} className="nav-link inline-flex items-center gap-1 text-foreground!">
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
            {navItems.map(({ id, label }) => (
              <li key={id}>
                <button
                  type="button"
                  className="block w-full border-b py-3 text-left text-sm"
                  onClick={() => {
                    setOpen(false);
                    if (id === "work") {
                      window.history.pushState({}, "", "/work");
                      return;
                    }
                    window.history.pushState({}, "", "/");
                    const target = document.getElementById(id === "top" ? "top" : id);
                    if (target) {
                      const navHeight = 72;
                      const nextTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
                      window.scrollTo({ top: nextTop, behavior: "smooth" });
                    }
                  }}
                >
                  {label}
                </button>
              </li>
            ))}
            <li className="flex gap-5 pt-4">
              <Ext href={LINKS.resume}>Resume</Ext>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

function ProfileImage() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="profile-frame">
      {failed || !SITE.profileImage ? (
        <div className="grid h-full w-full place-items-center rounded-full bg-muted font-serif text-6xl text-muted-foreground">
          NY
        </div>
      ) : (
        <img
          src={SITE.profileImage}
          alt="Portrait of Nitish Kumar Yadav"
          width={400}
          height={400}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="page-shell pb-20 pt-16 md:pb-28 md:pt-24">
      <div className="hero-grid">
        <div>
          <p className="hero-enter status-chip">
            <span className="status-dot" aria-hidden /> {SITE.status}
          </p>
          <h1 className="hero-enter mt-8 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {SITE.name} <span className="mx-2">/</span> {SITE.role}
          </h1>
          <p className="hero-enter mt-5 max-w-3xl font-serif text-[clamp(2.6rem,6.4vw,5.6rem)] leading-[0.98] tracking-[-0.01em]">
            Building full-stack systems and AI-powered products.
          </p>
          <p className="hero-enter mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
            I build production web applications, SaaS systems, APIs, mobile applications and
            AI-powered products.
          </p>
          <p className="hero-enter mt-6 font-mono text-xs text-muted-foreground">
            React · Next.js · Node.js · TypeScript · MongoDB · Python · AI
          </p>
          <div className="hero-enter mt-9 flex flex-wrap items-center gap-3">
            <Link to="/work" className="btn-secondary inline-flex items-center gap-2">
              Explore All Projects <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Ext href={LINKS.resume} className="btn-secondary">
              Resume
            </Ext>
            <Ext href={LINKS.social.github} className="text-link ml-2">
              GitHub
            </Ext>
            <Ext href={LINKS.social.linkedin} className="text-link ml-2">
              LinkedIn
            </Ext>
          </div>
        </div>
        <aside className="profile-enter justify-self-start lg:justify-self-end" aria-label="Profile">
          <ProfileImage />
          <dl className="mt-6 grid gap-1 font-mono text-xs text-muted-foreground">
            <dt className="sr-only">Location</dt>
            <dd>{SITE.location}</dd>
            <dt className="sr-only">Roles</dt>
            <dd className="text-foreground">Full Stack Developer</dd>
            <dd className="text-foreground">AI Engineer</dd>
          </dl>
        </aside>
      </div>
    </section>
  );
}

function ProjectPreview({ p }: { p: Project }) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const update = () => {
      setHasScrolled(node.scrollTop > 12 || node.scrollHeight > node.clientHeight + 12);
    };
    update();
    const handleWheel = (event: WheelEvent) => {
      if (node.scrollHeight <= node.clientHeight) return;
      const isAtTop = node.scrollTop <= 0 && event.deltaY < 0;
      const isAtBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1 && event.deltaY > 0;
      if (isAtTop || isAtBottom) return;
      event.preventDefault();
      node.scrollTop += event.deltaY;
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (node.scrollHeight <= node.clientHeight) return;
      const delta = event.touches[0]?.clientY ?? 0;
      if (Math.abs(delta) > 0) {
        event.preventDefault();
      }
    };
    node.addEventListener("scroll", update, { passive: true });
    node.addEventListener("wheel", handleWheel, { passive: false });
    node.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("resize", update);
    return () => {
      node.removeEventListener("scroll", update);
      node.removeEventListener("wheel", handleWheel);
      node.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", update);
    };
  }, [p.id]);

  return (
    <div className="project-preview" aria-label={`${p.name} project preview`}>
      <div className="project-preview__window">
        <div className="project-preview__header" aria-hidden="true">
          <div className="project-preview__dots">
            <span />
            <span />
            <span />
          </div>
          <div className="project-preview__url">{p.browserDomain}</div>
        </div>
        <div
          ref={viewportRef}
          className="project-preview__viewport"
          aria-label={`${p.name} screenshot preview`}
          tabIndex={0}
          onWheel={(event) => {
            const node = event.currentTarget;
            if (node.scrollHeight <= node.clientHeight) return;
            const isAtTop = node.scrollTop <= 0 && event.deltaY < 0;
            const isAtBottom =
              node.scrollTop + node.clientHeight >= node.scrollHeight - 1 && event.deltaY > 0;
            if (isAtTop || isAtBottom) return;
            event.preventDefault();
            node.scrollTop += event.deltaY;
          }}
        >
          {p.cover ? (
            <img
              src={p.cover}
              alt={`${p.name} long-form project screenshot`}
              className="project-preview__image"
              loading="lazy"
              onError={() => setHasScrolled(true)}
            />
          ) : (
            <div className="project-preview__fallback">
              <p>{p.name}</p>
            </div>
          )}
        </div>
        {!hasScrolled && (
          <div className="project-preview__indicator" aria-hidden="true">
            Scroll to explore
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCover({ p }: { p: Project }) {
  const [error, setError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  if (!p.cover || error) {
    return (
      <div className="project-cover bg-muted">
        <div className="grid h-full place-items-center">
          <div className="text-center">
            <p className="font-serif text-4xl">{p.name}</p>
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
      <button
        ref={triggerRef}
        type="button"
        className="project-preview project-preview--trigger"
        aria-label={`Open ${p.name} project preview`}
        onClick={() => setIsExpanded(true)}
      >
        <span className="project-preview__window">
          <span className="project-preview__header" aria-hidden="true">
            <span className="project-preview__dots">
              <span />
              <span />
              <span />
            </span>
            <span className="project-preview__url">{p.browserDomain}</span>
          </span>
          <span className="project-preview__viewport" aria-hidden="true">
            <img
              src={p.cover}
              alt={`${p.name} long-form project screenshot`}
              className="project-preview__image"
              loading="lazy"
              onError={() => setError(true)}
            />
          </span>
          <span className="project-preview__indicator" aria-hidden="true">
            Click to explore
          </span>
        </span>
      </button>

      <ProjectPreviewModal
        isOpen={isExpanded}
        onClose={() => {
          setIsExpanded(false);
          triggerRef.current?.focus();
        }}
        projectName={p.name}
        projectCategory={p.category}
        projectUrl={p.browserDomain}
        imageSrc={p.cover}
      />
    </>
  );
}

function Work() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="work" className="page-shell section-space">
      <SectionHead n="02" title="Selected Work" sub="Products, experiments and engineering projects I've built." />
      <div className="mt-14 grid gap-20">
        {FEATURED_PROJECTS.map((p, i) => {
          const isOpen = open === p.id;
          return (
            <article key={p.id} className="project reveal grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <ProjectCover p={p} />
              </div>
              <div className="lg:col-span-5">
                <p className="font-mono text-xs text-muted-foreground">
                  0{i + 1} · {p.category}
                  {p.status && (
                    <span className="ml-2 rounded-full border px-2 py-0.5 text-accent-strong">
                      {p.status}
                    </span>
                  )}
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight">{p.name}</h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">{p.summary}</p>
                <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs">
                  {p.tech.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap items-center gap-5">
                  <button
                    type="button"
                    className="text-link"
                    aria-expanded={isOpen}
                    aria-controls={`${p.id}-details`}
                    onClick={() => setOpen(isOpen ? null : p.id)}
                  >
                    {isOpen ? "Hide details" : "Case study"}
                    <ChevronDown
                      aria-hidden
                      className={`size-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <Ext href={p.live ?? ""}>Live demo</Ext>
                  <Ext href={p.github ?? ""}>GitHub</Ext>
                </div>
              </div>
              {isOpen && (
                <div
                  id={`${p.id}-details`}
                  className="case-panel grid gap-8 border-t pt-8 md:grid-cols-3 lg:col-span-12"
                >
                  <div>
                    <p className="section-kicker">Overview</p>
                    <p className="mt-3 text-sm leading-relaxed">{p.summary}</p>
                  </div>
                  <div>
                    <p className="section-kicker">Technical implementation</p>
                    <ul className="mt-3 grid gap-3 text-sm leading-relaxed">
                      {p.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="section-kicker">Key functionality</p>
                    <ul className="mt-3 grid gap-2 text-sm">
                      {p.features.map((f) => (
                        <li key={f} className="border-b pb-2">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
      <div className="mt-10">
        <Link to="/work" className="text-link">
          View all work <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      </div>
    </section>
  );
}

function Engineering() {
  return (
    <section id="engineering" className="border-y bg-surface">
      <div className="page-shell section-space">
        <SectionHead n="03" title="Engineering" sub="What I work on." />
        <div className="mt-14 grid gap-px overflow-hidden border bg-border sm:grid-cols-2 lg:grid-cols-5">
          {ENGINEERING.map((e) => (
            <div key={e.n} className="reveal bg-background p-6">
              <p className="font-mono text-xs text-muted-foreground">{e.n}</p>
              <h3 className="mt-6 text-lg font-semibold">{e.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{e.summary}</p>
              <ul className="mt-4 grid gap-1.5 text-sm text-muted-foreground">
                {e.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Experience() {
  return (
    <section id="experience" className="page-shell section-space">
      <SectionHead n="04" title="Experience" />
      <ol className="mt-14">
        {EXPERIENCE.map((x) => (
          <li key={x.company} className="reveal grid gap-4 border-t py-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="font-mono text-xs text-muted-foreground">
                {x.period}
                {x.current && <span className="ml-2 text-accent-strong">● Current</span>}
              </p>
              <h3 className="mt-3 text-xl font-semibold">{x.company}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{x.role}</p>
            </div>
            <ul className="grid gap-3 leading-relaxed lg:col-span-8">
              {x.points.map((pt) => (
                <li
                  key={pt}
                  className="relative pl-5 before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-muted-foreground"
                >
                  <Rich text={pt} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="border-t bg-surface">
      <div className="page-shell section-space grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead n="09" title="About" />
        </div>
        <div className="reveal grid max-w-2xl gap-5 text-lg leading-relaxed lg:col-span-8">
          <p>
            I'm Nitish, a full-stack developer based in New Delhi. I started with web development,
            moved into production backend systems and mobile applications, and am now going deeper
            into AI and machine learning.
          </p>
          <p className="text-muted-foreground">
            I enjoy understanding what happens underneath the interface — APIs, authentication,
            databases, background jobs, deployment and the systems connecting them.
          </p>
          <p className="text-muted-foreground">
            I'm currently pursuing my BCA at IGNOU while building and shipping software alongside
            it.
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="page-shell flex flex-col gap-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
      <div>
        <p>© 2026 {SITE.name}</p>
        <p className="mt-1 font-mono text-xs">{SITE.role}</p>
      </div>
      <div className="flex flex-wrap gap-5">
        <Ext href={LINKS.social.github}>GitHub</Ext>
        <Ext href={LINKS.social.linkedin}>LinkedIn</Ext>
        <a href={`mailto:${SITE.email}`} className="text-link">
          Email
        </a>
        <Ext href={LINKS.resume}>Resume</Ext>
      </div>
    </footer>
  );
}
