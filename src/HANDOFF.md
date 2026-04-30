# Handover Notes

## How to find handoff items in code

```sh
grep -rn "HANDOFF:" src/
```

This returns every blocker that needs the developer's attention before going live.

## Open items beyond inline HANDOFF flags

### 1. Hardcoded hex colors

The codebase currently has ~64 inline hex color values (`text-[#585871]`, `border-[#f2f3f8]`, etc.) that bypass the design system tokens. The most-frequent values are:

- `#585871` (23 usages) — slate-grey body text. Closest theme token: `washmen-secondary-500` (slight HSL drift).
- `#f2f3f8` (16 usages) — light card border. Closest theme token: `washmen-secondary-100` (slight HSL drift).
- `#A4FF00` (8 usages) — lime-green check accent. No matching token; this is a new brand color.
- `#c3c8db` (5 usages) — placeholder grey. Closest theme token: `washmen-secondary-300`.

Decisions needed:

- Do we round each hex to its closest existing token (and accept the slight visual drift), or add new tokens (`washmen-text-secondary`, `washmen-border-light`, `washmen-success-accent`, `washmen-input-placeholder`) that exactly match the design?
- Recommendation: add the new tokens. The drift between `#585871` and `secondary-500` is small but visible side-by-side, and the design intent likely was specific.

### 2. iOS/Android native bridge

See `src/lib/nativeBridge.ts`. The web layer calls `nativeBridge.openSheet(name, value)` to request a native bottom sheet from the host app, and listens via `nativeBridge.onSheetResult(name, cb)` for the user's selection. Currently both are stubs. Wire to `window.WashmenBridge` (the global injected by the iOS/Android WebView) — confirm the method signatures with the native team.

### 3. State Inspector gating

`src/components/dev/StateInspector.tsx` has a hostname allow-list to prevent it rendering in production. Confirm the allow-list matches the actual production hostname before shipping. Recommendation: switch to `import.meta.env.MODE === "production"` for safer gating.

### 4. Google Maps API key

See HANDOFF block in `src/lib/google-maps.ts`. The prototype key must be replaced with a Washmen-owned, domain-restricted key, and read from a build-time env var.

### 5. Backend wiring TODOs

Files with HANDOFF flags for backend integration:

- `src/data/promos.ts` — promo list + per-promo terms.
- `src/data/slots.ts` — pickup/drop-off slot availability.
- `src/data/scheduleDefaults.ts` — initial slot selection logic.
- `src/stores/orderStore.ts` — see comment around the cart submit logic for a Press & Hang exclusion case.
- `src/pages/laundry/LastStep.tsx` — Press & Hang vs Folding sub-service copy needs to be made dynamic based on which is actually selected (currently hardcoded to mention both).

### 6. Linting

`npm run lint` reports 7 warnings from shadcn/ui files (`react-refresh/only-export-components`). These are stock shadcn — common across all shadcn installs and not a real bug. They can be ignored or suppressed with a config rule.