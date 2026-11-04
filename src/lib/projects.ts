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
      "Built a modern admissions and student-management platform focused on lead capture, workflow automation, and scalable digital operations for education businesses.",
    details: [
      "Designed a modular web architecture for admissions, CRM, and workflow management.",
      "Built responsive UI patterns for high-conversion customer journeys and internal data workflows.",
      "Connected backend systems with secure data handling and operational dashboards.",
    ],
    features: [
      "admissions workflows",
      "lead capture",
      "customer portals",
      "operations dashboards",
      "automation systems",
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
      "Created an AI-powered workflow platform for admissions and operations, helping teams automate lead routing, engagement, and business-critical decision support.",
    details: [
      "Built AI-assisted user flows for operational tasks and customer support.",
      "Structured a clean, scalable frontend and backend for multi-step automation logic.",
      "Focused on conversion-oriented workflows and simplified business operations.",
    ],
    features: [
      "AI-assisted workflows",
      "lead routing",
      "automated admissions operations",
      "business insights",
      "team productivity tools",
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
      "Designed and developed a premium insurance and financial services website with a strong editorial style, lead-generation flow, and clear content architecture.",
    details: [
      "Built a content-focused user experience for finance and insurance audiences.",
      "Created a scalable, mobile-responsive marketing and conversion flow.",
      "Emphasized trust-building content, service clarity, and strategic customer journeys.",
    ],
    features: [
      "insurance landing pages",
      "financial service storytelling",
      "lead generation flow",
      "responsive marketing layout",
      "content-first UX",
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
    blurb: "Products, experiments and engineering projects I've built.",
  },
  {
    value: "personal",
    label: "Personal Projects",
    blurb: "Projects that sharpen systems design and product thinking.",
  },
  {
    value: "fun",
    label: "For Fun",
    blurb: "Creative prototypes and side exploration.",
  },
  {
    value: "learning",
    label: "For Learning",
    blurb: "Experiments focused on learning and iteration.",
  },
] as const;

export function getProjectsByCategory(category: ProjectCategory) {
  return PROJECTS.filter((project) => project.category === category);
}
