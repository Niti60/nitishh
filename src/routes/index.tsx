import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Site configuration — edit these values. Empty strings are hidden.   */
/* ------------------------------------------------------------------ */
const SITE = {
  name: "Nitish Kumar Yadav",
  short: "Nitish Yadav",
  role: "Full Stack Developer · AI Engineer",
  location: "New Delhi, India",
  email: "hi@nitishyadav.com",
  phone: "+91 96255 32559",
  website: "nitishyadav.com",
  status: "Currently: Full Stack Developer @ Admeasy",
  profileImage: "/profile.jpg", // replace public/profile.jpg to update
  links: {
    resume: "/Nitish-Kumar-Yadav-Resume.pdf",
    github: "", // e.g. "https://github.com/username"
    linkedin: "", // e.g. "https://linkedin.com/in/username"
  },
};

type Project = {
  id: string;
  name: string;
  status?: string;
  category: string;
  tech: string[];
  summary: string;
  details: string[];
  features: string[];
  cover?: string; // e.g. "/projects/domnotify-cover.png"
  live?: string;
  github?: string;
  private?: boolean;
};

const PROJECTS: Project[] = [
  {
    id: "domnotify",
    name: "DomNotify",
    status: "Ongoing",
    category: "Domain Monitoring SaaS",
    tech: ["Next.js", "React", "Tailwind CSS", "MongoDB", "JWT"],
    summary:
      "Built a premium domain monitoring SaaS using Next.js, React, Tailwind CSS, MongoDB, and JWT authentication with secure role-based access control.",
    details: [
      "Developed real-time domain tracking features including expiry monitoring, SSL checks, registrar insights, watchlists, and admin management dashboards.",
      "Optimized performance and scalability through modular architecture, protected APIs, middleware-based authentication, and responsive UI/UX inspired by modern platforms like Vercel and Linear.",
    ],
    features: ["Architecture", "Authentication", "Domain monitoring", "Admin dashboard", "Responsive UI"],
  },
  {
    id: "personax",
    name: "PersonaX",
    category: "AI Chatbot",
    tech: ["Gemini AI", "React 19", "Express", "MongoDB"],
    summary:
      "Built Persona X, an AI chatbot application with 5 interactive personas, integrating Gemini AI, React 19, Express, and MongoDB to handle real-time conversations and prompt analytics.",
    details: [
      "Implemented admin dashboard, onboarding system, and prompt-tracking architecture, enabling complete monitoring of user interactions and persona usage across the platform.",
    ],
    features: ["5 interactive personas", "AI integration", "Real-time conversations", "Prompt analytics", "Admin dashboard", "Onboarding system"],
  },
  {
    id: "ecommerce",
    name: "E-Commerce App",
    category: "Full-stack commerce",
    tech: ["React", "Tailwind CSS", "Node.js", "Express", "MongoDB", "Vite"],
    summary:
      "Implemented JWT-secured APIs, 30% faster UI rendering using React + Tailwind CSS, and integrated MongoDB Atlas for scalable data storage.",
    details: [
      "Implemented RESTful APIs using Node.js, Express, and MongoDB with optimized frontend builds powered by Vite and Tailwind CSS.",
      "Integrated user cart, wishlist, and admin dashboard functionalities.",
    ],
    features: ["Authentication", "REST APIs", "Cart", "Wishlist", "Admin dashboard", "MongoDB Atlas"],
  },
];

const ENGINEERING = [
  { n: "01", t: "Full Stack", items: ["Production web applications", "SaaS platforms", "Admin dashboards", "Responsive UI/UX"] },
  { n: "02", t: "Backend & Systems", items: ["Node.js", "Express.js", "REST APIs", "Authentication", "MongoDB", "Redis", "BullMQ", "Prisma ORM"] },
  { n: "03", t: "Infrastructure", items: ["Docker", "Git", "GitHub", "GitHub Actions", "CI/CD", "SSH", "Remote SSH"] },
  { n: "04", t: "Mobile", items: ["React Native", "Capacitor", "Android Studio", "APK/AAB builds", "Hybrid applications"] },
  { n: "05", t: "AI", items: ["Gemini API", "AI chatbot development", "Prompt engineering", "Python", "FastAPI"] },
];

const EXPERIENCE = [
  {
    company: "Admeasy Admission Solutions Pvt. Ltd.",
    role: "Full Stack Developer",
    period: "Mar 2026 – Present",
    current: true,
    points: [
      "Architected and developed scalable full-stack applications using React.js, Node.js, Express, and MongoDB with secure authentication and optimized APIs.",
      "Integrated Redis caching, BullMQ background jobs, and CI/CD pipelines using GitHub Actions to improve performance and deployment efficiency.",
      "Delivered **50+** responsive UI/UX pages focused on clean design, scalability, and user experience.",
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

const HIGHLIGHTS = [
  { v: "50+", l: "Responsive UI/UX pages delivered" },
  { v: "2", l: "Mobile applications developed at Rishiwar" },
  { v: "3", l: "Professional roles / internships listed" },
  { v: "1", l: "Current Full Stack Developer role at Admeasy" },
];

const JOURNEY = [
  { year: "2024", items: [["BCA", "IGNOU"], ["MERN Stack Development", "Oxford Software Institute"]] },
  { year: "2025", items: [["Diploma completed", "Oxford Software Institute"], ["Web Developer Intern", "Hindustan Soft Education"], ["Full Stack Developer Intern", "Rishiwar Industries"]] },
  { year: "2026", items: [["Rishiwar internship completed", "Feb 2026"], ["Joined Admeasy", "Full Stack Developer"], ["Full Stack Development + AI Engineering", "Now"]] },
];

const CURRENTLY = [
  { t: "Building", items: ["Production full-stack applications and SaaS systems."] },
  { t: "Learning", items: ["Python", "Pandas", "NumPy", "Matplotlib"] },
  { t: "Exploring", items: ["PyTorch", "TensorFlow", "FastAPI", "AI Engineering"] },
  { t: "Focusing on", items: ["System design", "Backend architecture", "Performance", "DSA", "AI-powered products"] },
];

const STACK: [string, string[]][] = [
  ["Frontend", ["React.js", "Next.js", "JavaScript ES6+", "TypeScript", "Tailwind CSS", "MUI", "Bootstrap", "Framer Motion"]],
  ["Backend", ["Node.js", "Express.js", "REST APIs", "JWT", "OAuth", "API Optimization", "Redis", "BullMQ", "Prisma ORM"]],
  ["Database", ["MongoDB", "SQL", "Database Design & Optimization"]],
  ["Mobile", ["React Native", "Capacitor", "Android Studio", "Android APK/AAB Builds", "Hybrid App Development"]],
  ["AI / Data", ["Python", "Pandas", "NumPy", "Matplotlib", "PyTorch", "TensorFlow", "FastAPI", "Gemini API", "AI Chatbot Development", "Prompt Engineering"]],
  ["DevOps", ["Docker", "Git", "GitHub", "GitHub Actions", "CI/CD", "SSH", "Remote SSH", "Postman"]],
  ["IDE / Platforms", ["VS Code", "Antigravity", "Cursor", "Claude", "Codespaces"]],
];

const NAV = [
  ["work", "Work"],
  ["experience", "Experience"],
  ["journey", "Journey"],
  ["stack", "Stack"],
  ["about", "About"],
] as const;

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

/* ------------------------------ helpers ------------------------------ */

function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return <>{parts.map((p, i) => (i % 2 ? <strong key={i} className="metric">{p}</strong> : p))}</>;
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
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("is-visible"), io.unobserve(e.target))),
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useActiveSection() {
  const [active, setActive] = useState("");
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    NAV.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
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
    } catch {}
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

/* ------------------------------- page -------------------------------- */

function Portfolio() {
  useReveal();
  return (
    <>
      <div className="scroll-rule" aria-hidden />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-background focus:p-2">
        Skip to content
      </a>
      <SiteNav />
      <main id="main">
        <Hero />
        <Work />
        <Engineering />
        <Experience />
        <Highlights />
        <Journey />
        <Currently />
        <AIEngineering />
        <Stack />
        <About />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

function SiteNav() {
  const active = useActiveSection();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-nav">
      <nav className="page-shell flex h-16 items-center justify-between gap-6" aria-label="Primary">
        <a href="#top" className="wordmark" onClick={() => setOpen(false)}>
          {SITE.short}
        </a>
        <div className="hidden items-center gap-7 md:flex">
          <ul className="flex items-center gap-6">
            {NAV.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className={`nav-link ${active === id ? "active" : ""}`}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <span className="h-4 w-px bg-border" aria-hidden />
          <Ext href={SITE.links.resume} className="nav-link inline-flex items-center gap-1 !text-foreground">Resume</Ext>
          <Ext href={SITE.links.github} className="nav-link inline-flex items-center gap-1">GitHub</Ext>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button type="button" className="icon-btn" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="border-t bg-background md:hidden">
          <ul className="page-shell grid py-4">
            {NAV.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="block border-b py-3 text-sm" onClick={() => setOpen(false)}>
                  {label}
                </a>
              </li>
            ))}
            <li className="flex gap-5 pt-4">
              <Ext href={SITE.links.resume}>Resume</Ext>
              <Ext href={SITE.links.github}>GitHub</Ext>
              <Ext href={SITE.links.linkedin}>LinkedIn</Ext>
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
        <div className="grid h-full w-full place-items-center rounded-full bg-muted font-serif text-6xl text-muted-foreground">NY</div>
      ) : (
        <img src={SITE.profileImage} alt="Portrait of Nitish Kumar Yadav" width={400} height={400} className="h-full w-full object-cover" onError={() => setFailed(true)} />
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
            I build production web applications, SaaS systems, APIs, mobile applications and AI-powered products.
          </p>
          <p className="hero-enter mt-6 font-mono text-xs text-muted-foreground">React · Next.js · Node.js · TypeScript · MongoDB · Python · AI</p>
          <div className="hero-enter mt-9 flex flex-wrap items-center gap-3">
            <a href="#work" className="btn-primary">
              View work <ArrowRight aria-hidden className="size-4" />
            </a>
            <Ext href={SITE.links.resume} className="btn-secondary">Resume</Ext>
            <Ext href={SITE.links.github} className="text-link ml-2">GitHub</Ext>
            <Ext href={SITE.links.linkedin} className="text-link ml-2">LinkedIn</Ext>
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

function ProjectCover({ p }: { p: Project }) {
  return (
    <div className="project-cover">
      {p.cover ? (
        <img src={p.cover} alt={`${p.name} screenshot`} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full place-items-center">
          <div className="text-center">
            <p className="font-serif text-4xl">{p.name}</p>
            <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">Screenshot coming</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Work() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section id="work" className="page-shell section-space">
      <SectionHead n="02" title="Selected Work" sub="Things I've built." />
      <div className="mt-14 grid gap-20">
        {PROJECTS.map((p, i) => {
          const isOpen = open === p.id;
          return (
            <article key={p.id} className="project reveal grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <ProjectCover p={p} />
              </div>
              <div className="lg:col-span-5">
                <p className="font-mono text-xs text-muted-foreground">
                  0{i + 1} · {p.category}
                  {p.status && <span className="ml-2 rounded-full border px-2 py-0.5 text-accent-strong">{p.status}</span>}
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight">{p.name}</h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">{p.summary}</p>
                <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs">
                  {p.tech.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap items-center gap-5">
                  <button type="button" className="text-link" aria-expanded={isOpen} aria-controls={`${p.id}-details`} onClick={() => setOpen(isOpen ? null : p.id)}>
                    {isOpen ? "Hide details" : "Case study"}
                    <ChevronDown aria-hidden className={`size-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <Ext href={p.live ?? ""}>Live demo</Ext>
                  <Ext href={p.github ?? ""}>GitHub</Ext>
                  {p.private && <span className="font-mono text-xs text-muted-foreground">Private project</span>}
                </div>
              </div>
              {isOpen && (
                <div id={`${p.id}-details`} className="case-panel grid gap-8 border-t pt-8 md:grid-cols-3 lg:col-span-12">
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
                        <li key={f} className="border-b pb-2">{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </article>
          );
        })}
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
              <h3 className="mt-6 text-lg font-semibold">{e.t}</h3>
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
                <li key={pt} className="relative pl-5 before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-muted-foreground">
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

function Highlights() {
  return (
    <section aria-labelledby="hl" className="page-shell pb-8">
      <h2 id="hl" className="section-kicker">Selected highlights</h2>
      <dl className="mt-6 grid grid-cols-2 gap-y-8 border-y py-8 lg:grid-cols-4">
        {HIGHLIGHTS.map((h) => (
          <div key={h.l} className="reveal pr-6">
            <dt className="order-2 mt-2 text-sm text-muted-foreground">{h.l}</dt>
            <dd className="font-serif text-5xl">{h.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Journey() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
      el.style.setProperty("--progress", String(p));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <section id="journey" className="page-shell section-space">
      <SectionHead n="05" title="My Journey" />
      <div ref={ref} className="journey mt-16">
        <span className="journey-track" aria-hidden />
        <span className="journey-fill" aria-hidden />
        {JOURNEY.map((y) => (
          <div key={y.year} className="journey-year">
            <p className="journey-label reveal">{y.year}</p>
            <ul className="grid gap-5">
              {y.items.map(([t, s], i) => (
                <li key={t} className={`journey-branch reveal ${i % 2 ? "is-right" : "is-left"}`}>
                  <span className="journey-dot" aria-hidden />
                  <div className="journey-card">
                    <p className="font-semibold">{t}</p>
                    <p className="text-sm text-muted-foreground">{s}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Currently() {
  return (
    <section id="currently" className="border-y bg-surface">
      <div className="page-shell section-space">
        <SectionHead n="06" title="Currently" sub="What I'm building, learning and exploring right now — not all of it is production experience yet." />
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {CURRENTLY.map((c) => (
            <div key={c.t} className="reveal border-t pt-5">
              <h3 className="section-kicker">{c.t}</h3>
              <ul className="mt-4 grid gap-1.5">
                {c.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AIEngineering() {
  return (
    <section id="ai" className="page-shell section-space">
      <SectionHead n="07" title="AI Engineering" />
      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        <div className="reveal grid gap-10 sm:grid-cols-2 lg:col-span-6">
          <div>
            <h3 className="section-kicker">AI work</h3>
            <ul className="mt-4 grid gap-1.5">
              <li>Gemini API</li>
              <li>AI Chatbot Development</li>
              <li>Prompt Engineering</li>
            </ul>
          </div>
          <div>
            <h3 className="section-kicker">Python / AI stack</h3>
            <ul className="mt-4 grid gap-1.5">
              {["Python", "Pandas", "NumPy", "Matplotlib", "PyTorch", "TensorFlow", "FastAPI"].map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
        <aside className="reveal border p-8 lg:col-span-6">
          <p className="section-kicker">Proof · Featured project</p>
          <h3 className="mt-4 font-serif text-4xl">PersonaX</h3>
          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {["5 interactive AI personas", "Gemini AI", "React 19", "Express", "MongoDB", "Real-time conversations", "Prompt analytics", "Admin dashboard"].map((t) => (
              <li key={t} className="border-b pb-2">{t}</li>
            ))}
          </ul>
          <a href="#work" className="text-link mt-6">
            View project <ArrowUpRight aria-hidden className="size-3.5" />
          </a>
        </aside>
      </div>
    </section>
  );
}

function Stack() {
  return (
    <section id="stack" className="page-shell section-space pt-0">
      <SectionHead n="08" title="Stack" />
      <div className="mt-10">
        {STACK.map(([group, items]) => (
          <details key={group} className="skill-row reveal" open>
            <summary>
              <span className="section-kicker">{group}</span>
              <span className="hidden text-sm text-muted-foreground sm:block">{items.length} tools</span>
              <ChevronDown aria-hidden className="size-4 text-muted-foreground" />
            </summary>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 pb-6 pl-[2.5rem]">
              {items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </details>
        ))}
      </div>
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
            I'm Nitish, a full-stack developer based in New Delhi. I started with web development, moved into production backend systems and mobile applications, and am now going deeper into AI and machine learning.
          </p>
          <p className="text-muted-foreground">
            I enjoy understanding what happens underneath the interface — APIs, authentication, databases, background jobs, deployment and the systems connecting them.
          </p>
          <p className="text-muted-foreground">I'm currently pursuing my BCA at IGNOU while building and shipping software alongside it.</p>
        </div>
      </div>
    </section>
  );
}

function Education() {
  return (
    <section id="education" className="page-shell section-space">
      <SectionHead n="10" title="Education" />
      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <ul className="reveal">
          {[
            ["Bachelor of Computer Applications (BCA)", "Indira Gandhi National Open University", "Aug 2024 – 2027"],
            ["Diploma in MERN Stack Web Development", "Oxford Software Institute", "Aug 2024 – Aug 2025"],
          ].map(([d, s, p]) => (
            <li key={d} className="border-t py-5">
              <p className="font-semibold">{d}</p>
              <p className="text-sm text-muted-foreground">{s} · New Delhi, India</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{p}</p>
            </li>
          ))}
        </ul>
        <div className="reveal">
          <h3 className="section-kicker">Certifications</h3>
          <ul className="mt-4">
            {[
              ["Web Developer Intern", "Hindustan Soft Education Ltd.", "Oct 2025"],
              ["Full Stack Developer Intern", "Rishiwar Industries Pvt. Ltd.", "Feb 2026"],
            ].map(([t, o, d]) => (
              <li key={t} className="border-t py-5">
                <p className="font-semibold">{t}</p>
                <p className="text-sm text-muted-foreground">{o}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="bg-ink text-ink-foreground">
      <div className="page-shell section-space">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-muted">11 · Have a project, role, or problem in mind?</p>
        <h2 className="mt-6 font-serif text-[clamp(3.5rem,10vw,8rem)] leading-none">Let's talk.</h2>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <a href={`mailto:${SITE.email}`} className="btn-invert">
            Email me <ArrowRight aria-hidden className="size-4" />
          </a>
          <Ext href={SITE.links.github} className="text-link !text-ink-foreground">GitHub</Ext>
          <Ext href={SITE.links.linkedin} className="text-link !text-ink-foreground">LinkedIn</Ext>
          <Ext href={SITE.links.resume} className="text-link !text-ink-foreground">Resume</Ext>
        </div>
        <dl className="mt-16 grid gap-4 border-t border-ink-border pt-6 font-mono text-xs text-ink-muted sm:grid-cols-3">
          <div><dt className="sr-only">Email</dt><dd><a href={`mailto:${SITE.email}`} className="hover:text-ink-foreground">{SITE.email}</a></dd></div>
          <div><dt className="sr-only">Website</dt><dd>{SITE.website}</dd></div>
          <div><dt className="sr-only">Phone</dt><dd><a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-ink-foreground">{SITE.phone}</a></dd></div>
        </dl>
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
        <Ext href={SITE.links.github}>GitHub</Ext>
        <Ext href={SITE.links.linkedin}>LinkedIn</Ext>
        <a href={`mailto:${SITE.email}`} className="text-link">Email</a>
        <Ext href={SITE.links.resume}>Resume</Ext>
      </div>
    </footer>
  );
}
