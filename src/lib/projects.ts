export interface Project {
  description: string;
  featured?: boolean;
  href?: string;
  status?: "archived" | "decommissioned";
  statusNote?: string;
  title: string;
  year: string;
}

export const PROJECTS: Project[] = [
  {
    description:
      "Orchestration for coding agents across machines and providers.",
    featured: true,
    href: "https://github.com/arsenstorm/lgtm",
    title: "LGTM",
    year: "2026",
  },
  {
    description:
      "Serverless peer-to-peer voice rooms with end-to-end encryption.",
    featured: true,
    href: "https://github.com/arsenstorm/nearby",
    title: "Nearby",
    year: "2026",
  },
  {
    description:
      "An iOS app for storing and resurfacing polaroids in your Apple Wallet.",
    featured: true,
    href: "https://apps.apple.com/gb/app/memory-wallet/id6789089080",
    title: "Memory Wallet",
    year: "2026",
  },
  {
    description:
      "A Rails gateway that verifies, transforms, and reliably delivers webhooks.",
    featured: true,
    href: "https://github.com/arsenstorm/hookrail",
    title: "Hookrail",
    year: "2026",
  },
  {
    description: "Reliable browser automation for real-world workflows.",
    featured: true,
    href: "https://github.com/arsenstorm/automated-web",
    title: "Automated Web",
    year: "2026",
  },
  {
    description:
      "A protocol for low-latency live streaming on top of object storage.",
    featured: true,
    href: "https://github.com/arsenstorm/olos",
    title: "Open Live Object Streaming (OLOS)",
    year: "2026",
  },
  {
    description:
      "An email-native service that merges emailed images into a single PDF.",
    href: "/writing/using-email-as-an-interface",
    title: "img-to-pdf",
    year: "2026",
  },
  {
    description: "Privacy-first identity verification.",
    href: "https://github.com/kayleai/kayle-id-v1",
    title: "Kayle ID",
    year: "2026",
  },
  {
    description: "A personal film archive.",
    href: "https://films.arsenstorm.com",
    title: "Films",
    year: "2026",
  },
  {
    description: "Compare AI model outputs side by side.",
    href: "https://ai.arsenstorm.com",
    title: "AI Gateway",
    year: "2026",
  },
  {
    description: "iOS app for reading identity documents over NFC.",
    href: "https://apps.apple.com/us/app/id-reader/id6757679372",
    title: "iOS ID Reader",
    year: "2026",
  },
  {
    description:
      "A Swift library for reading NFC-enabled passports and ID cards.",
    href: "https://github.com/arsenstorm/MRTDReader",
    title: "MRTDReader",
    year: "2026",
  },
  {
    description: "Expert tutoring for top students.",
    title: "World Class Education",
    year: "2025",
  },
  {
    description:
      "A CLI that explains how to install missing command dependencies.",
    href: "https://github.com/arsenstorm/run-this",
    title: "run-this",
    year: "2025",
  },
  {
    description: "A curated directory for discovering useful APIs.",
    title: "Request Directory",
    year: "2025",
  },
  {
    description:
      "Parallel AI agents for processing every row of an uploaded CSV.",
    title: "Arsen Agents",
    year: "2025",
  },
  {
    description: "Search and track across your favorite podcasts.",
    href: "https://trackmypodcast.com",
    title: "Track My Podcast",
    year: "2025",
  },
  {
    description: "Cross-posting to social media, built for developers.",
    href: "https://sotsial.com",
    title: "Sotsial",
    year: "2024",
  },
  {
    description: "Analytics and data for optimising Amazon listings and sales.",
    href: "https://amazonomics.com",
    title: "Amazonomics",
    year: "2024",
  },
  {
    description: "Useful tools that should be in GitHub, but aren't.",
    href: "https://eght.arsenstorm.com",
    title: "Extra GitHub Tools",
    year: "2024",
  },
  {
    description:
      "An AI assistant that could take actions across external services.",
    title: "PLAM",
    year: "2024",
  },
  {
    description:
      "Developer infrastructure for moderating harmful user-generated content.",
    title: "Kayle",
    year: "2023",
  },
  {
    description:
      "A GPT-powered virtual assistant available through web, email, SMS and voice.",
    title: "Rosel",
    year: "2023",
  },
  {
    description:
      "AI-curated Arsenal news aggregated and summarised from across the web.",
    title: "Arsenal Insiders",
    year: "2023",
  },
  {
    description: "An Instagram bot that replied to mentions using GPT-4.",
    title: "MentionGPT",
    year: "2023",
  },
  {
    description:
      "Security infrastructure and developer APIs for websites and applications.",
    title: "DevRIFT",
    year: "2022",
  },
  {
    description: "AI-assisted marking software for teachers.",
    title: "EduRIFT",
    year: "2022",
  },
  {
    description: "Computer vision for checking vehicles against DVLA records.",
    title: "ANPR",
    year: "2022",
  },
];
