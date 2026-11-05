export const SITE = {
  name: "Nitish Kumar Yadav",
  short: "Nitish Yadav",
  role: "Full Stack Developer · AI Engineer",
  location: "New Delhi, India",
  email: "hi@nitishyadav.com",
  phone: "+91 96255 32559",
  website: "nitishyadav.com",
  status: "Currently: Full Stack Developer @ Admeasy",
  profileImage: "/profile.jpg",
} as const;

export const LINKS = {
  resume: "/Nitish-Kumar-Yadav-Resume.pdf",
  social: {
    github: "",
    linkedin: "",
  },
} as const;

export const SECTION_IDS = [
  "top",
  "work",
  "engineering",
  "experience",
  "journey",
  "about",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const NAV_ITEMS: { id: SectionId | "work-page"; label: string; section?: SectionId }[] = [
  { id: "top", label: "Home", section: "top" },
  { id: "work-page", label: "Work", section: "work" },
  { id: "engineering", label: "Engineering", section: "engineering" },
  { id: "experience", label: "Experience", section: "experience" },
  { id: "journey", label: "Journey", section: "journey" },
  { id: "about", label: "About", section: "about" },
];

export const NAV_OFFSET = 72;
export const SCROLL_TO_KEY = "portfolio-scroll-to";

export function scrollToSection(id: string, behavior: ScrollBehavior = "smooth") {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior });
}

export function storePendingSection(id: string) {
  try {
    sessionStorage.setItem(SCROLL_TO_KEY, id);
  } catch {
    // ignore
  }
}

export function consumePendingSection() {
  try {
    const id = sessionStorage.getItem(SCROLL_TO_KEY);
    if (id) sessionStorage.removeItem(SCROLL_TO_KEY);
    return id;
  } catch {
    return null;
  }
}
