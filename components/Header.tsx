"use client";

import { useEffect, useState } from "react";

import { Logo } from "./Logo";
import { industryLinks, primaryLinks } from "./navigation";

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <header id="hdr">
      <nav className="navpill" aria-label="Primary navigation">
        <a className="brand" href="/" aria-label="QuantSentry home">
          <Logo />
          QuantSentry
        </a>

        <ul className="desktop-nav">
          <li className="drop">
            <a href="/industries">
              Industries
              <svg
                aria-hidden="true"
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginLeft: 5, verticalAlign: -1 }}
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <div className="menu">
              <div className="menu-inner">
                {industryLinks.map((item) => (
                  <a className="industry-menu-link" href={item.href} key={item.href}>
                    <span className="industry-menu-title">
                      <span>{item.label}</span>
                      <span className="eyebrow" style={{ color: item.statusColour }}>
                        {item.status}
                      </span>
                    </span>
                    <span className="industry-menu-description">{item.description}</span>
                  </a>
                ))}
              </div>
            </div>
          </li>
          {primaryLinks.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
          <li>
            <a className="btn ghost" href="/demo">
              Talk to Us
            </a>
          </li>
          <li>
            <a className="btn solid" href="/demo">
              <span>Book a Demo</span>
            </a>
          </li>
        </ul>

        <a className="btn solid mobile-demo" href="/demo">
          <span>Book a Demo</span>
        </a>

        <button
          type="button"
          className="mobile-toggle"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className="mobile-menu" id="mobile-navigation" hidden={!open}>
          <a href="/industries">Industries</a>
          {industryLinks.map((item) => (
            <a className="mobile-sub-link" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
          {primaryLinks.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
          <a className="btn solid" href="/demo">
            <span>Book a Demo</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
