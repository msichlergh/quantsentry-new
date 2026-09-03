import type { MetadataRoute } from "next";

import { absoluteUrl } from "./_seo/site";

/**
 * Crawl policy.
 *
 * QuantSentry is a marketing site whose whole job is to be found and cited, so
 * the default is open. The AI crawlers are listed explicitly rather than left
 * to the `*` group: several of them (Google-Extended, Applebot-Extended,
 * OAI-SearchBot) only read their own named block, and being named "allow"
 * is what keeps the site eligible for AI Overviews, ChatGPT search results
 * and Perplexity citations.
 *
 * `/api/` is the only closed path — those routes are the lead, geo and slots
 * endpoints. They render nothing and have no search value.
 *
 * Note on `?cc=`: `lib/lead-client.ts` reads a `cc` query parameter, so
 * parameterised URLs are linkable. They are deliberately NOT disallowed here.
 * Blocking them would stop crawlers reading the `rel=canonical` that folds
 * them back into the clean URL, leaving the duplicates indexed and orphaned.
 * Canonicals are the right tool for that; robots.txt is not.
 */

/** Search engines and answer engines that should read and index the site. */
const SEARCH_AND_AI_AGENTS = [
  // Google
  "Googlebot",
  "Googlebot-Image",
  "Google-Extended",
  // Microsoft / Copilot
  "bingbot",
  // OpenAI
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Apple
  "Applebot",
  "Applebot-Extended",
  // Meta
  "meta-externalagent",
  "FacebookBot",
  // Others
  "Amazonbot",
  "MistralAI-User",
  "cohere-ai",
  "DuckDuckBot",
  "CCBot",
];

/**
 * Link unfurlers. They need the page HTML to read the OG tags; none of them
 * index, so they get the whole site including the generated card routes.
 */
const SOCIAL_UNFURLERS = [
  "facebookexternalhit",
  "Twitterbot",
  "LinkedInBot",
  "Slackbot",
  "Slackbot-LinkExpanding",
  "Discordbot",
  "WhatsApp",
  "TelegramBot",
  "redditbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
      {
        userAgent: SEARCH_AND_AI_AGENTS,
        allow: "/",
        disallow: "/api/",
      },
      {
        userAgent: SOCIAL_UNFURLERS,
        allow: "/",
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
