## ADDED Requirements

### Requirement: Er is een end-to-end test die een compleet solo spel simuleert
Het systeem SHALL een end-to-end integratietest bevatten die een volledig solo spel simuleert van scheepsplaatsing tot game-over, zonder echte netwerkverbinding. De test valideert dat het spel een winnaar bereikt; de winnaar hoeft niet voorspeld te worden.

#### Scenario: Volledig solo spel van plaatsing tot game-over
- **GIVEN** de speler bevindt zich in de PlacementView in solo modus en de AI heeft zijn schepen willekeurig geplaatst
- **WHEN**
  1. de speler alle schepen plaatst en op "Klaar!" klikt
  2. beide partijen beurtelings schieten totdat alle schepen van één partij gezonken zijn
- **THEN** navigeert het systeem via `/placement` → `/game` → `/gameover` en is er een winnaar bepaald

### Requirement: AI-logica heeft 100% unit test coverage
Het systeem SHALL unit tests bevatten voor alle functies in `game/ai.ts` die alle branches van Hunt & Target afdekken.

#### Scenario: randomBoard genereert geldig bord
- **WHEN** `randomBoard()` aangeroepen wordt
- **THEN** retourneert het een bord met alle vijf schepen op geldige, niet-overlappende posities

#### Scenario: Hunt modus selecteert beste cel
- **WHEN** de AI in hunt-modus een schot kiest op een leeg bord
- **THEN** kiest de AI een cel met de hoogste kanswaarde

#### Scenario: Target modus na raak
- **WHEN** `processResult` aangeroepen wordt met `hit: true`
- **THEN** bevat de volgende `nextShot` een buurcel van de raak-cel

#### Scenario: Terugval naar hunt na zinken
- **WHEN** `processResult` aangeroepen wordt met een gezonken schip
- **THEN** is de AI terug in hunt-modus

### Requirement: useAIConnection heeft 100% unit test coverage
Het systeem SHALL unit tests bevatten voor alle paden in `useAIConnection.ts`.

#### Scenario: sendMessage shot-result triggert AI schot
- **WHEN** `sendMessage({ type: 'shot-result', ... })` aangeroepen wordt
- **THEN** roept de composable de `onMessage` callback aan met een `shot` bericht van de AI

#### Scenario: heartbeatLost is altijd false
- **WHEN** `useAIConnection` actief is
- **THEN** is `heartbeatLost` altijd `false`
