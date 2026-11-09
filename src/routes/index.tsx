import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { Journey } from "../components/Journey";
import { ProjectCard } from "../components/ProjectCard";
import { SiteFooter } from "../components/SiteFooter";
import { SiteNav } from "../components/SiteNav";
import { useReveal } from "../hooks/useReveal";
import { PROJECTS } from "../lib/projects";
import { LINKS, SITE, scrollToSection } from "../lib/site";
import { ContactSection } from "../components/ContactSection";

const FEATURED_PROJECTS = PROJECTS.filter((project) => project.category === "selected").slice(0, 3);

const ENGINEERING = [
  {
    n: "01",
    title: "Full Stack Development",
    summary:
      "Production web applications, customer portals, and internal dashboards built for responsiveness, accessibility, and real-world utility.",
    items: ["React", "Next.js", "TypeScript", "Node.js", "Express", "REST APIs"],
  },
  {
    n: "02",
    title: "Backend & Architecture",
    summary:
      "Designing RESTful APIs, relational and NoSQL databases, authentication flows, caching layers, and background job queues.",
    items: [
      "API Design",
      "Authentication",
      "MongoDB",
      "SQL",
      "Redis",
      "BullMQ",
      "Database Architecture",
    ],
  },
  {
    n: "03",
    title: "AI Engineering",
    summary:
      "Integrating LLMs, building intent classification pipelines, and creating practical conversational tools using Python, FastAPI, and the Gemini API.",
    items: ["Python", "FastAPI", "Gemini API", "AI Integration", "LangGraph", "Prompt Engineering"],
  },
  {
    n: "04",
    title: "Infrastructure & Performance",
    summary:
      "Setting up CI/CD pipelines, Docker containers, caching strategies, and optimizing server response times.",
    items: [
      "Docker",
      "CI/CD",
      "GitHub Actions",
      "Redis Caching",
      "Background Jobs",
      "Cloud Deployment",
    ],
  },
  {
    n: "05",
    title: "Engineering Focus",
    summary:
      "Prioritizing clean API contracts, database indexing, predictable state management, and reliable deployment workflows.",
    items: [
      "System Design",
      "Backend Architecture",
      "Performance Engineering",
      "Data Structures",
      "Production Reliability",
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
      "Architected and developed full-stack web applications using React.js, Node.js, Express, and MongoDB with secure JWT authentication and optimized REST APIs.",
      "Integrated Redis caching and BullMQ background jobs to process asynchronous notifications and automated email delivery.",
      "Delivered **50+ responsive UI/UX pages** with mobile-first layouts, consistent component systems, and accessible interactions.",
      "Independently developed and deployed mobile applications to the Google Play Store using Capacitor and Android Studio.",
    ],
  },
  {
    company: "Rishiwar Industries Pvt. Ltd.",
    role: "Full Stack Developer Intern — Paid Internship (₹11,000/month)",
    period: "Nov 2025 – Feb 2026",
    points: [
      "Developed Order Management and Authentication APIs with role-based permissions and input validation.",
      "Built a real-time Admin Verification Dashboard for tracking applicant reviews, status changes, and operational audits.",
      "Engineered **2 cross-platform mobile applications** using React Native and Android Studio for on-site staff.",
      "Used AI-assisted coding and debugging workflows to accelerate feature delivery while maintaining code quality.",
    ],
  },
  {
    company: "Hindustan Soft Education Ltd.",
    role: "Web Developer Intern — Non-Monetary",
    period: "Sep 2025 – Oct 2025",
    points: [
      "Maintained and debugged client web applications by resolving UI regressions, styling inconsistencies, and functional bugs.",
      "Collaborated with developers to fix frontend and backend issues across multiple active student portals.",
      "Improved overall system stability, performance, and code quality across active client projects.",
    ],
  },
];

const TITLE = "Nitish Kumar Yadav | Full Stack Developer & AI Engineer in New Delhi";
const DESC =
  "Nitish Kumar Yadav is a Full Stack Developer & AI Engineer in New Delhi. Building scalable web apps, REST APIs, and AI tools with React, Node.js, and Python.";

const HOMEPAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://nitishyadav.com/#person",
      name: "Nitish Kumar Yadav",
      alternateName: ["Nitish Yadav"],
      url: "https://nitishyadav.com",
      image: "https://nitishyadav.com/profile.jpg",
      jobTitle: "Full Stack Developer & AI Engineer",
      worksFor: {
        "@type": "Organization",
        name: "Admeasy Admission Solutions Pvt. Ltd.",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "New Delhi",
        addressCountry: "IN",
      },
      sameAs: ["https://github.com/Niti60"],
      knowsAbout: [
        "Full Stack Web Development",
        "React.js",
        "Next.js",
        "Node.js",
        "TypeScript",
        "Python",
        "FastAPI",
        "MongoDB",
        "Redis",
        "BullMQ",
        "REST APIs",
        "AI Engineering",
        "System Design",
      ],
      description: DESC,
    },
    {
      "@type": "WebSite",
      "@id": "https://nitishyadav.com/#website",
      url: "https://nitishyadav.com",
      name: "Nitish Kumar Yadav — Full Stack Developer & AI Engineer",
      description: DESC,
      publisher: {
        "@id": "https://nitishyadav.com/#person",
      },
    },
    {
      "@type": "ProfilePage",
      "@id": "https://nitishyadav.com/#webpage",
      url: "https://nitishyadav.com",
      name: TITLE,
      description: DESC,
      isPartOf: {
        "@id": "https://nitishyadav.com/#website",
      },
      about: {
        "@id": "https://nitishyadav.com/#person",
      },
      mainEntity: {
        "@id": "https://nitishyadav.com/#person",
      },
    },
  ],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "author", content: SITE.name },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: "https://nitishyadav.com" },
      { property: "og:image", content: "https://nitishyadav.com/profile.jpg" },
      {
        property: "og:image:alt",
        content: "Nitish Kumar Yadav — Full Stack Developer & AI Engineer in New Delhi",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: "https://nitishyadav.com/profile.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://nitishyadav.com" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(HOMEPAGE_SCHEMA),
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
      <SiteFooter />
    </>
  );
}

function ProfileImage() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="profile-frame select-none">
      {failed || !SITE.profileImage ? (
        <div className="grid h-full w-full select-none place-items-center rounded-full bg-muted font-serif text-6xl text-muted-foreground">
          NY
        </div>
      ) : (
        <img
          src={SITE.profileImage}
          alt="Portrait of Nitish Kumar Yadav — Full Stack Developer and AI Engineer based in New Delhi"
          width={400}
          height={400}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className="h-full w-full select-none object-cover"
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
            Building web applications, backend systems, and AI tools.
          </p>
          <p className="hero-enter mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
            I&apos;m a Full Stack Developer and AI Engineer based in New Delhi, India. I build
            production web applications, REST APIs, and practical AI tools — working across frontend
            interfaces, server architecture, databases, and deployment.
          </p>
          <p className="hero-enter mt-6 font-mono text-xs text-muted-foreground">
            React · Next.js · TypeScript · Node.js · Express · MongoDB · Python · FastAPI
          </p>
          <div className="hero-enter mt-9 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                window.location.href = "/contact";
              }}
              className="btn-cta inline-flex items-center gap-2"
            >
              Contact Me <ArrowRight aria-hidden className="size-4" />
            </button>
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
        sub="Production web applications, client systems, and engineering projects I've built."
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
        <SectionHead n="03" title="Engineering" sub="Areas of software engineering I focus on." />
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
            I&apos;m Nitish Kumar Yadav, a Full Stack Developer and AI Engineer based in New Delhi.
            I build production software across the entire web stack — writing clean TypeScript and
            React on the frontend, designing reliable Node.js and Express APIs, and engineering AI
            pipelines in Python.
          </p>
          <p className="text-muted-foreground">
            I care about what happens underneath the user interface: reliable authentication, schema
            design in MongoDB, Redis caching layers, background queue processing with BullMQ, and
            automated CI/CD pipelines.
          </p>
          <p className="text-muted-foreground">
            I&apos;m currently pursuing my BCA at IGNOU while working full-time at Admeasy. When
            I&apos;m not shipping software, I&apos;m exploring machine learning workflows, studying
            distributed system design, and building open-source projects on GitHub.
          </p>
        </div>
      </div>
    </section>
  );
}
