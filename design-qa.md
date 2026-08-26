# Design QA

- Source visual truth:
  - `.context/attachments/8Le75E/image.png`: scattered data signals around the opening message.
  - `.context/attachments/6O1OMS/image.png`: signals unified inside one dashboard.
  - `.context/attachments/IS9yNV/image.png`: AI experience inside the same dashboard frame.
  - `.context/attachments/8zmiZi/image.png` and `.context/attachments/dFs4rX/image.png`: Argus chat and voice patterns.
  - `.context/attachments/WOPdI8/image.png`: extensive dashboard side navigation.
- Latest implementation evidence supplied by the user:
  - `.context/attachments/ySMju0/image.png`: cards missing their dashboard targets.
  - `.context/attachments/meO1lJ/image.png`: oversized full-width Argus analysis state.
  - `.context/attachments/KGNcg3/image.png`: cards overlapping while the dashboard appears.
  - `.context/attachments/gDgc5p/image.png`: floating Argus entry point before voice controls.
  - `.context/attachments/k3Lyuh/image.png`: unified dashboard with the requested lower-right Argus bubble location.
  - `.context/attachments/dl2UJQ/image.png`: latest user-approved opening composition.
  - `.context/attachments/nKyuKR/image.png`: KYC Compliance clipped at the bottom edge before repositioning.
- Intended viewport: desktop scroll story with a stacked fallback below 901 CSS px.
- State: dark homepage moving from individual signals to a unified dashboard and then to Argus.

## Full-view comparison evidence

The supplied screenshots confirm the intended overall sequence but exposed three P1/P2 issues: docking was measured before the dashboard reached its settled position, the dashboard appeared while cards were still visibly overlapping, and the Argus state used an oversized analysis card rather than the selected conversational patterns.

The implementation now measures targets in the dashboard's final position, completes most card movement before revealing the dashboard, uses an expanded neutral sidebar, and replaces the analysis card with working Chat and Voice modes. Five additional connected-data signals cover acquisition, engagement, payments, trading platforms, and KYC compliance before docking into their own dashboard row. The floating Argus entry point now includes working microphone, speech-mode, and open controls, while a compact orb remains available in the lower-right of the unified dashboard.

No post-fix rendered screenshot is available, so the revised alignment and Argus format cannot yet be passed visually.

## Focused region comparison evidence

- Typography: the hero kicker is `Data Intelligence for [Industry]`; explanatory copy remains sentence case.
- KPI cards: neutral labels are `Net revenue` and `Value under review`.
- Dashboard rail: expanded into Overview, Analytics, Operations, and Intelligence groups with consistent Phosphor icons.
- Argus: neutral business language, chat/task delegation, voice mode, verified-data disclosure, and approval disclosure.
- Floating input: white `Argus AI` label, live Thinking Orb state text, the concise `How can I help today?` prompt, and matching microphone and speech-mode controls.
- Connected data: compact source cards use locally stored, full-colour advertising, social, Intercom, payment, trading-platform, Sumsub, and Veriff marks while keeping the labels category-neutral.

## Findings

- [P1] Post-fix dashboard alignment is not visually captured.
  - Location: homepage dashboard convergence state.
  - Evidence: the latest supplied dashboard screenshot predates the settled-target measurement and delayed dashboard reveal changes.
  - Impact: final card alignment cannot be visually approved.
  - Fix: capture the dashboard after the four cards have fully docked.

- [P1] Post-fix Argus chat and voice states are not visually captured.
  - Location: final homepage scroll state.
  - Evidence: the supplied Argus screenshot predates the new Chat/Voice console.
  - Impact: density, wrapping, controls, and sidebar balance cannot be visually approved.
  - Fix: capture both Chat and Voice modes at the same desktop viewport.

## Required fidelity surfaces

- Fonts and typography: General Sans and existing weights are preserved; post-fix wrapping needs a rendered check.
- Spacing and layout rhythm: docking geometry and reveal timing were corrected; post-fix capture is still required.
- Colors and visual tokens: existing charcoal, cyan, amber, and risk tokens are preserved.
- Image quality and asset fidelity: the QuantSentry logo is reused; integration marks are local full-colour brand assets, while neutral interface icons come from Phosphor.
- Copy and content: industry-neutral data intelligence, custom views, anomalies, growth opportunities, task delegation, and voice are represented.

## Primary interactions and runtime checks

- Scroll drives signals, dashboard, and Argus states.
- Card destinations recalculate on resize.
- All nine signal cards dock into KPI or connected-source targets in the unified dashboard.
- The dashboard is revealed after the docking motion is almost complete.
- Argus Chat and Voice tabs work.
- Floating microphone and speech controls scroll to Argus and open the relevant mode.
- The unified dashboard keeps a lower-right Argus orb available; selecting it opens Argus Chat.
- The Thinking Orb cycles through breathing, searching, connecting, composing, and solving states; voice mode pins it to listening.
- The visible status label stays synchronized with the active orb state.
- Mobile below 901 px uses a non-sticky stacked layout.
- Lint, TypeScript, the 33-page production build, and `git diff --check` pass.

## Comparison history

1. Initial scattered-signal state was confirmed from the user's screenshot.
2. Incorrect final docking was traced to measuring a translated dashboard and corrected.
3. Mid-transition overlap was reduced by separating dashboard reveal progress from card convergence.
4. The oversized analysis card was replaced by the selected compact chat and voice patterns.
5. Post-fix visual comparison remains blocked because no controllable browser is attached.
6. Additional connected-data widgets were added and repositioned, but still require a same-viewport post-fix capture.

## Implementation checklist

- Capture the fully docked dashboard state.
- Capture Argus Chat mode.
- Switch to Voice and capture the same viewport.
- Confirm no horizontal overflow at 320 px.

## Final result

final result: blocked

Blocker: post-fix browser-rendered screenshots of the dashboard, Argus Chat, and Argus Voice states are required.
