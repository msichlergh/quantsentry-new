"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { trackLeadSubmit } from "@/lib/analytics";
import { LeadError, submitContact } from "@/lib/lead-client";

// Compact contact form for the demo page. Same /api/lead pipeline as the
// wizard — honeypot, timing check, honest response — declared as
// form: "contact" so the CRM can route it separately later.

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export function BookDemoContact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Stamped on mount rather than in render: the route's sub-2s timing check
  // measures from when a human could first see the form.
  const renderedAt = useRef(0);
  useEffect(() => {
    if (!renderedAt.current) renderedAt.current = Date.now();
  }, []);

  const dropErr = (k: string) =>
    setErrors((e) => {
      if (e[k] === undefined) return e;
      const rest = { ...e };
      delete rest[k];
      return rest;
    });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your name";
    if (!emailOk(email)) next.email = "Enter a valid work email";
    if (!message.trim()) next.message = "Tell us what it is about";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    setError(null);
    try {
      const res = await submitContact({
        name,
        email,
        website: company,
        message,
        renderedAt: renderedAt.current,
        honeypot,
      });
      // Same gate as the wizard: only a lead the server says it delivered
      // counts. This form is the "sent a request, did not book" half of the
      // funnel and was previously invisible.
      if (res.delivered) trackLeadSubmit({ leadType: "contact", booked: false });
      setSent(true);
    } catch (err) {
      if (err instanceof LeadError) {
        // The route keys name errors on firstName; this form has one field.
        const fe = err.fieldErrors || {};
        setErrors({
          ...(fe.firstName ? { name: fe.firstName } : {}),
          ...(fe.email ? { email: fe.email } : {}),
        });
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="bd-contact-done" role="status">
        <h3>Message received.</h3>
        <p>We reply within 24 hours.</p>
        <button
          type="button"
          className="bd-btn-link"
          onClick={() => {
            setSent(false);
            setBusy(false);
            setMessage("");
          }}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="bd-contact" onSubmit={submit}>
      {/* Honeypot: out of sight, out of the a11y tree, not focusable. */}
      <div className="bd-hp" aria-hidden="true">
        <label>
          Company confirm
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      <div className="bd-fields-row-2">
        <label className={`bd-field ${errors.name ? "has-err" : ""}`}>
          <span>Name</span>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              dropErr("name");
            }}
            autoComplete="name"
            autoCapitalize="words"
            placeholder="Jana Fischer"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <small className="bd-field-err">{errors.name}</small>}
        </label>
        <label className={`bd-field ${errors.email ? "has-err" : ""}`}>
          <span>Work email</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              dropErr("email");
            }}
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            autoCapitalize="off"
            placeholder="you@yourfirm.com"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <small className="bd-field-err">{errors.email}</small>}
        </label>
      </div>

      <label className="bd-field">
        <span>
          Company or website <em>(optional)</em>
        </span>
        <input
          type="text"
          name="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          autoComplete="organization"
          spellCheck={false}
          placeholder="yourfirm.com"
        />
      </label>

      <label className={`bd-field ${errors.message ? "has-err" : ""}`}>
        <span>Message</span>
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            dropErr("message");
          }}
          rows={4}
          placeholder="e.g. A question on pricing, a partnership idea, or a futures book you would like covered."
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message && <small className="bd-field-err">{errors.message}</small>}
      </label>

      {error && (
        <div className="bd-form-error bd-form-error-flush" role="alert">
          {error}
        </div>
      )}

      <div className="bd-contact-foot">
        <p className="bd-fine">Your details are used to reply, nothing else.</p>
        <button type="submit" className="btn solid" disabled={busy}>
          <span>{busy ? "Sending…" : "Send message"}</span>
        </button>
      </div>
    </form>
  );
}
