## 1. GameConnection interface en useGameConnection singleton

- [x] 1.1 Definieer `GameConnection` interface in `src/composables/useGameConnection.ts` met `sendMessage`, `onMessage`, `onDisconnected`, `destroy`, `role`, `heartbeatLost`, `secondsSinceLastHeartbeat`, `isAI`
- [x] 1.2 Implementeer `useGameConnection()` singleton composable
- [x] 1.3 Schrijf unit tests voor `useGameConnection`

## 2. PeerGameConnection

- [x] 2.1 Maak `src/composables/PeerGameConnection.ts`
- [x] 2.2 Pas `HomeView.vue` aan: `setGameConnection` aanroepen na verbinding
- [x] 2.3 Verifieer dat bestaande tests nog slagen (`npm test`)

## 3. AI logica

- [x] 3.1 Maak `src/game/ai.ts` met `randomBoard()`
- [x] 3.2 Implementeer `createAI(remainingShips)` fabrieksfunctie
- [x] 3.3 Implementeer `AI.nextShot()` — Hunt modus
- [x] 3.4 Implementeer `AI.nextShot` — Target modus
- [x] 3.5 Implementeer `AI.processResult(x, y, hit, sunk?)`
- [x] 3.6 Schrijf unit tests voor alle functies in `ai.ts` met 100% coverage

## 4. AIGameConnection

- [x] 4.1 Maak `src/composables/useAIConnection.ts`
- [x] 4.2 Implementeer `sendMessage`
- [x] 4.3 Implementeer willekeurige eerste beurt
- [x] 4.4 Schrijf unit tests voor `useAIConnection`

## 5. Views aanpassen

- [x] 5.1 Pas `PlacementView.vue` aan: gebruik `useGameConnection()`
- [x] 5.2 Pas `GameView.vue` aan: gebruik `useGameConnection()`
- [x] 5.3 Maak `ConnectionWarning` conditioneel
- [x] 5.4 Pas `HomeView.vue` aan: voeg "Solo spelen" knop toe
- [x] 5.5 Pas component tests van `PlacementView` en `GameView` aan
- [x] 5.6 Voeg tests toe voor `HomeView`: solo knop zichtbaar, klik navigeert

## 6. E2E solo test

- [x] 6.1 Maak `src/__tests__/full-game-solo.test.ts`
- [x] 6.2 Verifieer dat de test slaagt via `/placement` → `/game` → `/gameover`

## 7. Coverage en verificatie

- [x] 7.1 Draai `npm run coverage` en verifieer 100% coverage op alle nieuwe en gewijzigde bestanden
- [x] 7.2 Verifieer dat alle 130+ bestaande tests nog slagen
