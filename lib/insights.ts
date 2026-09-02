export const insightCategories = [
  "Company News",
  "Industry Insights",
  "Product Updates",
  "Event Recaps",
] as const;

export type InsightCategory = (typeof insightCategories)[number];

export type InsightAuthor = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedIn: string;
};

export type InsightSection = {
  heading: string;
  paragraphs: readonly string[];
};

export type InsightArticle = {
  slug: string;
  title: string;
  summary: string;
  category: InsightCategory;
  publishedAt: string;
  publishedLabel: string;
  readTime: string;
  authorSlug: string;
  sourceUrl: string;
  sections: readonly InsightSection[];
  takeaway: string;
};

export const insightAuthors = [
  {
    slug: "akash-thakrar",
    name: "Akash Thakrar",
    role: "Head of Corporate Development",
    bio: "Akash helps trading firms use risk and business data to make better decisions.",
    image: "/images/team/Akash-Thakrar.webp",
    linkedIn: "https://www.linkedin.com/in/akashthakrar/",
  },
  {
    slug: "leonard-breitkopf",
    name: "Leonard Breitkopf",
    role: "Chief Technology Officer",
    bio: "Leonard leads platform engineering across Quant Technology Group, with a focus on reliable systems for growing trading businesses.",
    image: "/images/team/Leonard-Breitkopf.webp",
    linkedIn: "https://www.linkedin.com/in/leonardbreitkopf/?skipRedirect=true",
  },
  {
    slug: "milos-mosovsky",
    name: "Milos Mosovsky",
    role: "Head of R&D",
    bio: "Milos leads the AI research behind QuantSentry, from finding trading patterns to presenting clear evidence.",
    image: "/images/team/Milos-Mosovsky.webp",
    linkedIn: "https://www.linkedin.com/in/mosovsky/",
  },
  {
    slug: "markus-sichler",
    name: "Markus Sichler",
    role: "Co-Founder",
    bio: "Markus helps shape the technology, risk, and infrastructure that Quant Technology Group builds for modern prop firms and brokers.",
    image: "/images/team/Markus-Sichler.webp",
    linkedIn: "https://www.linkedin.com/in/msichler/",
  },
] as const satisfies readonly InsightAuthor[];

export const insightArticles = [
  {
    slug: "why-prop-firms-need-dedicated-risk-management",
    title: "Why Prop Firms Need Dedicated Risk Management",
    summary:
      "How dedicated risk management helps prop firms protect payouts and make faster, more consistent decisions.",
    category: "Industry Insights",
    publishedAt: "2026-06-05",
    publishedLabel: "5 Jun 2026",
    readTime: "7 min read",
    authorSlug: "akash-thakrar",
    sourceUrl:
      "https://quanttechnology.com/insights/why-prop-firms-need-dedicated-risk-management",
    sections: [
      {
        heading: "Risk Is Part of Daily Operations",
        paragraphs: [
          "As a firm grows, risk can no longer sit in a separate review queue. Trading activity, identity, payouts and business performance need one clear view.",
          "When teams can see those signals together, they can protect capital and make faster, more consistent decisions for legitimate traders.",
        ],
      },
      {
        heading: "Evidence Makes Decisions Easier",
        paragraphs: [
          "A useful alert shows the accounts, sessions, payments and trading patterns behind it. That evidence helps a reviewer separate real coordination from coincidence.",
          "The goal is not to automate judgment. It is to give the risk team enough evidence to make a clear decision quickly.",
        ],
      },
    ],
    takeaway:
      "Dedicated risk management turns disconnected activity into clear evidence that protects payouts and supports better decisions.",
  },
  {
    slug: "quantsentry-generally-available",
    title: "QuantSentry Is Now Available",
    summary:
      "Live risk detection and connected evidence for prop firms, with every final decision kept under human control.",
    category: "Product Updates",
    publishedAt: "2026-02-10",
    publishedLabel: "10 Feb 2026",
    readTime: "5 min read",
    authorSlug: "milos-mosovsky",
    sourceUrl:
      "https://quanttechnology.com/insights/quant-technology-group-launches-quantsentry",
    sections: [
      {
        heading: "From Separate Alerts to One Clear View",
        paragraphs: [
          "QuantSentry brings trading, session, identity and payment signals into one investigation view. Reviewers can see the group behind a flag instead of checking separate events.",
          "The platform connects to the systems a trading business already uses, so teams gain a clearer view without replacing their existing tools.",
        ],
      },
      {
        heading: "People Keep Control",
        paragraphs: [
          "QuantSentry ranks and explains risk. People decide what happens next. It does not move money, close accounts or clear payouts on its own.",
          "Each investigation keeps the supporting evidence and a record of what happened, so the business can explain its decision.",
        ],
      },
    ],
    takeaway:
      "QuantSentry shows connected risk evidence in real time while keeping every important decision with the team.",
  },
  {
    slug: "modern-risk-infrastructure-prop-firms",
    title: "What Modern Risk Management Looks Like for Prop Firms",
    summary:
      "A practical approach to live rule checks, risk monitoring, pattern detection and clear evidence.",
    category: "Industry Insights",
    publishedAt: "2026-03-31",
    publishedLabel: "31 Mar 2026",
    readTime: "10 min read",
    authorSlug: "leonard-breitkopf",
    sourceUrl:
      "https://quanttechnology.com/insights/modern-risk-infrastructure-prop-firms",
    sections: [
      {
        heading: "Manual Review Does Not Scale",
        paragraphs: [
          "Spreadsheets and samples can support a small business, but they become unreliable as account numbers and platform coverage grow.",
          "Modern systems check clear rules continuously, then highlight the cases that need expert review.",
        ],
      },
      {
        heading: "Every Alert Needs Evidence",
        paragraphs: [
          "A score alone is not enough. Reviewers need the trades, linked identities, shared devices and timeline behind it.",
          "That context makes decisions faster and fairer: good traders can be cleared quickly, while coordinated abuse can be handled with evidence.",
        ],
      },
    ],
    takeaway:
      "The right risk system handles volume, shows evidence clearly and keeps people in control of each decision.",
  },
  {
    slug: "ai-agents-reduce-support-workload",
    title: "How AI Agents Can Reduce Support Workload for Trading Businesses",
    summary:
      "Where AI can reduce repetitive support work, and where a person must stay involved.",
    category: "Industry Insights",
    publishedAt: "2026-04-14",
    publishedLabel: "14 Apr 2026",
    readTime: "9 min read",
    authorSlug: "milos-mosovsky",
    sourceUrl:
      "https://quanttechnology.com/insights/ai-agents-reduce-support-workload",
    sections: [
      {
        heading: "Useful AI Needs the Right Data",
        paragraphs: [
          "A generic chatbot can repeat policy. A useful assistant can read the relevant account data, collect the evidence and send the task to the right person when needed.",
          "That matters in trading operations, where payout, KYC and rule questions depend on the facts of a specific account.",
        ],
      },
      {
        heading: "Start With Clear, Limited Tasks",
        paragraphs: [
          "Good first tasks include sorting tickets, requesting missing documents and explaining a status from live data.",
          "Money, disputes and risk decisions should go to a person with the evidence already collected. AI reduces repetitive work without replacing judgment.",
        ],
      },
    ],
    takeaway:
      "AI creates value when it has the right data, a clear task and a simple handoff to a person for important decisions.",
  },
  {
    slug: "outgrowing-fragmented-infrastructure",
    title: "Why Disconnected Tools Slow Trading Businesses",
    summary:
      "Disconnected CRM, payout and risk tools create more manual work as a trading business grows.",
    category: "Industry Insights",
    publishedAt: "2026-04-28",
    publishedLabel: "28 Apr 2026",
    readTime: "8 min read",
    authorSlug: "leonard-breitkopf",
    sourceUrl:
      "https://quanttechnology.com/insights/outgrowing-fragmented-infrastructure",
    sections: [
      {
        heading: "Disconnected Tools Create Hidden Work",
        paragraphs: [
          "Most trading businesses add useful tools one at a time. Eventually, people have to move information between them by hand.",
          "The result is repeated data checks, inconsistent decisions, slow reports and risk signals that no single tool can see.",
        ],
      },
      {
        heading: "Connect the Data Before Replacing Tools",
        paragraphs: [
          "You do not need to replace every tool at once. Start by connecting identity, risk, payout and reporting data in one reliable view.",
          "Once teams share that view, a signal found in one part of the business becomes useful everywhere else.",
        ],
      },
    ],
    takeaway:
      "A shared view of business data connects operations, risk and decisions without adding more separate tools.",
  },
  {
    slug: "monevis-technology-assets",
    title: "QTG Acquires Monevis Technology Assets",
    summary:
      "The acquisition brings proven trading analysis, risk technology and an experienced engineering team into the group.",
    category: "Company News",
    publishedAt: "2025-10-01",
    publishedLabel: "1 Oct 2025",
    readTime: "5 min read",
    authorSlug: "markus-sichler",
    sourceUrl:
      "https://quanttechnology.com/insights/quant-technology-group-acquires-monevis-technology-assets",
    sections: [
      {
        heading: "Technology and Expertise Join the Group",
        paragraphs: [
          "The transaction brings tested technology for finding trading patterns and managing risk into Quant Technology Group.",
          "The team that built the technology also joins the group, helping QuantSentry turn research into working product features faster.",
        ],
      },
      {
        heading: "A Stronger Product Roadmap",
        paragraphs: [
          "The acquired technology supports today’s risk products and can help QuantSentry serve more markets over time.",
          "It also strengthens research across identity matching, pattern detection and evidence generation.",
        ],
      },
    ],
    takeaway:
      "QTG added proven risk technology and the people who built it, strengthening QuantSentry’s long-term product roadmap.",
  },
  {
    slug: "ifx-expo-dubai-2026",
    title: "iFX EXPO Dubai 2026",
    summary:
      "Three days of conversations about prop trading technology, risk management and moving between platforms.",
    category: "Event Recaps",
    publishedAt: "2026-02-12",
    publishedLabel: "10–12 Feb 2026",
    readTime: "4 min read",
    authorSlug: "markus-sichler",
    sourceUrl: "https://quanttechnology.com/events",
    sections: [
      {
        heading: "Risk Became a Main Topic",
        paragraphs: [
          "Teams asked practical questions about payout reviews, coordinated trading and connecting data across platforms without creating another separate system.",
          "The strongest discussions focused on how evidence should move from detection to the person making the decision.",
        ],
      },
      {
        heading: "What we brought back",
        paragraphs: [
          "The event reinforced the need for quick integrations and clear investigation views that work for both risk specialists and business leaders.",
          "Those conversations continue to shape QuantSentry’s connector roadmap and the way evidence is presented across the platform.",
        ],
      },
    ],
    takeaway:
      "Trading firms want live risk signals, clear evidence and a simple path from detection to a human decision.",
  },
] as const satisfies readonly InsightArticle[];

export function getInsightAuthor(slug: string) {
  return insightAuthors.find((author) => author.slug === slug);
}

export function getInsightArticle(slug: string) {
  return insightArticles.find((article) => article.slug === slug);
}

export function getArticlesByAuthor(authorSlug: string) {
  return insightArticles
    .filter((article) => article.authorSlug === authorSlug)
    .toSorted((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}
