## ADDED Requirements

### Requirement: Spel doorloopt gedefinieerde fases
Het systeem SHALL het spelverloop structureren in opeenvolgende fases: verbinding, plaatsing, spelen, einde.

#### Scenario: Fase overgang na plaatsing
- **WHEN** beide spelers alle schepen geplaatst hebben en op "Klaar" geklikt hebben
- **THEN** gaat het spel over naar de schietfase, waarbij de host als eerste schiet

#### Scenario: Fase overgang na verbinding
- **WHEN** beide spelers verbonden zijn
- **THEN** gaat het spel over naar de plaatsingsfase

### Requirement: Spelers schieten om beurten
Het systeem SHALL beurtenwisseling afdwingen waarbij spelers afwisselend schieten. Beide spelers verwerken inkomende schoten op hun eigen bord en sturen het resultaat terug — het protocol is symmetrisch voor host en guest.

#### Scenario: Schot door actieve speler
- **WHEN** de actieve speler op een cel van het tegenstander-bord klikt
- **THEN** stuurt het systeem een `shot` bericht naar de tegenstander, die het verwerkt op zijn eigen bord en een `shot-result` terugstuur

#### Scenario: Schot door inactieve speler geblokkeerd
- **WHEN** een speler op het bord klikt terwijl de tegenstander aan de beurt is
- **THEN** negeert het systeem de klik en toont een indicatie dat de speler moet wachten

#### Scenario: Raak schot
- **WHEN** een schot een cel met een schip treft
- **THEN** markeert het systeem de cel als "raak" op beide borden en blijft dezelfde speler aan de beurt

#### Scenario: Misser
- **WHEN** een schot een lege cel treft
- **THEN** markeert het systeem de cel als "mis" op beide borden en wisselt de beurt naar de tegenstander

### Requirement: Gezonken schip wordt gemeld
Het systeem SHALL melden wanneer een volledig schip gezonken is.

#### Scenario: Schip gezonken
- **WHEN** het laatste deel van een schip geraakt wordt
- **THEN** toont het systeem een melding dat het betreffende schip gezonken is

### Requirement: Spel eindigt bij volledig vernietigde vloot
Het systeem SHALL het spel beëindigen wanneer alle schepen van een speler gezonken zijn.

#### Scenario: Winnaar bepaald
- **WHEN** alle schepen van een speler gezonken zijn
- **THEN** beëindigt het systeem het spel en toont het eindscherm met de winnaar
