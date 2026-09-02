"use client";

import { useEffect, useState } from "react";

type LegalSection = {
  id: string;
  title: string;
  paragraphs?: readonly string[];
  items?: readonly string[];
  groups?: readonly {
    title: string;
    items: readonly string[];
  }[];
  note?: string;
  details?: readonly [label: string, value: string][];
};

type LegalDocumentContent = {
  label: string;
  title: string;
  summary: string;
  source: string;
  sections: readonly LegalSection[];
};

const documents = {
  privacy: {
    label: "Privacy",
    title: "Privacy Policy",
    summary:
      "How Quant Technology Group collects, uses and protects personal data across its platforms and services.",
    source: "https://quanttechnology.com/privacy",
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        paragraphs: [
          'Quant Technology Group Pte. Ltd. ("QTG", "we", "us") provides modular trading infrastructure to prop firms, brokers and fintech platforms. This Privacy Policy explains how we collect, use, share and protect personal data when you interact with our websites, products and services.',
          "This policy applies to all services operated by QTG and its affiliates. Our products are delivered to operator clients (B2B). End-user data is processed primarily on behalf of those operators under separate data-processing terms.",
        ],
      },
      {
        id: "data-controller",
        title: "Data Controller",
        details: [
          ["Entity", "Quant Technology Group Pte. Ltd."],
          ["Registration", "Singapore"],
          ["Registered office", "Singapore"],
          ["Data protection contact", "privacy@quanttechnology.com"],
        ],
      },
      {
        id: "what-we-collect",
        title: "What We Collect",
        groups: [
          {
            title: "Information You Provide",
            items: [
              "Identity and contact data — name, business email, phone, company and role.",
              "Account credentials — username, hashed password and multi-factor secrets.",
              "Communication content — messages, support tickets and sales conversations.",
              "Commercial data — billing details, contracts and purchase history.",
            ],
          },
          {
            title: "Information Collected Automatically",
            items: [
              "Device and connection data — IP address, device type, browser, operating system and language.",
              "Usage data — pages viewed, features used, timestamps and referrers.",
              "Cookies and similar technologies — see section 08.",
            ],
          },
          {
            title: "Information From Third Parties",
            items: [
              "Identity-verification providers, including KYC and KYB checks for operator clients.",
              "Payment processors and banking partners.",
              "Public registries, sanctions lists and fraud-prevention services.",
            ],
          },
        ],
      },
      {
        id: "how-we-use-data",
        title: "How We Use Your Data",
        paragraphs: [
          "We process personal data for the following purposes, each with a corresponding lawful basis:",
        ],
        items: [
          "Provide, secure and improve our products and services — contractual necessity.",
          "Onboard operator clients and meet KYC or KYB obligations — legal obligation.",
          "Detect, prevent and respond to fraud, abuse and security incidents — legitimate interest.",
          "Send service communications and respond to enquiries — legitimate interest or consent.",
          "Comply with regulatory and accounting requirements — legal obligation.",
          "Send marketing communications where you have opted in — consent.",
        ],
      },
      {
        id: "sharing",
        title: "Sharing and Disclosure",
        paragraphs: [
          "We share personal data only with parties who need it to deliver our services or where required by law:",
        ],
        items: [
          "QTG group entities supporting service delivery, operations or compliance.",
          "Service providers — cloud hosting, identity verification, analytics and payments — under written data-processing agreements.",
          "Operator clients, where you are an end-user of a platform they operate, and only to the extent contractually permitted.",
          "Regulators, courts or law enforcement where legally required.",
          "Counterparties in a corporate transaction, subject to confidentiality.",
        ],
        note: "We do not sell personal data and we do not share it for cross-context behavioural advertising.",
      },
      {
        id: "international-transfers",
        title: "International Transfers",
        paragraphs: [
          "QTG operates across multiple jurisdictions. Personal data may be transferred to and processed in countries other than your own. Where such transfers occur, we rely on appropriate safeguards — Standard Contractual Clauses, equivalent statutory mechanisms or recognised adequacy frameworks.",
        ],
      },
      {
        id: "retention",
        title: "Retention",
        paragraphs: [
          "We retain personal data only for as long as necessary to provide our services, comply with legal obligations, resolve disputes and enforce agreements. Retention periods vary by data category and are reviewed periodically.",
        ],
      },
      {
        id: "cookies",
        title: "Cookies and Similar Technologies",
        paragraphs: [
          "We use essential cookies to operate our websites and authentication flows, plus analytics cookies only with your consent to understand product usage. You can manage cookie preferences through your browser settings or our cookie banner where shown.",
        ],
      },
      {
        id: "your-rights",
        title: "Your Rights",
        paragraphs: [
          "Subject to applicable law, you may have the right to access, correct, delete, restrict or object to processing of your personal data, and to data portability. To exercise any right, contact privacy@quanttechnology.com. We will respond within the timeframe required by your jurisdiction.",
        ],
      },
      {
        id: "security",
        title: "Security",
        paragraphs: [
          "We implement technical and organisational measures appropriate to the risk, including encryption in transit and at rest, access controls, monitoring and regular security review. No system is perfectly secure; we encourage you to use strong, unique passwords and enable multi-factor authentication.",
        ],
      },
      {
        id: "policy-changes",
        title: "Changes to This Policy",
        paragraphs: [
          'We may update this policy from time to time. Material changes will be notified by posting an updated version with a new "Last updated" date and, where appropriate, by direct notice.',
        ],
      },
      {
        id: "contact",
        title: "Contact",
        paragraphs: ["For privacy questions, data subject requests or to file a complaint:"],
        details: [
          ["Email", "privacy@quanttechnology.com"],
          ["Mail", "Quant Technology Group Pte. Ltd. — Singapore"],
        ],
      },
    ],
  },
  terms: {
    label: "Terms",
    title: "Terms of Service",
    summary:
      "The terms governing access to and use of Quant Technology Group websites, products and services.",
    source: "https://quanttechnology.com/terms",
    sections: [
      {
        id: "agreement",
        title: "Agreement",
        paragraphs: [
          'These Terms of Service ("Terms") govern your access to and use of the websites, products and services of Quant Technology Group Pte. Ltd. ("QTG", "we"). By accessing or using our services you agree to these Terms. If you do not agree, do not use the services.',
          "For operator clients, a separate Master Services Agreement or equivalent commercial contract sets out the binding commercial terms. Where there is a conflict, the commercial contract prevails over these Terms.",
        ],
      },
      {
        id: "eligibility",
        title: "Eligibility",
        paragraphs: [
          "You may use the services only if you are at least 18 years old, or the age of majority in your jurisdiction, and legally capable of entering into a binding contract. Operator accounts are available to legal entities that pass our KYB and onboarding checks.",
        ],
      },
      {
        id: "accounts",
        title: "Accounts and Access",
        items: [
          "You are responsible for safeguarding your credentials and for all activity under your account.",
          "You must notify us promptly of any unauthorised use or suspected security incident.",
          "We may suspend or terminate access where required by law, where security is at risk or where these Terms are breached.",
        ],
      },
      {
        id: "acceptable-use",
        title: "Acceptable Use",
        paragraphs: ["You agree not to:"],
        items: [
          "Use the services to violate applicable law or third-party rights.",
          "Reverse engineer, decompile or attempt to extract source code, except where permitted by law.",
          "Probe, scan or test the vulnerability of any system without prior written authorisation.",
          "Interfere with or disrupt the services, servers or networks.",
          "Use the services to conduct fraudulent, abusive or market-manipulative activity.",
        ],
      },
      {
        id: "intellectual-property",
        title: "Intellectual Property",
        paragraphs: [
          "The services, including all software, content, design and trademarks, are owned by QTG or its licensors. We grant you a limited, non-exclusive, non-transferable licence to access and use the services in accordance with these Terms. All other rights are reserved.",
        ],
      },
      {
        id: "customer-data",
        title: "Customer Data",
        paragraphs: [
          "You retain all rights in data you submit to the services. You grant QTG the rights necessary to host, process and transmit such data to provide and improve the services. Processing of personal data is governed by our Privacy Policy and applicable data-processing terms.",
        ],
      },
      {
        id: "fees",
        title: "Fees and Payment",
        paragraphs: [
          "Fees, billing cycles and payment terms are set out in your order form or commercial contract. Unless otherwise stated, fees are non-refundable. Late payments may incur interest and may result in suspension of services.",
        ],
      },
      {
        id: "third-party-services",
        title: "Third-Party Services",
        paragraphs: [
          "The services may integrate with third-party services, such as trading venues, payment processors and identity-verification providers. Your use of those services is governed by their own terms; QTG is not responsible for third-party services beyond what is set out in our agreements.",
        ],
      },
      {
        id: "trading-risk",
        title: "Trading Risk",
        paragraphs: [
          "Our infrastructure supports the trading activities of operator clients. Trading in financial instruments — including forex, CFDs, futures, options and crypto-assets — involves significant risk and may not be suitable for all investors. QTG does not provide investment advice and is not a counterparty to any trade.",
        ],
        note: "See the QTG Disclosures page for full risk warnings and regulatory information.",
      },
      {
        id: "warranties",
        title: "Warranties and Disclaimers",
        paragraphs: [
          'The services are provided "as is" and "as available". To the maximum extent permitted by law, QTG disclaims all implied warranties, including merchantability, fitness for a particular purpose and non-infringement. We do not warrant that the services will be uninterrupted, error-free or secure.',
        ],
      },
      {
        id: "liability",
        title: "Limitation of Liability",
        paragraphs: [
          "To the maximum extent permitted by law, QTG’s aggregate liability under these Terms shall not exceed the fees paid by you to QTG in the twelve months preceding the claim. QTG is not liable for indirect, incidental, special, consequential or punitive damages, or for lost profits, revenue or data.",
        ],
      },
      {
        id: "indemnity",
        title: "Indemnity",
        paragraphs: [
          "You will defend, indemnify and hold harmless QTG and its affiliates from third-party claims arising out of your breach of these Terms, your misuse of the services or your violation of applicable law.",
        ],
      },
      {
        id: "termination",
        title: "Term and Termination",
        paragraphs: [
          "These Terms apply for as long as you use the services. Either party may terminate for material breach not cured within thirty days of written notice. Provisions that by their nature should survive termination — intellectual property, liability, indemnity and governing law — will survive.",
        ],
      },
      {
        id: "governing-law",
        title: "Governing Law and Disputes",
        paragraphs: [
          "These Terms are governed by the laws of Singapore, without regard to its conflict-of-laws principles. Disputes shall be resolved by the Singapore courts, except where mandatory law provides otherwise.",
        ],
      },
      {
        id: "terms-changes",
        title: "Changes",
        paragraphs: [
          "We may update these Terms from time to time. Material changes will be notified in advance. Continued use after the effective date constitutes acceptance.",
        ],
      },
      {
        id: "contact",
        title: "Contact",
        details: [
          ["Legal", "legal@quanttechnology.com"],
          ["Mail", "Quant Technology Group Pte. Ltd. — Singapore"],
        ],
      },
    ],
  },
} as const satisfies Record<string, LegalDocumentContent>;

type LegalDocument = keyof typeof documents;

function documentFromHash(): LegalDocument {
  return window.location.hash.startsWith("#terms") ? "terms" : "privacy";
}

export function LegalDocuments() {
  const [activeDocument, setActiveDocument] = useState<LegalDocument>("privacy");

  useEffect(() => {
    const syncDocument = () => setActiveDocument(documentFromHash());

    syncDocument();
    window.addEventListener("hashchange", syncDocument);
    return () => window.removeEventListener("hashchange", syncDocument);
  }, []);

  const selectDocument = (document: LegalDocument) => {
    setActiveDocument(document);
    window.history.replaceState(null, "", `#${document}`);
  };

  const active: LegalDocumentContent = documents[activeDocument];

  return (
    <div className="legal-document-viewer">
      <div aria-label="Legal documents" className="legal-document-tabs" role="tablist">
        {(Object.keys(documents) as LegalDocument[]).map((document) => (
          <button
            aria-controls="legal-document-panel"
            aria-selected={activeDocument === document}
            className={activeDocument === document ? "is-active" : undefined}
            id={`legal-tab-${document}`}
            key={document}
            onClick={() => selectDocument(document)}
            role="tab"
            type="button"
          >
            {documents[document].label}
          </button>
        ))}
      </div>

      <article
        aria-labelledby={`legal-tab-${activeDocument}`}
        className="legal-document-panel"
        id="legal-document-panel"
        key={activeDocument}
        role="tabpanel"
      >
        <header className="legal-document-header">
          <div>
            <span className="legal-document-label">Legal · {active.label}</span>
            <h2>{active.title}</h2>
            <p>{active.summary}</p>
          </div>
          <dl className="legal-document-meta">
            <div><dt>Last Updated</dt><dd>April 2026</dd></div>
            <div><dt>Version</dt><dd>2026.04</dd></div>
            <div><dt>Jurisdiction</dt><dd>Singapore (SG)</dd></div>
            <div><dt>Status</dt><dd><span className="dot" />Active</dd></div>
          </dl>
        </header>

        <div className="legal-document-layout">
          <nav aria-label={`${active.title} contents`} className="legal-document-toc">
            <span>Contents</span>
            <ol>
              {active.sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${activeDocument}-${section.id}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="legal-document-content">
            {active.sections.map((section, index) => (
              <section id={`${activeDocument}-${section.id}`} key={section.id}>
                <span className="legal-section-number">§ {String(index + 1).padStart(2, "0")}</span>
                <h3>{section.title}</h3>

                {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

                {section.groups?.map((group) => (
                  <div className="legal-document-group" key={group.title}>
                    <h4>{group.title}</h4>
                    <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                ))}

                {section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}

                {section.note && <aside className="legal-document-note"><span>Note</span>{section.note}</aside>}

                {section.details && (
                  <dl className="legal-document-details">
                    {section.details.map(([label, value]) => (
                      <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                    ))}
                  </dl>
                )}
              </section>
            ))}

            <div className="legal-document-end">
              <span>End of Document</span>
              <a href={active.source} rel="noreferrer" target="_blank">View the QTG source</a>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
