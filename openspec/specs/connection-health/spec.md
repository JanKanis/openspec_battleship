### Requirement: Heartbeat wordt periodiek verstuurd
Beide kanten van de verbinding SHALL onafhankelijk van elkaar elke 10 seconden een `ping`-bericht sturen naar de andere kant. Er is geen pong-antwoord — elk ontvangen bericht (ping of spelbericht) bewijst dat de verbinding nog leeft.

#### Scenario: Normale heartbeat
- **WHEN** de P2P verbinding actief is (in placement of playing fase)
- **THEN** stuurt elke kant onafhankelijk elke 10 seconden een `ping` naar de andere kant

#### Scenario: Heartbeat start na verbinding
- **WHEN** de verbinding tot stand komt
- **THEN** starten beide kanten direct met het onafhankelijk versturen van heartbeats

#### Scenario: Heartbeat stopt bij speleinde
- **WHEN** het spel eindigt of de verbinding bewust verbroken wordt
- **THEN** stopt het heartbeat mechanisme aan beide kanten

### Requirement: Verbindingsproblemen worden zichtbaar gemeld
Het systeem SHALL de speler informeren wanneer de heartbeat uitblijft, inclusief hoe lang er al geen heartbeat is ontvangen.

#### Scenario: Heartbeat blijft uit
- **WHEN** een speler gedurende meer dan 15 seconden geen bericht (heartbeat of spelbericht) heeft ontvangen
- **THEN** toont het systeem een melding met de tekst "Geen verbinding — wachten op tegenstander" en een tijdsindicator die aangeeft hoeveel seconden er al geen verbinding is

#### Scenario: Melding verdwijnt bij herstel
- **WHEN** er opnieuw een bericht ontvangen wordt na een onderbreking
- **THEN** verdwijnt de melding automatisch en hervat het spel

### Requirement: Speler kan het spel handmatig afbreken bij verbindingsproblemen
Het systeem SHALL de speler de mogelijkheid bieden het spel te beëindigen wanneer de verbinding is uitgevallen.

#### Scenario: Afbreekknop zichtbaar
- **WHEN** de verbindingsmelding getoond wordt
- **THEN** toont het systeem een knop "Spel afbreken"

#### Scenario: Spel afbreken
- **WHEN** de speler op "Spel afbreken" klikt
- **THEN** beëindigt het systeem het spel en navigeert de speler naar het startscherm
