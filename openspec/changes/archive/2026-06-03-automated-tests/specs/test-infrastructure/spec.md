## ADDED Requirements

### Requirement: Testinfrastructuur is aanwezig en configureerbaar
Het systeem SHALL Vitest, @vue/test-utils en @vitest/coverage-v8 bevatten als devDependencies, met een werkende configuratie voor jsdom-omgeving en coverage-rapportage.

#### Scenario: Tests draaien
- **WHEN** `npm test` uitgevoerd wordt
- **THEN** voert het systeem alle tests uit en rapporteert pass/fail zonder browser

#### Scenario: Coverage rapportage
- **WHEN** `npm run coverage` uitgevoerd wordt
- **THEN** genereert het systeem een coverage-rapport en faalt als de drempel niet gehaald wordt

### Requirement: Game logica heeft 100% unit test coverage
Het systeem SHALL unit tests bevatten voor alle functies in `game/logic.ts` en `game/state.ts` die alle branches afdekken.

#### Scenario: createBoard
- **WHEN** `createBoard()` aangeroepen wordt
- **THEN** retourneert het een 10×10 bord met alle cellen in staat 'water'

#### Scenario: isValidPlacement — geldig
- **WHEN** een schip geplaatst wordt op een vrije positie binnen het bord
- **THEN** retourneert `isValidPlacement` true

#### Scenario: isValidPlacement — buiten bord
- **WHEN** een schip geplaatst wordt zodat het buiten het bord valt
- **THEN** retourneert `isValidPlacement` false

#### Scenario: isValidPlacement — overlap
- **WHEN** een schip geplaatst wordt op een cel die al bezet is
- **THEN** retourneert `isValidPlacement` false

#### Scenario: placeShip
- **WHEN** `placeShip` aangeroepen wordt met een geldig schip
- **THEN** bevat het nieuwe bord de scheepscellen met de juiste shipId

#### Scenario: fireShot — mis
- **WHEN** geschoten wordt op een lege cel
- **THEN** retourneert `fireShot` `hit: false` en de cel staat op 'miss'

#### Scenario: fireShot — raak
- **WHEN** geschoten wordt op een cel met een schip
- **THEN** retourneert `fireShot` `hit: true` en de cel staat op 'hit'

#### Scenario: fireShot — gezonken
- **WHEN** het laatste deel van een schip geraakt wordt
- **THEN** retourneert `fireShot` het scheepstype in `sunk`

#### Scenario: fireShot — al geraakt
- **WHEN** geschoten wordt op een cel die al 'hit' of 'miss' is
- **THEN** retourneert `fireShot` `hit: false` zonder het bord te wijzigen

#### Scenario: checkWin — niet gewonnen
- **WHEN** niet alle schepen gezonken zijn
- **THEN** retourneert `checkWin` false

#### Scenario: checkWin — gewonnen
- **WHEN** alle schepen gezonken zijn
- **THEN** retourneert `checkWin` true

#### Scenario: resetGame
- **WHEN** `resetGame()` aangeroepen wordt
- **THEN** staat de gameState terug op beginwaarden

### Requirement: usePeerConnection heeft 100% unit test coverage
Het systeem SHALL tests bevatten voor alle paden in `usePeerConnection.ts` met PeerJS volledig gemockt.

#### Scenario: initHost genereert een peer ID
- **WHEN** `initHost()` aangeroepen wordt
- **THEN** resolvt de promise met een peer ID en staat `status` op 'connecting'

#### Scenario: Guest verbindt met host
- **WHEN** `connectToHost(id)` aangeroepen wordt en de verbinding opent
- **THEN** staat `status` op 'connected' en is `onConnected` callback aangeroepen

#### Scenario: Bericht sturen en ontvangen
- **WHEN** `sendMessage` aangeroepen wordt
- **THEN** stuurt de composable het bericht via de DataConnection

#### Scenario: Verbinding verbroken
- **WHEN** de DataConnection een 'close' event gooit
- **THEN** staat `status` op 'disconnected' en is de `onDisconnected` callback aangeroepen

#### Scenario: Fout bij verbinden
- **WHEN** PeerJS een 'error' event gooit
- **THEN** staat `status` op 'error' en bevat `errorMessage` de foutbeschrijving

#### Scenario: destroy ruimt op
- **WHEN** `destroy()` aangeroepen wordt
- **THEN** staat `status` op 'idle' en zijn alle callbacks gereset

### Requirement: PlacementView heeft 100% component test coverage
Het systeem SHALL component tests bevatten voor PlacementView die de volledige plaatsings- en ready-flow afdekken.

#### Scenario: Klaar-knop verschijnt na alle schepen geplaatst
- **WHEN** alle schepen geplaatst zijn
- **THEN** is de "Klaar!" knop zichtbaar

#### Scenario: ready bericht wordt gestuurd bij Klaar
- **WHEN** de speler op "Klaar!" klikt
- **THEN** stuurt het systeem een `ready` bericht naar de tegenstander

#### Scenario: Navigeert naar spel als beide klaar zijn (eigen klaar eerst)
- **WHEN** de speler op "Klaar!" klikt en daarna een `ready` bericht ontvangt
- **THEN** navigeert het systeem naar `/game`

#### Scenario: Navigeert naar spel als beide klaar zijn (tegenstander klaar eerst)
- **WHEN** het systeem eerst een `ready` bericht ontvangt en de speler daarna op "Klaar!" klikt
- **THEN** navigeert het systeem naar `/game`

### Requirement: GameView heeft 100% component test coverage
Het systeem SHALL component tests bevatten voor GameView die de volledige schietflow afdekken, inclusief de eerder gevonden bug.

#### Scenario: Host schiet en krijgt shot-result terug
- **WHEN** de host op een cel klikt en het systeem een `shot-result` ontvangt
- **THEN** wordt het tegenstander-bord bijgewerkt

#### Scenario: Guest schiet en krijgt shot-result terug
- **WHEN** de guest op een cel klikt en het systeem een `shot-result` ontvangt
- **THEN** wordt het tegenstander-bord bijgewerkt

#### Scenario: Inkomend schot wordt verwerkt en shot-result teruggestuurd
- **WHEN** het systeem een `shot` bericht ontvangt
- **THEN** stuurt het systeem een `shot-result` terug

#### Scenario: Beurtenwisseling bij mis
- **WHEN** een `shot-result` met `hit: false` ontvangen wordt
- **THEN** wisselt de beurt naar de tegenstander

#### Scenario: Beurt blijft bij raak
- **WHEN** een `shot-result` met `hit: true` ontvangen wordt
- **THEN** blijft de beurt bij de huidige speler

#### Scenario: Winnaar navigeert naar gameover
- **WHEN** een `game-over` bericht ontvangen wordt
- **THEN** navigeert het systeem naar `/gameover`

#### Scenario: Verbindingsverlies navigeert terug
- **WHEN** de verbinding verbroken wordt
- **THEN** navigeert het systeem na korte tijd terug naar het startscherm

### Requirement: Er is een end-to-end test die een volledig spel simuleert
Het systeem SHALL een end-to-end integratietest bevatten die een compleet spel simuleert van schepen plaatsen tot game-over, via twee in-process gesimuleerde spelers (host en gemockte tegenstander) zonder echte netwerkverbinding.

#### Scenario: Volledig spel van plaatsing tot game-over
- **GIVEN** de host bevindt zich in de PlacementView en beide spelers hebben bekende scheepsposities
- **WHEN**
  1. de host alle schepen plaatst en op "Klaar!" klikt
  2. de tegenstander ook "ready" stuurt
  3. beide spelers meerdere beurten spelen waarbij zowel de host als de tegenstander minstens één raak én één mis schot vuren
  4. daarna één partij alle resterende scheepsposities van de tegenstander raak schiet
  5. de winnende partij het "game-over" bericht stuurt
- **THEN** navigeert het systeem via `/placement` → `/game` → `/gameover` en toont de juiste winnaar

#### Scenario: Beurtenwisseling bij mis en raak
- **GIVEN** beide spelers bevinden zich in de spelende fase
- **WHEN** een speler een mis schot lost
- **THEN** wisselt de beurt naar de tegenstander
- **WHEN** een speler een raak schot lost
- **THEN** blijft de beurt bij dezelfde speler
