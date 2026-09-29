import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  Mail,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import profileAsset from "@/assets/nitish-profile.jpeg.asset.json";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nitish Kumar Yadav — Full Stack Developer & AI Engineer" },
      {
        name: "description",
        content:
          "Full Stack Developer and AI Engineer building scalable web applications, SaaS platforms, APIs, mobile applications and AI-powered products.",
      },
      { property: "og:title", content: "Nitish Kumar Yadav — Full Stack Developer & AI Engineer" },
      {
        property: "og:description",
        content:
          "Full Stack Developer and AI Engineer building scalable web applications, SaaS platforms, APIs, mobile applications and AI-powered products.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://nitishyadav.com" }],
  }),
  component: Portfolio,
});

const navigation = [
  ["Work", "work"],
  ["Experience", "experience"],
  ["Journey", "journey"],
  ["Skills", "skills"],
  ["About", "about"],
  ["Contact", "contact"],
] as const;

const projects = [
  {
    number: "01",
    title: "DomNotify",
    status: "Ongoing",
    description:
      "A premium domain monitoring SaaS with secure role-based access, real-time expiry monitoring, SSL checks, registrar insights, watchlists, and admin management.",
    detail:
      "Built around modular architecture, protected APIs, middleware authentication, and a responsive product interface.",
    stack: ["Next.js", "React", "Tailwind CSS", "MongoDB", "JWT"],
  },
  {
    number: "02",
    title: "PersonaX",
    status: "AI Chatbot",
    description:
      "An AI chatbot with five interactive personas, real-time conversations, prompt analytics, onboarding, and a complete admin dashboard.",
    detail:
      "Designed a prompt-tracking architecture to monitor user interactions and persona usage across the platform.",
    stack: ["Gemini AI", "React 19", "Express", "MongoDB"],
  },
  {
    number: "03",
    title: "E-Commerce App",
    status: "Full Stack",
    description:
      "A commerce platform with JWT-secured APIs, optimized React rendering, scalable MongoDB Atlas storage, cart, wishlist, and admin workflows.",
    detail:
      "Implemented REST APIs with Node.js and Express, with frontend builds powered by Vite and Tailwind CSS.",
    stack: ["React", "Node.js", "Express", "MongoDB", "Vite"],
  },
];

const experience = [
  {
    company: "Admeasy Admission Solutions Pvt. Ltd.",
    role: "Full Stack Developer",
    date: "Mar 2026 — Present",
    points: [
      "Architected scalable applications with React.js, Node.js, Express, MongoDB, secure authentication, and optimized APIs.",
      "Integrated Redis caching, BullMQ background jobs, and GitHub Actions CI/CD pipelines.",
      "Delivered 50+ responsive UI/UX pages focused on clean design and user experience.",
      "Developed and deployed mobile applications using Capacitor and Android Studio on Google Play Store.",
    ],
  },
  {
    company: "Rishiwar Industries Pvt. Ltd.",
    role: "Full Stack Developer Intern — Paid Internship (₹11,000/month)",
    date: "Nov 2025 — Feb 2026",
    points: [
      "Architected Order Management and Authentication APIs for performance and security.",
      "Built a real-time Admin Verification Dashboard for applicant review and approval workflows.",
      "Developed two mobile applications using React Native and Android Studio.",
      "Delivered features ahead of deadlines using AI tools to improve development speed and code quality.",
    ],
  },
  {
    company: "Hindustan Soft Education Ltd.",
    role: "Web Developer Intern — Non-Monetary",
    date: "Sep 2025 — Oct 2025",
    points: [
      "Maintained and debugged web applications, resolving UI and functional issues.",
      "Collaborated on frontend and backend bug fixes to improve stability, performance, and code quality.",
    ],
  },
];

const journey = [
  {
    year: "2024",
    items: [
      "Started BCA at Indira Gandhi National Open University",
      "Started Diploma in MERN Stack Web Development at Oxford Software Institute",
    ],
  },
  {
    year: "2025",
    items: [
      "Completed Diploma in MERN Stack Web Development — Aug 2025",
      "Web Developer Intern at Hindustan Soft Education — Sep–Oct",
      "Joined Rishiwar Industries as Full Stack Developer Intern — Nov",
    ],
  },
  {
    year: "2026",
    items: [
      "Completed Rishiwar Industries internship — Feb",
      "Joined Admeasy as Full Stack Developer — Mar",
      "Building full-stack applications, APIs, infrastructure, UI/UX, and mobile applications",
    ],
  },
  {
    year: "Now",
    items: ["Full Stack Development", "AI Engineering", "Python ecosystem", "Machine Learning / Deep Learning exploration"],
  },
];

const skillGroups = [
  ["Frontend", "React.js, Next.js, JavaScript (ES6+), TypeScript, Tailwind CSS, MUI, Bootstrap, Framer Motion"],
  ["Backend", "Node.js, Express.js, REST APIs, JWT, OAuth, API Optimization, Redis, BullMQ, Prisma ORM"],
  ["Mobile", "React Native, Capacitor, Android Studio, Android APK/AAB Builds, Hybrid App Development"],
  ["Database", "MongoDB, SQL, Database Design & Optimization"],
  ["AI & Python", "Gemini API, AI Chatbot Development, Prompt Engineering, Python, Pandas, NumPy, Matplotlib, PyTorch, TensorFlow, FastAPI"],
  ["DevOps & Tools", "Docker, Git, GitHub, GitHub Actions, CI/CD, SSH, Remote SSH, Postman"],
  ["IDE & Platforms", "VS Code, Antigravity, Cursor, Claude, Codespaces"],
] as const;

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="section-heading reveal">
      <span>{number}</span>
      <h2>{title}</h2>
    </div>
  );
}

function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("work");

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".reveal");
    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.12 },
    );
    elements.forEach((element) => revealObserver.observe(element));

    const sections = navigation
      .map(([, id]) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const current = entries.find((entry) => entry.isIntersecting);
        if (current?.target.id) setActive(current.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    sections.forEach((section) => sectionObserver.observe(section));
    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  return (
    <main className="overflow-x-hidden bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      <div className="scroll-rule" aria-hidden="true" />
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-sm">
        <nav className="page-shell grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center" aria-label="Main navigation">
          <a href="#top" className="min-w-0 truncate text-sm font-bold uppercase tracking-normal">Nitish Yadav</a>
          <div className="hidden items-center gap-7 md:flex">
            {navigation.map(([label, id]) => (
              <a key={id} href={`#${id}`} className={`nav-link ${active === id ? "active" : ""}`}>{label}</a>
            ))}
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </nav>
        {menuOpen && (
          <div className="border-t border-border bg-background px-5 py-5 md:hidden">
            <div className="grid gap-1">
              {navigation.map(([label, id]) => (
                <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className="border-b border-border py-3 text-sm font-medium">{label}</a>
              ))}
            </div>
          </div>
        )}
      </header>

      <section id="top" className="page-shell hero-grid min-h-[calc(100svh-4rem)] py-16 lg:py-24">
        <div className="flex min-w-0 flex-col justify-center">
          <p className="hero-enter text-xs font-semibold uppercase text-accent-strong">Full Stack Developer · AI Engineer</p>
          <h1 className="hero-enter mt-7 max-w-4xl text-[clamp(3rem,7vw,6.7rem)] font-semibold leading-[0.96] tracking-normal">
            Building full-stack systems and AI-powered products.
          </h1>
          <p className="hero-enter mt-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Full Stack Developer with hands-on experience building scalable SaaS applications and production-grade web platforms using React.js, Next.js, Node.js, Express, MongoDB, and TypeScript.
          </p>
          <div className="hero-enter mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-none shadow-none"><a href="#work">View Work <ArrowDownRight /></a></Button>
            <Button asChild size="lg" variant="outline" className="rounded-none shadow-none"><a href="#contact">Contact Me</a></Button>
            <a href="https://nitishyadav.com" className="ml-0 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:ml-3">nitishyadav.com</a>
          </div>
        </div>
        <div className="profile-enter flex flex-col items-center justify-center lg:items-end">
          <div className="profile-frame">
            <img src={profileAsset.url} alt="Nitish Kumar Yadav" width="768" height="768" className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.025]" />
          </div>
          <div className="mt-7 grid w-full max-w-sm grid-cols-2 gap-x-6 gap-y-3 border-y border-border py-4 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground"><MapPin className="size-3.5" /> Location</span><span className="text-right">New Delhi, India</span>
            <span className="text-muted-foreground">Focus</span><span className="text-right">Full Stack · AI</span>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface py-16 sm:py-20">
        <div className="page-shell grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div className="reveal"><p className="section-kicker">Working principles</p><h2 className="mt-3 text-3xl font-semibold">How I build</h2></div>
          <div className="grid sm:grid-cols-2">
            {["Scalable System Design", "Debugging & Performance Optimization", "Clean Code & API Architecture", "Problem Solving (DSA-focused)", "Fast Learning & Execution with AI Tools"].map((item, index) => (
              <div key={item} className="reveal flex gap-4 border-t border-border py-5 sm:odd:pr-8 sm:even:border-l sm:even:pl-8"><span className="text-xs text-accent-strong">0{index + 1}</span><p className="font-medium">{item}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="work" className="page-shell section-space scroll-mt-20">
        <SectionHeading number="01" title="Selected Work" />
        <div className="mt-12 border-t border-border">
          {projects.map((project) => (
            <article key={project.title} className="project-row reveal group grid gap-8 border-b border-border py-10 lg:grid-cols-[5rem_1fr_1fr] lg:py-14">
              <span className="font-mono text-xs text-muted-foreground">{project.number}</span>
              <div><div className="flex flex-wrap items-center gap-3"><h3 className="text-3xl font-semibold sm:text-5xl">{project.title}</h3><span className="border border-border px-2 py-1 text-[10px] uppercase text-muted-foreground">{project.status}</span></div><div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">{project.stack.map((tech) => <span key={tech}>{tech}</span>)}</div></div>
              <div className="flex flex-col justify-between"><div><p className="leading-7">{project.description}</p><p className="mt-4 text-sm leading-6 text-muted-foreground">{project.detail}</p></div><span className="mt-7 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">Links available on request <ArrowRight className="project-arrow size-4" /></span></div>
            </article>
          ))}
        </div>
      </section>

      <section id="experience" className="border-y border-border bg-surface scroll-mt-20">
        <div className="page-shell section-space">
          <SectionHeading number="02" title="Experience" />
          <div className="mt-12">
            {experience.map((job) => (
              <article key={job.company} className="reveal grid gap-6 border-t border-border py-9 lg:grid-cols-[1fr_1fr_2fr]">
                <p className="font-semibold">{job.company}</p><div><p className="text-sm">{job.role}</p><p className="mt-2 font-mono text-xs text-muted-foreground">{job.date}</p></div>
                <ul className="space-y-3 text-sm leading-6 text-muted-foreground">{job.points.map((point) => <li key={point} className="flex gap-3"><Check className="mt-1 size-3.5 shrink-0 text-accent-strong" /><span>{point}</span></li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="journey" className="page-shell section-space scroll-mt-20">
        <SectionHeading number="03" title="My Journey" />
        <p className="reveal mt-5 max-w-xl text-muted-foreground">A continuing path through formal study, product engineering, mobile development, and applied AI.</p>
        <div className="journey-line mt-16 lg:mt-24">
          {journey.map((stage, index) => (
            <article key={stage.year} className={`journey-stage reveal ${index % 2 ? "lg:translate-y-24" : ""}`}>
              <div className="journey-node" aria-hidden="true" />
              <p className="text-4xl font-semibold text-accent-strong">{stage.year}</p>
              <div className="mt-6 space-y-5">{stage.items.map((item) => <div key={item} className="border-l border-border pl-4 text-sm leading-6 text-muted-foreground">{item}</div>)}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-ink text-ink-foreground">
        <div className="page-shell section-space grid gap-14 lg:grid-cols-[1fr_1.3fr]">
          <div className="reveal"><p className="section-kicker text-ink-muted">04 — AI Engineering</p><h2 className="mt-5 max-w-lg text-4xl font-semibold leading-tight sm:text-6xl">AI where it solves a real product problem.</h2><p className="mt-7 max-w-lg leading-7 text-ink-muted">Practical work includes Gemini API integration, chatbot development, prompt engineering, and PersonaX’s conversation and analytics architecture.</p></div>
          <div className="reveal self-end border-t border-ink-border"><div className="grid grid-cols-2 border-b border-ink-border py-5 text-sm"><span className="text-ink-muted">Applied</span><span>AI Integration · Gemini API · Chatbots · Prompt Engineering</span></div><div className="grid grid-cols-2 border-b border-ink-border py-5 text-sm"><span className="text-ink-muted">AI / Data Stack</span><span>Python · Pandas · NumPy · Matplotlib · PyTorch · TensorFlow · FastAPI</span></div><div className="grid grid-cols-2 border-b border-ink-border py-5 text-sm"><span className="text-ink-muted">Reference project</span><span>PersonaX — AI Chatbot</span></div></div>
        </div>
      </section>

      <section id="skills" className="page-shell section-space scroll-mt-20">
        <SectionHeading number="05" title="Technical Skills" />
        <div className="mt-12 border-t border-border">
          {skillGroups.map(([name, skills], index) => (
            <details key={name} className="skill-row reveal group" open={index < 2}>
              <summary><span className="font-mono text-xs text-muted-foreground">0{index + 1}</span><span className="text-xl font-semibold sm:text-2xl">{name}</span><ChevronDown className="size-4 transition-transform group-open:rotate-180" /></summary>
              <p className="pb-7 pl-10 pr-6 text-sm leading-7 text-muted-foreground sm:pl-16">{skills}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="about" className="border-y border-border bg-surface scroll-mt-20">
        <div className="page-shell section-space">
          <SectionHeading number="06" title="About" />
          <div className="mt-12 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
            <p className="reveal text-2xl font-medium leading-relaxed sm:text-4xl">I build scalable SaaS applications and production-grade web platforms across frontend, backend, infrastructure, and mobile.</p>
            <div className="reveal space-y-5 text-sm leading-7 text-muted-foreground"><p>My work includes secure authentication systems, admin dashboards, REST APIs, real-time features, Redis caching, BullMQ processing, and CI/CD.</p><p>I’m pursuing a Bachelor of Computer Applications at IGNOU and completed a Diploma in MERN Stack Web Development from Oxford Software Institute.</p><div className="grid grid-cols-2 border-t border-border pt-5"><span>English</span><span>Professional Proficiency</span><span>Hindi</span><span>Native / Bilingual</span></div></div>
          </div>
          <div className="mt-20 grid gap-10 border-t border-border pt-10 lg:grid-cols-2">
            <div className="reveal"><p className="section-kicker">Education</p><div className="mt-6 space-y-7"><div><h3 className="font-semibold">Bachelor of Computer Applications (BCA)</h3><p className="mt-1 text-sm text-muted-foreground">Indira Gandhi National Open University · Aug 2024–2027 · New Delhi</p></div><div><h3 className="font-semibold">Diploma in MERN Stack Web Development</h3><p className="mt-1 text-sm text-muted-foreground">Oxford Software Institute · Aug 2024–Aug 2025 · New Delhi</p></div></div></div>
            <div className="reveal"><p className="section-kicker">Certifications</p><div className="mt-6 space-y-7"><div><h3 className="font-semibold">Web Developer Intern</h3><p className="mt-1 text-sm text-muted-foreground">Hindustan Soft Education Ltd. · Oct 2025</p></div><div><h3 className="font-semibold">Full Stack Developer Intern</h3><p className="mt-1 text-sm text-muted-foreground">Rishiwar Industries Pvt. Ltd. · Feb 2026</p></div></div></div>
          </div>
        </div>
      </section>

      <section id="contact" className="page-shell section-space scroll-mt-20">
        <SectionHeading number="07" title="Contact" />
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <div className="reveal"><h2 className="max-w-4xl text-[clamp(3.5rem,8vw,7.5rem)] font-semibold leading-[0.9]">Let’s build something.</h2><Button asChild size="lg" className="mt-10 rounded-none shadow-none"><a href="mailto:hi@nitishyadav.com"><Mail /> Email Me</a></Button></div>
          <div className="reveal border-t border-border text-sm"><a className="contact-row" href="mailto:hi@nitishyadav.com"><span>Email</span><span>hi@nitishyadav.com</span></a><a className="contact-row" href="https://nitishyadav.com"><span>Website</span><span>nitishyadav.com</span></a><div className="contact-row"><span>Phone</span><span>+91 96255 32559</span></div><div className="contact-row text-muted-foreground"><span>GitHub</span><span>Link available soon</span></div></div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="page-shell grid gap-5 text-xs text-muted-foreground sm:grid-cols-[1fr_auto] sm:items-end"><div><p>© 2026 Nitish Kumar Yadav</p><p className="mt-2">Full Stack Developer · AI Engineer</p></div><div className="flex flex-wrap gap-5"><a href="mailto:hi@nitishyadav.com" className="hover:text-foreground">Email</a><a href="https://nitishyadav.com" className="hover:text-foreground">nitishyadav.com</a><span>GitHub link available soon</span></div></div>
      </footer>
    </main>
  );
}