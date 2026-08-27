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
