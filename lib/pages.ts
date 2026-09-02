export const pages = {
  "argus": {
    "title": "Argus AI | QuantSentry",
    "description": "Ask questions, monitor your business and research the market using connected company data and cited public sources."
  },
  "company": {
    "title": "Company | QuantSentry",
    "description": "Learn about QuantSentry, the connected data and risk platform from Quant Technology Group."
  },
  "compare": {
    "title": "Trading Risk Comparison | QuantSentry",
    "description": "Compare common trading risk tools, from basic rule checks to coordinated abuse detection."
  },
  "custom-bi": {
    "title": "Business Intelligence | QuantSentry",
    "description": "Connect supported business data in read-only mode and see your most important numbers in one place with Argus AI."
  },
  "demo": {
    "title": "Book a Demo | QuantSentry",
    "description": "See how QuantSentry can connect your data, answer business questions and find risks and opportunities."
  },
  "diagnostic": {
    "title": "Risk Blind Spot Finder | QuantSentry",
    "description": "Answer six questions about your risk process and receive a clear summary of possible gaps."
  },
  "index": {
    "title": "QuantSentry | From Disconnected Data to Profitable Action",
    "description": "Bring your business data together. Use Argus AI to find risks and opportunities, get clear answers and decide what to do next."
  },
  "industries-brokerages": {
    "title": "Brokerages | QuantSentry",
    "description": "Find toxic flow, latency abuse and bonus fraud across brokerage accounts, with evidence your team can review."
  },
  "industries-funds": {
    "title": "Funds and Asset Managers | QuantSentry",
    "description": "Find allocation issues, front-running patterns and mandate breaches in executed trades."
  },
  "industries-payments": {
    "title": "Payments and Fintech | QuantSentry",
    "description": "Find linked identities, chargeback rings and mule networks behind suspicious transactions."
  },
  "industries-prop-trading": {
    "title": "Prop Trading | QuantSentry",
    "description": "Detect coordinated trading abuse and review clear evidence before approving a payout."
  },
  "industries": {
    "title": "Industries | QuantSentry",
    "description": "Prop trading is live. Coverage for brokerages, funds and payments businesses is coming soon."
  },
  "industry-intelligence": {
    "title": "Industry Intelligence | QuantSentry",
    "description": "Track competitor rules, pricing, payout terms and product changes with sources collected by Argus AI."
  },
  "integrations": {
    "title": "Integrations | QuantSentry",
    "description": "Connect QuantSentry to the trading platforms, payment systems, identity tools, support channels and acquisition sources your team already uses."
  },
  "managed-desk": {
    "title": "Managed Risk Service | QuantSentry",
    "description": "Add a named risk analyst who reviews your queue in QuantSentry and sends clear recommendations with supporting evidence."
  },
  "network": {
    "title": "Sentry Risk Network | QuantSentry",
    "description": "Check opt-in risk signals from other members without sharing names, trades or customer records."
  },
  "platform": {
    "title": "Platform | QuantSentry",
    "description": "Connect business data, detect trading abuse, build dashboards and use Argus AI from one platform."
  },
  "pricing": {
    "title": "Pricing | QuantSentry",
    "description": "Simple pricing based on monthly active trading accounts, with the full QuantSentry platform included."
  },
  "proof": {
    "title": "Success Stories | QuantSentry",
    "description": "See how QuantSentry found and documented 100 confirmed abuse cases in one anonymised customer account set."
  },
  "roadmap": {
    "title": "Roadmap | QuantSentry",
    "description": "See what is live today, what is coming next and what the QuantSentry team is exploring."
  }
} as const;

export type PageSlug = keyof typeof pages;
