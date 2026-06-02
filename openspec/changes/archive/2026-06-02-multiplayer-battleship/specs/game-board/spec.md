## ADDED Requirements

### Requirement: Bord wordt gerenderd als 10×10 grid
Het systeem SHALL een 10×10 grid tonen voor zowel het eigen bord als het bord van de tegenstander.

#### Scenario: Eigen bord zichtbaar
- **WHEN** de speler de plaatsingsfase betreedt
- **THEN** toont het systeem een 10×10 grid met kolommen A-J en rijen 1-10

#### Scenario: Tegenstander bord zichtbaar
- **WHEN** de speler de schietfase betreedt
- **THEN** toont het systeem een tweede 10×10 grid voor het bord van de tegenstander

### Requirement: Cellen hebben visuele states
Elke cel op het bord SHALL een visuele state tonen die de huidige spelstatus weergeeft.

#### Scenario: Lege watercel
- **WHEN** een cel geen schip bevat en nog niet beschoten is
- **THEN** toont de cel de "water" staat (neutraal)

#### Scenario: Cel met eigen schip
- **WHEN** een cel op het eigen bord een schip bevat
- **THEN** toont de cel de "schip" staat (zichtbaar voor de eigenaar)

#### Scenario: Geraakt schip
- **WHEN** een cel met een schip beschoten is
- **THEN** toont de cel de "raak" staat (rood/vuur indicatie)

#### Scenario: Misser
- **WHEN** een lege cel beschoten is
- **THEN** toont de cel de "mis" staat (wit/grijs indicatie)

### Requirement: Hover-preview bij plaatsing
Het systeem SHALL een preview tonen van de schip-positie tijdens de plaatsingsfase.

#### Scenario: Geldige plaatsingspositie
- **WHEN** de speler een schip geselecteerd heeft en over een cel hovert die een geldige plaatsing toestaat
- **THEN** toont het systeem het schip als semi-transparante overlay op de betreffende cellen

#### Scenario: Ongeldige plaatsingspositie
- **WHEN** de speler een schip geselecteerd heeft en over een cel hovert die geen geldige plaatsing toestaat (buiten bord of overlapping)
- **THEN** toont het systeem een rode overlay als indicatie dat plaatsing niet mogelijk is
