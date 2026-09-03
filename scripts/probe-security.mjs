// Proves the /api hardening against a running server. Read-only with respect
// to the CRM: run it with CRM_PROVIDER=noop so nothing reaches GoHighLevel.
//
//   CRM_PROVIDER=noop CRM_ALLOW_NOOP=1 npm start &
//   node scripts/probe-security.mjs http://127.0.0.1:3111
//
// Each probe prints PASS/FAIL plus the status and the bits of the response
// that carry the evidence. Exit code is the number of failures.
//
// Every request sends a distinct X-Forwarded-For so probes do not spend each
// other's rate-limit budget. That header is only trusted here because this
// talks to a local server with no proxy in front of it — in production
// lib/rate-limit.ts prefers the platform-set headers precisely because this one
// is forgeable.

const BASE = process.argv[2] || "http://127.0.0.1:3111";
const ORIGIN = new URL(BASE).origin;

let failures = 0;
let probe = 0;

function check(name, condition, evidence) {
  const status = condition ? "PASS" : "FAIL";
  if (!condition) failures++;
  console.log(`  [${status}] ${name}`);
  for (const line of evidence) console.log(`         ${line}`);
}

function ip() {
  // 203.0.113.0/24 is TEST-NET-3 (RFC 5737): reserved for documentation, never
  // routed, and routable enough to pass the geo route's private-range filter.
  probe++;
  return `203.0.113.${probe % 250}`;
}

async function post(path, body, { headers = {}, xff = ip(), raw = null } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: ORIGIN,
      "X-Forwarded-For": xff,
      ...headers,
    },
    body: raw ?? JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON body is itself evidence */
  }
  return { res, json, text };
}

async function get(path, { headers = {}, xff = ip() } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: "application/json", "X-Forwarded-For": xff, ...headers },
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { res, json, text };
}

// A submission that passes every gate: honeypot empty, render timestamp a
// plausible 30 seconds ago, all required fields present.
const validLead = (over = {}) => ({
  firstName: "Probe",
  lastName: "Tester",
  email: `probe+${Date.now()}@example.com`,
  phone: "+49 30 1234567",
  company_confirm: "",
  ts: Date.now() - 30_000,
  page: "/demo",
  ...over,
});

async function main() {
  console.log(`\nProbing ${BASE}\n`);

  // -----------------------------------------------------------------------
  console.log("1. Rate limiting — burst on POST /api/lead (limit 8 / 10 min per IP)");
  {
    const burst = "203.0.113.240";
    const codes = [];
    let firstLimited = null;
    for (let i = 0; i < 12; i++) {
      const { res, json } = await post("/api/lead", validLead(), { xff: burst });
      codes.push(res.status);
      if (res.status === 429 && !firstLimited) {
        firstLimited = {
          n: i + 1,
          retryAfter: res.headers.get("retry-after"),
          limit: res.headers.get("ratelimit-limit"),
          remaining: res.headers.get("ratelimit-remaining"),
          code: json?.code,
        };
      }
    }
    check(
      "burst trips the limiter with 429",
      codes.includes(429),
      [`statuses: ${codes.join(" ")}`],
    );
    check(
      "429 carries Retry-After and RATE_LIMITED",
      Boolean(firstLimited && Number(firstLimited.retryAfter) > 0 && firstLimited.code === "RATE_LIMITED"),
      firstLimited
        ? [
            `first 429 on request #${firstLimited.n} of 12`,
            `Retry-After: ${firstLimited.retryAfter}`,
            `RateLimit-Limit: ${firstLimited.limit}  RateLimit-Remaining: ${firstLimited.remaining}`,
            `body.code: ${firstLimited.code}`,
          ]
        : ["no 429 observed"],
    );
    check(
      "a real person submitting twice is NOT blocked",
      codes[0] === 200 && codes[1] === 200,
      [`request 1: ${codes[0]}   request 2: ${codes[1]}`],
    );
  }

  // -----------------------------------------------------------------------
  console.log("\n2. Per-email limit (3 / hour) survives IP rotation");
  {
    const email = `same+${Date.now()}@example.com`;
    const codes = [];
    for (let i = 0; i < 5; i++) {
      // Fresh IP each time: only the email key can stop this.
      const { res } = await post("/api/lead", validLead({ email }));
      codes.push(res.status);
    }
    check(
      "same address from 5 different IPs is limited",
      codes.filter((c) => c === 429).length >= 1,
      [`statuses: ${codes.join(" ")}`, "(each request used a different X-Forwarded-For)"],
    );
  }

  // -----------------------------------------------------------------------
  console.log("\n3. Bot check — `ts` omitted must fail CLOSED");
  {
    const noTs = validLead();
    delete noTs.ts;
    const { res, json } = await post("/api/lead", noTs);
    check(
      "omitting ts is dropped (was: skipped the check entirely)",
      res.status === 200 && json?.dropped === true && json?.delivered === false,
      [`status ${res.status}`, `body ${JSON.stringify(json)}`],
    );
    check(
      "the drop is silent — a bot is not told it was blocked",
      res.status === 200 && json?.ok === true,
      ["200 with ok:true, no error field"],
    );

    const badTs = await post("/api/lead", validLead({ ts: "not-a-number" }));
    check(
      "unparseable ts is dropped",
      badTs.res.status === 200 && badTs.json?.dropped === true,
      [`status ${badTs.res.status}`, `body ${JSON.stringify(badTs.json)}`],
    );

    const nullTs = await post("/api/lead", validLead({ ts: null }));
    check(
      "null ts is dropped",
      nullTs.res.status === 200 && nullTs.json?.dropped === true,
      [`body ${JSON.stringify(nullTs.json)}`],
    );

    const zeroTs = await post("/api/lead", validLead({ ts: 0 }));
    check(
      "ts:0 is dropped",
      zeroTs.res.status === 200 && zeroTs.json?.dropped === true,
      [`body ${JSON.stringify(zeroTs.json)}`],
    );

    const fastTs = await post("/api/lead", validLead({ ts: Date.now() }));
    check(
      "sub-2s submission still dropped (original behaviour intact)",
      fastTs.res.status === 200 && fastTs.json?.dropped === true,
      [`body ${JSON.stringify(fastTs.json)}`],
    );

    const honey = await post("/api/lead", validLead({ company_confirm: "spam" }));
    check(
      "honeypot still dropped",
      honey.res.status === 200 && honey.json?.dropped === true,
      [`body ${JSON.stringify(honey.json)}`],
    );

    const old = await post("/api/lead", validLead({ ts: Date.now() - 6 * 3600_000 }));
    check(
      "a tab left open for 6 hours is ACCEPTED, not dropped",
      old.res.status === 200 && old.json?.dropped !== true,
      [`body ${JSON.stringify(old.json)}`],
    );
  }

  // -----------------------------------------------------------------------
  console.log("\n4. Cross-origin forgery");
  {
    // The <form enctype="text/plain"> attack: a browser will send this
    // cross-origin with no preflight, but it cannot set a JSON content type.
    const plain = await post("/api/lead", null, {
      headers: { "Content-Type": "text/plain;charset=UTF-8", Origin: "https://evil.example" },
      raw: `${JSON.stringify(validLead())}=`,
    });
    check(
      "enctype=text/plain form post is rejected",
      plain.res.status === 415 && plain.json?.code === "UNSUPPORTED_MEDIA_TYPE",
      [`status ${plain.res.status}`, `body ${JSON.stringify(plain.json)}`],
    );

    const form = await post("/api/lead", null, {
      headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: "https://evil.example" },
      raw: "email=a@b.com&firstName=x",
    });
    check(
      "urlencoded form post is rejected",
      form.res.status === 415,
      [`status ${form.res.status}`, `body ${JSON.stringify(form.json)}`],
    );

    const foreign = await post("/api/lead", validLead(), {
      headers: { Origin: "https://evil.example" },
    });
    check(
      "foreign Origin with a JSON content type is rejected",
      foreign.res.status === 403 && foreign.json?.code === "FORBIDDEN",
      [`status ${foreign.res.status}`, `body ${JSON.stringify(foreign.json)}`],
    );

    const foreignReferer = await post("/api/lead", validLead(), {
      headers: { Origin: "", Referer: "https://evil.example/page" },
    });
    check(
      "foreign Referer (no Origin) is rejected",
      foreignReferer.res.status === 403,
      [`status ${foreignReferer.res.status}`],
    );

    const same = await post("/api/lead", validLead());
    check(
      "same-origin submission still works",
      same.res.status === 200 && same.json?.ok === true && same.json?.dropped !== true,
      [`status ${same.res.status}`, `body ${JSON.stringify(same.json)}`],
    );
  }

  // -----------------------------------------------------------------------
  console.log("\n5. /api/slots — timezone validation");
  {
    const from = new Date(Date.now() + 86400_000).toISOString();
    const to = new Date(Date.now() + 7 * 86400_000).toISOString();
    const q = (tz) => `/api/slots?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&tz=${encodeURIComponent(tz)}`;

    const good = await get(q("Europe/Berlin"));
    check(
      "a real IANA zone is accepted",
      good.res.status === 200 && good.json?.timezone === "Europe/Berlin",
      [`status ${good.res.status}`, `timezone echoed: ${good.json?.timezone}`],
    );

    for (const bad of ["Mars/Olympus", "<script>alert(1)</script>", "../../etc/passwd", "A".repeat(200)]) {
      const r = await get(q(bad));
      check(
        `rejected: ${bad.slice(0, 34)}${bad.length > 34 ? "…" : ""}`,
        r.res.status === 400 && r.json?.code === "VALIDATION_ERROR",
        [`status ${r.res.status}`, `body ${JSON.stringify(r.json)}`],
      );
    }

    const burstIp = "203.0.113.241";
    const codes = [];
    for (let i = 0; i < 45; i++) {
      const r = await get(q("UTC"), { xff: burstIp });
      codes.push(r.res.status);
    }
    check(
      "slots burst is limited (40 / min)",
      codes.includes(429),
      [`first 429 at request #${codes.indexOf(429) + 1} of 45`],
    );
  }

  // -----------------------------------------------------------------------
  console.log("\n6. /api/geo — limited, and the cache key must be an IP");
  {
    const burstIp = "203.0.113.242";
    const codes = [];
    for (let i = 0; i < 35; i++) {
      const r = await get("/api/geo", { xff: burstIp });
      codes.push(r.res.status);
    }
    const limited = codes.indexOf(429);
    check(
      "geo burst is limited (30 / min)",
      limited >= 0,
      [`first 429 at request #${limited + 1} of 35`],
    );

    // The old code used the raw header as a Map key. A non-IP value must not
    // become one, and must not reach the ipwho.is URL either.
    const junk = await get("/api/geo", { xff: "not-an-ip-".repeat(20) });
    check(
      "a non-IP x-forwarded-for is not used as a cache key",
      junk.res.status === 200 && junk.json?.source === "none",
      [`status ${junk.res.status}`, `body ${JSON.stringify(junk.json)}`],
    );

    const override = await get("/api/geo?cc=DE");
    check(
      "?cc override still works",
      override.json?.country === "DE",
      [`body ${JSON.stringify(override.json)}`],
    );
  }

  // -----------------------------------------------------------------------
  console.log("\n7. Security headers");
  {
    const res = await fetch(`${BASE}/demo`, { headers: { "X-Forwarded-For": ip() } });
    const expected = {
      "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin",
      "x-frame-options": "SAMEORIGIN",
      "permissions-policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    };
    for (const [key, value] of Object.entries(expected)) {
      const actual = res.headers.get(key);
      check(key, actual === value, [`${actual ?? "(absent)"}`]);
    }
    check(
      "Referrer-Policy is not no-referrer (referral attribution preserved)",
      res.headers.get("referrer-policy") !== "no-referrer",
      [`${res.headers.get("referrer-policy")}`],
    );
  }

  console.log(`\n${failures === 0 ? "ALL PROBES PASSED" : `${failures} PROBE(S) FAILED`}\n`);
  process.exit(failures);
}

main().catch((err) => {
  console.error("probe run failed:", err);
  process.exit(1);
});
