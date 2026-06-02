## Context

De app bestaat uit drie testbare lagen:

```
┌─────────────────────────────────────────────────────┐
│  Views (HomeView, PlacementView, GameView,          │
│         GameOverView) + GameBoard component         │
│  → Vue component tests, mock peer + router          │
├─────────────────────────────────────────────────────┤
│  usePeerConnection composable                       │
│  → unit tests, PeerJS volledig gemockt              │
├─────────────────────────────────────────────────────┤
│  game/logic.ts, game/state.ts                       │
│  → pure unit tests, geen mocks nodig                │
└─────────────────────────────────────────────────────┘
```

PeerJS maakt echte WebRTC-verbindingen aan en is niet testbaar zonder browser + netwerk. De composable moet daarom volledig gemockt worden bij het testen van views.

## Goals / Non-Goals

**Goals:**
- 100% statement/branch/function coverage op alle bestanden onder `src/`
- Elke bug die we al tegengekomen zijn (shot-handling, placement ready-flow) heeft een failing test vóór de fix en een passing test erna
- Tests draaien in CI zonder browser (jsdom/happy-dom environment)
- `npm test` en `npm run coverage` werken

**Non-Goals:**
- End-to-end tests met echte WebRTC (te complex, vereist twee browsers)
- Visual regression tests

## Decisions

### Beslissing 1: Vitest + @vue/test-utils

**Keuze:** Vitest als testrunner, `@vue/test-utils` voor component mounting, `@vitest/coverage-v8` voor coverage.

**Reden:** Vitest is de standaard voor Vite-projecten — geen extra bundler config nodig, native ESM, snel. `@vue/test-utils` is de officiële Vue testbibliotheek.

**Alternatief:** Jest + babel-jest. Meer configuratie nodig voor ESM en Vue SFC's.

---

### Beslissing 2: PeerJS mock via `vi.mock`

**Keuze:** Mock de `peerjs` module globaal met `vi.mock('peerjs')`. De mock implementeert een minimale `Peer` klasse die event callbacks (`on('open')`, `on('connection')`, `on('data')`, etc.) synchroon of via microtask aanroept.

**Reden:** PeerJS aanroepen in jsdom crasht omdat WebRTC niet beschikbaar is. Een gecontroleerde mock laat ons ook de exacte berichtenstroom simuleren.

---

### Beslissing 3: `usePeerConnection` wordt een mock bij view-tests

**Keuze:** Bij view-tests wordt `usePeerConnection` gemockt via `vi.mock(...)` zodat tests de `onMessage` callback direct kunnen aanroepen en `sendMessage` kunnen bespioneren.

**Reden:** Views testen via de echte composable vereist PeerJS te draaien. Met een nep-composable test je de view-logica geïsoleerd — precies wat we willen voor de placement-bug.

---

### Beslissing 4: Testlocatie in `src/**/__tests__/`

**Keuze:** Testbestanden naast de bronbestanden in `__tests__/` submappen.

**Reden:** Conventie die door Vitest en Vue-community gehanteerd wordt. Makkelijk te vinden.

---

### Beslissing 5: 100% drempel afgedwongen in config

**Keuze:** `coverage.thresholds` in vitest-config op 100% voor statements, branches, functions, lines — op alle bestanden inclusief `main.ts` en `router/index.ts`.

**Reden:** Expliciete eis. Uitzonderingen (zoals `main.ts`) kunnen worden uitgesloten via `coverage.exclude` als ze aantoonbaar niet testbaar zijn zonder een volledige browser-mount.

**Nuance:** `main.ts` (bootstrapt de app) en `router/index.ts` (declaratief) worden uitgesloten van coverage. Alle overige bestanden moeten 100% halen.

## Risks / Trade-offs

- **jsdom mist browser APIs** (bijv. `navigator.clipboard` in HomeView) → mocken via `vi.stubGlobal` of `Object.defineProperty`
- **Vue Router navigatie in tests** → gebruik `createMemoryHistory()` of mock `useRouter`
- **Async berichtstromen** → gebruik `await nextTick()` en `flushPromises()` na het simuleren van berichten
- **`main.ts` en `router/index.ts` uitgesloten** → documenteer waarom in vitest-config

## Open Questions

- Wil je ook een `npm run test:watch` script voor development?
