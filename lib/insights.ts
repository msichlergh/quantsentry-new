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
    bio: "Akash works at the intersection of risk infrastructure and business intelligence, helping trading firms turn operational data into better decisions.",
    image: "/images/team/Akash-Thakrar.webp",
    linkedIn: "https://www.linkedin.com/in/akashthakrar/",
  },
  {
    slug: "leonard-breitkopf",
    name: "Leonard Breitkopf",
    role: "Chief Technology Officer",
    bio: "Leonard leads platform architecture and engineering across Quant Technology Group, with a focus on trading infrastructure that remains reliable at scale.",
    image: "/images/team/Leonard-Breitkopf.webp",
    linkedIn: "https://www.linkedin.com/in/leonardbreitkopf/?skipRedirect=true",
  },
  {
    slug: "milos-mosovsky",
    name: "Milos Mosovsky",
    role: "Head of R&D",
    bio: "Milos leads research and development across the AI models behind QuantSentry, from behavioural detection to operator-facing evidence.",
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
    title: "Why Retail Prop Firms Can’t Scale Without Dedicated Risk Management",
    summary:
      "Why risk management has become a source of business intelligence, not simply a way to catch abuse.",
    category: "Industry Insights",
    publishedAt: "2026-06-05",
    publishedLabel: "5 Jun 2026",
    readTime: "7 min read",
    authorSlug: "akash-thakrar",
    sourceUrl:
      "https://quanttechnology.com/insights/why-prop-firms-need-dedicated-risk-management",
    sections: [
      {
        heading: "Risk moved into the operating core",
        paragraphs: [
          "At scale, risk is no longer a separate review queue. It connects trading behaviour, identity, payouts, and commercial performance in one operational view.",
          "The firms that learn from those signals can protect capital while making faster, more consistent decisions for legitimate traders.",
        ],
      },
      {
        heading: "Evidence changes the decision",
        paragraphs: [
          "A useful alert explains the accounts, sessions, payments, and execution patterns behind it. That evidence lets an operator distinguish a real network from a coincidental similarity.",
          "The objective is not to automate judgment. It is to give the risk team enough connected context to make a defensible judgment quickly.",
        ],
      },
    ],
    takeaway:
      "Dedicated risk infrastructure turns fragmented activity into evidence that protects payouts and improves the operating model.",
  },
  {
    slug: "quantsentry-generally-available",
    title: "QuantSentry Is Generally Available",
    summary:
      "AI-native risk infrastructure for prop firms that need live detection, connected evidence, and operator-controlled decisions.",
    category: "Product Updates",
    publishedAt: "2026-02-10",
    publishedLabel: "10 Feb 2026",
    readTime: "5 min read",
    authorSlug: "milos-mosovsky",
    sourceUrl:
      "https://quanttechnology.com/insights/quant-technology-group-launches-quantsentry",
    sections: [
      {
        heading: "From isolated rules to connected intelligence",
        paragraphs: [
          "QuantSentry brings execution, session, identity, and payment signals into one investigation layer. Operators can see the network behind a flag instead of reviewing disconnected events.",
          "The platform is designed to sit above the systems a trading business already uses, so teams can improve visibility without replacing their operating stack.",
        ],
      },
      {
        heading: "Human control remains explicit",
        paragraphs: [
          "Models rank and explain risk. People decide what happens next. QuantSentry does not move money, close accounts, or clear payouts on its own.",
          "Every investigation retains the underlying evidence and the actions taken, creating an audit trail that the business can defend.",
        ],
      },
    ],
    takeaway:
      "QuantSentry makes connected risk evidence available in real time while keeping every consequential decision with the operator.",
  },
  {
    slug: "modern-risk-infrastructure-prop-firms",
    title: "What Modern Risk Infrastructure Should Look Like for Prop Firms",
    summary:
      "A practical model for live rules, exposure monitoring, behavioural detection, and investigation-ready evidence.",
    category: "Industry Insights",
    publishedAt: "2026-03-31",
    publishedLabel: "31 Mar 2026",
    readTime: "10 min read",
    authorSlug: "leonard-breitkopf",
    sourceUrl:
      "https://quanttechnology.com/insights/modern-risk-infrastructure-prop-firms",
    sections: [
      {
        heading: "Manual review has a ceiling",
        paragraphs: [
          "Spreadsheets and sampling can support a small book, but they become unreliable as account volume and platform coverage grow. The missed signal is often the one that matters most.",
          "Modern infrastructure applies deterministic rules continuously, then uses behavioural models to prioritise the cases that need expert review.",
        ],
      },
      {
        heading: "Detection must arrive with context",
        paragraphs: [
          "A score alone is not an investigation. Reviewers need the trades, linked identities, shared infrastructure, and timeline that produced it.",
          "That context makes decisions faster and fairer: good traders can be cleared quickly, while coordinated abuse can be handled with evidence.",
        ],
      },
    ],
    takeaway:
      "The right risk stack handles volume automatically, surfaces evidence clearly, and preserves human judgment at the decision point.",
  },
  {
    slug: "ai-agents-reduce-support-workload",
    title: "How AI Agents Can Reduce Support Workload for Trading Businesses",
    summary:
      "Where context-aware agents help with repetitive operational work—and where an operator must stay in the loop.",
    category: "Industry Insights",
    publishedAt: "2026-04-14",
    publishedLabel: "14 Apr 2026",
    readTime: "9 min read",
    authorSlug: "milos-mosovsky",
    sourceUrl:
      "https://quanttechnology.com/insights/ai-agents-reduce-support-workload",
    sections: [
      {
        heading: "Context is the difference",
        paragraphs: [
          "A generic chatbot can repeat policy. A useful agent can read the relevant account state, assemble the evidence, and either resolve a narrow task or hand it to the right person.",
          "That grounding matters most in trading operations, where payout, KYC, and rule questions depend on the facts of a specific account.",
        ],
      },
      {
        heading: "Start with bounded work",
        paragraphs: [
          "The strongest first use cases are high-volume, low-judgment tasks: ticket classification, document chasing, and status explanations based on live data.",
          "Money, disputes, and risk decisions should escalate with the context already assembled. The agent reduces repetitive work without pretending judgment is automatic.",
        ],
      },
    ],
    takeaway:
      "Agents create value when they have real context, a narrow job, and a clear handoff to a human for consequential decisions.",
  },
  {
    slug: "outgrowing-fragmented-infrastructure",
    title: "Why Trading Businesses Are Outgrowing Fragmented Infrastructure",
    summary:
      "Disconnected CRMs, payout tools, and risk systems create an operational tax that compounds with every stage of growth.",
    category: "Industry Insights",
    publishedAt: "2026-04-28",
    publishedLabel: "28 Apr 2026",
    readTime: "8 min read",
    authorSlug: "leonard-breitkopf",
    sourceUrl:
      "https://quanttechnology.com/insights/outgrowing-fragmented-infrastructure",
    sections: [
      {
        heading: "Fragmentation compounds quietly",
        paragraphs: [
          "Most trading businesses do not choose a fragmented stack deliberately. They add sensible tools one at a time until people become the integration layer between them.",
          "The cost appears as reconciliation work, inconsistent decisions, slow reporting, and risk signals that no single system can see.",
        ],
      },
      {
        heading: "Consolidate the data before the interface",
        paragraphs: [
          "A connected operation does not require replacing every tool at once. It requires one reliable activity layer that identity, risk, payouts, and reporting can read from together.",
          "Once those functions share context, a signal found in one part of the business becomes useful everywhere else.",
        ],
      },
    ],
    takeaway:
      "The scalable alternative to more point tools is a shared data layer that connects operations, risk, and decisions.",
  },
  {
    slug: "monevis-technology-assets",
    title: "QTG Acquires Monevis Technology Assets",
    summary:
      "The acquisition brings AI-based alpha identification, risk technology, and specialist engineering capability into the group.",
    category: "Company News",
    publishedAt: "2025-10-01",
    publishedLabel: "1 Oct 2025",
    readTime: "5 min read",
    authorSlug: "markus-sichler",
    sourceUrl:
      "https://quanttechnology.com/insights/quant-technology-group-acquires-monevis-technology-assets",
    sections: [
      {
        heading: "Capability moves in-house",
        paragraphs: [
          "The transaction brings tested models for identifying trading behaviour and managing risk into the Quant Technology Group ecosystem.",
          "It also brings the team that developed that technology into the group, shortening the path from research to production use inside QuantSentry.",
        ],
      },
      {
        heading: "A broader intelligence roadmap",
        paragraphs: [
          "The acquired capability supports risk products today and creates a foundation for additional markets where live behavioural evidence matters.",
          "For QuantSentry, the result is deeper research capacity and a faster product roadmap across identity resolution, pattern detection, and evidence generation.",
        ],
      },
    ],
    takeaway:
      "QTG added both proven risk technology and the people who built it, strengthening QuantSentry’s long-term intelligence roadmap.",
  },
  {
    slug: "ifx-expo-dubai-2026",
    title: "iFX EXPO Dubai 2026",
    summary:
      "Three days of operator conversations about proprietary trading technology, risk infrastructure, and platform migration.",
    category: "Event Recaps",
    publishedAt: "2026-02-12",
    publishedLabel: "10–12 Feb 2026",
    readTime: "4 min read",
    authorSlug: "markus-sichler",
    sourceUrl: "https://quanttechnology.com/events",
    sections: [
      {
        heading: "Risk moved to the centre of the conversation",
        paragraphs: [
          "Operators arrived with practical questions about payout review, coordinated behaviour, and how to connect data across platforms without creating another silo.",
          "The strongest discussions focused less on standalone detection and more on how evidence should move through the operating workflow.",
        ],
      },
      {
        heading: "What we brought back",
        paragraphs: [
          "The event reinforced the need for integrations that are fast to deploy and investigation views that work for both specialist risk teams and senior operators.",
          "Those conversations continue to shape QuantSentry’s connector roadmap and the way evidence is presented across the platform.",
        ],
      },
    ],
    takeaway:
      "Trading firms want connected risk workflows: live signals, clear evidence, and a practical path from detection to operator action.",
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
