## ADDED Requirements

### Requirement: Speler kan een schip selecteren
Het systeem SHALL een lijst tonen van te plaatsen schepen waaruit de speler kan kiezen.

#### Scenario: Schip selecteren uit lijst
- **WHEN** de speler op een schip in de lijst klikt
- **THEN** wordt het schip geselecteerd en volgt de cursor als preview op het bord

#### Scenario: Al geplaatste schepen niet opnieuw selecteerbaar
- **WHEN** een schip al op het bord geplaatst is
- **THEN** toont het systeem het schip als geplaatst in de lijst en is het niet opnieuw selecteerbaar

### Requirement: Speler kan een schip op het bord plaatsen
Het systeem SHALL een schip plaatsen op de cel waarop de speler klikt tijdens de plaatsingsfase.

#### Scenario: Geldig schip plaatsen
- **WHEN** de speler een schip geselecteerd heeft en op een geldige cel klikt
- **THEN** plaatst het systeem het schip op het bord en verwijdert het uit de te-plaatsen lijst

#### Scenario: Plaatsing buiten het bord
- **WHEN** de speler klikt op een positie waarbij het schip buiten het bord zou vallen
- **THEN** plaatst het systeem het schip niet en blijft het geselecteerd

#### Scenario: Overlappende plaatsing
- **WHEN** de speler klikt op een positie waarbij het schip een al geplaatst schip zou overlappen
- **THEN** plaatst het systeem het schip niet en blijft het geselecteerd

### Requirement: Speler kan een schip roteren
Het systeem SHALL de oriëntatie van het geselecteerde schip wisselen tussen horizontaal en verticaal.

#### Scenario: Roteren via toetsenbord
- **WHEN** de speler op de R-toets drukt terwijl een schip geselecteerd is
- **THEN** wisselt de oriëntatie van het schip (horizontaal ↔ verticaal)

#### Scenario: Roteren via knop
- **WHEN** de speler op de roteer-knop klikt terwijl een schip geselecteerd is
- **THEN** wisselt de oriëntatie van het schip (horizontaal ↔ verticaal)

### Requirement: Standaard schepen conform klassieke Battleship regels
Het systeem SHALL de volgende schepen beschikbaar stellen: 1× Carrier (5), 1× Battleship (4), 1× Cruiser (3), 1× Submarine (3), 1× Destroyer (2).

#### Scenario: Alle schepen beschikbaar bij start plaatsingsfase
- **WHEN** de plaatsingsfase begint
- **THEN** toont het systeem alle 5 schepen als te plaatsen in de lijst
