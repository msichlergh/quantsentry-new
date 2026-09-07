"use client";

import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { ArrowsLeftRightIcon as ArrowsLeftRight } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { CaretDownIcon as CaretDown } from "@phosphor-icons/react/dist/csr/CaretDown";
import { ChartLineUpIcon as ChartLineUp } from "@phosphor-icons/react/dist/csr/ChartLineUp";
import { CheckSquareIcon as CheckSquare } from "@phosphor-icons/react/dist/csr/CheckSquare";
import { CreditCardIcon as CreditCard } from "@phosphor-icons/react/dist/csr/CreditCard";
import { DatabaseIcon as Database } from "@phosphor-icons/react/dist/csr/Database";
import { FileTextIcon as FileText } from "@phosphor-icons/react/dist/csr/FileText";
import { GaugeIcon as Gauge } from "@phosphor-icons/react/dist/csr/Gauge";
import { GlobeIcon as Globe } from "@phosphor-icons/react/dist/csr/Globe";
import { MapTrifoldIcon as MapTrifold } from "@phosphor-icons/react/dist/csr/MapTrifold";
import { PlugsConnectedIcon as PlugsConnected } from "@phosphor-icons/react/dist/csr/PlugsConnected";
import { ShareNetworkIcon as ShareNetwork } from "@phosphor-icons/react/dist/csr/ShareNetwork";
import { SparkleIcon as Sparkle } from "@phosphor-icons/react/dist/csr/Sparkle";
import { SquaresFourIcon as SquaresFour } from "@phosphor-icons/react/dist/csr/SquaresFour";
import { TrophyIcon as Trophy } from "@phosphor-icons/react/dist/csr/Trophy";
import { type MouseEvent, useEffect, useState } from "react";

import { BrandLockup } from "./BrandLockup";
import { industryLinks, primaryLinks, resourceLinks, solutionLinks } from "./navigation";

function MenuIcon({ href }: { href: string }) {
  const props = { size: 16, weight: "regular" as const };

  if (href === "/industries-prop-trading") return <ChartLineUp {...props} />;
  if (href === "/industries-brokerages") return <Gauge {...props} />;
  if (href === "/industries-funds") return <Database {...props} />;
  if (href === "/industries-payments") return <CreditCard {...props} />;
  if (href === "/platform") return <SquaresFour {...props} />;
  if (href === "/argus") return <Sparkle {...props} />;
  if (href === "/custom-bi") return <ChartLineUp {...props} />;
  if (href === "/managed-desk") return <CheckSquare {...props} />;
  if (href === "/industry-intelligence") return <Globe {...props} />;
  if (href === "/network") return <ShareNetwork {...props} />;
  if (href === "/compare") return <ArrowsLeftRight {...props} />;
  if (href === "/proof") return <Trophy {...props} />;
  if (href === "/roadmap") return <MapTrifold {...props} />;
  if (href === "/integrations") return <PlugsConnected {...props} />;
  return <FileText {...props} />;
}

const mobileGroups = [
  { key: "industries", label: "Industries", href: "/industries", overview: "All Industries", links: industryLinks },
  { key: "solutions", label: "Solutions", href: "/platform", overview: null, links: solutionLinks },
  { key: "resources", label: "Resources", href: "/insights", overview: null, links: resourceLinks },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnOutsideTap = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest("#mobile-navigation, .mobile-toggle")) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideTap);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("pointerdown", closeOnOutsideTap);
    };
  }, [open]);

  const closeMobileMenu = () => {
    setOpen(false);
    setOpenGroup(null);
  };
  const handleMobileMenuClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest("a")) closeMobileMenu();
  };

  return (
    <header id="hdr">
      <nav className="navpill" aria-label="Primary navigation">
        <a className="brand" href="/" aria-label="QuantSentry home">
          <BrandLockup />
        </a>

        <ul className="desktop-nav">
          <li className="drop">
            <a href="/industries">
              Industries
              <CaretDown aria-hidden="true" size={11} weight="bold" />
            </a>
            <div className="menu">
              <div className="menu-inner">
                <div className="nav-menu-header">
                  <span>Industries</span>
                  <small>Intelligence built around the way your business operates.</small>
                </div>
                {industryLinks.map((item) => (
                  <a className="industry-menu-link" href={item.href} key={item.href}>
                    <span className="nav-menu-icon"><MenuIcon href={item.href} /></span>
                    <span className="nav-menu-copy">
                      <span className="industry-menu-title">
                        <span>{item.label}</span>
                        <span className="eyebrow" style={{ color: item.statusColour }}>
                          {item.status}
                        </span>
                      </span>
                      <span className="industry-menu-description">{item.description}</span>
                    </span>
                  </a>
                ))}
                <a className="nav-menu-footer" href="/industries">View All Industries <ArrowRight size={13} /></a>
              </div>
            </div>
          </li>
          <li className="drop">
            <a href="/platform">
              Solutions
              <CaretDown aria-hidden="true" size={11} weight="bold" />
            </a>
            <div className="menu">
              <div className="menu-inner">
                <div className="nav-menu-header">
                  <span>Solutions</span>
                  <small>One data layer for intelligence, action and support.</small>
                </div>
                {solutionLinks.map((item) => (
                  <a className="nav-menu-link" href={item.href} key={item.href}>
                    <span className="nav-menu-icon"><MenuIcon href={item.href} /></span>
                    <span className="nav-menu-copy">
                      <span className="nav-menu-title">{item.label}</span>
                      <span className="nav-menu-description">{item.description}</span>
                    </span>
                  </a>
                ))}
                <a className="nav-menu-footer" href="/platform">Explore the Platform <ArrowRight size={13} /></a>
              </div>
            </div>
          </li>
          <li className="drop">
            <a href="/insights">
              Resources
              <CaretDown aria-hidden="true" size={11} weight="bold" />
            </a>
            <div className="menu">
              <div className="menu-inner nav-menu-compact">
                <div className="nav-menu-header">
                  <span>Resources</span>
                  <small>Evidence and practical thinking for better decisions.</small>
                </div>
                {resourceLinks.map((item) => (
                  <a className="nav-menu-link" href={item.href} key={item.href}>
                    <span className="nav-menu-icon"><MenuIcon href={item.href} /></span>
                    <span className="nav-menu-copy">
                      <span className="nav-menu-title">{item.label}</span>
                      <span className="nav-menu-description">{item.description}</span>
                    </span>
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

        <div className="mobile-menu" id="mobile-navigation" hidden={!open} onClick={handleMobileMenuClick}>
          {mobileGroups.map((group) => {
            const expanded = openGroup === group.key;
            return (
              <div className="mobile-menu-group" key={group.key}>
                <button
                  aria-controls={`mobile-group-${group.key}`}
                  aria-expanded={expanded}
                  className="mobile-menu-group-toggle"
                  onClick={() => setOpenGroup((current) => (current === group.key ? null : group.key))}
                  type="button"
                >
                  <span>{group.label}</span>
                  <CaretDown aria-hidden="true" size={13} weight="bold" />
                </button>
                <div className="mobile-menu-group-panel" hidden={!expanded} id={`mobile-group-${group.key}`}>
                  {group.overview ? (
                    <a className="mobile-sub-link" href={group.href}>
                      {group.overview}
                    </a>
                  ) : null}
                  {group.links.map((item) => (
                    <a className="mobile-sub-link" href={item.href} key={item.href}>
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
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
