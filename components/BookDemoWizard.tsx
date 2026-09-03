"use client";

import type { CSSProperties, ChangeEvent, FormEvent, KeyboardEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { trackBookDemo, trackLeadSubmit } from "@/lib/analytics";
import { DIAL_CODES, dialOptions, flagFor } from "@/lib/dial-codes";
import {
  detectCountry,
  fetchSlots,
  LeadError,
  localTimezone,
  slotDayKey,
  slotLabel,
  submitLead,
  tzOffsetLabel,
  type LeadForm,
  type LeadResponse,
} from "@/lib/lead-client";

// Demo booking wizard, ported from the YourPropFirm booking card and
// rebranded for QuantSentry: one journey, six steps, calendar last.

// ---------- Icons ----------
// Minimal local icon set — only the glyphs this page uses.
const ICON_PATHS: Record<string, ReactNode> = {
  check: <path d="M5 12l5 5 9-9" />,
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  play: <path d="M8 6l10 6-10 6V6z" />,
  shield: <path d="M12 3l7 3v5.5c0 4.2-2.9 7.2-7 8.9-4.1-1.7-7-4.7-7-8.9V6l7-3z" />,
  chart: (
    <>
      <path d="M5 20v-8" />
      <path d="M12 20V5" />
      <path d="M19 20v-11" />
    </>
  ),
  bolt: <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />,
  plug: (
    <>
      <path d="M9 7V3" />
      <path d="M15 7V3" />
      <path d="M6 7h12v3a6 6 0 0 1-12 0V7z" />
      <path d="M12 16v5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
};

function Icon({
  name,
  size = 14,
  stroke = 2,
  style,
}: {
  name: keyof typeof ICON_PATHS;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

// ---------- Step + answer sets ----------
const BD_INTENTS: { v: string; i: keyof typeof ICON_PATHS }[] = [
  { v: "Prop Trading Firm", i: "chart" },
  { v: "Brokerage", i: "bolt" },
  { v: "Fund or Asset Manager", i: "search" },
  { v: "Payments or Fintech", i: "plug" },
];

const BD_RISK_TODAY = ["In House Team", "One Person, Part Time", "Outsourced", "Nobody Dedicated Yet"];
const BD_ROLES = ["Founder / CEO", "Risk / Operations", "CTO / Tech Lead", "Other"];
const BD_TIMELINES = [
  "As Soon as Possible",
  "Within 1 to 3 Months",
  "Within 3 to 6 Months",
  "Just Exploring for Now",
];

type StepId = "intent" | "business" | "contact" | "prepare" | "schedule";

const BD_STEPS: { id: StepId; label: string; title: string }[] = [
  { id: "intent", label: "Business", title: "Which best describes your business?" },
  { id: "business", label: "About", title: "About your business" },
  { id: "contact", label: "Contact", title: "Your contact details" },
  { id: "prepare", label: "Prepare", title: "Anything we should prepare?" },
  { id: "schedule", label: "Schedule", title: "Pick a time" },
];

// The site-wide promise: a twenty minute call, everywhere it is mentioned.
const BD_CALL_MINUTES = 20;

// For useSyncExternalStore reads of values that never change after load.
const subscribeNever = () => () => {};

const bdEmailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());
const bdFilled = (v: string) => Boolean(v && String(v).trim());

// Digit count, not a format. The dial code is picked separately, so this is
// the national number only, and national lengths run from 6 to 12 digits.
const bdPhoneOk = (v: string) => {
  const digits = String(v || "").replace(/\D/g, "");
  return digits.length >= 6 && digits.length <= 15;
};

// Scheme optional, since nobody types https:// into a form. Parsed rather
// than regex-matched on the whole string, so the host is checked for a real
// dotted name with a plausible TLD — "ddd" and "http://x" both fail.
function bdUrlOk(v: string) {
  const t = String(v || "").trim();
  if (!t || /\s/.test(t)) return false;
  try {
    const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
    const host = u.hostname;
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(host)) return false;
    return /^[a-z]{2,}$/i.test(host.split(".").pop() || "");
  } catch {
    return false;
  }
}

// Client-side gate per step. The route validates again — this exists so the
// visitor is told at the point of the mistake instead of after a round trip.
// The slot is only required when the calendar actually has open times: with
// no CRM connected (or an empty month) the request goes through without one
// and the confirmation says "request received", never "booked".
function bdStepErrors(
  stepId: StepId,
  form: LeadForm,
  extra: { startIso: string | null; requireSlot: boolean },
) {
  const e: Record<string, string> = {};
  if (stepId === "intent" && !bdFilled(form.intent)) e.intent = "Pick the one that fits best";
  if (stepId === "contact") {
    if (String(form.firstName || "").trim().length < 2) e.firstName = "Enter your first name";
    if (String(form.lastName || "").trim().length < 2) e.lastName = "Enter your last name";
    if (!bdEmailOk(form.email)) e.email = "Enter a valid work email";
    if (!bdPhoneOk(form.phone)) e.phone = "Enter your phone number";
  }
  if (stepId === "business") {
    const raw = String(form.website || "").trim();
    if (!raw) e.website = "Enter your website";
    else if (!bdUrlOk(raw)) e.website = "That does not look like a website";
  }
  if (stepId === "schedule" && extra.requireSlot && !extra.startIso) {
    e.schedule = "Pick a time to continue";
  }
  return e;
}

// ---------- Dial code picker ----------
// Search by country or by code — typing "+49", "49" or "germ" all land on
// Germany. Same combobox shape as the time zone control.
function BdDialPicker({
  country,
  dial,
  onPick,
}: {
  country: string;
  dial: string;
  onPick: (cc: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const opts = useMemo(() => dialOptions(), []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) {
        setOpen(false);
        setQ("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const needle = q.trim().toLowerCase().replace(/^\+/, "");
  const results = useMemo(() => {
    if (!needle) return opts;
    return opts.filter(
      (o) =>
        o.name.toLowerCase().includes(needle) ||
        o.cc.toLowerCase() === needle ||
        o.dial.replace("+", "").startsWith(needle),
    );
  }, [needle, opts]);

  return (
    <div className="bd-dialp" ref={box}>
      <button
        type="button"
        className="bd-dialp-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          setQ("");
        }}
      >
        <span>
          {country ? flagFor(country) : ""} {dial || "+"}
        </span>
        <i aria-hidden="true" />
      </button>
      {open && (
        <div className="bd-dialp-pop">
          <input
            className="bd-dialp-search"
            autoFocus
            value={q}
            placeholder="Country or +code"
            aria-label="Search country dial codes"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                setQ("");
              }
              if (e.key === "Enter" && results.length) {
                e.preventDefault();
                onPick(results[0].cc);
                setOpen(false);
                setQ("");
              }
            }}
          />
          <ul className="bd-dialp-list" role="listbox">
            {results.length === 0 && <li className="bd-tzp-empty">No match</li>}
            {results.map((o) => (
              <li key={o.cc}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.cc === country}
                  className={`bd-tzp-opt ${o.cc === country ? "is-sel" : ""}`}
                  onClick={() => {
                    onPick(o.cc);
                    setOpen(false);
                    setQ("");
                  }}
                >
                  <span>
                    {o.flag} {o.name}
                  </span>
                  <em>{o.dial}</em>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------- Time zone picker ----------
// Type-to-filter combobox rather than a <select>. The list is the browser's
// full IANA set — around 400 entries — which a native select turns into a
// scroll hunt.
function BdTimezonePicker({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (zone: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const box = useRef<HTMLDivElement>(null);

  // Click-outside rather than blur: blur fires before the click lands on a
  // result and would close the list first.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) {
        setOpen(false);
        setQ("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const needle = q.trim().toLowerCase().replace(/\s+/g, "_");
  const results = useMemo(() => {
    if (!needle) return options.slice(0, 60);
    return options.filter((z) => z.toLowerCase().includes(needle)).slice(0, 60);
  }, [needle, options]);

  const pick = (z: string) => {
    onChange(z);
    setOpen(false);
    setQ("");
  };

  return (
    <div className="bd-tzp" ref={box}>
      <input
        type="text"
        className="bd-tzp-input"
        value={open ? q : value.replace(/_/g, " ")}
        placeholder={value.replace(/_/g, " ")}
        aria-label="Search time zones"
        autoComplete="off"
        spellCheck={false}
        onFocus={() => {
          setOpen(true);
          setQ("");
        }}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            setQ("");
            e.currentTarget.blur();
          }
          if (e.key === "Enter" && results.length) {
            e.preventDefault();
            pick(results[0]);
          }
        }}
      />
      {open && (
        <ul className="bd-tzp-list" role="listbox">
          {results.length === 0 && <li className="bd-tzp-empty">No match</li>}
          {results.map((z) => (
            <li key={z}>
              <button
                type="button"
                role="option"
                aria-selected={z === value}
                className={`bd-tzp-opt ${z === value ? "is-sel" : ""}`}
                onClick={() => pick(z)}
              >
                <span>{z.replace(/_/g, " ")}</span>
                <em>{tzOffsetLabel(z)}</em>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Calendar / schedule step ----------
type SlotState = "loading" | "ready" | "empty" | "error" | "unconfigured";
type SlotResult = {
  key: string;
  days: Record<string, string[]>;
  state: Exclude<SlotState, "loading">;
};

function BdSchedulePicker({
  value,
  onChange,
  timezone,
  setTimezone,
  tzOptions,
  onAvailability,
}: {
  value: string | null;
  onChange: (iso: string | null) => void;
  timezone: string;
  setTimezone: (zone: string) => void;
  tzOptions: string[];
  onAvailability: (open: boolean) => void;
}) {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [day, setDay] = useState<Date | null>(null);
  // The fetch result carries the key of the window it answered, so "loading"
  // is derived rather than set synchronously — a stale answer never shows
  // against a newer month or zone.
  const [fetched, setFetched] = useState<SlotResult | null>(null);
  const time = value;
  const fetchKey = `${month.getFullYear()}-${month.getMonth()}|${timezone}`;

  useEffect(() => {
    let live = true;
    // Never ask for times already past: the range starts at whichever is
    // later, now or the first of the displayed month.
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const from = monthStart > new Date() ? monthStart : new Date();
    const to = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    fetchSlots({ from, to, timezone })
      .then((data) => {
        if (!live) return;
        const days = data.days || {};
        const any = Object.values(days).some((v) => v.length);
        const state: SlotResult["state"] = any
          ? "ready"
          : data.configured === false
            ? "unconfigured"
            : "empty";
        setFetched({ key: fetchKey, days, state });
        onAvailability(state === "ready");
      })
      .catch(() => {
        if (!live) return;
        setFetched({ key: fetchKey, days: {}, state: "error" });
        onAvailability(false);
      });
    return () => {
      live = false;
    };
    // fetchKey covers month + timezone; onAvailability is a stable setter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, timezone]);

  const current = fetched && fetched.key === fetchKey ? fetched : null;
  const slots = current ? current.days : {};
  const slotState: SlotState = current ? current.state : "loading";

  const monthLabel = month.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  // Monday-first. getDay() is 0 = Sunday, so shift it: Monday becomes 0 and
  // Sunday lands at the end of the row.
  const firstDow = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;

  const slotsFor = (d: number) =>
    slots[slotDayKey(new Date(month.getFullYear(), month.getMonth(), d))] || [];
  const isAvailable = (d: number) => slotsFor(d).length > 0;
  const times = day ? slots[slotDayKey(day)] || [] : [];

  const handlePickDay = (d: number) => {
    if (!isAvailable(d)) return;
    setDay(new Date(month.getFullYear(), month.getMonth(), d));
    onChange(null);
  };
  const prevMonth = () => {
    const m = new Date(month);
    m.setMonth(m.getMonth() - 1);
    if (m < new Date(today.getFullYear(), today.getMonth(), 1)) return;
    setMonth(m);
    setDay(null);
    onChange(null);
  };
  const nextMonth = () => {
    const m = new Date(month);
    m.setMonth(m.getMonth() + 1);
    setMonth(m);
    setDay(null);
    onChange(null);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const noteFor = (state: Exclude<SlotState, "ready">) => {
    if (state === "loading") return "Loading available times…";
    if (state === "unconfigured") {
      return "Online scheduling is not open just yet. Send the request and we will reply within 24 hours with times to pick from.";
    }
    if (state === "empty") {
      return "No times are open this month. Try the next one, or send the request and we will reply with options.";
    }
    return "We could not load available times. Send the request and we will reply with options.";
  };

  return (
    <>
      <div className="bd-cal-duration">
        <div className="bd-cal-dur-ico">
          <Icon name="clock" size={16} stroke={1.75} />
        </div>
        <div className="bd-cal-dur-t">Twenty minute demo call</div>
        {/* The zone is stated once, on the control that changes it. */}
        <div className="bd-cal-dur-tz">{tzOffsetLabel(timezone)}</div>
      </div>

      {/* Two columns: month on the left, the chosen day's times on the right. */}
      <div className="bd-cal-body bd-cal-split">
        <div className="bd-cal-left">
          <div className="bd-cal-monthnav">
            <button type="button" className="bd-cal-navbtn" onClick={prevMonth} aria-label="Previous month">
              ‹
            </button>
            <div className="bd-cal-monthlbl">{monthLabel}</div>
            <button type="button" className="bd-cal-navbtn" onClick={nextMonth} aria-label="Next month">
              ›
            </button>
          </div>

          <div className="bd-cal-dow">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="bd-cal-dowcell">
                {d}
              </div>
            ))}
          </div>

          <div className="bd-cal-days">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} className="bd-cal-day is-empty" />;
              const avail = isAvailable(d);
              const selected = Boolean(day && day.getDate() === d && day.getMonth() === month.getMonth());
              const cls = ["bd-cal-day", avail ? "is-avail" : "is-un", selected ? "is-sel" : ""]
                .filter(Boolean)
                .join(" ");
              return (
                <button key={i} type="button" className={cls} onClick={() => handlePickDay(d)} disabled={!avail}>
                  {d}
                </button>
              );
            })}
          </div>

          {/* Times are returned per time zone, so changing this refetches
              rather than shifting the labels client-side — a slot that is not
              offered in one zone is not offered in another. */}
          <div className="bd-cal-tz">
            <span>Time zone</span>
            <BdTimezonePicker value={timezone} options={tzOptions} onChange={setTimezone} />
            <em className="bd-cal-tz-off">{tzOffsetLabel(timezone)}</em>
          </div>
        </div>

        <div className="bd-cal-right">
          <div className="bd-cal-right-in">
            {slotState !== "ready" ? (
              <div className="bd-cal-note">{noteFor(slotState)}</div>
            ) : !day ? (
              <div className="bd-cal-note bd-cal-note-quiet">Pick a day to see available times.</div>
            ) : (
              <>
                <div className="bd-cal-times-head">
                  {day.toLocaleDateString("en-GB", { weekday: "long", month: "short", day: "numeric" })}
                </div>
                <div className="bd-cal-times-list">
                  {times.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`bd-cal-time ${time === t ? "is-sel" : ""}`}
                      onClick={() => onChange(t)}
                    >
                      {/* In the SELECTED zone, not the browser's. */}
                      {slotLabel(t, timezone)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ---------- Field wrappers ----------
// One-tap chips instead of a native select. A select on mobile is a modal:
// tap, wait, scroll, pick, dismiss. These are optional fields, and a select
// is the fastest way to have an optional field skipped.
function BdChoice({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: string[];
  value: string;
  onPick: (v: string) => void;
}) {
  return (
    <div className="bd-field">
      <span>
        {label} <em>(optional)</em>
      </span>
      <div className="bd-chips">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            className={`bd-chip ${value === o ? "is-on" : ""}`}
            aria-pressed={value === o}
            onClick={() => onPick(value === o ? "" : o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function BdField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className={`bd-field ${error ? "has-err" : ""}`}>
      <span>
        {label} {hint && <em>{hint}</em>}
      </span>
      {children}
      {error && <small className="bd-field-err">{error}</small>}
    </label>
  );
}

// ---------- The wizard ----------
export type BookDemoResult = LeadResponse & { startIso: string | null; timezone: string };

const EMPTY_FORM: LeadForm = {
  intent: "",
  stage: "",
  role: "",
  timeline: "",
  notes: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  telegram: "",
  website: "",
  country: "",
  dial: "",
  company_confirm: "",
};

export function BookDemoWizard({ onDone }: { onDone: (res: BookDemoResult) => void }) {
  const [form, setForm] = useState<LeadForm>(EMPTY_FORM);
  const [i, setI] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Stamped on mount rather than in render: the route's sub-2s timing check
  // measures from when a human could first see the form.
  const renderedAt = useRef(0);
  useEffect(() => {
    if (!renderedAt.current) renderedAt.current = Date.now();
  }, []);
  const started = useRef(false);
  const completedSteps = useRef(new Set<StepId>());

  const steps = BD_STEPS;
  const step = steps[i];
  const last = i === steps.length - 1;

  const trackStart = () => {
    if (started.current) return;
    started.current = true;
    trackBookDemo("demo_form_start", { step_id: step.id, step_number: i + 1 });
  };
  const trackCompletedStep = ({
    current = step,
    index = i,
    intent = form.intent,
  }: { current?: (typeof BD_STEPS)[number]; index?: number; intent?: string } = {}) => {
    if (completedSteps.current.has(current.id)) return;
    completedSteps.current.add(current.id);
    trackBookDemo("demo_form_step", {
      intent,
      step_id: current.id,
      step_number: index + 1,
      step_count: steps.length,
    });
  };

  // Slot + zone live here rather than in the picker: the wizard submits
  // them, and the confirmation needs the day it resolved to.
  const [startIso, setStartIso] = useState<string | null>(null);
  // Whether the calendar actually has open times. With no CRM connected the
  // slots endpoint returns configured:false and an empty month, and the
  // request can be sent without a slot — the schedule step must never
  // dead-end the form.
  const [slotsOpen, setSlotsOpen] = useState(false);
  // The browser's zone via useSyncExternalStore: the server snapshot is UTC,
  // so server HTML and the client's first render agree, and the real zone
  // arrives without a setState-in-effect cascade. A manual pick overrides it.
  const detectedTz = useSyncExternalStore(
    subscribeNever,
    localTimezone,
    () => "UTC",
  );
  const [tzChoice, setTzChoice] = useState<string | null>(null);
  const timezone = tzChoice ?? detectedTz;
  const tzOptions = useMemo(() => {
    let all: string[] = [];
    try {
      all = Intl.supportedValuesOf ? Intl.supportedValuesOf("timeZone") : [];
    } catch {
      all = [];
    }
    if (!all.length) {
      all = [
        "Europe/London",
        "Europe/Berlin",
        "America/New_York",
        "America/Chicago",
        "America/Los_Angeles",
        "Asia/Dubai",
        "Asia/Singapore",
        "Asia/Tokyo",
        "Australia/Sydney",
        "UTC",
      ];
    }
    const own = localTimezone();
    return [own, ...all.filter((z) => z !== own)];
  }, []);

  // An error clears the moment its own field changes, rather than surviving
  // until the next Continue.
  const dropErr = (k: string) =>
    setErrors((e) => {
      if (e[k] === undefined) return e;
      const rest = { ...e };
      delete rest[k];
      return rest;
    });

  // Functional updates throughout: spreading a captured `form` loses any
  // change made inside the same render.
  const upd = (k: keyof LeadForm) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    dropErr(k);
  };
  const set = (k: keyof LeadForm) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    dropErr(k);
  };
  // Dial code defaults to where the visitor actually is, so the most
  // annoying field on any mobile form starts half answered.
  useEffect(() => {
    let live = true;
    detectCountry().then((cc) => {
      if (live && cc && DIAL_CODES[cc]) {
        setForm((f) => (f.dial ? f : { ...f, country: cc, dial: DIAL_CODES[cc] }));
      }
    });
    return () => {
      live = false;
    };
  }, []);

  const gate = { startIso, requireSlot: slotsOpen };

  const next = () => {
    const e = bdStepErrors(step.id, form, gate);
    setErrors(e);
    if (Object.keys(e).length) return;
    trackCompletedStep();
    setI((n) => Math.min(n + 1, steps.length - 1));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    // Re-check every gated step, not just this one: someone can reach the
    // end and then go back and empty a field.
    const all = steps.reduce<Record<string, string>>(
      (acc, s) => ({ ...acc, ...bdStepErrors(s.id, form, gate) }),
      {},
    );
    if (Object.keys(all).length) {
      setErrors(all);
      setI(steps.findIndex((s) => Object.keys(bdStepErrors(s.id, form, gate)).length));
      return;
    }
    trackCompletedStep();
    setBusy(true);
    setError(null);
    try {
      const res = await submitLead({
        form,
        startIso,
        timezone,
        renderedAt: renderedAt.current,
      });
      const conversion = {
        intent: form.intent,
        booking_requested: Boolean(startIso),
        delivery_mode: res.degraded ? "fallback" : "ghl",
      };
      // `dropped` bots and unconfigured/failed delivery both carry
      // delivered:false, so neither can inflate the lead conversion.
      if (res.delivered) {
        trackLeadSubmit({
          leadType: "demo_booking",
          booked: Boolean(res.booked),
          ...conversion,
        });
      } else {
        // A dropped bot, or a CRM that did not take the lead. Without this the
        // funnel cannot tell a delivery outage from everyone abandoning on the
        // last step — the two look identical from the step events alone.
        trackBookDemo("demo_submit_failed", {
          ...conversion,
          reason: res.dropped ? "dropped" : "not_delivered",
        });
      }
      if (res.booked && startIso) {
        trackBookDemo("demo_booked", {
          ...conversion,
          appointment_timezone: timezone,
          appointment_lead_days: Math.max(0, Math.ceil((Date.parse(startIso) - Date.now()) / 86400_000)),
        });
      }
      onDone({ ...res, startIso, timezone });
    } catch (err) {
      // Coarse reason only. `err.message` is server copy today, but it is the
      // one string here that could ever echo a submitted value back.
      trackBookDemo("demo_submit_failed", {
        intent: form.intent,
        booking_requested: Boolean(startIso),
        reason: err instanceof LeadError ? "rejected" : "network",
      });
      if (err instanceof LeadError) {
        setErrors(err.fieldErrors || {});
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      setBusy(false);
    }
  };

  // Enter advances rather than submitting a half-filled form from step one.
  const onKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    trackStart();
    if (e.key === "Enter" && !last && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
      next();
    }
  };

  const submitLabel = busy ? "Sending…" : startIso ? "Confirm booking" : "Send request";

  return (
    <form
      className="bd-wiz"
      onSubmit={submit}
      onKeyDown={onKeyDown}
      onFocusCapture={trackStart}
      onPointerDown={trackStart}
    >
      {/* The rail is a counter and a bar rather than a row of dots — six
          labelled steps do not fit a 690px card. */}
      <div className="bd-wiz-head">
        <div className="bd-wiz-meta">
          <span className="bd-wiz-count">
            Step {i + 1} of {steps.length}
          </span>
          <span className="bd-wiz-now">{step.label}</span>
        </div>
        <div className="bd-prog-bar" aria-hidden="true">
          <i style={{ width: `${Math.round(((i + 1) / steps.length) * 100)}%` }} />
        </div>
      </div>

      <div className={`bd-fields ${step.id === "schedule" ? "is-cal" : ""}`}>
        {/* Honeypot. Hidden from sight and from the a11y tree, never
            focusable, and always empty from a real submission. */}
        <div className="bd-hp" aria-hidden="true">
          <label>
            Company confirm
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.company_confirm}
              onChange={upd("company_confirm")}
            />
          </label>
        </div>

        {/* The schedule step's duration strip already names it. */}
        {step.id !== "schedule" && <h3 className="bd-wiz-title">{step.title}</h3>}

        {step.id === "intent" && (
          <div className={`bd-field ${errors.intent ? "has-err" : ""}`}>
            <div className="bd-chips bd-chips-lg">
              {BD_INTENTS.map((o) => (
                <button
                  key={o.v}
                  type="button"
                  className={`bd-chip ${form.intent === o.v ? "is-on" : ""}`}
                  aria-pressed={form.intent === o.v}
                  onClick={() => {
                    setForm((f) => ({ ...f, intent: o.v }));
                    setErrors({});
                    trackCompletedStep({ current: BD_STEPS[0], index: 0, intent: o.v });
                    // One tap is the whole step, so advancing on it saves a
                    // second deliberate click for no added clarity.
                    setTimeout(() => setI(1), 160);
                  }}
                >
                  <span className="bd-chip-ic">
                    <Icon name={o.i} size={16} />
                  </span>
                  {o.v}
                </button>
              ))}
            </div>
            {errors.intent && <small className="bd-field-err">{errors.intent}</small>}
          </div>
        )}

        {step.id === "business" && (
          <>
            <BdField label="Website" error={errors.website}>
              <input
                type="url"
                name="url"
                value={form.website}
                onChange={upd("website")}
                autoComplete="url"
                spellCheck={false}
                autoCapitalize="off"
                inputMode="url"
                placeholder="yourfirm.com"
                autoFocus
                aria-invalid={Boolean(errors.website)}
              />
            </BdField>
            <BdChoice
              label="How risk is handled today"
              options={BD_RISK_TODAY}
              value={form.stage}
              onPick={set("stage")}
            />
          </>
        )}

        {step.id === "contact" && (
          <>
            {/* Split, and each half named the way autofill expects. */}
            <div className="bd-fields-row-2">
              <BdField label="First name" error={errors.firstName}>
                <input
                  type="text"
                  name="fname"
                  value={form.firstName}
                  onChange={upd("firstName")}
                  autoComplete="given-name"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  placeholder="Jana"
                  autoFocus
                  aria-invalid={Boolean(errors.firstName)}
                />
              </BdField>
              <BdField label="Last name" error={errors.lastName}>
                <input
                  type="text"
                  name="lname"
                  value={form.lastName}
                  onChange={upd("lastName")}
                  autoComplete="family-name"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  placeholder="Fischer"
                  aria-invalid={Boolean(errors.lastName)}
                />
              </BdField>
            </div>

            <BdField label="Work email" error={errors.email}>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={upd("email")}
                autoComplete="email"
                inputMode="email"
                spellCheck={false}
                autoCapitalize="off"
                enterKeyHint="next"
                placeholder="you@yourfirm.com"
                aria-invalid={Boolean(errors.email)}
              />
            </BdField>

            {/* Who we are talking to decides who takes the call. */}
            <BdChoice label="Your role" options={BD_ROLES} value={form.role} onPick={set("role")} />

            <div className="bd-fields-row-2">
              <div className={`bd-field ${errors.phone ? "has-err" : ""}`}>
                <span>Phone</span>
                <div className="bd-phone">
                  <BdDialPicker
                    country={form.country}
                    dial={form.dial}
                    onPick={(cc) => setForm((f) => ({ ...f, country: cc, dial: DIAL_CODES[cc] || "" }))}
                  />
                  <input
                    type="tel"
                    name="tel"
                    value={form.phone}
                    onChange={(e) => {
                      // Typing or pasting a full international number swaps
                      // the country rather than leaving "+49 …" inside a +44
                      // field. Longest code first, so +1 cannot shadow a
                      // longer code.
                      const v = e.target.value;
                      dropErr("phone");
                      const m = v.replace(/[\s()-]/g, "").match(/^\+(\d{1,4})/);
                      if (m) {
                        const hit = Object.entries(DIAL_CODES)
                          .filter(([, d]) => m[1].startsWith(d.slice(1)))
                          .sort((a, b) => b[1].length - a[1].length)[0];
                        if (hit) {
                          setForm((f) => ({
                            ...f,
                            country: hit[0],
                            dial: hit[1],
                            phone: v.replace(/^\s*\+\d+/, "").trimStart(),
                          }));
                          return;
                        }
                      }
                      // Digits and the separators people actually type.
                      setForm((f) => ({ ...f, phone: v.replace(/[^\d\s()+.-]/g, "") }));
                    }}
                    autoComplete="tel-national"
                    inputMode="tel"
                    placeholder="Phone number"
                    aria-invalid={Boolean(errors.phone)}
                  />
                </div>
                {errors.phone && <small className="bd-field-err">{errors.phone}</small>}
              </div>
              <BdField label="Telegram" hint="(optional)">
                <input
                  type="text"
                  value={form.telegram}
                  onChange={upd("telegram")}
                  autoCapitalize="off"
                  spellCheck={false}
                  placeholder="@username"
                />
              </BdField>
            </div>
          </>
        )}

        {step.id === "prepare" && (
          <>
            <BdField label="What is important to cover" hint="(optional)">
              <textarea
                value={form.notes}
                onChange={upd("notes")}
                rows={3}
                autoFocus
                placeholder="e.g. A pattern you suspect but cannot prove, or the platforms we should connect first."
              />
            </BdField>
            <BdChoice
              label="When you would like to move"
              options={BD_TIMELINES}
              value={form.timeline}
              onPick={set("timeline")}
            />
          </>
        )}

        {step.id === "schedule" && (
          <>
            <BdSchedulePicker
              value={startIso}
              onChange={(iso) => {
                setStartIso(iso);
                dropErr("schedule");
                // The picker also calls onChange(null) when a day or month
                // is changed to clear an old time. That is not a selection.
                if (iso && Number.isFinite(Date.parse(iso))) {
                  trackBookDemo("demo_slot_selected", {
                    intent: form.intent,
                    appointment_timezone: timezone,
                    appointment_lead_days: Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 86400_000)),
                  });
                }
              }}
              timezone={timezone}
              setTimezone={setTzChoice}
              tzOptions={tzOptions}
              onAvailability={setSlotsOpen}
            />
            {errors.schedule && <small className="bd-field-err">{errors.schedule}</small>}
          </>
        )}

        {last && <p className="bd-fine">Your details are used to prepare the call.</p>}
      </div>

      {error && (
        <div className="bd-form-error" role="alert">
          {error}
        </div>
      )}

      <div className="bd-cal-foot bd-wiz-foot">
        {i > 0 && (
          <button type="button" className="bd-wiz-back" onClick={() => setI((n) => n - 1)}>
            <Icon name="arrow" size={13} style={{ transform: "rotate(180deg)" }} /> Back
          </button>
        )}
        {/* Distinct keys, so React replaces the node between steps. Reusing
            one DOM button lets the browser see it as type="submit" by the
            time the click's default action runs — which submitted the form
            from the step before the schedule. */}
        {last ? (
          <button key="submit" type="submit" className="btn solid" disabled={busy}>
            <span>{submitLabel}</span>
          </button>
        ) : (
          <button key="continue" type="button" className="btn solid" onClick={next}>
            <span>Continue</span> <Icon name="arrow" size={13} />
          </button>
        )}
      </div>
    </form>
  );
}

// ---------- Confirmation ----------
// Google's "add to calendar" template link. `dates` must be UTC basic format
// (YYYYMMDDTHHMMSSZ) — with Z times the zone is unambiguous, so the entry
// lands correctly whatever zone the visitor's Google account is set to.
function googleCalendarUrl(startIso: string, minutes = BD_CALL_MINUTES): string | null {
  const start = Date.parse(startIso);
  if (!Number.isFinite(start)) return null;
  const stamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "QuantSentry demo call",
    dates: `${stamp(start)}/${stamp(start + minutes * 60_000)}`,
    details:
      "A twenty minute demo with the QuantSentry team. " +
      "The calendar invite with the video link is on its way.",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function BookDemoConfirm({
  picked,
  onReset,
}: {
  picked: BookDemoResult | null;
  onReset: () => void;
}) {
  const { startIso, booked, timezone } = picked || { startIso: null, booked: false, timezone: "" };
  // The zone the visitor chose in the picker, not the browser's. Both the
  // date and the time are formatted in it — a slot at 23:00 in one zone is
  // the next day in another.
  const zone = timezone || localTimezone();
  const fmt = (opts: Intl.DateTimeFormatOptions) => {
    if (!startIso) return "";
    try {
      return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: zone }).format(new Date(startIso));
    } catch {
      return new Intl.DateTimeFormat("en-GB", opts).format(new Date(startIso));
    }
  };
  const calendarHref = startIso ? googleCalendarUrl(startIso) : null;
  // Only claim a slot was held when one actually was. Without `booked` the
  // route delivered a plain enquiry, and this screen must say so.
  const hasSlot = Boolean(startIso && booked);
  return (
    <div className="bd-confirm">
      <div className="bd-confirm-ico">
        <Icon name="check" size={28} stroke={2} />
      </div>
      <h3 className="bd-confirm-h">{hasSlot ? "You are booked." : "Request received."}</h3>
      <p className="bd-confirm-p">
        {hasSlot ? (
          <>
            We have you down for{" "}
            <strong>
              {fmt({ weekday: "long", month: "long", day: "numeric" })} at {slotLabel(startIso!, zone)}{" "}
              {tzOffsetLabel(zone)}
            </strong>
            . A calendar invite is on its way.
          </>
        ) : (
          <>We will reply within 24 hours with a few time slots.</>
        )}
      </p>

      <ul className="bd-confirm-list">
        <li>
          <span className="bd-confirm-bullet" />
          {hasSlot ? "Calendar invite (.ics) in your inbox" : "Times to pick from, within 24 hours"}
        </li>
        <li>
          <span className="bd-confirm-bullet" />A short brief before the call so we arrive prepared
        </li>
        <li>
          <span className="bd-confirm-bullet" />
          {hasSlot ? "A video link in the invite, nothing to install" : "Twenty minutes, at a time that suits you"}
        </li>
      </ul>

      {/* "Add to Google Calendar" only when there is something to add. */}
      <div className="bd-confirm-actions">
        {hasSlot && calendarHref && (
          <a href={calendarHref} className="btn ghost" target="_blank" rel="noopener noreferrer">
            Add to Google Calendar
          </a>
        )}
        <button type="button" className="bd-btn-link" onClick={onReset}>
          {hasSlot ? "Reschedule" : "Send another"}
        </button>
      </div>
    </div>
  );
}

// ---------- Assurance strip ----------
// Four statements of fact under the card: everything a visitor needs to know
// before typing their name.
function BookDemoAssurance() {
  return (
    <ul className="bd-assure">
      <li>
        <Icon name="clock" size={14} />
        Twenty minutes
      </li>
      <li>
        <Icon name="shield" size={14} />
        Read-only access
      </li>
      <li>
        <Icon name="play" size={13} />
        Live walkthrough on your patterns
      </li>
      <li>
        <Icon name="check" size={14} />
        Reply within 24 hours
      </li>
    </ul>
  );
}

// ---------- Booking section ----------
export function BookDemoBooking() {
  const [picked, setPicked] = useState<BookDemoResult | null>(null);

  return (
    <div className="bd-focus-inner">
      <div className="bd-booking">
        <div className="bd-cal">
          {picked ? (
            <BookDemoConfirm picked={picked} onReset={() => setPicked(null)} />
          ) : (
            <BookDemoWizard onDone={setPicked} />
          )}
        </div>
      </div>
      {!picked && <BookDemoAssurance />}
    </div>
  );
}
