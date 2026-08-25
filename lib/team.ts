import type { TeamGroup } from "@/components/TeamSection";

export const executiveTeamGroups = [
  {
    title: "Technical Leadership",
    description: "Platform architecture, infrastructure, research, and engineering delivery across QTG.",
    members: [
      {
        name: "Leonard Breitkopf",
        role: "Chief Technology Officer",
        bio: "Leads platform architecture and engineering across Quant Technology Group.",
        image: "/images/team/Leonard-Breitkopf.webp",
        linkedIn: "https://www.linkedin.com/in/leonardbreitkopf/?skipRedirect=true",
      },
      {
        name: "Martin Yi",
        role: "VP Development",
        bio: "Oversees delivery across the group’s engineering teams.",
        image: "/images/team/Martin-Yi.webp",
        linkedIn: "https://www.linkedin.com/in/martin-yi/?skipRedirect=true",
      },
      {
        name: "Ryan Beasley",
        role: "Head of Innovation",
        bio: "Explores and develops new products and capabilities across the group.",
        image: "/images/team/Ryan-Beasley.webp",
        linkedIn: "https://www.linkedin.com/in/ryan-beasley-3557b71b2/",
      },
      {
        name: "Milos Mosovsky",
        role: "Head of R&D",
        bio: "Leads research and AI risk-model development for QuantSentry.",
        image: "/images/team/Milos-Mosovsky.webp",
        linkedIn: "https://www.linkedin.com/in/mosovsky/",
      },
      {
        name: "Henry Wallace",
        role: "President, TraderWaves",
        bio: "Leads TraderWaves strategy, product direction, and growth.",
        image: "/images/team/Henry-Wallace.webp",
        linkedIn: "https://www.linkedin.com/in/henry-wallace-16234b3b8/",
      },
    ],
  },
  {
    title: "Business Leadership",
    description: "Commercial strategy, finance, operations, partnerships, and global scale.",
    members: [
      {
        name: "Stasys Brilis",
        role: "Chief Business Officer",
        bio: "Leads commercial strategy, partnerships, and international growth.",
        image: "/images/team/Stasys-Brilis.webp",
        linkedIn: "https://www.linkedin.com/in/stasysbrilis/?skipRedirect=true",
      },
      {
        name: "Rawad Jaber",
        role: "Chief Financial Officer",
        bio: "Directs finance, legal, and operational scaling across the group.",
        image: "/images/team/Rawad-Jaber.webp",
        linkedIn: "https://www.linkedin.com/in/rawad-jaber/",
      },
      {
        name: "Akash Thakrar",
        role: "Corporate Development",
        bio: "Leads mergers, acquisitions, and strategic corporate development.",
        image: "/images/team/Akash-Thakrar.webp",
        linkedIn: "https://www.linkedin.com/in/akashthakrar/",
      },
      {
        name: "Marcel Rauscher",
        role: "Chief Sales Officer",
        bio: "Heads global sales and operator partnerships.",
        image: "/images/team/Marcel-Rauscher.webp",
        linkedIn: "https://www.linkedin.com/in/marcel-rauscher/",
      },
      {
        name: "Sam Bradbury",
        role: "VP of Business Development",
        bio: "Develops new business across QTG’s operator network.",
        image: "/images/team/Sam-Bradbury.webp",
        linkedIn: "https://www.linkedin.com/in/sam-bradbury-08b322246/",
      },
    ],
  },
  {
    title: "Board of Directors",
    description: "Strategic oversight, founding direction, and long-term alignment.",
    members: [
      {
        name: "Lawrence Latham",
        role: "Strategy & Governance",
        bio: "Oversees corporate governance and long-term strategic direction.",
        image: "/images/team/Lawrence-Latham.webp",
        linkedIn: "https://www.linkedin.com/in/lawrence-latham/",
      },
      {
        name: "Jeremias Mandel",
        role: "Co-Founder",
        bio: "Co-founded QTG and leads vision and industry partnerships.",
        image: "/images/team/Jeremias-Mandel.webp",
        linkedIn: "https://www.linkedin.com/in/jeremiasmandel/",
      },
      {
        name: "Markus Sichler",
        role: "Co-Founder",
        bio: "Co-founded QTG and shapes product and company direction.",
        image: "/images/team/Markus-Sichler.webp",
        linkedIn: "https://www.linkedin.com/in/msichler/",
      },
    ],
  },
] as const satisfies readonly TeamGroup[];
