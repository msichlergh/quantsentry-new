# Design QA

- Source visual truth: `https://quantsentry-website.vercel.app/`, `.context/attachments/333sZ8/image.png`, `.context/attachments/vedM72/image.png`, `.context/attachments/Y5RZxb/image.png`, `.context/attachments/rdcrpQ/image.png`, `.context/attachments/P3GHhV/image.png`, `.context/attachments/5wQULy/image.png`, `.context/attachments/tit3Gi/image.png`, `.context/attachments/c5nXPH/image.png`, `.context/attachments/i7jEl7/image.png`, `.context/attachments/3kjcTS/image.png`, `.context/attachments/0AGKgG/image.png`, `.context/attachments/Y6JoDT/image.png`, `.context/attachments/IvQ3eB/image.png`, `.context/attachments/vitESO/image.png`, `.context/attachments/K1RjPT/image.png`, `.context/attachments/IwzcJq/image.png`, `.context/attachments/UikWD1/image.png`, `.context/attachments/UbwKQY/image.png`, and `.context/attachments/lYrdu2/image.png`
- Earlier source pixels: 1096 x 182, 1167 x 216, 392 x 410, 156 x 135, 332 x 196, 170 x 153, 186 x 144, 282 x 214, and 195 x 196
- Latest source pixels: 1049 x 269
- Implementation: `http://localhost:55000`
- Implementation screenshot: unavailable for the latest eye-free abstract animation change
- Previously validated viewports: 1440 x 900 and 320 x 800
- State: idle Argus prompt, focused prompt, ingestion message, floating-widget transition, and final Argus workspace

## Comparison evidence

The prompt and animation references were inspected at original resolution. Previous browser evidence confirmed the existing 368 x 62 Argus widget, typed greeting, focused prompt, and input behaviour. The selected abstract orb receives the same live Argus state as its status label across the hero, dashboard bubble, and AI console. The current result could not be captured because no browser surface is available.

At 320 x 800, the document and client widths both measured 305 px, confirming no horizontal overflow. Every Argus orb receives the same live state, while the dashboard-only bubble remains hidden at the existing mobile breakpoint.

## Findings

- [P1] Latest eye-free Argus animation is not visually verified
  - Location: compact Argus orb in the hero widget.
  - Evidence: source screenshot is available, but the browser runtime reports no available browser.
  - Impact: the animation colour, timing, and hierarchy cannot be certified against the selected balance.
  - Fix: capture the compact widget when a browser surface is available and compare it with the supplied screenshot.
- [P1] Live hero typography match is not visually verified
  - Location: homepage hero headline, kicker, and CTA labels.
  - Evidence: the local stylesheet had incorrectly registered the real General Sans 600 face as weight 500, competing with the real 500 face. The descriptor is restored to 600, and the optimized local build now has the exact same 400/500/600/700 face hashes and descriptors as the live stylesheet. The supplied inspectors both report General Sans at 54px and weight 500, but no connected browser is available for a same-viewport page capture.
  - Impact: source and code-level matching is verified, but rendered fidelity cannot yet be certified.
  - Fix: capture the homepage at the supplied viewport when a browser surface is available.
- [P1] Latest navigation weight match is not visually verified
  - Location: desktop and mobile primary navigation.
  - Evidence: the local desktop navigation now matches the live stylesheet at weight 450, while CTA labels use 500; no browser surface is connected for a fresh capture.
  - Impact: the CSS hierarchy is verified, but rendered fidelity cannot yet be certified.
  - Fix: capture the header at the supplied viewport when a browser surface is available.

## Required fidelity surfaces

- Fonts and typography: the prompt remains within the existing input typography and writes itself out instead of appearing as a static block.
- Spacing and layout rhythm: the existing widget dimensions, controls, and gaps are unchanged.
- Colors and visual tokens: the selected Argus treatment uses white particles for contrast while retaining QuantSentry teal for the status indicator, voice controls, and interactive borders.
- Image quality and asset fidelity: the existing animated `ThinkingOrb` remains visible and state-responsive without code-native eyes or a secondary status orb.
- Copy and content: idle prompts are short, the first greeting is `Hey, I’m ready to get started.`, and focus changes the copy to `What should we explore?`.

## Implementation checklist

- Capture the fully docked dashboard state.
- Capture Argus Chat mode.
- Switch to Voice and capture the same viewport.
- Confirm no horizontal overflow at 320 px.
- Confirm the selected white-particle Argus animation in the hero, dashboard bubble, and AI console.
- Confirm keyboard focus follows the outer Argus pill instead of outlining the inner input.

## Final brand implementation

- The selected Coil icon and Instrument Sans wordmark render consistently in the header and footer across every route.
- Quant uses weight 400 and Sentry uses weight 500 with a subtle cool-white gradient.
- The Coil is optically sized at `1.08em`, aligned to the wordmark, and separated by a `5px` gap.
- Standard mobile sizing is `19.8px`; viewports at or below 350px use the compact `16.5px` fallback.
- Hover rotates the Coil in place without glow or positional drift. Reduced-motion users receive no animation.
- The font and icon comparison controls and their unused production code were removed.
- `app/icon.png` places the Coil on a compact dark circular field for legibility at browser-tab size; `app/apple-icon.png` uses the same selected mark.
- Browser-rendered verification remains unavailable because no controllable browser is connected; local validation covers lint, build, static routes, and asset output only.

## Capability explorer and navigation update

- Source references: `.context/attachments/qPQr7l/image.png`, `.context/attachments/unoNRf/image.png`, and `.context/attachments/NAiUqk/image.png`.
- Source pixels: 2782 x 1247 for the capability reference, 2389 x 180 for the header reference, and 1316 x 837 for the dropdown reference.
- Intended implementation viewports: 1440 x 900 desktop and 320 x 800 narrow mobile at device scale factor 1.
- Implementation screenshot: unavailable because no in-app browser surface is connected.
- State: first capability selected, contained workspace at its top scroll position, plus Industries, Solutions, and Resources dropdown-open states.
- Implementation: `HomeCapabilityShowcase.tsx` adds a contained, vertically scrollable capability workspace with a synchronized category index and product sidebar.
- Navigation: Platform, Argus AI, Custom Business Intelligence, and Managed Desk are grouped under Solutions; Proof and Insights are grouped under Resources; Pricing and Company remain direct links.
- Dropdown treatment: compact headings, tighter link rows, lighter descriptions, restrained text-and-dot availability labels, and clear footer links replace the oversized content-card treatment.
- Responsive behavior: the capability index becomes a horizontally scrollable tab row below 760px and the internal product sidebar is removed below 1040px.
- Automated checks: lint, production build, and whitespace validation pass.
- Visual comparison: blocked because the in-app browser reports no available browser surfaces.

## Capability motion and submenu icon update

- Source references: `.context/attachments/BgcCOz/image.png`, `.context/attachments/Xmozk1/image.png`, and `.context/attachments/23VzpI/image.png`.
- Source pixels: 2631 x 1789 for the implemented capability state, 695 x 904 and 1034 x 818 for the submenu icon references.
- The contained workspace now resets to Data Intelligence on mount, preventing a restored bottom scroll position from showing Managed Desk while the navigation still highlights Data Intelligence.
- Selecting or scrolling to a capability updates the outer index, internal product navigation, and window title from the same active state.
- Active sections now use staged heading, description, metric, row, benchmark, Argus-message, and Managed Desk task reveals; live indicators and benchmark progress receive restrained continuous motion.
- Dropdown links now use consistent Phosphor icon tiles for industries, solutions, and resources, while preserving the existing compact mobile menu.
- `prefers-reduced-motion` disables all newly added motion and restores fully visible content.
- Automated checks: lint, production build, and whitespace validation pass.
- Browser-rendered verification remains blocked because no in-app browser surface is connected.

## Industry copy and header balance update

- Source references: `.context/attachments/b4mjDe/image.png` at 1009 x 937 and `.context/attachments/mVjdTg/image.png` at 2528 x 272.
- Industry descriptions are reduced to short, scannable phrases while preserving the existing titles, icons, availability states, and destinations.
- Desktop navigation now uses the space after the brand instead of shifting the full link group to the far right; the demo CTA remains anchored to the right edge.
- Mobile navigation is unchanged.
- Automated checks: lint, production build, and whitespace validation pass.
- Browser-rendered verification remains blocked because no in-app browser surface is connected.

## Hero widget surface update

- Source reference: `.context/attachments/DAN1NH/image.png`.
- The decorative radial and linear card gradients were removed from `.home-signal-card`.
- Widget surfaces now use a flat `#0c1112` background, a restrained teal border, and a lighter shadow.
- Functional gradients remain on charts and progress indicators.
- Automated checks: lint, production build, and whitespace validation pass.
- Browser-rendered verification remains blocked because no in-app browser surface is connected.

## Dashboard docking and autoplay update

- Source references: `.context/attachments/oxkP2o/image.png` at 2314 x 1076 and `.context/attachments/KEPocB/image.png` at 2484 x 1558.
- The dashboard docking targets are now measured in their final, untranslated frame position; this removes the 38 px vertical error that placed the source widgets over the activity heading.
- The activity panel retains an 18 px separation from the source-widget row so the docked cards and panel heading remain visually distinct.
- The first deliberate page scroll now starts one 8.2-second timeline for signals, ingestion, convergence, and dashboard reveal. The existing Argus cursor and analysis sequence then continues automatically.
- Resize measurement preserves the current story and Argus progress instead of resetting the animation.
- Automated checks: lint, production build, whitespace validation, local HTTP 200, and rebuilt-bundle marker checks pass.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

## Argus message typing and capability navigation update

- Source references: `.context/attachments/fdjAwQ/image.png` at 2054 x 993 and `.context/attachments/b8jEyj/image.png` at 2762 x 1582.
- The final Argus sequence now types the insight, follow-up question, and recommended action in order; suggestion actions appear only after the written response completes.
- Completed messages retain accessible full-text labels while their visible text is progressively written.
- The duplicate capability sidebar was removed from the dark workspace. The outer capability index is now the sole navigation control, and the selected capability uses the full workspace width.
- Automated checks: lint, production build, and whitespace validation pass.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

## Argus action interaction update

- Source reference: `.context/attachments/hgkcYp/image.png` at 1646 x 314.
- The full recommended-action card is now a keyboard-accessible button with hover and focus feedback.
- Selecting either the card or the `Create monitoring task` suggestion confirms the task, fills the checkbox, updates the response copy, and disables the duplicate suggestion action.
- Automated checks: lint, production build, and whitespace validation pass.
- Browser-rendered interaction verification remains blocked because no approved browser surface is connected.

## Simplified capability visualizations

- Source references: `.context/attachments/M5mWZw/image.png` at 2971 x 1763, `.context/attachments/TqtBqR/image.png` at 1282 x 1015, and `.context/attachments/fJLR6t/image.png` at 1121 x 1099.
- Dense source grids, KPI tables, network rows, benchmark progress tables, and Managed Desk task lists were replaced with two compact metric cards per capability.
- Each card now communicates one outcome through a single icon, short label, large value, and one comparison or status line; decorative chart complexity was intentionally omitted.
- Argus retains its conversation treatment because the interaction itself is the capability being demonstrated.
- Capability selection now jumps directly to the selected panel, preventing the menu label and visible content from disagreeing or showing a dim inactive panel during a smooth transition.
- Automated checks: lint, production build, and whitespace validation pass.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Argus short-viewport sequence visibility — 2026-08-29

- Review finding: the recommendation could animate below the visible chat area on short desktop viewports.
- Fix: the Argus sequence now scrolls the chat progressively as the follow-up and recommendation appear, ending with the primary action in view.
- Reduced-motion and mobile layouts retain their existing static presentation.
- Blocker: matching-state capture and direct short-viewport comparison require an available browser surface.

final result: blocked

## Argus navigation and insight actions — 2026-08-29

- Source visual truth: `.context/attachments/ceueBR/image.png` at 357 x 181 px and `.context/attachments/02iCJn/image.png` at 758 x 429 px.
- Implementation target: `http://localhost:55000/`; implementation screenshot unavailable because no browser surface is connected.
- State: the inactive Dashboard item now uses the same neutral navigation foreground as Data sources and Targets.
- State: Review Anomaly and Affected Segment are grouped at the bottom of the Key insight card; Create Task remains with the recommendation it executes.
- Typography, card dimensions, semantic colors, and the existing Argus sequence are preserved.
- Blocker: matching-state capture and direct source-versus-build comparison require an available browser surface.

final result: blocked

## Argus header simplification — 2026-08-29

- Source visual truth: `.context/attachments/vDw9HD/image.png` at 1836 x 1183 px and `.context/attachments/21hgP8/image.png` at 165 x 97 px.
- Implementation target: `http://localhost:55000/`; implementation screenshot unavailable because no browser surface is connected.
- State: the `Verified across 6 sources` and `Actions require approval` header metadata is removed. The Chat and Voice selector remains right aligned.
- Typography: the main `Argus AI` header label decreases from weight 600 to 500; its size and status label are unchanged.
- Spacing, panel surfaces, chat content, and interactions are unchanged.
- Blocker: matching-state capture and direct source-versus-build comparison require an available browser surface.

final result: blocked

## Argus analysis surface neutralization — 2026-08-29

- Source visual truth: `.context/attachments/ud30tB/image.png` at 1678 x 999 px.
- Implementation target: `http://localhost:55000/`; implementation screenshot unavailable because no browser surface is connected.
- State: the green-tinted analysis, insight, and recommendation surface is replaced by the shared neutral near-black panel color `#0b0d0e`; user bubbles use the adjacent neutral `#101214`.
- Typography, spacing, borders, interaction behavior, and semantic red/teal states are unchanged.
- Automated checks: whitespace validation, ESLint, TypeScript, and local HTTP 200 pass.
- Blocker: matching-state capture and direct source-versus-build comparison require an available browser surface.

final result: blocked

## Argus chronological chat thread — 2026-08-29

- Source visual truth: `.context/attachments/KZQQlT/image.png` at 2372 x 1376 px.
- Implementation target: `http://localhost:55000/` in the final Argus dashboard state.
- Implementation screenshot: unavailable because the in-app browser reports `Browser is not available: iab`.
- Intended viewport and density: desktop dashboard state at device scale factor 1; matching-state normalization is blocked without a browser capture.
- State: Chat mode, first user question, Argus analysis with performance table and key insight, second user question, and Argus recommended action with suggestion buttons.
- Primary interactions: Chat/Voice mode switching and task creation remain wired; browser interaction verification is blocked.
- Console inspection: blocked without a browser surface.

### Full-view and focused comparison evidence

The 2372 x 1376 source was opened at original resolution. It showed that the two-column workspace visually separated the user questions from their answers, weakening the AI conversation model. The implementation now uses one chronological thread while retaining the compact table and insight grid inside the first Argus reply. A matching implementation capture and focused comparison could not be produced without a connected browser.

### Findings

- [P1] The revised chronological thread is not visually verified.
  - Location: homepage Argus dashboard panel.
  - Evidence: the source screenshot is available, but no browser-rendered implementation screenshot can be captured.
  - Impact: final response density, bubble alignment, and the desktop-to-mobile collapse cannot be certified visually.
  - Fix: capture the final Chat state at the supplied viewport and compare the complete panel plus the response-author and bubble-tail details.

### Required fidelity surfaces

- Fonts and typography: existing dashboard type tokens and weights are unchanged; the new Argus author labels use the existing UI font at 10.5 px and weight 600.
- Spacing and layout rhythm: the thread is constrained to 980 px, questions remain right-aligned, first-response content uses a compact 1.55-to-.75 grid, and the grid collapses to one column below 900 px.
- Colors and visual tokens: existing dark surfaces, teal accents, negative-value pills, borders, and shadows are retained.
- Image quality and asset fidelity: response authors reuse the production QuantSentry `Logo` component; no replacement asset or placeholder was introduced.
- Copy and content: all existing questions, table values, insight copy, recommendation copy, action labels, accessible labels, and typing refs are preserved.

### Comparison history

- The earlier implementation split the analysis and recommendation across independent workspace columns.
- The revised implementation restores the sequence: user question, Argus analysis, user follow-up, Argus recommendation.
- Argus author labels and restrained message tails clarify speaker ownership without widening the cards.
- Post-fix visual evidence remains blocked because no browser surface is connected.

final result: blocked

## Integrations category directory — 2026-08-28

- Source visual truth: `.context/attachments/LFXagU/image.png` at 2782 x 1542 px, `.context/attachments/VXkpvQ/image.png` at 879 x 505 px, `.context/attachments/ZTDf9a/image.png` at 745 x 892 px, `.context/attachments/jhQcxb/image.png` at 1478 x 131 px, `.context/attachments/r7IQkv/image.png` at 1796 x 441 px, `.context/attachments/MwLuRt/image.png` at 1125 x 461 px, `.context/attachments/skRFDn/image.png` at 1796 x 461 px, `.context/attachments/aPfGao/image.png` at 2067 x 902 px, `.context/attachments/DKRTVj/image.png` at 1269 x 207 px, `.context/attachments/mauNIC/image.png` at 170 x 477 px, `.context/attachments/71vVS2/image.png` at 284 x 97 px, `.context/attachments/AgRqAt/image.png` at 1766 x 563 px, `.context/attachments/chBC2Y/image.png` at 573 x 379 px, `.context/attachments/PvNxsf/image.png` at 512 x 512 px, `.context/attachments/CTLWzC/image.png` at 689 x 183 px, `.context/attachments/5Ngcgr/image.png` at 2184 x 623 px, `.context/attachments/2803YQ/image.png` at 200 x 200 px, `.context/attachments/kNlW3k/image.png` at 164 x 920 px, `.context/attachments/C8Au9U/image.png` at 166 x 107 px, `.context/attachments/okSemD/image.png` at 1400 x 240 px, `.context/attachments/MNdbVQ/image.png` at 175 x 127 px, and `.context/attachments/l7sf9B/image.png` at 140 x 129 px.
- Additional focused references: `.context/attachments/ofzmUJ/image.png` at 177 x 128 px, `.context/attachments/BHj9Pz/image.png` at 187 x 157 px, `.context/attachments/UMdHOO/image.png` at 200 x 161 px, `.context/attachments/PBUR16/image.png` at 1898 x 935 px, `.context/attachments/sSQR2o/image.png` at 1672 x 103 px, `.context/attachments/A5zbtE/image.png` at 1875 x 329 px, `.context/attachments/EVOu1O/image.png` at 1876 x 332 px, `.context/attachments/dkm2bq/image.png` at 2109 x 623 px, `.context/attachments/pjtDnI/image.png` at 1938 x 391 px, `.context/attachments/jScZTo/image.png` at 590 x 122 px, `.context/attachments/eQo7UO/image.png` at 2023 x 302 px, `.context/attachments/q2HuEh/image.png` at 1892 x 869 px, `.context/attachments/6LZ8JD/image.png` at 490 x 97 px, `.context/attachments/EOPFiB/image.png` at 1694 x 91 px, and `.context/attachments/Z017kr/image.png` at 153 x 112 px.
- Implementation target: `http://localhost:55000/integrations`.
- Intended comparison viewport: 1440 x 900 CSS px at device scale factor 1.
- Implementation screenshot: unavailable because the in-app browser reports no available browser surfaces.
- State: `All` selected, with Trading Platforms, Payments & Commerce, Customer & Identity, Acquisition, and Delivery filter states available.
- Primary interaction: each category button updates the visible integration cards and its selected state; search filters names, descriptions, and categories within the selected category. Browser interaction verification is blocked.
- Console inspection: blocked without a browser surface.

### Full-view and focused comparison evidence

The reference was inspected at original resolution. Its information architecture is reproduced as a narrow category index beside a three-column integration directory. QuantSentry typography, colors, logo assets, and existing page framing are intentionally retained. A matching implementation capture and focused card comparison could not be produced without a connected browser.

### Findings

- [P1] Rendered directory and filter states are not visually verified.
  - Location: integrations directory and responsive category controls.
  - Evidence: the source screenshot is available, but the browser runtime returns an empty browser list.
  - Impact: final spacing, sticky-filter behavior, logo crop quality, and category transitions cannot be certified against the reference.
  - Fix: capture the `All`, filtered desktop, and narrow mobile states when the in-app browser is available.

### Required fidelity surfaces

- Fonts and typography: existing QuantSentry font tokens and 500-weight card titles are retained. The directory title is reduced by 10%, integration names are increased from 17 px to 19 px, category labels are 11 px, and the compact data labels are 10 px on one line; visual comparison is blocked.
- Spacing and layout rhythm: the reference's sidebar structure is retained beside a three-column desktop card grid, collapsing to two columns below 1200 px and one column on mobile. The title/category block is vertically centered against the smaller left logo, the icon-only website control is fixed to the card's top-right, and the description spans the full card width beneath the header row.
- Colors and visual tokens: the existing light QuantSentry surface, teal selected state, restrained shadows, and subtle dark-grey card-logo borders are retained.
- Image quality and asset fidelity: every card uses an original local integration logo; no placeholder or recreated logo is used. All logo shells and artwork are approximately 10% smaller; MetaTrader 4, MetaTrader 5, DXtrade, Slack, Klaviyo, Brevo, and ActiveCampaign use the scoped fill treatment; Intercom uses a slightly reduced fill treatment; ThinkTrader uses the supplied square icon; and Sirix uses the supplied official wordmark with excess transparent canvas trimmed.
- Copy and content: 20 active integrations are retained without repeated category or active-status badges on each card. Klaviyo, Brevo, and ActiveCampaign are included under Acquisition, and MetaTrader uses the same `Trades · Positions · Account Data` label as the other trading platforms. Each card includes a compact external link to the integration provider's website.

### Comparison history

- Initial implementation replaced three static category sections with one working directory and category controls.
- The repeated `Active` badge was removed; every card now carries only its integration category.
- Category badges moved to the top-right of every card, all category controls gained a consistent pill treatment, and a functional search field was added above the results.
- The directory title, one-line desktop description, platform-name alignment, and 12% platform-name size increase follow the supplied focused crops.
- Integration-card minimum height was reduced from 178 px to 148 px on desktop and from 164 px to 144 px on mobile to remove the marked empty lower area.
- The visibly rendered search accessibility label was removed; the input now exposes `Search integrations` through `aria-label` and displays a single placeholder beside the search icon.
- MetaTrader 4 and DXtrade use a scoped 1.08 artwork scale inside their existing shells, and the category pills were removed from all integration cards.
- The directory now displays three cards per row on desktop, with responsive two- and one-column fallbacks; every card includes an accessible icon-only external website link.
- Card categories now appear as plain metadata directly below each platform title. Platform logos remain left-aligned at a 10% smaller size, while the website icon sits in the top-right.
- ThinkTrader now uses the supplied 512 px square icon with the standard logo-shell treatment instead of the previous wide wordmark.
- The title/category gap and line height are tightened so that the metadata block aligns vertically with the logo. Descriptions now span both card columns instead of inheriting the narrower title-column width.
- Sirix now uses the supplied official wordmark, center-cropped from its 200 px square canvas to a transparent 180 x 80 px production asset so it fills the existing wide-logo shell cleanly.
- Every title/category block now uses the same 43 px alignment frame as its logo, removing per-name vertical drift. Logo-shell borders use neutral dark grey instead of teal, and MetaTrader 5, Slack, and Intercom are zoomed to eliminate inner gaps.
- Integration descriptions are concise dot-separated data labels, limited to two lines and placed in a thin neutral-grey pill. WooCommerce is enlarged by 3%, Intercom uses a softer fill scale, and Sirix uses the standard square shell.
- Card padding is reduced from 24 px to 20 px, the row gap from 12 px to 10 px, and the desktop minimum height from 148 px to 140 px to trim excess space while preserving the three-column rhythm.
- The remaining trailing card space is removed by reducing the desktop minimum height to 128 px and the mobile minimum height to 124 px; header and pill spacing remain unchanged.
- Data pills use a flex alignment shell with a separately clamped text span, keeping one- and two-line labels vertically centered without losing the two-line maximum.
- Post-fix visual evidence remains blocked because no browser surface is connected.

final result: blocked

## WooCommerce and four-mission refinement — 2026-08-28

- Source visual truth: `.context/attachments/CfvHze/image.png` at 256 x 256 px, `.context/attachments/Ez1ZPw/image.png` at 1517 x 982 px, and `.context/attachments/B8Q5w4/image.png` at 202 x 87 px.
- Implementation target: `http://localhost:55000/`; implementation screenshot unavailable because no browser surface is connected.
- Intended viewport and density: desktop at device scale factor 1; matching-viewport normalization is blocked without a browser capture.
- State: WooCommerce replaces Notion in the integration rail, using the existing 128 px brand asset. Every integration shell has a more visible circular border, and all logo artwork—including Slack and WooCommerce—uses a consistent 12 px corner radius.
- State: the mission grid now contains Revenue Growth, Payout Fraud Detection, Acquisition Cost Reduction, and KYC SLA in a balanced 2 x 2 layout. Coordinated Abuse Reduction is removed.
- Fonts and typography: the `CONNECTING…` label now uses the site's inherited font at weight 500 rather than a monospace face.
- Spacing and layout rhythm: mission period badges and icon wrappers use separate selectors, preventing badge padding from distorting the icons. The two mission columns retain a restrained 36 px stagger.
- Colors and visual tokens: the existing muted integration state and active brand-color transition are preserved.
- Image quality and asset fidelity: WooCommerce uses the existing product-brand WebP asset; Slack retains the supplied 512 px source asset.
- Copy and content: no mission copy changes beyond reducing the set to four.
- Full-view and focused comparison evidence: blocked because no browser-rendered implementation capture is available.
- Automated checks: whitespace validation, ESLint, TypeScript, and production build pass.
- Blocker: matching-state capture, responsive layout review, animation review, and console inspection require an available browser surface.

final result: blocked

## Additional integration logo — 2026-08-28

- Source visual truth: `.context/attachments/BAmQvC/image.png` at 512 x 512 px.
- Implementation target: `http://localhost:55000/#how-it-works`; implementation screenshot unavailable because no browser surface is connected.
- Intended viewport and density: desktop at device scale factor 1; matching-viewport normalization is blocked without a browser capture.
- State: the supplied logo is added as an eighth integration item beside the existing trading-platform assets. No existing logo is replaced.
- Fonts and typography: unchanged.
- Spacing and layout rhythm: the existing rail sizing, gap, orbit geometry, and responsive behavior are unchanged.
- Colors and visual tokens: the new asset inherits the same grayscale inactive treatment and rounded integration shell.
- Image quality and asset fidelity: `public/images/how-it-works/tools/tool-08.png` exactly matches the supplied 512 px source asset.
- Copy and content: unchanged.
- Full-view and focused comparison evidence: blocked because no browser-rendered implementation capture is available.
- Automated checks: whitespace validation, ESLint, TypeScript, and production build pass.
- Blocker: matching-state capture, animation review, and console inspection require an available browser surface.

final result: blocked

## Active integration logo color — 2026-08-28

- Source visual truth: `.context/attachments/x5XtWk/image.png` at 245 x 188 px.
- Implementation target: `http://localhost:55000/#how-it-works`; implementation screenshot unavailable because the connected-browser list is empty.
- Intended viewport and density: desktop at device scale factor 1; matching-viewport normalization is blocked without a browser capture.
- State: the enlarged active integration logo displays its original brand colors while every inactive logo remains muted and grayscale. Color transfers to the next logo on the existing 5.2-second focus cycle.
- Full-view comparison evidence: blocked because no browser-rendered implementation capture is available.
- Focused region comparison evidence: the supplied crop was inspected at original resolution; source review confirms the desired single colored-logo focus state.
- Fonts and typography: unchanged.
- Spacing and layout rhythm: unchanged; the existing logo sizes, rail movement, borders, and orbit geometry are preserved.
- Colors and visual tokens: inactive logos retain the existing grayscale treatment; only the active asset returns to its source brand colors at full opacity.
- Image quality and asset fidelity: existing original logo files remain unchanged and are revealed through the animated image filter.
- Copy and content: unchanged.
- Automated checks: whitespace validation, ESLint, TypeScript, and production build pass.
- Blocker: no in-app or connected browser is available for matching-state capture, animation timing review, or console inspection.

final result: blocked

## Homepage Aurora lower-edge fill — 2026-08-27

- Source visual truth: `.context/attachments/3VjnNN/image.png` at 2048 x 591.
- The black strip was the extended hero area below the dashboard outgrowing the Aurora canvas.
- The Aurora canvas now fills the complete hero height while retaining its 130vh/980px minimum, so its field continues beneath the dashboard to the following light section.
- Automated checks: whitespace validation, lint, and production build pass.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Homepage capability directory rebuild — 2026-08-27

- Source visual truth: `.context/attachments/Jok9qH/image.png` (2501 x 1747), `.context/attachments/xMAwQP/image.png` (1850 x 653), `.context/attachments/XXKwvw/image.png` (2706 x 806), `.context/attachments/1yafEP/image.png` (745 x 442), `.context/attachments/25K4g9/image.png` (2398 x 1243), and `.context/attachments/qybtRs/image.png` (2366 x 175).
- Implementation target: `http://localhost:3001/#capabilities` at the supplied desktop state. A browser-rendered implementation screenshot is unavailable because the connected-browser list is empty.
- Viewport and density normalization: blocked; no controllable browser was available to capture the implementation at a matching CSS viewport or device scale factor.
- Full-view comparison evidence: the supplied implementation capture confirms a full-width two-column directory with all capability cards visible together; the redundant browse column and capability numbering were subsequently removed.
- Focused region evidence: the supplied header crop identifies the removable `Connected Capabilities` label; it is removed and `Platform Overview` is now rendered as the section's primary button.
- Fonts and typography: existing General Sans and IBM Plex Mono tokens are retained; capability names remain the primary card hierarchy and descriptive copy is limited to compact blocks.
- Spacing and layout rhythm: the directory now uses the full content width; six cards render as three balanced paired rows without the former side-navigation gap.
- Colors and visual tokens: existing light QuantSentry surface, teal actions, subtle borders, radii, and shadows are retained.
- Image quality and asset fidelity: no raster assets are introduced; capability icons use the project's existing Phosphor icon library.
- Copy and content: the final six capabilities are Data Connectivity, Argus AI, Business Intelligence, Industry Intelligence, Trading Abuse Detection, and Sentry Risk Network, each with a direct destination link.
- Automated checks: whitespace validation, lint, TypeScript, and the production build pass.
- Blocker: a browser-rendered capture is still required for final visual comparison and responsive verification.

final result: blocked

## Shared team intelligence section — 2026-08-27

- Source visual truth: `.context/attachments/vRRdy4/image.png`, `.context/attachments/o8P4Ui/image.png`, `.context/attachments/LJ5Cqx/image.png`, `.context/attachments/oPMnwX/image.png`, `.context/attachments/Ogwuua/image.png`, `.context/attachments/GpFmFi/image.png`, `.context/attachments/UlABKY/image.png`, `.context/attachments/8gxAcJ/image.png`, `.context/attachments/CVVJLe/image.png`, `.context/attachments/aRA3TB/image.png`, `.context/attachments/5dpLsT/image.png`, and `.context/attachments/9i8dMz/image.png`.
- Implementation routes: homepage `/` and Platform Overview `/platform`.
- The shared `TeamInsightsSection` recreates the reference hierarchy in QuantSentry styling: feature copy above a central Argus workspace, with team questions distributed around the main insight surface.
- The two adjacent Argus sections now have distinct jobs: the light section explains how people work with Argus, while the dark Missions section shows the business outcomes a configured Mission owns.
- Mission cards lead with the outcome name, place the numeric target in a compact button-shaped badge below the icon, and show the current value against a compact progress indicator instead of a generic runtime status.
- Target and current values use two adjacent compact pills in the content column. A circular percentage gauge below each mission icon replaces the horizontal progress bar.
- Mission descriptions now state the matching outcome directly and are capped at two lines; `Payout Loss Reduction` is renamed `Payout Fraud Detection`.
- The Missions section has 32px more desktop space and 20px more mobile space below the final card row.
- Finance, Growth, Marketing, and Risk prompts use the supplied client portraits with their matching Phosphor role icons and no personal names.
- The shared team-intelligence title is capped at 54px on desktop.
- The closed-state Argus prompt in the homepage hero is moved upward by reducing only its desktop top margin, while closed-state bottom padding preserves a clear gap below the input without changing the mobile override.
- Finance, Growth, Marketing, and Risk cards are functional tabs. Each selection updates the question, finding, three metrics, evidence basis, and recommended action.
- Homepage and Industries card titles use natural title case for `Funds and Asset Managers` and `Payments and Fintech`.
- The previous Platform-only three-role block is replaced by the shared section, preventing duplicate team messaging while preserving the preceding trade-comparison section.
- Desktop retains the floating prompt-card composition. Below 1050 px the prompts become a two-column grid, and below 680 px the entire section becomes a one-column layout without fixed widths or horizontal overflow.
- Floating team cards use a 98% opaque white surface for clearer separation from the workspace beneath them.
- Existing General Sans, IBM Plex Mono, Phosphor icons, QuantSentry logo, color tokens, light data pattern, and dark product surfaces are reused; no placeholder imagery or new dependency was introduced.
- Automated verification: `git diff --check`, lint, production build, and HTTP 200 checks for both routes pass.
- Blocker: the in-app browser is unavailable, so matching-viewport implementation screenshots, tab-click visual checks, console inspection, and source-versus-build comparison cannot be completed.

final result: blocked

## Intelligence gap and Argus everywhere sections — 2026-08-27

- Source visual truth: `.context/attachments/dDaiym/image.png`, `.context/attachments/CRLPUT/image.png`, and `.context/attachments/9EQZjb/image.png`.
- Implementation route: homepage `/`.
- The team-intelligence heading is centered as one composition while its interactive team cards and Argus workspace remain unchanged.
- The heading is shortened to `One Data Layer. Answers for Every Team.`, and the gap before the workspace is reduced by 12px.
- The redundant `Explore Argus AI` button is removed and the space before the interactive cards is reduced.
- A new problem-framing section explains the three specific breaks caused by fragmented data and business context, using the existing light data pattern and Sentry card system.
- Its heading is shortened to `Fragmented Data Limits Intelligence.`, and the supporting sentence stays on one line at desktop widths.
- The gap between the problem statement and its three cards is reduced by 16px.
- A new Argus Everywhere section shows four concrete delivery surfaces: Slack, email, the browser, and embedded tools. Slack and Gmail use the bundled real brand assets; browser and embedded states use the existing Phosphor icon system.
- The gap between the Argus Everywhere lede and its delivery surfaces is reduced by 16px.
- Desktop uses the reference four-column surface layout and three-column gap-card layout. Both collapse to two columns and then one column without fixed viewport widths.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Homepage customer case study framing — 2026-08-27

- Source visual truth: `.context/attachments/E2mReW/image.png` and `.context/attachments/242bZf/image.png`.
- The homepage proof block is explicitly labelled `Customer Case Study` and leads with the verified outcome: `100 Confirmed Abusers. $3.4M in Funded Capital Halted.`
- The supporting copy identifies the anonymised customer and four-month case-study period, while the CTA now reads `Read the Case Study` and retains the existing `/proof` destination.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Platform logos and Argus task rows — 2026-08-27

- Source visual truth: `.context/attachments/X1PjqY/image.png`, `.context/attachments/I2unhR/image.png`, `.context/attachments/RxJ2LG/image.png`, `.context/attachments/Fe08s9/image.png`, `.context/attachments/MR9858/image.png`, `.context/attachments/iT2436/image.png`, `.context/attachments/Xpy4Rt/image.png`, `.context/attachments/HMoKgj/image.png`, `.context/attachments/qm1ByX/image.png`, `.context/attachments/1R7wUv/image.png`, `.context/attachments/zoJpxs/image.png`, `.context/attachments/aEZcJe/image.png`, `.context/attachments/VNEeny/image.png`, `.context/attachments/9Brkjx/image.png`, `.context/attachments/4zTJ2J/image.png`, `.context/attachments/k6AJi7/image.png`, `.context/attachments/NvnhwM/image.png`, `.context/attachments/ppFTQK/image.png`, `.context/attachments/cWR6kr/image.png`, `.context/attachments/mVUgpD/image.png`, `.context/attachments/pQj7Ai/image.png`, `.context/attachments/FGhiHG/image.png`, and `.context/attachments/h6zNn6/image.png`.
- The Platform connector grid uses real bundled platform assets for all eight brands plus the official cTrader icon, replacing the repeated terminal placeholder.
- The QuantSentry wordmark weights increase by exactly 50, from 400/500 to 450/550.
- KYC Compliance starts directly after its two-logo stack instead of reserving room for a third logo.
- Argus now shows four consistently styled task rows with matching feature icons, recurring schedules, delivery channels, and no redundant right-side run-status column. The fourth task is named `Competitor Intelligence Report`.
- The second recurring task is named `Risk Abuse Report`, and the exploration question is mixed 15% toward white for better contrast.
- The proactive capability label is `Risk Abuse Detection` instead of `Automatic Anomaly Detection`.
- The homepage platform stack uses three distinct assets on matching dark tiles: MetaTrader 5, cTrader, and TradeLocker. The Platform connector grid uses the same TradeLocker asset instead of duplicating cTrader.
- The task-panel header gap is reduced, the panel surface is darker, and the task cards use neutral dark surfaces with subtle inset highlights and depth shadows.
- The exploration heading, desktop action row, and feature labels remain on one line, with narrow-mobile wrapping retained to prevent overflow.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Company ownership and card refinements — 2026-08-27

- Source visual truth: `.context/attachments/BESQuD/image.png`, `.context/attachments/7Ftqs5/image.png`, `.context/attachments/nHw6nj/image.png`, `.context/attachments/Q4G1oZ/image.png`, `.context/attachments/iD5krr/image.png`, `.context/attachments/ziaSfd/image.png`, `.context/attachments/s9pyfn/image.png`, `.context/attachments/jErW8F/image.png`, and `.context/attachments/kG90Oa/image.png`.
- The Company page now has a dedicated light ownership section with the existing Sentry pixel pattern, real Quant Technology Group and QuantSentry assets, group rationale, and a responsive parent-to-product relationship card.
- Both Argus workflow states now sit inside one solid light container. The proactive preview has less top padding, and the exploration preview has less unused bottom space.
- Industry cards are restored to the existing opaque light panel system on both the homepage and Industries page.
- The two Pricing operation cards use opaque dark surfaces; the managed option uses the clearer Managed Risk Service wording and a proper `How the service works` button.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Navigation labels, platform capabilities, and diagnostic typography — 2026-08-27

- Source references: `.context/attachments/x2vZaX/image.png`, `.context/attachments/BSi7DF/image.png`, `.context/attachments/E5zhun/image.png`, `.context/attachments/4HnkAj/image.png`, `.context/attachments/CwBFSH/image.png`, `.context/attachments/VaO7pW/image.png`, `.context/attachments/o9lSXj/image.png`, `.context/attachments/7aBxxr/image.png`, `.context/attachments/w4r3uB/image.png`, `.context/attachments/V4ZCOd/image.png`, `.context/attachments/9YLZc1/image.png`, and `.context/attachments/AN2SJm/image.png`.
- Diagnostic result headings and the `What closes it.` lead are reduced from the browser-default 700 weight to 600.
- Dropdown section titles are increased by 5%, from 12px to 12.6px.
- Dropdown footer links use a fixed-height flex row so their text and arrow remain vertically centered.
- Upcoming industry statuses now read `Soon` in light grey rather than `Early Access` in yellow.
- The homepage and Industries overview cards both use `Soon`, with green status text, borders, and top accents instead of amber styling.
- The `/proof` navigation label is now `Success Stories` in the header and footer while preserving the route.
- Success Stories uses a distinct trophy icon rather than reusing the Managed Risk Service check icon.
- Industry Intelligence now appears under Solutions rather than Resources in both navigation surfaces.
- The main Platform menu item is labelled `Platform Overview`, matching the footer.
- Sentry Risk Network now has its own Solutions item in both navigation surfaces and a single name pill on its page.
- The Platform capability is labelled `Industry Intelligence`, and its matching menu item uses the globe icon.
- `Seven detection engines` is renamed `Trading Abuse Detection` so the capability is clear without exposing its implementation count.
- The Trading Abuse Detection name is applied across Platform, Pricing, Prop Trading, and diagnostic copy.
- The hero aurora lens scale increases from 12 to 15, zooming the field out by another 25%.
- `Managed Desk` is labelled `Managed Risk Service` in navigation to make the service model explicit.
- The QuantSentry Futures capability card is removed from the Platform capabilities grid.
- Network signal event titles are reduced from 600 to 500 weight.
- Standard Insight card titles are reduced by 10% while the featured-card hierarchy remains unchanged.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Trading risk comparison navigation and table — 2026-08-27

- Source visual truth: `.context/attachments/jDAmQy/image.png`.
- `Trading Risk Comparison` now links to `/compare` from desktop Resources, mobile Resources, and the footer.
- The comparison matrix uses wider vendor columns, 14px body copy, stronger contrast, generous cell padding, column dividers, a sticky header, and a sticky capability column.
- Narrow screens retain horizontal scrolling instead of compressing the five columns into unreadable text.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Homepage platform, Aurora, Argus task, and navigation refinements — 2026-08-27

- Source references: `.context/attachments/OhXB83/image.png`, `.context/attachments/K6ev5C/image.png`, `.context/attachments/FqpHkw/image.png`, `.context/attachments/VkQODf/image.png`, `.context/attachments/ikFnvB/image.png`, `.context/attachments/8MGyMH/image.png`, `.context/attachments/KntZi7/image.png`, `.context/attachments/63Ozwn/image.png`, `.context/attachments/9WvbB3/image.png`, `.context/attachments/k0mo0A/image.png`, `.context/attachments/s0z6Od/image.png`, `.context/attachments/kt6h7L/image.png`, and `.context/attachments/RLiIOE/image.png`.
- The Platforms source card now uses official MetaTrader 5, cTrader, and TradeLocker icon assets, while the homepage marquee replaces the remaining text stand-ins with image assets.
- The opening Aurora now continues through the entire interactive story while its WebGL canvas remains viewport-sized and sticky, preserving the established visual scale instead of stretching the shader.
- The Aurora lens scale increases from 10 to 12, revealing a finer, more granular band field without changing its footprint or intensity.
- Argus question bubbles use tighter vertical padding, proactive feature labels use natural title case, and the proactive Argus orb uses the calmer breathing animation instead of orbiting work particles.
- Argus task rows and the latest-delivery panel now expose Slack and Gmail delivery channels with their original brand assets in restrained rectangular badges; run statuses use natural title case.
- Header dropdown icons no longer translate upward on hover, and icons and two-line menu copy are vertically centered within each row.
- Connected-data logo artwork now has a subtle three-pixel rounded outline inside its existing platform chip.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Pre-docking signal contrast and typography refinements — 2026-08-27

- Source visual truth: `.context/attachments/WCF44h/image.png` at 2747 x 1443, plus focused typography references `.context/attachments/zIWM2x/image.png`, `.context/attachments/amcCDe/image.png`, `.context/attachments/x3Lz8r/image.png`, `.context/attachments/UICRc8/image.png`, `.context/attachments/TooTYy/image.png`, `.context/attachments/pKhG1J/image.png`, and `.context/attachments/IW7s7X/image.png`.
- Implementation: `http://localhost:55000/` at the desktop homepage story, header dropdowns, and `/custom-bi` route.
- Implementation screenshot: unavailable because neither the in-app Browser nor an attached external browser is connected.
- Intended state: the scattered source and metric cards use a high-contrast off-white surface with dark typography; after docking completes, they transition back to the existing dark dashboard treatment. The central Argus ingestion panel remains dark throughout.
- Focused typography changes: the Argus console title uses weight 600; active app-navigation labels and custom-BI row labels use weight 500; Argus action chips use natural title case; both header-dropdown footer CTAs are 15% larger; the custom-BI hero reads “Your Data, Your Dashboard.”
- Fonts and typography: existing General Sans and IBM Plex Mono families are preserved; only the explicitly requested weights, size, and casing changed.
- Spacing and layout rhythm: card dimensions, transforms, docking geometry, CTA padding, and menu layout are unchanged.
- Colors and visual tokens: the light floating state uses the existing QuantSentry teal with off-white surfaces and dark foreground tokens; the docked state retains the dashboard palette.
- Image quality and asset fidelity: all existing source-system logos and Phosphor icons are preserved with no generated or placeholder assets.
- Copy and content: only the supplied title-case and CTA-label refinements changed.
- Comparison history: the source screenshot showed dark floating cards blending into the dashboard. The implementation now scopes the light palette to `data-story-stage="signals"` and transitions back after the stage changes to `dashboard`; browser-rendered post-fix evidence is still required.
- Automated checks: whitespace validation, lint, and production build pass.
- Blocker: a connected browser surface is required to capture the same animation states and complete the combined visual comparison.

final result: blocked

## Screenshot punch-list completion — 2026-08-27

- Source visual truth: `.context/attachments/lzZJNL/image.png`, `.context/attachments/InM6Wa/image.png`, `.context/attachments/XVhs0l/image.png`, `.context/attachments/Bzc84J/image.png`, `.context/attachments/uKh96i/image.png`, `.context/attachments/p9sYLW/image.png`, `.context/attachments/d9f89W/image.png`, `.context/attachments/Oxc8gA/image.png`, `.context/attachments/Q5vVQQ/image.png`, `.context/attachments/oEXaL6/image.png`, `.context/attachments/3ad3v4/image.png`, `.context/attachments/D5180z/image.png`, `.context/attachments/JpBwKp/image.png`, and `.context/attachments/iFOREU/image.png`.
- Implementation: `http://localhost:55000/` and `http://localhost:55000/industries`.
- Implementation screenshot: unavailable because the browser runtime reports no connected browser surfaces.
- Intended viewports: supplied desktop screenshots plus narrow mobile at 320 x 800 CSS px, device scale factor 1.
- State: resting homepage, two-second Argus prompt, confirmed ingestion sequence, dashboard-first reveal, final Argus dashboard, light industry section with light cards, and footer.

### Full-view and focused comparison evidence

- The supplied references were opened at original resolution and mapped to the existing homepage, dashboard, cards, navigation, and footer components.
- A browser-rendered full-view comparison and focused implementation crops could not be captured, so density normalization, rendered typography, spacing, final aurora intensity, console inspection, and visual overflow checks remain unavailable.
- Code and rendered-HTML checks confirm the requested interaction timing, sequence ordering, hidden standalone Argus prompt, fixed dashboard bounds, shared 40 px CTA height, restored light industry cards, reduced footer groups, 20% footer-logo increase, and Privacy/Terms footer links.

### Findings

- [P1] Final screenshot fidelity is not visually verified.
  - Location: homepage hero and Argus sequence, industries cards, footer.
  - Evidence: all source screenshots are available, but no approved browser surface is connected for implementation capture.
  - Impact: the rendered aurora strength, vertical rhythm, and responsive layout cannot be certified against the references.
  - Fix: capture the same routes and states when a browser surface is connected, combine each capture with its source reference, and compare at matching viewport and density.

### Required fidelity surfaces

- Fonts and typography: existing General Sans and IBM Plex Mono hierarchy is preserved; rendered weight and wrapping comparison is blocked.
- Spacing and layout rhythm: the standalone prompt is removed from layout after confirmation and the dashboard is viewport-constrained; rendered comparison is blocked.
- Colors and visual tokens: the live-site aurora mask and opacity are restored and industry cards use the light section palette; rendered comparison is blocked.
- Image quality and asset fidelity: existing QuantSentry and QTG assets are reused without generated or approximate replacements; rendered sharpness comparison is blocked.
- Copy and content: footer disclaimer is replaced by Privacy and Terms, both resolving to current QTG legal pages; footer groups match the cleaned information architecture.

### Verification

- `npm run lint`: passed.
- `npm run build`: passed, 35 static pages generated.
- `git diff --check`: passed.
- Local `/` and `/industries`: HTTP 200.
- QTG `/privacy` and `/terms`: HTTP 200.

final result: blocked

## Argus workflow animation and light Mission cards

- Source references: `.context/attachments/Ajm6Zp/image.png`, `.context/attachments/yDpeWj/image.png`, and `.context/attachments/M15hct/image.png`.
- The workflow title tile now reuses the live Argus orb and changes its activity state between Proactive Tasks and Exploration Mode.
- The tab hover and selected treatments use a quieter teal range instead of the previous high-contrast fill.
- All six Mission cards now use off-white surfaces, dark typography, teal icon treatments, and light-theme status colours while preserving the surrounding dark section.
- Browser-rendered comparison remains blocked because no controllable in-app browser surface is available.

final result: blocked

## Dark Argus workflow surfaces

- Source reference: `.context/attachments/CY3SA9/image.png` at 2048 x 960.
- The mode switcher, four capability tiles, and full Argus workflow panel now use the established dark QuantSentry surfaces while the surrounding explanatory section remains light.
- Task rows, delivery state, Exploration Mode answers, and interactive actions inherit matching light typography and teal accents so both tab states remain readable.
- Browser-rendered comparison remains blocked because no controllable in-app browser surface is available.

final result: blocked

## Dashboard brand mark

- Source reference: `.context/attachments/CXrWbq/image.png` at 595 x 209.
- The retired Q symbol in the unified-dashboard sidebar is replaced with the selected QuantSentry Coil and matching Instrument Sans wordmark.
- The change is scoped to the dashboard brand row; Argus-specific icon treatments remain unchanged.
- Automated checks: lint, production build, and whitespace validation pass.
- Browser-rendered comparison remains blocked because no controllable in-app browser surface is available.

final result: blocked

## Subtle data pattern for light homepage sections

- Source visual truth: `.context/attachments/JBpF1y/image.png` at 2048 x 856, `.context/attachments/kNuYFA/image.png` at 1335 x 778, and `.context/attachments/HpCxGM/image.png` at 1552 x 768.
- Implementation screenshot: unavailable because no controllable browser surface is connected.
- Intended states: desktop “How Argus Works,” “Two Ways to Work” with the Proactive Tasks tab active, and the capability explorer.
- Viewport, CSS size, density normalization, full-view comparison, focused comparison, primary interaction checks, and console inspection remain unavailable without a browser-rendered capture.
- Implementation: one shared QuantSentry pixel field is reused across the three light sections with 3 px square pixels, moderate density, slow motion, and an opaque pale-teal color. Each pattern sits behind its section content and does not intercept input.
- The three “How Argus Works” step cards use opaque dark QuantSentry surfaces with teal borders and high-contrast copy, reducing the large white-card area while preserving the light section frame.
- The desktop gap between the explanatory copy and step cards is reduced from 54 px to 32 px; the stacked layout uses 30 px.
- The shared pattern also has an opaque dark-teal variant used behind Argus Missions and Always-On Intelligence; the animated hero remains unchanged.
- Mission cards and the adjacent secondary CTA use the same opaque green-black surface (`#0e1415`) as the Always-On output cards.
- Bare copy in the two dark patterned sections is protected by localized green-black radial backplates; cards and controls retain their existing opaque surfaces.
- Light patterned sections use matching soft-white localized backplates behind exposed headings, body copy, and capability navigation; interactive cards and tabs use opaque surfaces.
- Fonts, spacing, component structure, colors, image assets, and copy remain unchanged; no new dependency or generated asset was introduced.
- Automated checks: production build, whitespace validation, and local HTTP 200 pass.
- Blocker: browser-rendered evidence is required to verify that the final contrast remains appropriately subtle at the intended desktop viewport.

final result: blocked

## Argus working modes and specialized missions

- Source references: `.context/attachments/0IRZLQ/image.png` at 2927 x 1586, `.context/attachments/jENB4y/image.png` at 2983 x 1531, and `.context/attachments/QhpO8n/image.png` at 3666 x 1832.
- A new two-state section presents proactive Argus tasks and conversational exploration as functional tabs rather than static mockups.
- Proactive mode includes scheduled monitoring tasks and a completed delivery; exploration mode includes a natural-language question, a structured three-driver answer, and follow-up actions.
- A separate dark section translates the specialized-agent reference into QuantSentry-specific Argus missions for revenue, payouts, fraud networks, acquisition, compliance, and executive reporting.
- Widget surfaces remain flat, with restrained teal borders and no decorative card gradients; all icons come from the existing Phosphor library.
- Both sections collapse to a single-column layout on tablet and mobile, and the staggered mission grid is removed on narrow screens.
- Automated checks: lint, production build, whitespace validation, local HTTP 200, and rendered HTML marker checks pass.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Homepage how-it-works section

- Source reference: `.context/attachments/65psmV/image.png` at 2986 x 1131.
- A new three-step section now sits directly after the animated homepage hero and before the capability explorer.
- QuantSentry-specific copy explains how users ask across connected data, how Argus investigates verified sources, and how the platform returns actionable results.
- The section uses the existing light theme, General Sans typography, QuantSentry teal, Phosphor icons, equal-height cards, and restrained hover motion.
- The three-column desktop layout stacks into a single column on tablet and mobile, with left-aligned mobile copy.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Capability column height alignment

- Source reference: `.context/attachments/Eb9S0A/image.png` at 2880 x 1800.
- Desktop capability menu rows now distribute evenly across the full dashboard frame height, aligning the top and bottom edges of both columns.
- The horizontally scrolling mobile capability tabs retain their intrinsic width and height.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Light capability workspace

- Source reference: `.context/attachments/YzolUq/image.png` at 2880 x 1800.
- The capability workspace now uses a soft off-white shell, white metric cards, charcoal typography, subtle grey borders, and restrained QuantSentry-teal accents.
- The dark homepage hero and Argus experience remain unchanged, creating clearer visual rhythm between the animated opening and the explanatory capability section.
- Existing capability selection, internal scrolling, motion, and responsive behaviour are preserved.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Hidden dark-panel scrollbars

- Source reference: `.context/attachments/wXM0lQ/image.png` at 2777 x 1808.
- Visible scrollbar chrome is removed from the capability workspace and Argus conversation so it no longer competes with the interface.
- Wheel, trackpad, keyboard, and touch scrolling remain enabled.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Argus scrollbar treatment

- Source reference: `.context/attachments/CXXvJv/image.png` at 381 x 1283.
- The native light scrollbar is replaced with a narrow transparent track and a restrained QuantSentry-teal thumb with a clearer hover state.
- Scrolling behaviour and content sizing are unchanged.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Argus analysis density correction

- Source reference: `.context/attachments/jaqu5E/image.png` at 1577 x 588.
- The analysis card now uses a continuous left accent instead of a segmented inset shadow.
- Header, table-row, and insight padding are reduced so the result fits the dashboard without dominating the remaining conversation.
- The insight copy is shortened to retain the quantified recommendation on one compact line at the supplied desktop width.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Capability click and Argus overflow correction

- Source references: `.context/attachments/4FHa8K/image.png` at 1571 x 1311 and `.context/attachments/Cz8y35/image.png` at 1723 x 611.
- Capability targets are now measured relative to the capability scroller rather than the page, keeping the selected menu item and visible panel synchronized.
- Argus chat rows now retain their intrinsic content height, preventing the structured analysis card and Key insight copy from being compressed or clipped.
- Browser-rendered interaction verification remains blocked because no approved browser surface is connected.

final result: blocked

## Structured Argus analysis response

- Source references: `.context/attachments/FZNJbo/image.png` at 1412 x 1105 and `.context/attachments/fRZdmY/image.png` at 2899 x 1556.
- The first Argus answer is now a structured analysis card with an actual semantic table for the three primary performance drivers, their changes, and their business impact.
- A typed Key insight translates the table into a quantified business opportunity while preserving the existing follow-up question, monitoring-task action, and suggestion flow.
- The table remains horizontally scrollable at narrow widths and the analysis header and insight stack vertically on mobile.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Always-on intelligence pipeline

- Source references: `.context/attachments/xIabtU/image.png` at 2556 x 1010 and `.context/attachments/jx6zbV/image.png` at 521 x 360.
- The preserved source implementation was located at `/Users/markussichler/Documents/quantsentry/src/components/sites/tellius-dffc1b10/root-8a5edab2/HeroDiagram.tsx` and used as the interaction reference.
- A new QuantSentry section connects source-system cards to an Argus composer and synchronized output cards for insights, recurring tasks, finished reports, and custom views.
- The composer types realistic prompts, rotates automatically through four modes and four industries, and stops auto-rotation after the first user selection.
- Existing original platform assets are reused for trading, payment, CRM, marketing, and identity sources; no placeholder logos were introduced.
- Desktop uses the source three-column pipeline, while tablet and mobile remove the connector layer and stack the same functional controls without horizontal overflow.
- Automated checks: lint, production build, and whitespace validation pass.
- Browser-rendered comparison remains blocked because no controllable in-app browser surface is available.

final result: blocked

## Aurora scale, dashboard stacking, and frame fill — 2026-08-27

- Source visual truth: `.context/attachments/3ad3v4/image.png`, `.context/attachments/RX88yw/image.png`, `.context/attachments/p9sYLW/image.png`, `.context/attachments/YpWRmS/image.png`, `.context/attachments/PRYp7u/image.png`, `.context/attachments/ONtiqC/image.png`, and `.context/attachments/PWz92Q/image.png`.
- Implementation: `http://localhost:55000/`.
- Implementation screenshot: unavailable because no controllable browser surface is connected.
- Intended state: stable viewport-scale aurora, dashboard shell visible before signal cards, and final Argus console filling the dashboard main frame edge-to-edge.
- Code evidence: aurora height is independent of the short intro layout and now extends to at least 130vh/980px; the story stage stacks above the aurora; dashboard opacity completes before signal-card opacity begins; the Argus layer is absolutely inset to all four dashboard-main edges; the chat body retains internal vertical scrolling.
- The confirmation CTA now reads `Yes, get started` while retaining the existing action.
- Follow-up evidence: `.context/attachments/gBwjmP/image.png` showed the click state entering the fully exposed lower aurora while the shell was still visually subordinate. The shell is now immediately opaque when revealed, and the opening aurora transitions from `.58` to `.18` opacity after confirmation so it remains atmosphere rather than the story surface.
- Automated checks: lint, production build, whitespace validation, local HTTP 200, and targeted layout assertions pass.
- Blocker: a fresh browser capture is required to compare the repaired implementation with the supplied screenshots at matching viewport and density.

final result: blocked

## Homepage signal distribution — 2026-08-27

- Source visual truth: `.context/attachments/0pizYQ/image.png`.
- KYC Compliance now occupies the open upper field and Payments the open lower field around Argus, reducing the previous left-side cluster.
- Acquisition and Engagement move inward symmetrically while the four large metric cards continue framing the dashboard corners.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Final animation, menu, status, and team refinements — 2026-08-27

- Source visual truth: `.context/attachments/GccInY/image.png`, `.context/attachments/lBuHQf/image.png`, `.context/attachments/cJs8O9/image.png`, `.context/attachments/runO4X/image.png`, `.context/attachments/vn8fLP/image.png`, `.context/attachments/MF9mZH/image.png`, `.context/attachments/dySWIU/image.png`, `.context/attachments/tL5iiy/image.png`, and `.context/attachments/6jigJE/image.png`.
- The ingestion paragraph now types over 3.3 seconds, status reveal starts after a 520 ms pause, and checkmarks arrive 700 ms apart; the surrounding story timeline is extended to 12 seconds so the slower cadence remains visible.
- Homepage and Industries overview `Soon` badges use the neutral grey status treatment rather than the active green treatment.
- The Trading Risk Comparison menu description is shortened to one line, while menu footer CTAs are 10% larger with a tighter 42 px row.
- Technical Leadership role labels use weight 500 instead of 600.
- The Argus question bubble is approximately 15% darker and the performance-drivers response panel approximately 10% darker, with their existing borders and text contrast preserved.
- The homepage story no longer adds a desktop or mobile bottom spacer, so its Aurora edge meets the following light section without a black gap.
- Browser-rendered comparison remains blocked because no approved browser surface is connected.

final result: blocked

## Dashboard trailing space — 2026-08-27

- Source visual truth: `.context/attachments/u81R0q/image.png` at 2048 x 1112.
- The opened homepage story now retains 48px of Aurora-backed space below the dashboard before the following light section; the responsive layout uses 36px.
- The spacing is applied to the story container itself, so it follows the dashboard rather than increasing the earlier hero-to-dashboard gap.
- Automated checks: whitespace validation, lint, and production build pass.
- Browser-rendered comparison remains blocked because the in-app browser is unavailable.

final result: blocked

## How QuantSentry Works showcase — 2026-08-27

- Source visual truth: `.context/attachments/kEjUFg/image.png`, with supporting direction from `.context/attachments/sj5Lj6/image.png`, `.context/attachments/ZRSOUU/image.png`, `.context/attachments/wBow0X/image.png`, and `.context/attachments/FGCHAH/image.png`.
- The section is now titled `How QuantSentry Works` and uses three 15.5px process tabs above one focused explanation panel, graphic and contextual CTA.
- The tabs auto-advance every 5.2 seconds while the section is visible and stop after a visitor makes a selection.
- Three matching light-mode QuantSentry dashboard illustrations are wired from `public/images/how-it-works/` for data connection, intelligence building and action; the illustration pane now uses a light product-surface treatment while the explanatory pane remains dark.
- Contextual CTA labels use 14px type.
- The explanatory pane now uses the same light surface language as the illustrations, with dark text and a light teal CTA.
- The panel height is reduced from 410px to 340px, with tighter copy, CTA, tab and outer-section spacing.
- The process tabs use one dark segmented selector with a teal active segment and muted inactive options.
- The homepage dashboard navigation is desaturated and reduced to 30% opacity before widget docking, then resolves to full contrast as the dashboard becomes active.
- The duplicate question pill was removed from the team-intelligence dashboard toolbar, and the Argus driver-table copy is 20% smaller.
- Automated checks: whitespace validation, lint, and production build pass.
- Browser-rendered comparison remains blocked because the in-app browser is unavailable.

final result: blocked

## How QuantSentry Works animated visuals — 2026-08-28

- Source visual truth: `.context/attachments/fwpkvc/image.png` at 2048 x 632 and `.context/attachments/cHVY7C/image.png` at 2048 x 708.
- Source implementation: `msichlergh/quantsentry-website`, specifically `CodexaHowItWorksVisuals.tsx` and `CodexaHowItWorks.module.css` in the local `ndjamena` checkout.
- Implementation target: `http://localhost:55000/#how-it-works`; implementation screenshot unavailable because the connected-browser list is empty.
- Intended viewport and density: desktop, matching the supplied 2048 px reference width at device scale factor 1. Viewport normalization and a browser-rendered pixel comparison are blocked.
- State: each existing tab activates one remounted animation—tool integration, intelligence processing, or action impact—while the selector, copy, CTA, and section layout remain unchanged.
- Full-view comparison evidence: the reference and source component were inspected at original resolution; the local page responds with HTTP 200 and includes the new active integration animation marker.
- Focused region comparison evidence: blocked because no browser-rendered implementation capture is available.
- Fonts and typography: the existing QuantSentry section typography is unchanged; animation labels use the source component's compact monospace treatment.
- Spacing and layout rhythm: the source visual's 336 px frame is adapted to the existing 340 px visual slot, preserving the left copy column and tab selector.
- Colors and visual tokens: the animation surface uses the source's restrained near-black panel, neutral grey controls, and QuantSentry teal state accents.
- Image quality and asset fidelity: the seven original integration logo assets are copied from the supplied repository and rendered through `next/image`; no placeholder logos were introduced.
- Copy and content: the surrounding product messaging is unchanged. Internal status labels are adapted to data unification, benchmarking, risk monitoring, growth signals, and intelligence readiness.
- Interactions: selecting a tab remounts and restarts its animation. Reduced-motion users receive static controls with the complete chart line visible.
- Automated checks: whitespace validation, ESLint, TypeScript, production build, and local HTTP 200 pass.
- Blocker: no in-app browser or connected browser surface is available, so matching-viewport capture, animation timing review, tab-click verification, console inspection, and source-versus-build comparison cannot be completed.

final result: blocked

## Projected impact text color — 2026-08-28

- Source visual truth: `.context/attachments/ga7AQP/image.png` at 597 x 180 px.
- Implementation target: `http://localhost:55000/#how-it-works`; implementation screenshot unavailable because no browser surface is connected.
- State: the `Projected impact +3.8%` text is white while its border and leading status dot retain the existing teal accent.
- Fonts and typography: family, size, weight, and spacing are unchanged.
- Spacing and layout rhythm: pill size, padding, placement, and animation are unchanged.
- Colors and visual tokens: foreground changes from teal to `#f4f7f7`; the semantic teal accent remains on the dot and border.
- Image quality and asset fidelity: no image assets are affected.
- Copy and content: unchanged.
- Full-view and focused comparison evidence: blocked because no browser-rendered implementation capture is available.
- Automated checks: whitespace validation, ESLint, TypeScript, and production build pass.
- Blocker: matching-state capture, animation review, and console inspection require an available browser surface.

final result: blocked

## Mission and workflow refinements — 2026-08-28

- Source visual truth: `.context/attachments/X2OopK/image.png` at 2675 x 1100 px, `.context/attachments/sTeeSl/image.png` at 573 x 729 px, `.context/attachments/ncm8Pz/image.png` at 2489 x 938 px, `.context/attachments/CzqyGP/image.png` at 512 x 512 px, and `.context/attachments/4w57sg/image.png` at 342 x 74 px.
- Implementation target: `http://localhost:55000/`; implementation screenshot unavailable because no browser surface is connected.
- Intended viewport and density: desktop at device scale factor 1; matching-viewport normalization is blocked without a browser capture.
- State: the mission grid contains four cards in a balanced 2 x 2 composition. Revenue, fraud, acquisition cost, and KYC each use a matching Phosphor icon; Priority Market Coverage and Coordinated Abuse Reduction are removed.
- State: the Find Insights rows are renamed to Unified Data, Performance Benchmarks, Risk Alerts, Growth Opportunities, and AI Recommendations with concise completion details.
- State: the supplied 512 px Slack asset replaces the previous logo file and continues to use the existing muted-to-brand-color focus animation.
- Fonts and typography: the projected-impact label increases from weight 400 to 500; other type settings are unchanged.
- Spacing and layout rhythm: the right mission column retains a restrained 36 px stagger; mobile remains a single unshifted column.
- Colors and visual tokens: the large workflow icons use a darker teal foreground, stronger border, and opaque pale-teal surface for better contrast on the light panel.
- Image quality and asset fidelity: `public/images/slack.png` exactly matches the supplied 512 px source asset.
- Copy and content: the mission set removes Priority Market Coverage and Coordinated Abuse Reduction; Find Insights terminology now describes outputs rather than internal processing layers.
- Full-view and focused comparison evidence: blocked because no browser-rendered implementation capture is available.
- Automated checks: whitespace validation, ESLint, TypeScript, and production build pass.
- Blocker: matching-state capture, responsive layout review, animation review, and console inspection require an available browser surface.

final result: blocked

## Copy refinements — 2026-08-28

- Source visual truth: `.context/attachments/q4MRMq/image.png` at 642 x 69 px.
- Implementation target: `http://localhost:55000/`; implementation screenshot unavailable because no browser surface is connected.
- State: `3 Drivers Identified for the Conversion Decline:` uses natural title case. The redundant mission sentence `It applies your metrics and thresholds continuously.` is removed.
- Fonts and typography: unchanged.
- Spacing and layout rhythm: unchanged.
- Colors and visual tokens: unchanged.
- Image quality and asset fidelity: no image assets are affected.
- Copy and content: updated exactly as requested.
- Full-view and focused comparison evidence: blocked because no browser-rendered implementation capture is available.
- Automated checks: whitespace validation, ESLint, TypeScript, and production build pass.
- Blocker: matching-state capture and console inspection require an available browser surface.

final result: blocked

## Goal hierarchy and integration alignment — 2026-08-28

- Source visual truth: `.context/attachments/EuEdwQ/image.png` at 1395 x 810 px and `.context/attachments/rc5n9t/image.png` at 763 x 543 px.
- Implementation target: `http://localhost:55000/`; implementation screenshot unavailable because no browser surface is connected.
- Intended viewport and density: desktop at device scale factor 1; matching-viewport normalization is blocked without a browser capture.
- State: every mission card now leads with `Mission Goal`, followed by the goal name, timeframe, description, progress percentage, and explicit target. The ambiguous `Now` value is removed.
- State: the eight-item integration rail offsets both animation positions by half a logo step, centering the active logo in the orbit for both phases.
- Fonts and typography: existing card typography is preserved; the new goal eyebrow uses the existing compact uppercase metadata style.
- Spacing and layout rhythm: goal names receive their own row, while period badges align to the right of the metadata row. The integration rail retains its existing logo sizes and gaps.
- Colors and visual tokens: goal metadata uses the existing teal accent; inactive and active integration treatments are unchanged.
- Image quality and asset fidelity: no image assets are changed in this pass.
- Copy and content: progress is now labeled directly and the target remains explicit in every card.
- Full-view and focused comparison evidence: blocked because no browser-rendered implementation capture is available.
- Automated checks: whitespace validation, ESLint, TypeScript, and production build pass.
- Blocker: matching-state capture, responsive review, animation review, and console inspection require an available browser surface.

final result: blocked
