"use client";

import { useEffect, useState } from "react";

const documents = {
  privacy: {
    label: "Privacy",
    source: "https://quanttechnology.com/privacy",
  },
  terms: {
    label: "Terms",
    source: "https://quanttechnology.com/terms",
  },
} as const;

type LegalDocument = keyof typeof documents;

function documentFromHash(): LegalDocument {
  return window.location.hash === "#terms" ? "terms" : "privacy";
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

  const active = documents[activeDocument];

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

      <div
        aria-labelledby={`legal-tab-${activeDocument}`}
        className="legal-document-panel"
        id="legal-document-panel"
        role="tabpanel"
      >
        <iframe
          key={activeDocument}
          referrerPolicy="strict-origin-when-cross-origin"
          src={active.source}
          title={`Quant Technology Group ${active.label}`}
        />
      </div>

      <p className="legal-document-source">
        Having trouble viewing the document?{" "}
        <a href={active.source} rel="noreferrer" target="_blank">
          Open the {active.label.toLowerCase()} page
        </a>
        .
      </p>
    </div>
  );
}
