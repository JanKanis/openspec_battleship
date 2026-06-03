## MODIFIED Requirements

### Requirement: Startscherm met keuze host of guest
Het systeem SHALL bij het openen een startscherm tonen met de keuze om een nieuw spel te starten of te verbinden. Alle teksten worden weergegeven in de actieve taal.

#### Scenario: Nieuw spel starten
- **WHEN** de speler op de "Nieuw spel"-knop klikt
- **THEN** toont het systeem de gegenereerde game-code en wacht op een guest

#### Scenario: Verbinden als guest
- **WHEN** de speler op de "Verbinden"-knop klikt
- **THEN** toont het systeem een invoerveld voor de game-code

### Requirement: Beurt-indicatie zichtbaar tijdens schietfase
Het systeem SHALL duidelijk aangeven welke speler aan de beurt is. De beurt-indicatietekst wordt weergegeven in de actieve taal.

#### Scenario: Eigen beurt
- **WHEN** de lokale speler aan de beurt is
- **THEN** toont het systeem de beurt-indicatie in de actieve taal en is het tegenstander-bord klikbaar

#### Scenario: Tegenstander aan de beurt
- **WHEN** de tegenstander aan de beurt is
- **THEN** toont het systeem de wacht-indicatie in de actieve taal en is het bord niet klikbaar

### Requirement: Eindscherm na afloop van het spel
Het systeem SHALL na afloop een eindscherm tonen met de uitslag en een optie om opnieuw te spelen. Alle teksten worden weergegeven in de actieve taal.

#### Scenario: Gewonnen
- **WHEN** de lokale speler het spel gewonnen heeft
- **THEN** toont het systeem de winst-melding in de actieve taal met een "Opnieuw spelen"-knop

#### Scenario: Verloren
- **WHEN** de lokale speler het spel verloren heeft
- **THEN** toont het systeem de verlies-melding in de actieve taal met een "Opnieuw spelen"-knop

#### Scenario: Opnieuw spelen
- **WHEN** de speler op de "Opnieuw spelen"-knop klikt
- **THEN** navigeert het systeem terug naar het startscherm

### Requirement: Responsive layout voor muis, touchpad en mobiel
Het systeem SHALL op alle schermformaten bruikbaar zijn zonder horizontaal scrollen.

#### Scenario: Mobiel scherm
- **WHEN** de app geopend wordt op een scherm smaller dan 768px
- **THEN** toont het systeem de borden gestapeld (verticaal) in plaats van naast elkaar
