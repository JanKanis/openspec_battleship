## Why

De Battleship app heeft geen geautomatiseerde tests. Bugs zoals de gebroken shot-handling en de vastgelopen plaatsingsfase werden pas ontdekt door handmatig te testen. Met 100% testcoverage zijn regressies onmiddellijk zichtbaar en kunnen bugs structureel opgespoord worden zonder browser.

## What Changes

- Vitest en @vue/test-utils worden toegevoegd als testinfrastructuur
- PeerJS wordt gemockt zodat P2P-flows getest kunnen worden zonder echte netwerkverbinding
- Unit tests voor alle pure game logica (`logic.ts`, `state.ts`)
- Composable tests voor `usePeerConnection.ts`
- Component tests voor alle views en GameBoard
- Twee-speler integratieflows worden getest (plaatsing → spel → einde)
- Coverage-drempel ingesteld op 100% voor alle bronbestanden

## Capabilities

### New Capabilities

- `test-infrastructure`: Vitest + @vue/test-utils setup met coverage-rapportage en 100%-drempel

### Modified Capabilities

_(geen — testcode voegt gedrag toe, wijzigt geen bestaande specs)_

## Impact

- `package.json`: Vitest, @vue/test-utils, @vitest/coverage-v8 toevoegen
- `vite.config.ts` of `vitest.config.ts`: testconfiguratie en coverage-drempel
- `src/**/__tests__/`: testbestanden per module
- Geen wijzigingen aan productiecode
