## Why

Het spel vereist momenteel altijd twee spelers via een P2P-verbinding, wat de drempel hoog maakt. Een single player modus stelt de speler in staat om direct tegen een lokale AI te spelen zonder netwerk of tweede speler.

## What Changes

- Nieuwe "Solo spelen" knop op het home scherm naast de bestaande multiplayer opties
- Nieuwe `GameConnection` interface die zowel P2P als AI-verbindingen uniform beschrijft
- Refactor van `usePeerConnection` naar een `PeerGameConnection` implementatie van de interface
- Nieuwe `useAIConnection` implementatie: lokale AI met Hunt & Target algoritme, willekeurige scheepsplaatsing, geen netwerk
- `PlacementView` en `GameView` gebruiken de interface in plaats van direct `usePeerConnection`
- `ConnectionWarning` (heartbeat UI) alleen zichtbaar in P2P modus
- Nieuwe E2E integratietest die een compleet potje solo-zeeslag speelt tot een winnaar; winnaar hoeft niet voorspeld te worden

## Capabilities

### New Capabilities
- `ai-opponent`: De AI-tegenstander — willekeurige scheepsplaatsing, Hunt & Target schietstrategie, volledig lokaal
- `game-connection`: De gedeelde `GameConnection` interface en de twee implementaties (Peer, AI)
- `single-player-mode`: De solo spelstroom — startknop, AI-initialisatie, scheepsplaatsing, spel tot einde

### Modified Capabilities
- `game-session`: De spelstroom ondersteunt nu ook een solo pad naast het P2P pad; de `role`-waarde is in solo modus niet relevant voor de spelervaring
- `test-infrastructure`: Uitbreiding met E2E test voor het solo pad

## Impact

- `src/composables/usePeerConnection.ts`: interface extractie; bestaand gedrag blijft intact
- `src/composables/useAIConnection.ts`: nieuw bestand
- `src/game/ai.ts`: nieuw bestand met Hunt & Target logica en willekeurige plaatsing
- `src/views/HomeView.vue`: extra knop "Solo spelen"
- `src/views/PlacementView.vue`: gebruikt `GameConnection` interface
- `src/views/GameView.vue`: gebruikt `GameConnection` interface; `ConnectionWarning` conditioneel
- `src/components/ConnectionWarning.vue`: ongewijzigd
- `src/__tests__/full-game-solo.test.ts`: nieuwe E2E test
