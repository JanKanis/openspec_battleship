## ADDED Requirements

### Requirement: Host maakt een lobby aan
Het systeem SHALL een unieke peer-ID genereren voor de host waarmee de guest kan verbinden.

#### Scenario: Lobby aanmaken
- **WHEN** de speler kiest voor "Nieuw spel"
- **THEN** genereert het systeem een unieke game-code en toont deze aan de host

#### Scenario: Code kopieerbaar
- **WHEN** de game-code getoond wordt
- **THEN** biedt het systeem een knop om de code naar het klembord te kopiëren

### Requirement: Guest verbindt via game-code
Het systeem SHALL een guest toestaan een code in te voeren om te verbinden met de host.

#### Scenario: Succesvol verbinden
- **WHEN** de guest een geldige game-code invoert en op "Verbinden" klikt
- **THEN** bouwt het systeem een P2P verbinding op met de host en gaan beide spelers naar de plaatsingsfase

#### Scenario: Verbinding mislukt
- **WHEN** de guest een ongeldige of verlopen code invoert
- **THEN** toont het systeem een foutmelding met de suggestie de code te controleren

### Requirement: Verbindingsstatus zichtbaar
Het systeem SHALL de huidige verbindingsstatus tonen aan beide spelers.

#### Scenario: Wachten op guest
- **WHEN** de host de lobby aangemaakt heeft maar de guest nog niet verbonden is
- **THEN** toont het systeem "Wachten op tegenstander..."

#### Scenario: Verbonden
- **WHEN** beide spelers verbonden zijn
- **THEN** toont het systeem "Verbonden" en start automatisch de plaatsingsfase

### Requirement: Verbindingsverlies wordt gemeld
Het systeem SHALL de speler informeren als de P2P verbinding wegvalt.

#### Scenario: Verbinding verbroken tijdens spel
- **WHEN** de P2P verbinding wegvalt tijdens de speel- of plaatsingsfase
- **THEN** toont het systeem een melding dat de verbinding verbroken is en het spel beëindigd wordt
