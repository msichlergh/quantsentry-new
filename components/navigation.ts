export const industryLinks = [
  {
    href: "/industries-prop-trading",
    label: "Prop Trading",
    status: "Live",
    statusColour: "var(--cy)",
    description:
      "Coordinated abuse, payout integrity and the economics of a funded book.",
  },
  {
    href: "/industries-brokerages",
    label: "Brokerages",
    status: "Early Access",
    statusColour: "var(--amb)",
    description:
      "Toxic flow, latency abuse and bonus fraud across a retail book.",
  },
  {
    href: "/industries-funds",
    label: "Funds and Asset Managers",
    status: "Early Access",
    statusColour: "var(--amb)",
    description:
      "Allocation integrity, front running patterns and mandate breaches.",
  },
  {
    href: "/industries-payments",
    label: "Payments and Fintech",
    status: "Early Access",
    statusColour: "var(--amb)",
    description:
      "Identity clusters, chargeback rings and mule networks behind the transactions.",
  },
] as const;

export const primaryLinks = [
  { href: "/platform", label: "Platform" },
  { href: "/managed-desk", label: "Managed Desk" },
  { href: "/argus", label: "Argus AI" },
  { href: "/proof", label: "Proof" },
  { href: "/pricing", label: "Pricing" },
  { href: "/company", label: "Company" },
] as const;
