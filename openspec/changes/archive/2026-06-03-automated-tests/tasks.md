## 1. Infrastructuur opzetten

- [x] 1.1 Installeer devDependencies: `vitest`, `@vue/test-utils`, `@vitest/coverage-v8`, `happy-dom`
- [x] 1.2 Maak `vitest.config.ts` aan met jsdom/happy-dom environment, coverage ingeschakeld en `main.ts` + `router/index.ts` uitgesloten van coverage
- [x] 1.3 Voeg scripts toe aan `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`, `"coverage": "vitest run --coverage"`
- [x] 1.4 Verifieer dat `npm test` slaagt (nog geen tests, maar config werkt)

## 2. Unit tests: game/logic.ts

- [x] 2.1 Maak `src/game/__tests__/logic.test.ts` aan
- [x] 2.2 Test `createBoard`: 10×10 bord, alle cellen 'water'
- [x] 2.3 Test `getShipCells`: horizontaal en verticaal
- [x] 2.4 Test `isValidPlacement`: geldig, buiten bord (horizontaal en verticaal), overlap
- [x] 2.5 Test `placeShip`: cellen hebben juiste state en shipId
- [x] 2.6 Test `fireShot`: mis, raak, gezonken, al geraakt (hit en miss)
- [x] 2.7 Test `checkWin`: niet gewonnen, wel gewonnen
- [x] 2.8 Verifieer 100% coverage op `logic.ts`

## 3. Unit tests: game/state.ts

- [x] 3.1 Maak `src/game/__tests__/state.test.ts` aan
- [x] 3.2 Test `resetGame`: alle velden terug op beginwaarden
- [x] 3.3 Test dat `gameState` de juiste beginwaarden heeft
- [x] 3.4 Verifieer 100% coverage op `state.ts`

## 4. Unit tests: usePeerConnection.ts

- [x] 4.1 Maak `src/composables/__tests__/usePeerConnection.test.ts` aan
- [x] 4.2 Maak een PeerJS mock (`vi.mock('peerjs')`) die `open`, `connection`, `data`, `close`, `error` events synchroon kan triggeren
- [x] 4.3 Test `initHost`: resolveert met peer ID, status wordt 'connecting' dan 'connected' bij binnenkomende verbinding
- [x] 4.4 Test `connectToHost`: resolveert als conn opent, status wordt 'connected', `onConnected` callback wordt aangeroepen
- [x] 4.5 Test `sendMessage`: roept `conn.send` aan
- [x] 4.6 Test `onMessage`: callback wordt aangeroepen bij binnenkomende data
- [x] 4.7 Test `onConnected`: callback direct aangeroepen als al verbonden
- [x] 4.8 Test `onDisconnected`: callback aangeroepen bij 'close' event
- [x] 4.9 Test foutpad: status wordt 'error', errorMessage gevuld
- [x] 4.10 Test `destroy`: status 'idle', alles gereset
- [x] 4.11 Verifieer 100% coverage op `usePeerConnection.ts`

## 5. Component tests: GameBoard.vue

- [x] 5.1 Maak `src/components/__tests__/GameBoard.test.ts` aan
- [x] 5.2 Test rendering van een leeg bord (10×10 cellen)
- [x] 5.3 Test dat cell-click event geëmit wordt bij klik op interactieve cel
- [x] 5.4 Test dat cell-click NIET geëmit wordt als `interactive` false is
- [x] 5.5 Test preview-rendering (valid en invalid preview)
- [x] 5.6 Verifieer 100% coverage op `GameBoard.vue`

## 6. Component tests: PlacementView.vue

- [x] 6.1 Maak `src/views/__tests__/PlacementView.test.ts` aan
- [x] 6.2 Mock `usePeerConnection` met een nep-implementatie die `sendMessage` bespioneert en `onMessage` callback opslaat
- [x] 6.3 Test schip selecteren en plaatsen op het bord
- [x] 6.4 Test dat "Klaar!" knop pas verschijnt als alle schepen geplaatst zijn
- [x] 6.5 Test: klik "Klaar!" → `sendMessage({ type: 'ready' })` wordt aangeroepen
- [x] 6.6 Test: klik "Klaar!", daarna `ready` ontvangen → navigeert naar `/game`
- [x] 6.7 Test: `ready` ontvangen, daarna klik "Klaar!" → navigeert naar `/game`
- [x] 6.8 Test: verbinding verbroken → navigeert naar `/`
- [x] 6.9 Verifieer 100% coverage op `PlacementView.vue`

## 7. Component tests: GameView.vue

- [x] 7.1 Maak `src/views/__tests__/GameView.test.ts` aan
- [x] 7.2 Mock `usePeerConnection`
- [x] 7.3 Test: speler klikt cel → `sendMessage({ type: 'shot' })` wordt gestuurd, `myTurn` wordt false
- [x] 7.4 Test: `shot` ontvangen → `sendMessage({ type: 'shot-result' })` wordt teruggestuurd
- [x] 7.5 Test: `shot-result` met `hit: false` → `myTurn` wordt true (beurt wisselt)
- [x] 7.6 Test: `shot-result` met `hit: true` → `myTurn` blijft false (tegenstander gaat opnieuw)
- [x] 7.7 Test: `shot` op laatste schip → `game-over` bericht gestuurd, navigeert naar `/gameover`
- [x] 7.8 Test: `game-over` ontvangen → navigeert naar `/gameover`
- [x] 7.9 Test: klik op cel terwijl `myTurn` false → geen bericht gestuurd
- [x] 7.10 Test: verbinding verbroken → navigeert naar `/`
- [x] 7.11 Verifieer 100% coverage op `GameView.vue`

## 8. Component tests: HomeView.vue en GameOverView.vue

- [x] 8.1 Maak `src/views/__tests__/HomeView.test.ts` aan
- [x] 8.2 Test: klik "Nieuw spel" → `initHost` aangeroepen, game-code zichtbaar
- [x] 8.3 Test: klik "Verbinden" → invoerveld zichtbaar
- [x] 8.4 Test: geldige code invullen en verbinden → navigeert naar `/placement`
- [x] 8.5 Test: kopieer-knop roept `navigator.clipboard.writeText` aan
- [x] 8.6 Maak `src/views/__tests__/GameOverView.test.ts` aan
- [x] 8.7 Test: winnaar-informatie wordt getoond
- [x] 8.8 Test: "Opnieuw spelen" knop navigeert terug naar `/`
- [x] 8.9 Verifieer 100% coverage op `HomeView.vue` en `GameOverView.vue`

## 10. End-to-end test: volledig spel

- [x] 10.1 Maak `src/__tests__/full-game.test.ts` aan met een auto-responding mock peer die `ready`, `shot`, `shot-result` en `game-over` berichten automatisch routeert tussen host en gesimuleerde tegenstander
- [x] 10.2 Test plaatsingsfase: host plaatst alle schepen → klikt Klaar → ontvangt ready van tegenstander → navigeert naar `/game`
- [x] 10.3 Test schietfase beurtenwisseling: host vuurt een mis schot (beurt wisselt naar tegenstander), tegenstander vuurt een mis schot (beurt wisselt terug naar host)
- [x] 10.4 Test rake schoten: host vuurt een raak schot (beurt blijft bij host), tegenstander vuurt een raak schot op host's bord (beurt wisselt naar host)
- [x] 10.5 Test afsluiting: één partij schiet alle resterende scheepsposities van de tegenstander raak → `game-over` bericht gestuurd → navigeert naar `/gameover` met juiste winnaar
- [x] 10.6 Verifieer dat de volledige route `/placement` → `/game` → `/gameover` doorlopen wordt in één test

## 9. Coverage afdwingen

- [x] 9.1 Draai `npm run coverage` en verifieer dat alle bestanden (excl. `main.ts`, `router/index.ts`) 100% halen
- [x] 9.2 Fix eventuele ontbrekende branches of paden
