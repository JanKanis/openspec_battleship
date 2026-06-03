## ADDED Requirements

### Requirement: GameConnection interface abstraheert communicatie
Het systeem SHALL een `GameConnection` interface bieden waarachter zowel P2P- als AI-communicatie schuilgaan. `GameView` en `PlacementView` mogen uitsluitend via deze interface communiceren.

#### Scenario: Berichten sturen via interface
- **WHEN** een view `sendMessage()` aanroept op een `GameConnection`
- **THEN** bereikt het bericht de andere partij, ongeacht of dat een P2P-verbinding of een lokale AI is

#### Scenario: Berichten ontvangen via interface
- **WHEN** de andere partij een bericht stuurt
- **THEN** wordt de geregistreerde `onMessage`-callback aangeroepen met het juiste bericht

### Requirement: PeerGameConnection implementeert GameConnection voor P2P
Het systeem SHALL een `PeerGameConnection` bieden die de bestaande `usePeerConnection` inpakt en de `GameConnection` interface implementeert, inclusief heartbeat.

#### Scenario: Heartbeat werkt in P2P modus
- **WHEN** de P2P verbinding actief is
- **THEN** stuurt `PeerGameConnection` elke 10 seconden een ping en meldt verbindingsverlies na 15 seconden zonder ontvangen berichten

### Requirement: AIGameConnection implementeert GameConnection lokaal
Het systeem SHALL een `useAIConnection` bieden die volledig lokaal draait zonder netwerk. `heartbeatLost` is altijd `false`; `onDisconnected` wordt nooit aangeroepen.

#### Scenario: AI reageert op shot-result
- **WHEN** de speler een schot lost en de AI een `shot-result` ontvangt
- **THEN** berekent de AI zijn volgende schot en stuurt dat asynchroon als `shot` bericht terug

#### Scenario: Geen heartbeat in AI modus
- **WHEN** de AI-verbinding actief is
- **THEN** is `heartbeatLost` altijd `false` en `secondsSinceLastHeartbeat` altijd `0`

### Requirement: useGameConnection levert de actieve verbinding
Het systeem SHALL een `useGameConnection()` composable bieden die de actieve `GameConnection` retourneert. `HomeView` stelt de actieve verbinding in vóór navigatie naar de plaatsingsfase.

#### Scenario: Multiplayer verbinding actief
- **WHEN** de speler kiest voor multiplayer en een verbinding tot stand brengt
- **THEN** retourneert `useGameConnection()` een `PeerGameConnection`

#### Scenario: Solo verbinding actief
- **WHEN** de speler kiest voor solo spelen
- **THEN** retourneert `useGameConnection()` een `AIGameConnection`
