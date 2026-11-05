import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { Journey } from "../components/Journey";
import { ProjectCard } from "../components/ProjectCard";
import { SiteNav } from "../components/SiteNav";
import { useReveal } from "../hooks/useReveal";
import { PROJECTS } from "../lib/projects";
import { LINKS, SITE } from "../lib/site";
import { ContactSection } from "../components/ContactSection";

const FEATURED_PROJECTS = PROJECTS.filter((project) => project.category === "selected").slice(0, 3);

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
    items: ["Python", "Gemini API", "AI integrations", "AI-powered products", "LangGraph"],
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
        <ContactSection />
      </main>
      <Footer />
    </>
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
          <p className="hero-enter mt-5 max-w-3xl font-serif text-[clamp(2.4rem,5.8vw,5.2rem)] leading-[0.98] tracking-[-0.01em]">
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
        <aside className="hero-aside profile-enter" aria-label="Profile">
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

function Work() {
  return (
    <section id="work" className="page-shell section-space">
      <SectionHead
        n="02"
        title="Selected Work"
        sub="Products, experiments and engineering projects I've built."
      />
      <div className="mt-14 grid gap-20">
        {FEATURED_PROJECTS.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} />
        ))}
      </div>
      <div className="work-cta">
        <Link to="/work" className="btn-secondary inline-flex items-center gap-2">
          View all work <ArrowRight aria-hidden className="size-4" />
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
          <SectionHead n="06" title="About" />
        </div>
        <div className="reveal grid max-w-2xl gap-5 text-lg leading-relaxed lg:col-span-8">
          <p>
            I&apos;m Nitish, a full-stack developer based in New Delhi. I started with web
            development, moved into production backend systems and mobile applications, and am now
            going deeper into AI and machine learning.
          </p>
          <p className="text-muted-foreground">
            I enjoy understanding what happens underneath the interface — APIs, authentication,
            databases, background jobs, deployment and the systems connecting them.
          </p>
          <p className="text-muted-foreground">
            I&apos;m currently pursuing my BCA at IGNOU while building and shipping software
            alongside it.
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="page-shell flex flex-col gap-4 border-t py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
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
