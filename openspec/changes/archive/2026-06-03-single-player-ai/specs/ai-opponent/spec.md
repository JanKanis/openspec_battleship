## ADDED Requirements

### Requirement: AI plaatst schepen willekeurig
De AI SHALL bij aanvang van elke sessie willekeurig schepen plaatsen op een geldig bord, waarbij geen schepen overlappen en alle schepen binnen het bord vallen.

#### Scenario: Willekeurig bord gegenereerd
- **WHEN** een nieuwe AI-sessie gestart wordt
- **THEN** plaatst de AI alle vijf schepen (carrier, battleship, cruiser, submarine, destroyer) op geldige, niet-overlappende posities

### Requirement: AI gebruikt Hunt & Target schietstrategie
De AI SHALL schoten bepalen op basis van de Hunt & Target strategie: in hunt-modus wordt de cel met de hoogste statistische kans gekozen; na een raak schakelt de AI over naar target-modus en werkt de AI buurcellen van de raak-cel af.

#### Scenario: Hunt modus — hoogste kanscel
- **WHEN** de AI in hunt-modus een schot bepaalt
- **THEN** kiest de AI een cel die nog niet beschoten is en de hoogste overlap heeft met geldige plaatsingen van resterende schepen

#### Scenario: Target modus — buurcel na raak
- **WHEN** de AI een raak schot heeft gelost
- **THEN** schiet de AI op een buurcel van de bekende raak-cellen totdat het schip gezonken is

#### Scenario: Terugval naar hunt na zinken
- **WHEN** een schip volledig gezonken is
- **THEN** keert de AI terug naar hunt-modus en begint een nieuwe zoekfase

#### Scenario: AI schiet nooit tweemaal op dezelfde cel
- **WHEN** de AI een volgend schot bepaalt
- **THEN** kiest de AI altijd een cel die nog niet eerder beschoten is
