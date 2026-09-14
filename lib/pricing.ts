// Platform pricing, shared by the pricing page and the savings calculator so
// the two can never quote different numbers.
//
// Platform is €1,500 a month with the first 250 active accounts included. Each
// further block of 250 is priced by the band its top account falls in, and the
// blocks are cumulative: crossing a threshold only reprices the next block,
// never the whole account base. Annual billing takes 20% off every price.
export const INCLUDED = 250;
export const BLOCK = 250;
export const BANDS = [
  { upTo: 1000, rate: 250 },
  { upTo: 2500, rate: 175 },
  { upTo: 5000, rate: 125 },
  { upTo: 10000, rate: 100 },
  { upTo: Infinity, rate: 75 },
] as const;
export const PLATFORM_BASE = 1500;
export const NETWORK_PRICE = 750;
export const BASE_CREDITS = 1500;
export const CREDITS_PER_BLOCK = 500;
export const ANNUAL_DISCOUNT = 0.2;
export const STEPS = [250, 500, 750, 1000, 1500, 2000, 2500, 3500, 5000, 7500, 10000, 15000, 20000];

export const blocksFor = (accounts: number) => Math.max(0, Math.ceil((accounts - INCLUDED) / BLOCK));

export function volumeFee(accounts: number) {
  let fee = 0;
  for (let i = 0; i < blocksFor(accounts); i++) {
    const top = INCLUDED + (i + 1) * BLOCK;
    fee += (BANDS.find((band) => top <= band.upTo) ?? BANDS[BANDS.length - 1]).rate;
  }
  return fee;
}

/** Platform's monthly list price for an account count, before any discount. */
export const platformPrice = (accounts: number) => PLATFORM_BASE + volumeFee(accounts);

/** A monthly list price as billed: annual billing takes 20% off. */
export const billedPrice = (monthly: number, annual: boolean) => (annual ? monthly * (1 - ANNUAL_DISCOUNT) : monthly);

// en-GB matches the document language, so server and client format identically.
export const euros = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
export const count = (n: number) => n.toLocaleString("en-GB");
