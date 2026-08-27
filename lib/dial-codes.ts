// Country -> dial code, for prefilling the phone field.
//
// Not exhaustive on purpose: this is a picker default, not a validation table.
// Anything missing falls back to an empty prefix the visitor can type.
export const DIAL_CODES: Record<string, string> = {
  AE: "+971", AR: "+54", AT: "+43", AU: "+61", BE: "+32", BG: "+359", BR: "+55",
  CA: "+1", CH: "+41", CL: "+56", CN: "+86", CO: "+57", CY: "+357", CZ: "+420",
  DE: "+49", DK: "+45", EE: "+372", EG: "+20", ES: "+34", FI: "+358", FR: "+33",
  GB: "+44", GR: "+30", HK: "+852", HR: "+385", HU: "+36", ID: "+62", IE: "+353",
  IL: "+972", IN: "+91", IT: "+39", JP: "+81", KE: "+254", KR: "+82", KW: "+965",
  LT: "+370", LU: "+352", LV: "+371", MA: "+212", MT: "+356", MX: "+52",
  MY: "+60", NG: "+234", NL: "+31", NO: "+47", NZ: "+64", PE: "+51", PH: "+63",
  PK: "+92", PL: "+48", PT: "+351", QA: "+974", RO: "+40", RS: "+381",
  SA: "+966", SE: "+46", SG: "+65", SI: "+386", SK: "+421", TH: "+66",
  TR: "+90", TW: "+886", UA: "+380", US: "+1", VN: "+84", ZA: "+27",
};

// Regional-indicator pair, so the flag comes from the font rather than 60 SVGs.
export const flagFor = (cc: string): string =>
  /^[A-Z]{2}$/.test(cc || "")
    ? String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
    : "";

export const countryName = (cc: string): string => {
  try {
    return new Intl.DisplayNames(undefined, { type: "region" }).of(cc) || cc;
  } catch {
    return cc;
  }
};

export type DialOption = { cc: string; dial: string; name: string; flag: string };

// Sorted by name so the list reads the way a person scans it, not by ISO code.
export const dialOptions = (): DialOption[] =>
  Object.keys(DIAL_CODES)
    .map((cc) => ({ cc, dial: DIAL_CODES[cc], name: countryName(cc), flag: flagFor(cc) }))
    .sort((a, b) => a.name.localeCompare(b.name));
