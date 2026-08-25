export const pages = {
  "argus": {
    "title": "Argus AI | QuantSentry",
    "description": "Ask your own book a question in writing or by call, answered from your data with the working shown."
  },
  "company": {
    "title": "Company | QuantSentry",
    "description": "QuantSentry is the surveillance and intelligence product of Quant Technology Group."
  },
  "compare": {
    "title": "How the market compares | QuantSentry",
    "description": "An evidence tagged comparison of prop firm risk tooling, from CRM rules modules to dedicated abuse detection."
  },
  "custom-bi": {
    "title": "Custom business intelligence | QuantSentry",
    "description": "Give us a read only feed from anything you run, from trading platforms to Shopify, and get one layer over the numbers with Argus on top."
  },
  "demo": {
    "title": "Book a Demo | QuantSentry",
    "description": "Twenty minutes on your own patterns, then a read only key and your first findings inside a week."
  },
  "diagnostic": {
    "title": "Blind spot finder | QuantSentry",
    "description": "Six questions on how you run risk today, and a written read on where your blind spots are."
  },
  "index": {
    "title": "QuantSentry | The data intelligence layer for trading businesses",
    "description": "One layer over every trade, payment and identity in your business. Coordinated behaviour proved with evidence, and the business intelligence that sits on the same data."
  },
  "industries-brokerages": {
    "title": "Brokerages | QuantSentry",
    "description": "Toxic flow, latency abuse and bonus fraud across a retail brokerage book, proved with evidence."
  },
  "industries-funds": {
    "title": "Funds and asset managers | QuantSentry",
    "description": "Allocation integrity, front running patterns and mandate breaches, evidenced from executed trades."
  },
  "industries-payments": {
    "title": "Payments and fintech | QuantSentry",
    "description": "Identity clusters, chargeback rings and mule networks behind the transactions, proved with evidence."
  },
  "industries-prop-trading": {
    "title": "Prop Trading | QuantSentry",
    "description": "Detect coordinated abuse, prove it with defensible evidence, and hold the payout before it clears."
  },
  "industries": {
    "title": "Industries | QuantSentry",
    "description": "Prop trading today, with brokerages, funds and payments businesses in early access."
  },
  "managed-desk": {
    "title": "Managed risk desk | QuantSentry",
    "description": "QuantSentry plus a named risk analyst embedded with your team, working your queue daily and bringing you decisions with the evidence attached."
  },
  "network": {
    "title": "Risk Intelligence Network | QuantSentry",
    "description": "Opt in and pseudonymised. Members share the signal behind a coordinated group without sharing the book it came from."
  },
  "platform": {
    "title": "Platform | QuantSentry",
    "description": "Seven detection engines, evidence kits, business intelligence and Argus AI on one ingestion layer."
  },
  "pricing": {
    "title": "Pricing | QuantSentry",
    "description": "Priced on monthly active trading accounts. Every plan carries every engine and every evidence kit."
  },
  "proof": {
    "title": "Proof | QuantSentry",
    "description": "One hundred confirmed cheaters on one anonymised book, named, evidenced and priced per person."
  },
  "risk-intelligence-network": {
    "title": "Risk Intelligence Network | QuantSentry",
    "description": "An opt in, pseudonymised signal between firms, so a ring that moves between them stops being invisible. In design."
  }
} as const;

export type PageSlug = keyof typeof pages;
