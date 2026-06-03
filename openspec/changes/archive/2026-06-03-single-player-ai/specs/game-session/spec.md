## MODIFIED Requirements

### Requirement: Spel doorloopt gedefinieerde fases
Het systeem SHALL het spelverloop structureren in opeenvolgende fases: verbinding (alleen P2P), plaatsing, spelen, einde. In solo modus wordt de verbindingsfase overgeslagen.

#### Scenario: Fase overgang na plaatsing
- **WHEN** beide spelers alle schepen geplaatst hebben en op "Klaar" geklikt hebben
- **THEN** gaat het spel over naar de schietfase, waarbij de eerste beurt random bepaald wordt in solo modus en aan de host toebehoort in multiplayer

#### Scenario: Fase overgang na verbinding (P2P)
- **WHEN** beide spelers verbonden zijn via P2P
- **THEN** gaat het spel over naar de plaatsingsfase

#### Scenario: Fase overgang bij solo start
- **WHEN** de speler op "Solo spelen" klikt
- **THEN** gaat het spel direct over naar de plaatsingsfase zonder verbindingsfase
