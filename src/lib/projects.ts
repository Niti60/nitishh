import admeasyLong from "../assets/admeasy-long.png";
import aiAdmeasyLong from "../assets/aiadmeasy-long.png";
import mohinderLong from "../assets/mohinder-long.png";

export type ProjectCategory = "selected" | "personal" | "fun" | "learning";

export type Project = {
  id: string;
  name: string;
  status?: string;
  category: ProjectCategory;
  tech: string[];
  summary: string;
  details: string[];
  features: string[];
  cover?: string;
  browserDomain: string;
  live?: string;
  github?: string;
  private?: boolean;
};

export const PROJECTS: Project[] = [
  {
    id: "admeasy",
    name: "Admeasy",
    status: "Ongoing",
    category: "selected",
    tech: ["React", "Next.js", "Node.js", "MongoDB", "Tailwind CSS"],
    summary:
      "Full-stack admissions and student management platform built with React, Next.js, Node.js, and MongoDB, streamlining student lead intake and counselor workflows for educational institutes.",
    details: [
      "Architected the core web platform and REST APIs for multi-stage admissions tracking, lead status updates, and student record management.",
      "Built over 50 responsive interface pages with role-based dashboards for counselors, team leads, and system administrators.",
      "Integrated Redis caching and BullMQ background job queues to handle batch email notifications, status reminders, and data exports.",
    ],
    features: [
      "Lead capture and source attribution",
      "Counselor CRM dashboard",
      "Multi-stage admissions pipeline",
      "Role-based access control (RBAC)",
      "Automated background task queues",
    ],
    cover: admeasyLong,
    browserDomain: "admeasy.in",
    live: "https://admeasy.in",
  },
  {
    id: "admeasy-ai",
    name: "Admeasy AI",
    status: "Ongoing",
    category: "selected",
    tech: ["React", "AI", "Node.js", "FastAPI", "MongoDB"],
    summary:
      "AI-assisted lead qualification and inquiry automation service combining FastAPI, Node.js, and Google's Gemini API to accelerate response times and categorize student queries.",
    details: [
      "Developed backend microservices in FastAPI and Node.js that process inbound student inquiries and generate structured intent classifications.",
      "Implemented prompt pipelines and context-aware query assistants to answer common admission questions 24/7.",
      "Connected the AI routing engine directly to counselor dashboards, flagging high-priority leads for immediate human follow-up.",
    ],
    features: [
      "Automated intent classification",
      "24/7 AI inquiry assistant",
      "Dynamic lead priority scoring",
      "Gemini API integration",
      "Counselor handoff workflows",
    ],
    cover: aiAdmeasyLong,
    browserDomain: "admeasy.in",
    live: "https://admeasy.in",
  },
  {
    id: "mohinder",
    name: "Mohindra Financial",
    category: "selected",
    tech: ["React", "Node.js", "MongoDB", "Responsive Design", "UI Systems"],
    summary:
      "Financial advisory and insurance web platform designed with React, Node.js, and MongoDB, delivering clear policy comparisons and structured lead generation funnels.",
    details: [
      "Structured a content-first information architecture that simplifies insurance products across health, life, motor, and commercial coverage.",
      "Engineered responsive quote request funnels and contact endpoints with input validation and automated lead capture.",
      "Optimized page load speeds, typography rendering, and on-page technical SEO to drive local organic discovery.",
    ],
    features: [
      "Insurance policy comparison flows",
      "Validated quote inquiry forms",
      "Responsive editorial layout",
      "SEO-optimized product pages",
      "Fast-loading mobile experience",
    ],
    cover: mohinderLong,
    browserDomain: "mohinderafinancial.com",
    live: "https://mohinderafinancial.com",
  },
];

export const PROJECT_CATEGORIES = [
  {
    value: "selected",
    label: "Selected Work",
    blurb: "Production web applications, client systems, and engineering projects I've built.",
  },
  {
    value: "personal",
    label: "Personal Projects",
    blurb: "Independent software projects exploring backend architecture and system design.",
  },
  {
    value: "fun",
    label: "For Fun",
    blurb: "Creative developer experiments, tools, and visual prototypes.",
  },
  {
    value: "learning",
    label: "For Learning",
    blurb: "Focused codebases testing new libraries, algorithms, and models.",
  },
] as const;

export function getProjectsByCategory(category: ProjectCategory) {
  return PROJECTS.filter((project) => project.category === category);
}
