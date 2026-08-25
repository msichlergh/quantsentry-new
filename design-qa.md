# Design QA

- Source visual truth:
  - `.context/attachments/LtsXPg/image.png` (2705 x 514 px): final CTA with the Aurora limited to the right side; requested correction is full-width coverage.
  - `.context/attachments/suh2ul/image.png` (2835 x 578 px): the equivalent homepage CTA variant that must use the same treatment.
  - `.context/attachments/KIHPEX/image.png` (3021 x 792 px): platform-logo rail selected for a subtle transparent-glass pill.
  - `.context/attachments/GUPfwg/image.png` (3730 x 1188 px): secondary hero with open space reserved for a restrained animated field.
  - `.context/attachments/c4hKck/image.png` (1911 x 706 px): PixelBlast composition reference.
  - `.context/attachments/2gd7Av/image.png` (2289 x 143 px): Platform roadmap status labels selected for consistent pill treatment.
  - `.context/attachments/dPXYwH/image.png` (1458 x 1047 px): Argus hero showing PixelBlast visible beneath the translucent chat panel.
- Implementation screenshot path: unavailable; no controllable Conductor browser is attached.
- Intended viewports: 1280 px desktop and 320 px mobile.
- CSS size and density normalization: unavailable until browser screenshots can be captured at the intended CSS viewports.
- State: dark homepage hero with Aurora; secondary and Insights listing/article/author heroes with PixelBlast; cyan and amber final CTA panels with full-width Aurora; homepage and Prop Trading platform rails with glass treatment.

## Full-view comparison evidence

The supplied references were opened and inspected. The CTA reference shows the earlier animation concentrated in the right 54% of the card; the requested implementation now positions the same Aurora canvas across the complete CTA surface at 12% opacity. Ten existing full-width end-of-page CTA panels are explicitly marked so cyan and amber variants share the treatment without affecting mid-page cards or the global footer.

The agreed background system is now finalized in code: Aurora remains on the homepage hero, while every secondary content-page hero uses the supplied PixelBlast component in the empty right column. The temporary Platform query-parameter comparison has been removed.

The same PixelBlast treatment is also mounted on the Insights index, article headers, and author-profile headers. Author profiles use lower opacity because their biography occupies the right column.

The platform-logo rail receives a low-opacity dark glass surface, 12 px backdrop blur, a fine light border, and a fully rounded outline. Its marquee behavior and logo assets are unchanged.

## Focused region comparison evidence

- CTA animation: `.footer-cta-aurora` now uses `inset: 0` rather than a right-side inset or directional mask.
- CTA readability: the canvas remains behind the existing copy and button at 12% opacity and is disabled below 901 px.
- Header background: `.hero-pixel-field` uses the same `55%` right-side crop, `.62` opacity, teal palette, and desktop breakpoint on all secondary page heroes.
- Insights headers: listing and article heroes inherit the standard crop; author heroes reduce opacity to `.38` to protect biography readability.
- Argus header: the PixelBlast field begins at the right edge of the 1200 px content container (`50% + 576px`), preventing the canvas from running beneath the chat panel.
- Logo rail: the existing marquee is unchanged; only its immediate wrapper receives the glass surface.
- Post-change focused screenshots are unavailable, so these code-level checks do not constitute visual approval.

## Findings

- [P1] Browser-rendered comparison is unavailable
  - Location: homepage, secondary and Insights heroes, platform-logo rail, cyan and amber footer CTA panels.
  - Evidence: all source screenshots are available, but the Conductor browser runtime reports no available browser instance, so no same-viewport implementation capture can be produced.
  - Impact: final animation intensity, glass transparency, text contrast, and 320 px overflow cannot be visually approved.
  - Fix: open the running local preview in Conductor or provide desktop and 320 px screenshots of `/`, `/network`, and `/managed-desk`; compare those captures with the source images.

## Required fidelity surfaces

- Fonts and typography: General Sans and the existing heading/button typography are unchanged by this iteration.
- Spacing and layout rhythm: CTA padding and content dimensions are unchanged. The glass rail adds 16 px vertical and 22 px horizontal inset around the existing marquee and must be visually checked at 320 px.
- Colors and visual tokens: Aurora keeps the supplied charcoal/cyan palette. PixelBlast uses `#48c7c3`. The glass surface uses a low-opacity charcoal fill and white hairline.
- Image quality and asset fidelity: all existing platform logos remain unchanged; no placeholder or replacement asset was introduced.
- Copy and content: unchanged.

## Primary interactions and runtime checks

- PixelBlast preserves its pointer ripple interaction on desktop, pauses offscreen, and is hidden below 1100 px where the hero no longer has a stable empty right column.
- Aurora pauses offscreen and renders a static frame for reduced-motion users.
- The platform marquee animation and hover pause remain unchanged.
- Lint passes.
- TypeScript compilation, all 33 static pages, and the production build pass.
- All 18 content routes return HTTP 200 from the existing local server at port 55040.
- Browser console and rendered overflow checks remain blocked because no controllable browser is attached.

## Comparison history

1. The exact Aurora shader replaced the earlier bright Canvas approximation.
2. Homepage readability was improved with a lower contrast veil while keeping the supplied shader unchanged.
3. Aurora and PixelBlast were exposed temporarily on Platform for comparison.
4. PixelBlast was selected for secondary page heroes; Aurora remained the homepage treatment.
5. The final CTA Aurora was expanded from a right-side mask to the full panel width and shared across ten cyan and amber CTA variants.
6. The platform-logo rail received a subtle transparent-glass surface.
7. PixelBlast was wired into all secondary content-page heroes and the temporary comparison switch was removed.
8. PixelBlast was extended to the Insights index, article headers, and author-profile headers, with lower opacity on author profiles.
9. The Platform roadmap's Live Now, In Design, and Exploring labels were normalized to the same pill geometry while preserving their semantic colors.
10. The Argus-specific PixelBlast boundary was moved from the shared 55% start point to the content container's right edge so it cannot show through the translucent chat panel.
11. Post-change visual evidence remains blocked because the browser runtime has no available instance.

## Implementation checklist

- Capture `/`, `/network`, and `/managed-desk` at 1280 px.
- Capture `/` and `/managed-desk` at 320 px and confirm no horizontal overflow.
- Confirm the glass rail remains visually subordinate to the logos.
- Confirm cyan and amber CTA copy maintains sufficient contrast over the full-width animation.
- Check the browser console and repeat with reduced motion enabled.

## Follow-up polish

- Adjust only opacity or glass fill after rendered evidence; do not change layout or animation geometry speculatively.

## Final result

final result: blocked

Blocker: a browser-rendered implementation capture is required for the desktop and 320 px visual comparison.
