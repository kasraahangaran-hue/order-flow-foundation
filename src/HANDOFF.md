# Handover Notes

This document tracks production-readiness items the developer needs to address before shipping. It complements `// HANDOFF:` comments scattered across the codebase.

## Quick start

Find every blocker flagged in code:

```sh
grep -rn "HANDOFF:" src/
```

Each comment explains what the issue is, why it needs attention, and what to do.

---

## 1. Google Maps API key

See `// HANDOFF:` block in `src/lib/google-maps.ts`.

The current key was created on a personal Google Cloud account for prototyping. Before going live:

1. Create a new API key on the Washmen-owned Google Cloud project.
2. Restrict it by HTTP referrer to production hostnames (e.g. `*.washmen.com`) and by API to: Maps JavaScript API, Places API, Geocoding API.
3. Set `VITE_GOOGLE_MAPS_API_KEY` in the production build pipeline.
4. Once env var is set in production, the literal fallback can be removed from the source file.

The literal fallback is kept ONLY so Lovable preview keeps working without env config. It must not ship to production untouched.

---

## 2. State Inspector hostname gate

See `// HANDOFF:` block in `src/components/dev/StateInspector.tsx`.

The State Inspector dev panel is gated by an allow-list of production hostnames. Confirm the allow-list matches the actual production hostname before shipping. Recommendation: switch to `import.meta.env.MODE === "production"` for safer gating that doesn't depend on hostname guesses.

---

## 3. Native iOS/Android bridge

See `// HANDOFF:` block at the top of `src/lib/nativeBridge.ts`.

The web layer expects `window.WashmenBridge` to be injected by the iOS/Android WebView with two methods:

- `openSheet(name, value)` — request a native bottom sheet
- `onSheetResult(name, callback)` — subscribe to the user's selection

The current implementation is a stub. Confirm the contract with the iOS/Android team and wire to the real bridge.

Until wired, native-sheet flows (currently: Payment Method selection on Last Step) won't work in a production app build. The web flow will silently no-op and never receive a result.

---

## 4. Backend wiring (data files)

Three data files contain hardcoded values that need backend integration:

- `src/data/promos.ts` — promo list and per-promo terms.
- `src/data/slots.ts` — pickup/drop-off time slot availability.
- `src/data/scheduleDefaults.ts` — initial slot pre-selection logic.

Each has a `// HANDOFF:` comment with specifics.

Additional backend integration items in code:

- `src/stores/orderStore.ts` — Press & Hang exclusion logic on submit when `washAndFold` is false (existing TODO).
- `src/pages/laundry/LastStep.tsx` — Press & Hang vs Folding sub-service notice copy is currently hardcoded to mention both; should be dynamic based on which sub-services are actually selected.

---

## 5. Color system migration — completed phases

The customer-app color system has been aligned with the Figma design library (`Design Library / Customer App / Colours`, node `30307:5016`). Two phases have landed:

### Phase 1 — Canonical tokens (complete)

Updated `src/index.css` and `tailwind.config.ts` with all design-system tokens:

- Primary: `washmen-primary`, `washmen-primary-aqua`, `washmen-primary-green`, `washmen-primary-orange`, `washmen-primary-pink`, `washmen-primary-red`, `washmen-primary-teal`, `washmen-notification-red`
- Light variants: `washmen-light-blue`, `washmen-light-aqua`, `washmen-light-green`, `washmen-light-orange`, `washmen-light-pink`, `washmen-light-red`, `washmen-light-teal`
- Greys: `washmen-slate-grey`, `washmen-cloudy-blue`, `washmen-light-grey`, `washmen-pale-grey`, `washmen-bg`
- Function: `washmen-discount`, `washmen-info-toast`, `washmen-express-delivery`, `washmen-secondary-express`

Each token has a `// HANDOFF:` comment in `src/index.css` reminding the dev these MUST stay in sync with Figma.

### Phase 2 — Inline-hex sweep (complete)

Every brand inline hex (`text-[#585871]`, `bg-[#A4FF00]`, etc.) has been replaced with the canonical Tailwind token (`text-washmen-slate-grey`, `bg-washmen-primary-green`, etc.). Verification:

```sh
grep -rohE '\[#[0-9a-fA-F]{6}\]' src/ --include="*.tsx" --include="*.ts" | sort -u
```

This should return nothing for any brand color. Generic white/black hexes inside SVG markup may remain.

---

## 6. Color system migration — pending phases

Two follow-up sweeps are still needed before the design system becomes the single source of truth.

### Phase 3 — Migrate deprecated color aliases

Several components still use legacy alias names that map (via `var(...)`) to the canonical tokens. The aliases work, but the names mislead. Replace each usage with the canonical name:

| Deprecated | Replace with |
|---|---|
| `washmen-orange` | `washmen-primary-orange` |
| `washmen-pink` | `washmen-primary-pink` |
| `washmen-red` | `washmen-primary-red` |
| `washmen-secondary-blue` | `washmen-light-blue` |
| `washmen-secondary-aqua` | `washmen-light-aqua` |
| `washmen-secondary-red` | `washmen-light-red` |
| `washmen-primary-light` | `washmen-light-blue` |

Mechanical find-and-replace across `src/`. After complete, delete the deprecated entries from `src/index.css` and `tailwind.config.ts`.

### Phase 4 — Migrate the pre-design-system neutral ladder

The `washmen-secondary-100` through `washmen-secondary-900` ladder is a Lovable-era invention not present in the design system. Each usage needs to map to the closest canonical grey:

| Pre-DS token | Approximate canonical replacement |
|---|---|
| `washmen-secondary-50` | `washmen-bg` |
| `washmen-secondary-100` | `washmen-pale-grey` |
| `washmen-secondary-200` | `washmen-light-grey` |
| `washmen-secondary-300` | `washmen-cloudy-blue` (likely) |
| `washmen-secondary-400` | (designer call) |
| `washmen-secondary-500` | `washmen-slate-grey` (likely) |
| `washmen-secondary-600` to `900` | (designer call — DS may not need this many shades) |

The exact mapping should be confirmed with the designer since the canonical greys don't form a clean ladder. After all usages are migrated, delete the `washmen-secondary-*` tokens from theme.

---

## 7. Linting

`npm run lint` reports 7 warnings, all from stock `shadcn/ui` files (`react-refresh/only-export-components`). These are common across all shadcn installs and don't reflect a real bug. They can be ignored or suppressed with an ESLint config rule.

---

## 8. Cleanup checklist before going live

- [ ] Replace Google Maps API key (item #1)
- [ ] Verify State Inspector hostname gate (item #2)
- [ ] Wire native bridge (item #3)
- [ ] Wire backend data fetches (item #4)
- [ ] Complete Phase 3: migrate deprecated color aliases (item #6)
- [ ] Complete Phase 4: migrate neutral ladder (item #6)
- [ ] Decide whether to suppress shadcn lint warnings (item #7)
- [ ] Run final `grep -rn "HANDOFF:" src/` and confirm every flagged item is addressed
